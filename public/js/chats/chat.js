
const socket = io()
const messageContainer = document.querySelector('.chat-container1');
const messageInput = document.getElementById('chatInput')
const receiverId = parseInt(window.location.pathname.split('/')[3])
const userToken = window.location.pathname.split('/').pop();
console.log(receiverId,userToken)
const typingIndicator = document.querySelector('.typing-event')

   socket.on('user-joined', (user)=>{
    console.log(user.loggedInUserName, ' joined the chat')
    const loggedInUserId = user.loggedInUserId;
   adoptScreenHeight()
})

socket.on('user-typing', username =>{
    console.log(username, ' is typing..')
    displayTypingIndicator(username)
    // adoptScreenHeight()
})

// listen to receiving message
socket.on('received-message', (data)=>{
  
    if(data.target === 'receiver'){
     console.log('global store chat ', window.storeChats)

    //  return console.log(data.newMsg, data.sender_name)
     displayMessage(data.newMsg.message, formatDate(data.newMsg.created_at), 'receivingMessage')
     adoptScreenHeight()
    }
})

const submitBtn = document.querySelector('.chatSubmitBtn')
submitBtn.addEventListener('click', (e)=>{
    let message = messageInput.value
    const now = new Date().toISOString()
    const displayTime = new Date().toLocaleTimeString('en-US',{hour : '2-digit', minute: '2-digit', hour12 : true})

    const messageData = {
        msg : message, 
        date : now,
        userId : receiverId
    }
    if(messageInput.value === '') return;

    socket.emit('newMessage-send', messageData)
    displayMessage(message, displayTime, 'sendingMessage')
    messageInput.value = ''
    adoptScreenHeight()
})
// typing event

messageInput.addEventListener('keypress', (e)=>{
    socket.emit('user-typing', receiverId)
})

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


function formatDate(timestamp){
    const date = new Date(timestamp)
const formattedDate  = date.toLocaleDateString('en-US', {month : 'short'}) + 
'-' + date.toLocaleDateString('en-US',{weekday : 'short'})
    const timeFormat = date.toLocaleTimeString('en-US')
    const timeAndDate = timeFormat + '-' + formattedDate

    return timeAndDate;
}

//typing indicator display

function displayTypingIndicator(username){
    // to prevent diplaying after each key press/ we need only once !
    removeTypingIndicator()
    
    const indicatorEl = document.createElement('p')
    indicatorEl.classList.add('typing-event')
    indicatorEl.textContent = `${username} is typing...`

    messageContainer.appendChild(indicatorEl)

   indicatorEl.timeout = setTimeout(removeTypingIndicator,2000);
}


function removeTypingIndicator(){
    const existingEl = document.querySelector('.typing-event')
    if(existingEl) {
        clearTimeout(existingEl.timeout)
        existingEl.remove()
    }
}


function adoptScreenHeight(){
     if(messageContainer.scrollHeight > messageContainer.clientHeight){
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
}