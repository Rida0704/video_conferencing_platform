import { Server } from "socket.io";                      // Import the Socket.IO server class to create a WebSocket server.

let connections = {};                                    // In-memory map: roomPath -> [socketId, socketId, ...]
let messages = {};                                       // In-memory map: roomPath -> [{ data, "socket-id-sender", sender }, ...]
let timeOnline = {};                                     // In-memory map: socketId -> Date user joined (for simple online time tracking)

export const connectToSocket = (server) => {             // Export a function that wires Socket.IO onto an HTTP(S) server instance.
    const io = new Server(server,{
        cors:{
            origin: "*", 
            methods:["GET","POST"],
            alowedHeaders:["*"],
            credentials:true                       // Allow all origins for CORS (cross-origin resource sharing).
        }
    });                       // Create a Socket.IO server bound to the given HTTP server.

    io.on("connection", (socket) => {                    // When a client connects, Socket.IO gives us a 'socket' for that client.

        socket.on("join-call", (path) => {               // Client asks to join a specific "call" (room) identified by 'path'.
            if (!connections[path]) {                    // If this room doesn't exist yet...
                connections[path] = [];                  // ...create an empty list of participants.
            }
            connections[path].push(socket.id);           // Add this client's socket ID to the room participant list.
            timeOnline[socket.id] = new Date();          // Record when this client came online (for duration reporting).

            for (let a = 0; a < connections[path].length; a++) { // Loop through everyone already in the room...
                io.to(connections[path][a])                        // ...target each participant by socket ID...
                  .emit("user-joined", socket.id, connections[path]); // ...tell them a user joined + send the full participant list.
            }

            if (messages[path]) {                         // If this room has chat history stored...
                messages[path].forEach((msg) => {         // ...replay the messages to the newly joined client...
                    io.to(socket.id)                      // ...target only the joining socket...
                      .emit("chat-message", msg.data, msg["socket-id-sender"]); // ...emit past chat messages.
                });
            }
        });

        socket.on("signal", (toId, message) => {          // WebRTC signaling relay: one client sends SDPs/ICE to another.
            io.to(toId).emit("signal", socket.id, message); // Forward signaling payload to the target peer with sender ID.
        });

        socket.on("chat-message", (data, sender) => {     // A client sent a chat message (text, emoji, etc.).
            let matchingRoom = "";                        // We’ll detect which room this sender belongs to.
            let found = false;

            for (const [roomKey, roomValue] of Object.entries(connections)) { // Iterate rooms -> participant arrays.
                if (roomValue.includes(socket.id)) {      // If this socket ID is in the current room list...
                    matchingRoom = roomKey;               // ...we've found the room.
                    found = true;
                    break;                                // Stop searching; one room per socket in this design.
                }
            }

            if (found) {                                  // Only proceed if we know the sender's room.
                if (!messages[matchingRoom]) {            // Ensure there’s a chat history array for the room.
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({             // Store this message in room history (simple persistence in RAM).
                    data: data,
                    "socket-id-sender": sender,
                    sender: sender
                });

                console.log("message", matchingRoom, ":", sender, data); // Log for debugging.

                connections[matchingRoom].forEach((elem) => { // Broadcast the message to everyone in the room...
                    io.to(elem).emit("chat-message", data, sender, socket.id); // ...including the sender, with sender IDs.
                });
            }
        });

        socket.on("disconnect", () => {                   // When a client disconnects (tab closed, network drop, etc.).
            let key;                                      // Will hold the room the socket belonged to (if any).
            let diffTime = Math.abs(timeOnline[socket.id] - new Date()); // ms online (Date subtraction yields ms).

            for (const [roomKey, roomValue] of Object.entries(connections)) { // Search each room...
                if (roomValue.includes(socket.id)) {      // ...to find which one contains this socket.
                    key = roomKey;                        // Remember the room key.

                    for (let a = 0; a < connections[key].length; a++) { // Notify remaining participants...
                        io.to(connections[key][a]).emit("user-disconnected", socket.id); // ...that this user left.
                    }

                    const index = connections[key].indexOf(socket.id); // Remove the socket ID from the room list...
                    if (index !== -1) {
                        connections[key].splice(index, 1);
                    }

                    if (connections[key].length === 0) {  // If room is now empty...
                        delete connections[key];           // ...delete the room to keep memory tidy.
                    }
                    break;                                 // We’re done—each socket is in at most one room here.
                }
            }

            console.log(`User ${socket.id} was online for ${diffTime}ms`); // Debug: how long this socket was online.
            delete timeOnline[socket.id];                 // Clean up the timestamp entry for this socket.
        });
    });

    return io;                                            // Return the configured Socket.IO instance (useful for tests/hooks).
};
