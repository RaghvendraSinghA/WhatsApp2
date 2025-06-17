import {createContext,useState,useContext,useEffect} from 'react'
import {AuthContext} from './AuthContext.jsx'
import {toast} from 'react-hot-toast'


export const ChatContext=createContext()

export const ChatProvider=({children})=>{
    const [messages,setMessages]=useState([])
    const [users,setUsers]=useState([])
    const [selectedUser,setSelectedUser]=useState(null)
    const [unseenMessages,setUnseenMessages]=useState({})

    const {socket,axios}=useContext(AuthContext)


    const getUsers=async()=>{
        try{
            const {data} = await axios.get("/api/messages/users")
            console.log(data.filteredUsers)
            if(data.success){
                setUsers(data.filteredUsers)
                setUnseenMessages(data.unseenMessages)
            }
        }catch(e){
            toast.error(e.message)
        }
    }

    const getMessages=async(userId)=>{              //selected user
        try{
            const {data} = await axios.get(`/api/messages/${userId}`)
            if(data.success){
                setMessages(data.messages)
            }
        }catch(e){
            toast.error(e.message)
        }
    }


    const sendMessage=async(messageData)=>{
        try{
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData)
            console.log('data',data)
            if(data.success){
                setMessages((prev)=>[...prev,data.newMessage])
            }else{
                toast.error(data.message)
            }
        }catch(e){
            toast.error(e.message)
        }
    }


    const subscribeToMessages=async ()=>{
        if(!socket) return

        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId==selectedUser._id){
                newMessage.seen=true
                setMessages((prev)=>[...prev,newMessage])
                axios.put(`/api/messages/mark/${newMessage._id}`)
            }else{
                setUnseenMessages((prev)=>({
                    ...prev,[newMessage.senderId]:prev[newMessage.senderId]?prev[newMessage.senderId]+1:1
                }))
            }
        })
    }


    const unsubscribeFromMessage=()=>{
        if(socket) socket.off("newMessage")
    }

    useEffect(()=>{
        subscribeToMessages()

        return ()=>unsubscribeFromMessage()
    },[socket,selectedUser])

    const value={
        messages,users,selectedUser,getUsers,getMessages,sendMessage, setSelectedUser,unseenMessages,setUnseenMessages
    }


    return(<ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>)
}