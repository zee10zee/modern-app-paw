const main = document.querySelector('.chats-posts-users')
if(window.innerWidth > 800) {

chatListContainer.addEventListener('click', async(e)=>{
    e.preventDefault()

    const rightContainer = document.querySelector('.rightContainer')
    if(e.target.closest('.chatItem')){

        const lgContainer = document.querySelector('.lgChatPageContainer')

        if(lgContainer){
            lgContainer.remove()
        }

        const userLink = getReceiverLink(e,'.chatItem')
        storeOnLocalStorage('chat-list-user-url',userLink)

        postsContainer.style.display = "none"
        rightContainer.style.display = "none"

        // step 2 

        const lgChatPageContainer = document.createElement('div')
        lgChatPageContainer.classList.add('lgChatPageContainer')
        // step 3 : 
        // lgChatPageContainer.innerHTML = loadSpinner('all chats ...')
         await loadChatPage(lgChatPageContainer,userLink)

        main.appendChild(lgChatPageContainer)
        const chatBtn =  main.querySelector('.chatSubmitBtn')

        handleSendMsg(chatBtn)

    }
})

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
