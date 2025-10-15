const chatList = document.querySelector('.smChatListContainer')
const chatPageContainer = document.querySelector('.chatPageContainer')

chatList.addEventListener('click', async(e)=>{
    e.preventDefault()
    if(e.target.closest('.chatItem')){
        const userLink = getReceiverLink(e,'.chatItem')
        storeOnLocalStorage('chat-list-user-url',userLink)
        console.log('loading chats ..')
         hideAllPages()
         await loadChatPage(userLink)
    }
})

function updateChatCount(){
    // const seenChats = 
    console.log('update chat count')
}

function getReceiverLink(event,elClass = null){
     const itemEL = event.target.closest(elClass)  || event.target
     return itemEL.getAttribute('href') 
}

async function hideAllPages(){
    hideHomePage()
    hideChatList()
    hideUserProfilePage()
}

function hideChatPage(){
  chatPageContainer.classList.remove('active')
}

async function loadChatPage(link){
    console.log(link)
    const url = link.split('/').filter(url => url)
    console.log(url)
    const receiverId = url[2]
    const userToken = url[3]
    const oneToOneChats = await fetchAndLoadChats(receiverId,userToken)
    console.log(oneToOneChats)
    const chatsLayer = loadInitialChats(oneToOneChats)
    const fixedBottom = loadChatBoxAndButton()
    chatPageContainer.innerHTML = chatsLayer.outerHTML + fixedBottom
   chatPageContainer.classList.add('active')
   adoptTotalHeight()
}


function loadChatBoxAndButton(){
    return `  <div class="inputAndSentBtn">
            <input type="text" name="chatInput" id="chatInput" class="chatInput" placeholder = "Type a message...">
            <button class="chatSubmitBtn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 2L11 13"/>
                    <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
            </button>
        </div>`
}

async function fetchAndLoadChats(receiverId, userToken){
 console.log(receiverId,userToken)
    const res = await axios.get(`/api/allChats/${receiverId}/${userToken}`)
    if(res.status === 200 && res.data.success){
        const chatBuddy = res.data.sender.firstname
           oneToOnChats = res.data.chats;
           return oneToOnChats
    }
      return 'oops ! something went wrong fetching and loading chats'
}


function loadInitialChats(oneToOnChats){
 const messageContainer =createElement('div','chat-container1')

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
    return messageContainer

}

function storeOnLocalStorage(name,userLink){
    return localStorage.setItem(name,userLink)
}