
 let chatListContainer = document.querySelector('.chat-container')

 const bottomNav = document.querySelector('.bottom-nav')
const bottomNavchatContainer =  document.querySelector('.bottom-nav-chats')

    // const socket = io()
   const chatsMap = new Map()

window.addEventListener('DOMContentLoaded', async(e)=>{
  chatListContainer.innerHTML = loadSpinner('your chats')
  await fetchAndRenderChats(chatListContainer) 
})

 document.addEventListener('click',(e)=>{
  if(!e.target.classList.contains('chats-btn')){
    console.log('chats container should be hidden')
  }
 })


 async function fetchAndRenderChats(container){
   // fetch prevous data
       const chats =  await fetchChatsList()
        //   to order based on the last message of each user
      loadAndCheckExistingMessages(chats,chatsMap)

      console.log(chats)
    //  to make the map array , so to access them and loop them easily
    const chatsarray = Array.from(chatsMap.values())

    container.innerHTML = ''

    if(!Array.isArray(chats)) return container.innerHTML = chats

    chatsarray.forEach(chat => previewLastMessages(chat,container))
 }


 async function fetchChatsList(){
   const res = await axios.get('/api/userChatList');
     
    if((res.data.success && res.status === 200) || res.data){
          const chats = res.data.chats;
          console.log(chats) 
          const emptyMsg = res.data.emptyMessage;
          if(!chats || chats.length == 0)  return chatListContainer.innerHTML = emptyMsg
          return chats
    }
};



socket.on('received-message', (data)=>{
console.log(data.target)
if(window.innerWidth > 800){
  console.log('large size ')
}else{
  'small size'
}
 loadOrUpdateTheChats(data)
})


function loadOrUpdateTheChats(data){
  const newChat = data.newMsg
const receiver_name =  data.receiver_name
const sender_name = data.sender_name;
const receiver_token = data.receiver_token
const sender_token = data.sender_token

if(data.target === 'sender'){
      console.log('sender data ', data)
      const senderChat = chatListContainer.querySelector(`.chatItem[data-user-id="${data.newMsg.receiver_id}"]`)
      console.log(senderChat, 'SENDER CHAT', data, data.newMsg.receiver_id)
      if(senderChat){
        updateExistingChat(newChat,{receiver_name},senderChat)
      }else{
        previewLastMessages(newChat, chatListContainer,data)
      }
}else{
    updateHomeMessageList(data)
    console.log(data.newMsg, data.sender_name)
}
}

function displayMessage(message,date, sendingMessage){
    const messageHTML = document.createElement('div')
    messageHTML.classList.add(sendingMessage, 'message')
  const chatContent = ` 
  <p class="text">${message} <span class="messageGear">...</span></p>
        <p class="date">${date}</p>
    `
    messageHTML.innerHTML = chatContent
    messageContainer.appendChild(messageHTML)
}

function updateHomeMessageList(data){
   const newChat = data.newMsg
  const sender_name = data.sender_name;

   const chatKey = [newChat.sender_id,newChat.receiver_id].sort().join('-')
  const isAvailible = chatsMap.get(chatKey)
    // return console.log(chatsMap.size)
    if(isAvailible){
        console.log('chat is available in the map')
        const receiverChat = userChatListContainer.querySelector(`.chatItem[data-user-id="${newChat.sender_id}"]`)
        console.log('receiver chat item ', receiverChat)

        updateExistingChat(newChat,{sender_name},receiverChat)
    }
    else{
        console.log('chat is not available in the chat !')
        previewLastMessages(newChat,chatListContainer,data)
        
    }
}

const userChatListContainer = window.innerWidth > 800 ? chatListContainer : document.querySelector('#postsContainer')

function updateExistingChat(newChat, sender = {},ChatElement){

   console.log(newChat, sender, ChatElement)
    const writer = ChatElement.querySelector('.writer')
    if(!writer) return console.log('writer not found')
    writer.textContent = newChat.receiver_id === parseInt(loggedInUserId) ? sender.sender_name : sender.receiver_name;
    const msg = ChatElement.querySelector('.textMessage')
    if(!msg) return console.log('message element not found')
    msg.textContent = newChat.message
    const date = ChatElement.querySelector('.date')
    if(!date) return console.log('date not found')
      console.log(formatDate(newChat.created_at))
      date.textContent = formatDate(newChat.created_at)

    userChatListContainer.prepend(ChatElement)
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
  const receiverToken = lastChat.receiver_token || meta.receiver_token
  const senderToken = lastChat.receiver_token || meta.receiver_token
  let chatItem;

chatItem = document.createElement('a')
chatItem.classList.add('chatItem')

chatItem.dataset.userId = lastChat.sender_id === parseInt(loggedInUserId) 
  ? lastChat.receiver_id
  : lastChat.sender_id

chatItem.href = lastChat.receiver_id === parseInt(loggedInUserId) 
  ? `/api/chatpage/${lastChat.sender_id}/${senderToken}` 
  : `/api/chatpage/${lastChat.receiver_id}/${receiverToken}`

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
container.innerHTML = chatItem.outerHTML

}

function formatDate(timestamp){
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US',
        {hour: '2-digit', 
        minute : '2-digit', 
        }
    )    
}



