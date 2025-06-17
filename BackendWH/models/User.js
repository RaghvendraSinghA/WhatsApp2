import mongoose from 'mongoose'

const userSchema=new mongoose.Schema({
    email:{type:String, required:true, unique:true},
    fullName:{type:String, required:true},
    password:{type:String, required:true, minlength:6},
    profilePic:{type:String, default:""},
    bio:{type:String}   
},{timestamps:true})

const User=mongoose.models.User || mongoose.model('User',userSchema)

//If multiple files access this User class at same time then there could be an error happens bcoz multiple files want to re-write User model

export default User