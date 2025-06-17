//This file is used to create users.This function will be called from some other file and data will be passed.
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import {generateToken} from '../lib/utils.js'
import cloudinary from '../lib/cloudinary.js'


export const signup=async(req,res)=>{
    const {fullName,email,password,bio}=req.body

    try{
        if(!fullName || !email || !password || !bio){
            return res.json({success:false,message:'missing details'})
        }
        const user=await User.findOne({email})
        if(user){
            return res.json({success:false,message:"User already exist"})
        }

        const salt=await bcrypt.genSalt(10); //generate salt for bcrypt
        const hashedPassword=await bcrypt.hash(password,salt) //we hashed password bcoz for safety reasons we cannot store original password in database.


        const newUser=await User.create({
            fullName,email,password:hashedPassword,bio
        })

        const token=generateToken(newUser._id)             //use to validate login of user,we will jsut set it in localstorage.not good but ok,
        res.json({success:true,userData:newUser,token,message:"Account created Successfully"})
    }catch(e){
        res.json({success:false,message:e.message})
        console.log(e.message)
    }
}


export const login= async(req,res)=>{
    console.log("inside login")
    try{
        const {email,password}=req.body
        const userData=await User.findOne({email})
        console.log("inside login")

        const isPasswordCorrect=await bcrypt.compare(password,userData.password)

        if(!isPasswordCorrect){
            return res.json({success:false, message:'invalid password'})
        }

        const token=generateToken(userData._id)

        res.json({success:true, userData,token,message:"Login successfull"})


    }catch(e){
        res.json({success:false,message:e.message})
        console.log(e.message)
    }
}

export const checkAuth=(req,res)=>{
    res.json({success:true,user:req.user})
}

export const updateProfile=async (req,res)=>{
    try{
        const {profilePic,bio,fullName}=req.body

        const userId=req.user._id
        let updatedUser;

        if(!profilePic){
           updatedUser= await User.findByIdAndUpdate(userId,{bio,fullName},{new:true}) //3rd args to return new data
        }else{
            const upload=await cloudinary.uploader.upload(profilePic)
            updatedUser=await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true})
        }

        res.json({success:true,user:updatedUser})
    }catch(e){
        res.json({success:false, message:e.message})
    }
}


