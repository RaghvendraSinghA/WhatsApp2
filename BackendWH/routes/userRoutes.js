//This file contains router with all api ends,nothing fancy which will be used by other files
import {login,signup,updateProfile,checkAuth}from '../controllers/userController.js'
import {protectRoute} from '../middleware/auth.js'
import express from 'express'

const userRouter=express.Router()

userRouter.post('/signup',signup)
userRouter.post('/login',login)
userRouter.put("/update-profile",protectRoute,updateProfile) //put bcoz updating something
userRouter.get("/check",protectRoute,checkAuth)


export default userRouter