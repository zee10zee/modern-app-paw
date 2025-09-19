 let chatListContainer = document.querySelector('.chat-container')
    // const socket = io()
    const chatsMap = new Map()
    

    // function gotTopage(path){
    //    if(path === '/'){
    //       loadPostsOnLoad()
    //       fetchAndRenderChats()
    //       console.log(senderId, 'sender   iD')
    //    }else if(path === `/api/chatpage/${senderId}/${sender}`){
    //        loadAllOneToOneChats()
    //    }
    // }

      window.addEventListener('DOMContentLoaded', async(e)=>{
        // fetch prevous data
        await fetchAndRenderChats()
})

 async function fetchAndRenderChats(){
   const res = await axios.get('/api/userChatList');
     
    if((res.data.success && res.status === 200) || res.data){
          const chats = res.data.chats;
      
          const emptyMsg = res.data.emptyMessage;
          if(!chats || chats.length == 0)  return chatListContainer.innerHTML = emptyMsg


        //   to order based on the last message of each user
             loadAndCheckExistingMessages(chats,chatsMap)

           const chatsarray = Array.from(chatsMap.values())
               chatListContainer.innerHTML = ''
             
            chatsarray.forEach(chat => {
                previewLastMessages(chat,chatListContainer)
            }) 
    }
};



socket.on('received-message', (data)=>{
            console.log(data, 'data')
                const newChat = data.newMsg
                const receiver_name =  data.receiver_name
                const sender_name = data.sender_name;
                senderId = data.sender_id === loggedInUserId ? newChat.receiver_id :  newChat.sender_id
                console.log(senderId)

            
                const chatKey = [newChat.sender_id,newChat.receiver_id].sort().join('-')

                
                if(data.target === 'sender'){
                     const senderChat = chatListContainer.querySelector(`.chatItem[data-user-id="${newChat.receiver_id}"]`)
                     if(senderChat){
                        updateExistingChat(newChat,{receiver_name},senderChat)
                     }else{
                        previewLastMessages(newChat, chatListContainer,data)
                     }

                }
                
                // to the other use
                else{

                const isAvailible = chatsMap.get(chatKey)
                // return console.log(chatsMap.size)
                if(isAvailible){
                    console.log('chat is available in the map')
                    const receiverChat = chatListContainer.querySelector(`.chatItem[data-user-id="${newChat.sender_id}"]`)
                    updateExistingChat(newChat,{sender_name},receiverChat)
                }else{
                   console.log('chat is not available in the chat !')
                   previewLastMessages(newChat,chatListContainer,data)
                   
                }
            }  //sender - receiver live chats
})

  window.addEventListener('popstate', async function (event) {
          console.log('[PAGESHOW] Page restored from cache via back/forward');
           gotTopage(this.window.location.pathname)
      });

function updateExistingChat(newChat, sender = {},ChatElement){
                    const writer = ChatElement.querySelector('.writer')
                    if(!writer) return console.log('writer not found')
                    writer.textContent = newChat.receiver_id === parseInt(loggedInUserId) ? sender.sender_name : sender.receiver_name;
                   const msg = ChatElement.querySelector('.text-message')
                   if(!msg) return console.log('message element not found')
                    msg.textContent = newChat.message
                    const date = ChatElement.querySelector('.date')
                    if(!date) return console.log('date not found')
                      console.log(formatDate(newChat.created_at))
                     date.textContent = formatDate(newChat.created_at)
                    chatListContainer.prepend(ChatElement)
                    }

 function loadAndCheckExistingMessages(chats,chatsMap){
        for(let chat of chats){
                  const keyy = [chat.sender_id,chat.receiver_id].sort().join('-')
                  const existingChat = chatsMap.get(keyy)
                  if(!existingChat || new Date(chat.created_at) > new Date(existingChat.created_at)){
                    chatsMap.set(keyy, chat)
                  }
            }
    }


function previewLastMessages(lastChat,container, meta = {}){
    const senderName = lastChat.sender_name || meta.sender_name
    const receiverName = lastChat.receiver_name || meta.receiver_name
    //  return console.log(lastChat)
     const chatItem = document.createElement('a')
            chatItem.classList.add('chatItem')
            chatItem.dataset.userId = lastChat.sender_id === parseInt(loggedInUserId) ? lastChat.receiver_id : lastChat.sender_id;
            
            chatItem.href = lastChat.receiver_id === parseInt(loggedInUserId) ?  `/api/chatpage/${lastChat.sender_id}/${lastChat.sender_token}` :  `/api/chatpage/${lastChat.receiver_id}/${lastChat.receiver_token}`

            chatItem.innerHTML =`
                 ${lastChat.receiver_id === parseInt(loggedInUserId) ?`
                   <p class="writer">${senderName}</p>
                `:`<p class="writer">${receiverName}</p>`}
                  <p class="text-message">${lastChat.message}</p>
                  <i class="date smallTime">${formatDate(lastChat.created_at)}</i>
            `
            container.appendChild(chatItem)
}

function formatDate(timestamp){
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US',
        {hour: '2-digit', 
        minute : '2-digit', 
        }
    )    
}



