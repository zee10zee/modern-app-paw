
const chatsContainer = document.querySelector('.chat-container')
const bodyContainer = document.querySelector('.chats-posts-users')
 

let oneToOnChats;

async function fetchAndLoadChats(receiverId, userToken){
    const res = await axios.get(`/api/allChats/${receiverId}/${userToken}`)
    if(res.status === 200 && res.data.success){
        const chatBuddy = res.data.sender.firstname
           oneToOnChats = res.data.chats;
           return oneToOnChats
    }
      return 'oops ! something went wrong fetching and loading chats'
}


function showHide(showingContainer,hidingContainer){

if(showingContainer.classList.contains('hide')){
// showing hiding container 
showingContainer.classList.remove('hide')
// hiding showing container
hidingContainer.classList.remove('active')
}else{
    showingContainer.classList.add('hide')
    hidingContainer.classList.add('active')
}

}

function loadInitialChats(oneToOnChats){
 const messageContainer = document.querySelector('.chat-container1')

        
    oneToOnChats.forEach(chat => {
         const direction = chat.sender_id === parseInt(loggedInUserId) ? 
        'sendingMessage' : 'receivingMessage';
        const messageDiv = document.createElement('div')
        messageDiv.classList.add(direction, 'message')
        const message = chat.message;
        const date = chat.created_at;
       
    messageDiv.innerHTML = ` 
  <p class="text">${message} <span class="messageGear">...</span></p>
        <p class="date">${formatDate(date)}</p>
    `

    messageContainer.appendChild(messageDiv)

    })

}

// function loadChatBuddyName(buddyname){
//     const msgReceiverName = document.querySelector('#receiver')
//          msgReceiverName.textContent = buddyname;
// }