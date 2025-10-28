
const main = document.querySelector('.chats-posts-users')
const lgContainer = document.querySelector('.lgChatPageContainer')

if(window.innerWidth > 800) {

chatListContainer.addEventListener('click', async(e)=>{
    e.preventDefault()
    await createContainerAndAppendChatPage(e)
})

}


async function createContainerAndAppendChatPage(e){
    const tar_parent = e.target.closest('.chatItem') || e.target.closest('.action-item')
    if(tar_parent){
        checkDuplicateLgContainer()
        const userLink = getReceiverLink(e,'.chatItem')

        const receiverId = getReceiverId(userLink)



        storeOnLocalStorage('chat-list-user-url',userLink)
         hidePostAndRightContainer('none')

        const lgChatPageContainer = createElement('div','lgChatPageContainer')

          const conversationId = await createNewConversation(receiverId)
          if(!conversationId || conversationId === null){
             return console.log('did not found conversation id')
          }
          
          lgChatPageContainer.innerHTML= loadSpinner('chat page')
         await loadChatPage(lgChatPageContainer,userLink)
          main.appendChild(lgChatPageContainer)
          
          toggleHomeMenu()

          const chatBtn =  main.querySelector('.chatSubmitBtn')
          handleSendMsg(chatBtn)
        
    }
}


async function updateSeenMessages(conversation_id){
    console.log(conversation_id)
  const res = await axios.patch('/api/chats/update/isRead', {id : conversation_id})
  console.log(res)

  if(res.status === 200 && res.data.success){
    alert('messages are marked read !')
  }
}


function toggleHomeMenu(){

    const homeIcon = topNav.querySelector('.returnHome')

    if(homeIcon) homeIcon.remove()

    // TOMMAROW THIS SHOULD WORK INSHALLAH
     const homeBtn = createElement('div','returnHome')
     const topRightIcons = topNav.querySelector('.rightNavIcons')
     
     homeBtn.innerHTML = `<?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 112.07" style="enable-background:new 0 0 122.88 112.07" xml:space="preserve"><style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style><g><path fill="green" class="st0" d="M61.44,0L0,60.18l14.99,7.87L61.04,19.7l46.85,48.36l14.99-7.87L61.44,0L61.44,0z M18.26,69.63L18.26,69.63 L61.5,26.38l43.11,43.25h0v0v42.43H73.12V82.09H49.49v29.97H18.26V69.63L18.26,69.63L18.26,69.63z"/></g></svg>`
     topRightIcons.prepend(homeBtn)
}

// handle the home return from chat page
topNav.addEventListener('click', (e)=>{
if(e.target.closest('.returnHome')){
     displayHome()
    e.target.closest('.returnHome').remove()
}
})


function displayHome(){
 main.querySelector('.lgChatPageContainer')?.remove()
 hidePostAndRightContainer('flex')
 const rightContainer = document.querySelector('.rightContainer')
 rightContainer.style.flexDirection = "column"
    // if(chatContainer && window.getComputedStyle(chatContainer).display !== 'none'){
    //     chatContainer.remove()
    // }

if(!rightContainer)  hideAllShowHomePage()
}

function checkDuplicateLgContainer(){
    const lgContainer = document.querySelector('.lgChatPageContainer')

        if(lgContainer){
            lgContainer.remove()
        }

}

function hidePostAndRightContainer(state){
const rightContainer = document.querySelector('.rightContainer')

postsContainer.style.display = state
rightContainer.style.display = state
}


function handleSendMsg(btn){
    btn.addEventListener('click', (e)=>{
       setUpAndSendMessage(main)
    })
}