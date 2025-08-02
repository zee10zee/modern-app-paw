//   const container =document.querySelector('.chat-container')
//   return console.log(container.dataset.loggedinuserId)
        

window.addEventListener('DOMContentLoaded', async(e)=>{
    // alert(receiverId)
    const res = await axios.get(`/api/allChats/${receiverId}`)
    // console.log('initial chats of one to one ', res)

    if(res.status === 200 && res.data.success){
        const chats = res.data.chats;
        if(chats.receiver_id === parseInt(receiverId)){
            chats.forEach(chat =>{ return console.log(chats.receiver_id, receiverId); loadInitialChats(chat.message, formatDate(chats.created_at), 'receivingMessage')})
        }else{
            chats.forEach(chat => loadInitialChats(chat.message, formatDate(chats.created_at), 'sendingMessage'))
        }
        
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