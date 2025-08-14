import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import {connectToSocket} from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js"; 


const app=express();
const server=createServer(app);
const io=connectToSocket(server);

app.set("port",(process.env.PORT || 8000))


app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({extended:true,limit:"40kb"}));
app.use("/api/v1/users",userRoutes);

const start=async()=>{
    const connectionDb=await mongoose.connect("mongodb+srv://ridakhuraishi:q2RKlF2ja66iJSC9@cluster0.xhuuevi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log("MongoDB connected successfully");
    server.listen(app.get("port"),()=>{
        console.log("Server is running on port 8000");
    });
}

start();