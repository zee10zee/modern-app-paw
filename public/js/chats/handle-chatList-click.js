
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
        storeOnLocalStorage('chat-list-user-url',userLink)
         hidePostAndRightContainer('none')

        const lgChatPageContainer = createElement('div','lgChatPageContainer')

          lgChatPageContainer.innerHTML= loadSpinner('chat page')
         await loadChatPage(lgChatPageContainer,userLink)
          main.appendChild(lgChatPageContainer)
          toggleHomeMenu(lgChatPageContainer)

          const chatBtn =  main.querySelector('.chatSubmitBtn')
          handleSendMsg(chatBtn)
        
    }
}


function toggleHomeMenu(lgContainer){
      const homeBt = document.querySelector('.returnHome')
      console.log(homeBt)
   // Get computed style to check actual display value
    const computedStyle = window.getComputedStyle(lgContainer)
    const isVisible = computedStyle.display !== 'none' && 
                     computedStyle.visibility !== 'hidden'
    
    console.log('Container display:', computedStyle.display)
    console.log('Container visible:', isVisible)

    if(isVisible){
        console.log('ready to appear the home button')
        homeBt.classList.add('active')
    } else {
        homeBt.classList.remove('active')
    }
}

topNav.addEventListener('click', (e)=>{
if(e.target.closest('.returnHome')){
     displayHome()
     notifDropdown.classList.remove('active')
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


// function hideUserProfileContainer(){
//     const profileContainer = document.querySelector('.userProfileContainer')?.classList.remove('active')
//     displayHome
// }

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



// 1 : cliking each list 
//2 : postscontainer and right container dispaly to none
// 2 : new container on the righ of the chat list take the full width
// 2 : add the chat data into it
