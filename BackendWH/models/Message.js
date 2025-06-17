import mongoose from 'mongoose'

const messageSchema=new mongoose.Schema({
    senderId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    receiverId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    text:{type:String},
    image:{type:String},
    seen:{type:Boolean,default:false}
},{timestamps:true})

const Message=mongoose.models.Message || mongoose.model('Message',messageSchema)

//If multiple files access this User class at same time then there could be an error happens bcoz multiple files want to re-write User model

export default Message