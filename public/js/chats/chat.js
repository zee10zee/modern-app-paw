
const socket = io()
const messageContainer = document.querySelector('.chat-container');
const messageInput = document.getElementById('chatInput')
const userid = parseInt(window.location.pathname.split('/').pop())
console.log(typeof(userid))
// user joins to save id on server
    socket.emit('join-chat', userId)

    socket.on('user-joined', (message)=>{
    console.log(message)
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