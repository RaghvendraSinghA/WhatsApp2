import mongoose from "mongoose"

export const connectDB=async()=>{
    try{
        mongoose.connection.on('connected',()=>{
            console.log("DB connected")
        })//Event listener

        await mongoose.connect(`${process.env.MONGODB_URI}/WhatsApp`)

    }catch(e){
        console.log("DB failed to connect via mongoose")
    }
}