import assets,{imagesDummyData} from '../assets/assets.js'
import {useContext,useState,useEffect} from 'react'
import {ChatContext} from '../../context/ChatContext.jsx'
import {AuthContext} from '../../context/AuthContext.jsx'
const RightSidebar = ()=>{

    const{selectedUser,messages}=useContext(ChatContext)

    const {logOut,onlineUsers}=useContext(AuthContext)
    const [msgImages,setMsgImages]=useState([])
    
    useEffect(()=>{
        setMsgImages(
            messages.filter((msg)=>msg.image).map((msg)=>msg.image)
        )
    },[messages])
    console.log("msgImages",msgImages)
    console.log('re run')


    return selectedUser&&(
        <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser?"max-md:hidden":""}`}>
            <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
                <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-20 aspect-[1/1] rounded-full border border-white-500" />
                <h1 className="text-gray-600 px-10 text-xl font-medium mx-auto flex items-center gap-2">
                   {onlineUsers.includes(selectedUser._id)&&<p className='w-2 h-2 rounded-full bg-green-500'></p>}
                    {selectedUser.fullName}
                </h1>
                <p className="text-gray-500 px-10 mx-auto">{selectedUser.bio}</p>
            </div>
            <hr  className="border-[#ffffff50] my-4"/>

            <div className="px-5 test-xs">
                <p>Media</p>
                <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
                    {msgImages?.map((url,index)=>(
                        <div key={index} onClick={()=>window.open(url)} className="cursor-pointer rounded"> 
                            <img src={url} alt="" className="h-full rounded-md" />
                        </div>
                    ))}

                </div>
            </div>

            <button onClick={()=>logOut()} className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer">Logout</button>
        </div>
    )
}

export default RightSidebar