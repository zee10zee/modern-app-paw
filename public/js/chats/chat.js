
const socket = io()
const messageContainer = document.querySelector('.chat-container');
const messageInput = document.getElementById('chatInput')
const userid = parseInt(window.location.pathname.split('/').pop())
const typingIndicator = document.querySelector('.typing-event')


   socket.on('user-joined', (message)=>{
    console.log(message)
   
})

socket.on('user-typing', username =>{
    console.log(username, ' is typing..')
    displayTypingIndicator(username)
})

// listen to receiving message
socket.on('received-message', (data)=>{
    displayMessage(data.msg, data.date, 'receivingMessage')
})



const submitBtn = document.querySelector('.chatSubmitBtn').addEventListener('click', (e)=>{
    let message = messageInput.value
    const messageData = {
        msg : message, 
        date : formatDate(),
        userId : userid
    }
    socket.emit('newMessage-send', messageData)
    displayMessage(message, formatDate(), 'sendingMessage')
    messageInput.value = ''
})


// typing event

messageInput.addEventListener('keypress', (e)=>{
    socket.emit('user-typing', userid)
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


function formatDate(){
    const date = new Date()
const formattedDate  = date.toLocaleDateString('en-US', {month : 'short'}) + 
'-' + date.toLocaleDateString('en-US',{weekday : 'short'})
    const timeFormat = date.toLocaleTimeString('en-US', {hour: '2-digit', minute : '2-digit'})
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