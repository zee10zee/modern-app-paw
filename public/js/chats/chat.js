const messageContainer = chatPageContainer.querySelector('.chat-container1')
let receiverId;

   socket.on('user-joined', (user)=>{
    console.log(user.loggedInUser, ' joined the chat')
    const loggedInUserId = user.loggedInUserId;
    // adoptTotalHeight()
})

socket.on('user-typing', username =>{
    // return console.log(username)
    displayTypingIndicator(username)
    adoptTotalHeight()
})

socket.on('received-message', (data)=>{
    handleReceiverMessage(data)
    return console.log(data.target)
})



function handleReceiverMessage(data){

    if(data.target === 'receiver'){ 
        handleReceivingMessages(data)
      console.log('handle recieving message return')
    }else{
      console.log('you are looking for you own message', data)
    }
}

function handleReceivingMessages(data){
     console.log('handle recieving message return')
    const lastMessageData = localStorage.setItem('lastMsgData', data)
    console.log(data.newMsg, data.sender_name, 'just inside handleReceiving message')
    const msg = data.newMsg.message
    const msgTime = formatDate(data.newMsg.created_at)
    const directionClass = 'receivingMessage'
    
    if(window.innerWidth < 800){
      appendMessageToContainer(msg,msgTime,directionClass,messageContainer)
      adoptTotalHeight()
    }else{
    console.log('before appending to receiving message ')
       
        const lgChatPageContainer = main.querySelector('.chat-container1')
        console.log(lgChatPageContainer, 'just about to append receiving message')
        console.log('message data info ',data, data.newMsg, ' AND AVRIABLES ', msgTime,msg, directionClass)
        appendMessageToContainer(msg,msgTime,directionClass,lgChatPageContainer)
    }
}

function appendMessageToContainer(msg,messageTime,directionC,container){
    const messageHTML = displayMessage(msg,messageTime,directionC)
    if(container) container.appendChild(messageHTML)
}

chatPageContainer.addEventListener('click', (e)=>{

    if(e.target.closest('.chatSubmitBtn')){
      console.log('submit btn clicked too')
      setUpAndSendMessage(chatPageContainer)
      //checkout the status of unread messages
        // await updateSeenMessages(conversation_id)
        // console.log(conversation_id)
    }
   
})


async function setUpAndSendMessage(container){
    const messageInput = container.querySelector('#chatInput')

    const receiverId = getReceiverId()
     console.log(receiverId)
    let message = messageInput.value
    const now = new Date().toISOString()
    const displayTime = new Date().toLocaleTimeString('en-US',
        {hour : '2-digit', minute: '2-digit', hour12 : true})

    const storageConver_id = localStorage.getItem('conver_id')

    const conversationId = storageConver_id
     console.log('gloabal conversation id Notice ', conversationId)
    const messageData = {
        msg : message, 
        date : now,
        userId : receiverId,
        conversation_id : conversationId
    }
    
    if(messageInput.value === '') return;

    socket.emit('newMessage-send', messageData)
      
    const messageContainer = container.querySelector('.chat-container1')

    appendMessageToContainer(message, displayTime, 'sendingMessage',messageContainer)   
    messageInput.value = ''
    adoptTotalHeight()
}
// typing event



const messageInput = chatPageContainer.querySelector('#chatInput')
if(messageInput){
messageInput.addEventListener('keypress', (e)=>{
     const receiverId = getReceiverId()
    //   console.log(receiverId, 'on key press')
     socket.emit('start-typing', receiverId)
     adoptTotalHeight()
})
}



function adoptTotalHeight(){
const chatContainer = document.querySelector('.chat-container1')
   if(chatContainer.scrollTop < chatContainer.scrollHeight){
     chatContainer.scrollTop  = chatContainer.scrollHeight - chatContainer.clientHeight
    }
}

function getReceiverId(){
    console.log(Object.keys(localStorage), 'local storage');
    
    const url = localStorage.getItem('chat-list-user-url')
     console.log(url)
    const filteredURL = url.split('/').filter(segment => segment)

    console.log(filteredURL, 'filtered url')
    const receiverId = filteredURL[2]
    return receiverId
}


function displayMessage(message,date, sendingMessage){
    const messageHTML = document.createElement('div')
    messageHTML.classList.add(sendingMessage, 'message')
  const chatContent = ` 
  <p class="text">${message} <span class="messageGear">...</span></p>
        <p class="date">${date}</p>
    `
    messageHTML.innerHTML = chatContent
    return messageHTML
}


function formatDate(timestamp){
    const date = new Date(timestamp)
const formattedDate  = date.toLocaleDateString('en-US', {month : 'short'}) + 
'-' + date.toLocaleDateString('en-US',{weekday : 'short'})
    const timeFormat = date.toLocaleTimeString('en-US', {hour : '2-digit', minute : '2-digit', hour12: 'true'})
    const timeAndDate = timeFormat

    return timeAndDate;
}

//typing indicator display


function displayTypingIndicator(username){
const messageContainer = document.querySelector('.chat-container1')

if(!messageContainer) return console.log('message container is not defined !')

    // remove the indicator element if any from before 
    removeTypingIndicator()
    
    // then recreate the indidcator element 
    const indicatorEl = document.createElement('p')
    indicatorEl.classList.add('typing-event','date')
    indicatorEl.textContent = `${username} is typing...`
    messageContainer.appendChild(indicatorEl)

    // remove the element after two seconds too , if message delays
   indicatorEl.timeout = setTimeout(removeTypingIndicator,2000);
}


function removeTypingIndicator(){
    const existingEl = document.querySelector('.typing-event')
    if(existingEl) {
        clearTimeout(existingEl.timeout)
        existingEl.remove()
    }
}

// Detect keyboard show/hide
let initialHeight = window.innerHeight;

window.addEventListener('resize', () => {
    const currentHeight = window.innerHeight;
    
    if (currentHeight < initialHeight) {
        // Keyboard is open
        document.querySelector('.inputAndSentBtn').style.marginBottom = '0';
        // Scroll to bottom to keep input in view
        // scrollToBottom('.');
    } else {
        // Keyboard is closed
        document.querySelector('.inputAndSentBtn').style.marginBottom = '0';
    }
    
    initialHeight = currentHeight;
});


function scrollToBottom(containerClass) {
    const messagesContainer = document.querySelector(containerClass);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}