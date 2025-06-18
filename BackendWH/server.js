import express from "express"
import "dotenv/config"
import cors from "cors"
import http from "http"
import {connectDB} from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import {Server} from 'socket.io'

const app=express()
const server=http.createServer(app)

export const io=new Server(server,{
    cors:{origin:"*"}
})

//store online users
export const userSocketMap={}; //userid-socketid

io.on("connection",(socket)=>{
    const userId=socket.handshake.query.userId
    console.log('user connected',userId)

    if(userId){
        userSocketMap[userId]=socket.id
    }

    io.emit("getOnlineUsers",Object.keys(userSocketMap))

    socket.on("disconnect",()=>{
        console.log("User disconnected",userId)
        delete userSocketMap[userId]
    })

    io.emit("getOnlineUsers",Object.keys(userSocketMap))
})

app.use(express.json({limit:"4mb"}))
app.use(cors())

app.use("/api/status",(req,res)=>{
    res.send("Backend server is live") //this will be shown to website as text
})

app.use('/api/auth',userRouter) //Router setup
app.use('/api/messages',messageRouter)

await connectDB()

//error came on vercel so if block{} attached and exported server also for vercel.
if(process.env.NODE_ENV !== "production"){
const PORT=process.env.PORT || 5000
server.listen(PORT,()=>{
    console.log("Server is running on ",PORT)
})
}

//vercel manages the server by itself thats why its known as serverless.we just have to export the server for vercel,we can't control server manually and say listen on port 5000.

export default server