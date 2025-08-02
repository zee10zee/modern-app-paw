
window.addEventListener('DOMContentLoaded', async(e)=>{
    const res = await axios.get(`/api/allChats/${receiverId}`)

    if(res.status === 200 && res.data.success){
        const chats = res.data.chats;
             if(chats.length === 0){
                console.log('no chat yet !')
                messageContainer.innerHTML = '<p class="noChat">No chat yet !</p>'
                return;
             }
        chats.forEach(chat => {
             console.log(chat)
            const message = chat.message;
            const date = chat.created_at;
            const direction = chat.sender_id === parseInt(receiverId) ? 'receivingMessage' : 'sendingMessage';
            loadInitialChats(message,formatDate(date) , direction)
        })
    
    }
})

function loadInitialChats(message, date, direction){
    // console.log(chat)
     const messageDiv = document.createElement('div')
    messageDiv.classList.add(direction, 'message')
  const chatContent = ` 
  <p class="text">${message} <span class="messageGear">...</span></p>
        <p class="date">${date}</p>
    `
    messageDiv.innerHTML = chatContent
    messageContainer.appendChild(messageDiv)
}