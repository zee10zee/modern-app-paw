
let oneToOnChats;
window.addEventListener('DOMContentLoaded', async(e)=>{
    const res = await axios.get(`/api/allChats/${receiverId}/${userToken}`)
     console.log(res.data)
    if(res.status === 200 && res.data.success){
        const chatBuddy = res.data.sender.firstname
            loadChatBuddyName(chatBuddy)
           oneToOnChats = res.data.chats;
             if(oneToOnChats.length === 0){
                console.log('no chat yet !')
                messageContainer.innerHTML = '<p class="noChat">No chat yet !</p>'
                return;
             }
        loadAllOneToOneChats()
    }
})


function loadChatBuddyName(buddyname){
    const msgReceiverName = document.querySelector('#receiver')
         msgReceiverName.textContent = buddyname;
}

function loadAllOneToOneChats(){
    oneToOnChats.forEach(chat => {
            console.log(chat)
        const message = chat.message;
        const date = chat.created_at;
        const direction = chat.sender_id === parseInt(receiverId) ? 'receivingMessage' : 'sendingMessage';
            loadInitialChats(message, date , direction)
    })
}

function loadInitialChats(message, date, direction){
     const messageDiv = document.createElement('div')
    messageDiv.classList.add(direction, 'message')
  const chatContent = ` 
  <p class="text">${message} <span class="messageGear">...</span></p>
        <p class="date">${formatDate(date)}</p>
    `
    messageDiv.innerHTML = chatContent
    messageContainer.appendChild(messageDiv)
}