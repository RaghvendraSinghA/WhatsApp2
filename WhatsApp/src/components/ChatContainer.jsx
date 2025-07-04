import assets,{messagesDummyData} from '../assets/assets.js'
import {useRef,useEffect,useContext,useState} from 'react'
import {formatMessageTime} from '../lib/utils.js'
import {ChatContext} from '../../context/ChatContext.jsx'
import {AuthContext} from '../../context/AuthContext.jsx'



const ChatContainer = ()=>{

    const {messages,selectedUser,setSelectedUser,sendMessage,getMessages} =useContext(ChatContext)
    const {authUser, onlineUsers} =useContext(AuthContext)


    const scrollEnd = useRef()

    const [input,setInput]=useState('')

    const handleSendMessage=async(e)=>{
        e.preventDefault()
        console.log('handlemessae used')
        if(input.trim()==="") return null
        await sendMessage({text:input.trim()})
        setInput("")
    }

    const handleSendImage=async(e)=>{
        const file=e.target.files[0]
        if(!file || !file.type.startsWith('image/')){
        toast.error("select an image file")
        return
        }
        const reader=new FileReader()

        reader.onloadend=async()=>{
            await sendMessage({image:reader.result})
            e.target.value=""
        }

        reader.readAsDataURL(file)
    }
    useEffect(()=>{
        if(selectedUser){
            getMessages(selectedUser._id)
        }
    },[selectedUser])

    useEffect(()=>{
        if(scrollEnd.current && messages){
            scrollEnd.current.scrollIntoView({behavior:"smooth"})
        }
    },[messages])
    return selectedUser?(
            <div className='h-full overflow-scroll relative backdrop-blur-lg'>
                {/*--profileheader--*/}
                <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
                    <img src={selectedUser.profilePic||assets.avatar_icon} alt="" className="w-13  h-13 rounded-full border border-white"/>
                    <p className='flex-1 text-lg text-black flex items-center gap-2'>
                        {selectedUser.fullName || 'user'}
                        {onlineUsers.includes(selectedUser._id)&&<span className="w-2 h-2 rounded-full bg-green-500"></span>}
                    </p>
                    <img onClick={()=>setSelectedUser(null)} src={assets.arrow_icon} alt='' className='md:hidden max-w-7'/>
                    <img src={'help.png'} alt="" className='max-md:hidden w-10' />
                </div>
                {/*---Chat area */}
                <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
                    {messages?.map((msg,index)=>(
                        <div key={index} className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}>
                            {
                                msg.image?(
                                    <img src={msg.image}  alt="imageg" className='max-w-[230px] border border-gray-300 rounded-lg overflow-hidden mb-8'/>
                                ):(
                                <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-blue-800/60 text-white ${msg.senderId===authUser._id?'rounded-br-none':'rounded-bl-none'}`}>{msg.text}</p>
                            )
                            }
                            <div className='text-center text-xs'> 
                                <img src={msg.senderId=== authUser._id?authUser?.profilePic || assets.avatar_icon :selectedUser?.profilePic|| assets.avatar_icon} alt="" className='w-8 h-8 border border-white rounded-full' />
                                <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={scrollEnd}></div>
                </div>

                {/* bottom are */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
                    <div className="border border-gray-400 flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
                        <input onChange={(e)=>setInput(e.target.value)} value={input} 
                        onKeyDown={(e)=>e.key==="Enter"?handleSendMessage(e):null}
                        type="text" placeholder="Send a message.." className="flex-1 text-sm p-3 rounded-lg outline-none text-black placeholder-gray-500" />
                        <input onChange={handleSendImage} type="file" id="image" accept='image/png, image/jpeg' hidden />
                        <label htmlFor='image'>
                            <img src={'gallery.png'} alt="" className="w-7 mr-2 cursor-pointer" />
                        </label>
                    </div>
                    <img onClick={handleSendMessage} src={assets.send_button} alt="" className='w-7 cursor-pointer' />

                </div>



          </div>):(
            <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
                <img src={assets.logo_icon} alt='' className='max-w-16'/>
                <p className='text-lg font-medium text-white'>Chat anytime,Anywhere</p>
            </div>
          )
}

export default ChatContainer