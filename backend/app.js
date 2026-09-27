import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import {connectToSocket} from "./controllers/socketManager.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(express({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));
app.use(cors());

app.use("/user",userRoutes);




const server = createServer(app);
const io = connectToSocket(server);  

app.set("port",(process.env.PORT || 8000));

app.get("/",(req,res) => {  
    return res.send("Hello");
});
const start = async () => {
    const connectionDB = await mongoose.connect("mongodb+srv://yourchannelmediadivesh_db_user:sjL3RwHMZu8zND1e@vindexcluster0.vsa6fau.mongodb.net/");
    server.listen(app.get("port"),() => {
        console.log(`MONGODB CONNECTED ${connectionDB.connection.host}`);
        console.log(`Listening on port ${app.get("port")}`);
        
    });

}

start();


