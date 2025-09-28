let messageLayer = document.querySelector('.chatPageContainer')


chatsContainer.addEventListener('click',async(e)=>{
    e.preventDefault()
     const link =  getChatUrl(e)
     goToChatPage(link)
    hideHomeContent()
})

function hideHomeContent(){
     bodyContainer.classList.add('hide')
     messageLayer.classList.add('active')
}


function getChatUrl(e){
     const chatLinkWithOutBaseUrl = e.target.closest('.chatItem')?.getAttribute('href') || e.target.getAttribute('href')
    const receiverId = chatLinkWithOutBaseUrl.split('/')[3]
    const userToken = chatLinkWithOutBaseUrl.split('/').pop()
      return chatLinkWithOutBaseUrl
}


async function navigateTo(pathname){
    if(pathname === '/'){
        console.log('home page reached')
        const posts = await getAllposts()
        renderPosts(posts)
        showHide(bodyContainer,messageLayer)
    }else if(pathname.includes('/api/chatpage/')){
        console.log('user chat page raeched')

        const urlSegments = pathname.split('/').filter(segment => segment)
        console.log(urlSegments, 'url segment')
        goToChatPage(urlSegments)

    }else if(pathname.includes('/userProfile/')){
       console.log('this is ganna go to user profile')
    }
}


async function goToChatPage(url){
   

        const receiverId = url.split('/')[3]
        const userToken = url.split('/')[4]
    
        
         console.log(receiverId,userToken)
        const oneToOneChats = await fetchAndLoadChats(receiverId,userToken)

      console.log('one to one chats ', oneToOneChats)
        // get initial chats
        window.history.pushState({chats : oneToOneChats, page : 'chats'},'', url)
         loadInitialChats(oneToOneChats)
         hideAddPostBtn()
}


function hideAddPostBtn(){
    const addPostBtn = document.querySelector('.add-btn')
    if(window.location.pathname !== '/'){
        addPostBtn.classList.add('hide')
    }else{
        addPostBtn.classList.remove('hide')
    }
}



window.addEventListener('popstate', async(event)=>{
   const pn = window.location.pathname
    if(pn === '/'){
       renderPosts(await getAllposts())
       showHide(bodyContainer,messageLayer)
       hideAddPostBtn()

    }else if(pn.includes('/api/chatpage/')){
        goToChatPage(pn)
        hideHomeContent()
    }else{
        console.log('it might be the userprofile')
    }
    
})

document.addEventListener('load', async(e)=>{
    if(window.location.pathname.includes('/api/chatpage')){
         await goToChatPage(window.location.pathname)
        hideHomeContent()
    }
})