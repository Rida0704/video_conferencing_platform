import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import server from "../environment"; // Adjust the import path as necessary

const server_url = server.prod; // fixed for socket.io
var connections = {};
const peerConfigConnections = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export default function VideoMeetComponent() {
    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoref = useRef();

    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [screen, setScreen] = useState(false);
    const [showModal, setModal] = useState(true);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(3);
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        getPermissions();
    }, []);

    const getPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setVideoAvailable(true);
            setAudioAvailable(true);
            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

            window.localStream = stream;
            if (localVideoref.current) {
                localVideoref.current.srcObject = stream;
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [video, audio]);

    const getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };

    const getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) { console.log(e); }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit('signal', id, JSON.stringify({ sdp: connections[id].localDescription }));
                }).catch(e => console.log(e));
            });
        }
    };

    const getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video, audio })
                .then(getUserMediaSuccess)
                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) {}
        }
    };

    const getDisplayMedia = () => {
        if (!screen && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                .then(getDisplayMediaSuccess)
                .catch((e) => console.log(e));
        }
    };

    const getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) { console.log(e); }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit('signal', id, JSON.stringify({ sdp: connections[id].localDescription }));
                }).catch(e => console.log(e));
            });
        }
    };

    const gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ sdp: connections[fromId].localDescription }));
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    };

    const connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on('chat-message', addMessage);
            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
            });
        });
    };

    const handleVideo = () => setVideo(!video);
    const handleAudio = () => setAudio(!audio);
    const handleScreen = () => {
        setScreen(!screen);
        getDisplayMedia();
    };
    const handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        } catch (e) {}
        window.location.href = "/";
    };
    const handleMessage = (e) => setMessage(e.target.value);

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [...prevMessages, { sender, data }]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prev) => prev + 1);
        }
    };

    const sendMessage = () => {
        socketRef.current.emit('chat-message', message, username);
        setMessage("");
    };

    const connect = () => {
        setAskForUsername(false);
        getMedia();
    };

    return (
        <div>
            {askForUsername ? (
                <div>
                    <h2>Enter into Lobby</h2>
                    <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                    <Button variant="contained" onClick={connect}>Connect</Button>
                </div>
            ) : (
                <div className={styles.meetVideoContainer}>
                    {showModal && (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <h1>Chat</h1>
                                <div className={styles.chattingDisplay}>
                                    {messages.length ? messages.map((item, index) => (
                                        <div key={index} style={{ marginBottom: "20px" }}>
                                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )) : <p>No Messages Yet</p>}
                                </div>
                                <div className={styles.chattingArea}>
                                    <TextField value={message} onChange={handleMessage} label="Enter Your chat" variant="outlined" />
                                    <Button variant='contained' onClick={sendMessage}>Send</Button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {video ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                        {screenAvailable && (
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                            </IconButton>
                        )}
                        <Badge badgeContent={newMessages} max={999} color='secondary'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>
                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>
                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video
                                    data-socket={video.socketId}
                                    ref={ref => { if (ref && video.stream) ref.srcObject = video.stream; }}
                                    autoPlay
                                ></video>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
