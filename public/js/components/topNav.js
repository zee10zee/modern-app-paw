const topNav = document.querySelector('.top-nav')

if(!topNav) console.log('no top nav')

topNav.addEventListener('click', async(e) =>{
  if(e.target.closest('.profilePicContain')){
    e.preventDefault()        
    console.log('large size owner profile clicked')
    hideHomePage()
    getSectionsAndLoadUserPage(e)
  }else if(e.target.classList.contains('logo')){
    e.preventDefault()
      console.log('memory dom clicked')
      hideUserProfilePage()
      await showHomePage()
  }if(e.target.closest('.notif-btn')){
     notifDropdown.classList.add('lg-reveal')
     e.stopPropagation()
  }
})

async function showHomePage(){
  const allContainer = document.querySelector('.chats-posts-users')
    allContainer.classList.remove('hide')
    const posts = await getAllposts()
    loadHomePosts(posts)
    
}

// close notificaiotn modal if outside clicked
document.addEventListener('click', (e)=>{
    if(!e.target.closest('#notifDropdown') || !e.target.classList.contains('.notif-btn')) {
        notifDropdown.classList.remove('lg-reveal')
    }
})


