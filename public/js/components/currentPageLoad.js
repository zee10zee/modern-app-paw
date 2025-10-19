window.addEventListener('DOMContentLoaded', (e)=>{
    const containerClass = localStorage.getItem('last-active-window')

       if(!containerClass) return console.log('no such view found')

        if(window.innerWidth < 800){
          loadLastActiveView(containerClass)
        }
})

function loadLastActiveView(containerClass){

   const userPageClasses = document.querySelector('.action-item, .profilePicContain, .profileImageLink')
   const userLink = localStorage.getItem('chat-list-user-url')
   console.log(userLink)
    switch (containerClass) {
    case '.userProfileContainer':
      hideAllShowUserProfilePage(userPageClasses);
      break;
    case '.smGroupsContainer':
      hideAllShowCommunity();
      break;
    case '.smChatListContainer':
      hideAllShowChatList();
      break;
    case '.chatPageContainer':
      hideAllShowChatPage(userLink)
      break;
    
    default:
      hideAllShowHomePage()
      break;
  }
    
}