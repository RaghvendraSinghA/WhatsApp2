import {createContext,useState,useEffect} from 'react'
import axios from 'axios'
import toast from "react-hot-toast"
import {io} from 'socket.io-client'



const backendUrl =import.meta.env.VITE_BACKEND_URL

axios.defaults.baseURL=backendUrl
export const AuthContext=createContext()    //what is this and why it exported??
                                        //here we have created empty context store which value will be filled by AuthProvider component component and this object are interlinked.

export const AuthProvider=({children})=>{

    const [token,setToken]=useState(localStorage.getItem("token"))
    const [authUser,setAuthUser]=useState(null)  //for getting your own data
    const [onlineUsers,setOnlineUsers]=useState([])//for sidebar (list of all users).
    const [socket,setSocket]=useState(null) 

    console.log("authUSer",authUser)

    const checkAuth=async()=>{
        //called by below useEffect to get user(own) data from backend using token.Token is filled in header.
        //How token can get userData from backend??
        try{
            const {data} =await axios.get("/api/auth/check")
            console.log("userdata",data)
            if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        }catch(e){
            toast.error(e.message)
        }
    }

    const login=async(state,credentials)=>{
        //state is either login or sign-up, credentials user details like email,password /username
        console.log("here")
        try{
            const {data}= await axios.post(`/api/auth/${state}`,credentials)
            console.log("data from login",data)
            if(data.success){
                setAuthUser(data.userData)
                connectSocket(data.userData)




                axios.defaults.headers.common["token"]=data.token
                setToken(data.token)
                localStorage.setItem("token",data.token)
                toast.success(data.message)
            }else{
                toast.error(data.message,'backend error')
            }
        }catch(e){
                toast.error(e.message,"Auth froned")
        }
    }

    const updateProfile=async(body)=>{
        try{
            const {data}=await axios.put("/api/auth/update-profile",body)
            if(data.success){
                setAuthUser(data.user)
                toast.success('Profile updated')
            }
        }catch(e){
            toast.error(e.message)
        }

    }

    const logOut=async()=>{
        localStorage.removeItem("token")
        setToken(null)
        setAuthUser(null)
        setOnlineUsers([])
        axios.defaults.headers.common["token"]=null

        toast.success("Logged out")
        socket.disconnect() //this will call disconnect event on backend socket io server.here socket==newSocket bcoz we set it like that.
    }


    //socket connection
    const connectSocket=(userData)=>{
        if(!userData || socket?.connected) return

        const newSocket=io(backendUrl,{
            query:{
                userId:userData._id
            }
        })
        //why sending userId? so that we could know that this user is connected to this socketId and we can message them via their id.Else how would we know whom to message?

        //newSocket have socketId assigned by backend to the connection and many event listeners and functions.Even it have custom events which we have created on backend.

        //it also crates a connection to server.
        newSocket.connect()
        setSocket(newSocket)
         
        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds) //Getting list of all online users on server from backend.
        })

        //this is event listener active on backend server and calls this callbacks if "getOnlineusers"event triggers.
    }





    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"]=token
        }
        checkAuth()
    },[])

    const value = {
        axios,authUser,onlineUsers,socket,
        login,logOut,updateProfile
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
    // {children} are those Components who will be wrapped by AuthContext.
    //Using this componet we are initializing updating and managing store value.If u see above store is empty.
}