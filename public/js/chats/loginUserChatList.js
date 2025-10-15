
 let desktopChatContainer = document.querySelector('.lgChatListContainer')
const mobileChatContainer = document.querySelector('.smChatListContainer')
let chatListContainer = window.innerWidth >= 800 ? desktopChatContainer : mobileChatContainer

   let lastMessages = {}

window.addEventListener('DOMContentLoaded', async(e)=>{
  chatListContainer.innerHTML = loadSpinner('your chats')
   await fetchAndRenderChatList()
})

async function fetchAndRenderChatList(){
  const chats = await fetchChatsList()
    if(!Array.isArray(chats)) return console.log('no message in database')

    const lastMessages = getLastChats(chats)
     renderChatList(lastMessages)
}


function renderChatList(lastMessages){

   chatListContainer.innerHTML = ''
  const chatsArray = Object.values(lastMessages) 

   chatsArray.forEach(chat =>{
     chatListContainer.appendChild(previewLastMessage(chat,null))
   })  
}

function getLastChats(chats){

  if(!Array.isArray(chats)) return;

   chats.forEach((chat)=>{
     const receiverId = chat.receiver_id
     const senderId = chat.sender_id

     const key = generateConversationKey(receiverId,senderId)

    let existingLastMessage = lastMessages[key]
    let existingMsgDate = existingLastMessage ? new Date(existingLastMessage.created_at) : null 

     if(!existingLastMessage || new Date(chat.created_at) > existingMsgDate){
      // map should be updated 
     
        lastMessages[key] = chat
     }
   })
   return lastMessages
}

function generateConversationKey(receiver,senderId){
  const sortedKey = [receiver,senderId].sort((a,b)=> a - b)

    console.log('receiver id ', sortedKey[0], ' sender id ', sortedKey[1])

    return  `chat-pair ${sortedKey[0]}-${sortedKey[1]}`
}

function previewLastMessage(lastChat,meta = {}){
  const senderName = lastChat.sender_name || meta.sender_name
  const receiverName = lastChat.receiver_name || meta.receiver_name
  const receiverToken = lastChat.receiver_token || meta.receiver_token
  const senderToken = lastChat.sender_token || meta.sender_token
  let chatItem;

chatItem = document.createElement('a')
chatItem.classList.add('chatItem')

chatItem.dataset.userId = lastChat.sender_id === parseInt(loggedInUserId) 
  ? lastChat.receiver_id
  : lastChat.sender_id

chatItem.href = lastChat.sender_id === parseInt(loggedInUserId) 
  ? `/api/chatpage/${lastChat.receiver_id}/${receiverToken}` 
  : `/api/chatpage/${lastChat.sender_id}/${senderToken}`

  console.log('chat item hrf = ',chatItem.href)

chatItem.innerHTML = `
  <div class="chatContent">
    ${lastChat.receiver_id === parseInt(loggedInUserId) 
      ? `<p class="writer">${senderName}</p>` 
      : `<p class="writer">${receiverName}</p>`}

    <p class="textMessage">${lastChat.message}</p>
  </div>

  <div class="chatMeta">
    <i class="date smallTime">${formatDate(lastChat.created_at)}</i>
    <span class="unreadCount">0</span>
  </div>
`
return chatItem

}



 async function fetchChatsList(){
   const res = await axios.get('/api/userChatList');
     
    if((res.data.success && res.status === 200) || res.data){
          const chats = res.data.chats;
          const emptyMsg = res.data.emptyMessage;
          if(!chats || chats.length == 0)  return chatListContainer.innerHTML = emptyMsg
          return chats
    }
};



socket.on('received-message', (data)=>{
    const {newMsg} = data

    if(data.target === 'receiver'){
      const chatMateId = checkConversationItemEl(newMsg)
      const newMsgKey = generateConversationKey(newMsg.receiver_id, newMsg.sender_id)
      console.log(checkIfConversationExist(newMsg,newMsgKey))

      if(!checkIfConversationExist(newMsg,newMsgKey)){
        return appendAndSaveChatItem(newMsg,data,newMsgKey)
      }

      updateExistingConversation(newMsg,chatMateId)
      console.log('updated !')
      }

    else if(data.target === 'sender'){
      console.log('i ma receiveing for my self')
    }
    
})

socket.off('user-typing') //removes existing socket
socket.on('user-typing', (username)=>{
   console.log(username, 'is typing on chat list')
  const userChatListMsgEl = chatListContainer.querySelector('.textMessage')
  const prevousTextMessage = userChatListMsgEl.textContent
  userChatListMsgEl.textContent = `${username} is typing`

  setTimeout(() => {
    userChatListMsgEl.textContent = prevousTextMessage
  }, 2000);
})

function checkIfConversationExist(newMsg,newMsgKey){
   if(Object.keys(lastMessages).includes(newMsgKey)){
      console.log('yes key is there ', Object.keys(lastMessages))
      console.log('updating..')
      lastMessages[newMsgKey] = newMsg
      return true
}
      return false;
}

function appendAndSaveChatItem(newMsg,data,newMsgKey){
  chatListContainer.prepend(previewLastMessage(newMsg,data))
    console.log('Appended !')
    console.log('saving into the local chat list ...')
     lastMessages[newMsgKey] = newMsg
     console.log('saved !')
}


function checkConversationItemEl(newMsg){
  const chatMateId = newMsg.sender_id === loggedInUserId ? newMsg.receiver_id : newMsg.sender_id
  return chatMateId
}


function updateExistingConversation(newMsg,mateId){
  const chatItemEl = chatListContainer.querySelector(`.chatItem[data-user-id="${mateId}"]`)
  console.log(chatItemEl)
  // CHANGE THE NEW MESSAGE / NEW DATE / NEW UNDREAD CHATS
  const msgEl = chatItemEl.querySelector('.textMessage')
  if(!msgEl) return console.log('no msgEl')

  const dateEl = chatItemEl.querySelector('.date')
  if(!dateEl) return console.log('no date El')

  const unreadCountEl = chatItemEl.querySelector('.unreadCount')
  if(!unreadCountEl) return console.log('no unread count el')

  msgEl.textContent = newMsg.message
 dateEl.textContent = formatDate(newMsg.created_at)
  unreadCountEl.textContent = 0
}


function formatDate(timestamp){
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US',
        {hour: '2-digit', 
        minute : '2-digit', 
        }
    )    
}



