import User from '../models/User.js'
import Message from '../models/Message.js'
import cloudinary from '../lib/cloudinary.js'
import {io,userSocketMap} from'../server.js'
import mongoose from 'mongoose'


export const getUserForSidebar=async(req,res)=>{
    try{
        const userId =req.user._id
        console.log("userID",userId)
        const filteredUsers=await User.find({_id:{$ne:userId}}).select("-password") //$ne means not equal.Accessing all users of database.-password removes password property.All users on database except me.


        const unseenMessages={}
        const promises=filteredUsers.map(async(user)=>{
            const messages =await Message.find({
                senderId: user._id,
                receiverId:userId,
                seen:false
            })
            if(messages.length >0){
                unseenMessages[user._id]= messages.length
            }
        })
        //Async function is used in map bcoz for each user with their userId we have to search messages on mongDb database.

        //But why array of promises?Why not directly array of messages?
        //bcoz,Async function in javascript returns promise by default even if u return anything.

        //Who calls async function callbacks?
        //map function calls each async callback,lol forgot this.

        //When map calls the async callback function they return whole function wrapped in Promise and those promises are already started to execute internally.We don't need then() bcoz we are not asking anything in return from Promises.

        //Now promises array looks like this-:
        // promises = [p1<pending>,p2<pending>,p3<pending>,p4<pending>]
        

        await Promise.all(promises)
        //await only wait for all promises to execute,they don't return anything.They just execute and fill unseenMessages.without await Promise.all() half filled unseenMessages array would be send to frontend.

        //after Promises.all(promises),all promises are finished and they return undefined thats why we are not storing result of promise.all().All promises executes and fill unseenMessages.

        //filteredUser--All users on mongoDb except me.
        //unseenMessages---just length of all unseen messages of each user with their id.It doesn't have messages.

        res.json({success:true,filteredUsers,unseenMessages})

        //await resolves promise and gives resolved value.await doesn't block threat it only blocks async function execution.

    }catch(e){
        console.log(e.message)
        res.json({success:false,message:e.message})
    }
}


export const getMessages = async(req,res)=>{
    try{
        const {id:selectedUserId}=req.params;
        const myId=req.user._id

        const messages=await Message.find({
            $or:[
                {senderId:myId,receiverId:selectedUserId},
                {senderId:selectedUserId,receiverId:myId}
            ]
        })

        //find all messages in which either one exist from given aray

        await Message.updateMany({senderId:selectedUserId,receiverId:myId},{seen:true})

        res.json({success:true,messages})
    }catch(e){
        console.log(e.message)
        res.json({success:false,message:e.message})
    }
}


export const markMessageAsSeen=async (req,res)=>{
    try{
        const {id}=req.params 
        await Message.findByIdAndUpdate(id,{seen:true})
        res.json({success:true})

    }catch(e){
        console.log(e.message)
        res.json({success:false,message:e.message})
    }
}

export const sendMessage=async(req,res)=>{
    try{
        const {text,image}=req.body
        const receiverId=req.params.id
        const senderId=req.user._id

        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image)
            imageUrl=uploadResponse.secure_url
        }

        const newMessage= await Message.create({
            senderId,receiverId,text,image:imageUrl
        }) //creating messages but,only storing in database with both users id.Its not like that both users have common array where messages are pushed.We are storing messages always on database for all users at one place.If user is live on socket then we send him too.

        //if user comes live and login then he will be able to fetch messages using id of sender and his.

        //socket
        const receiverSocketId=userSocketMap[receiverId]
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        res.json({success:true,newMessage})
    }catch(e){
        console.log(e.message)
        res.json({success:false,message:e.message})
    }
}