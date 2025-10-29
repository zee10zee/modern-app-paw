
    const baseURL = `http://localhost:3000`

window.addEventListener('DOMContentLoaded', (e)=>{
    // const containerClass = localStorage.getItem('last-active-window')
    const url = window.location.pathname
       
       if(!url) return console.log('no such url found')

        // return console.log(url, 'URL')
        if(window.innerWidth < 800){
          
          window.addEventListener('DOMContentLoaded', () => {
            const path = window.location.pathname;

            // Define all SPA routes you want
            const validRoutes = ['/chatList', '/chatPage', '/community', '/userProfile'];

            if (!validRoutes.includes(path)) {
              // fallback to home if route not recognized
              history.replaceState({}, '', '/'); // update URL to home
              hideAllShowHomePage();
            } else {
              // load the corresponding SPA view
              loadLastActiveView(path);
            }
          });

        }
})

function loadLastActiveView(url){
   console.log(url)
   const userPageClasses = document.querySelector('.action-item, .profilePicContain, .profileImageLink')
   const userLink = localStorage.getItem('chat-list-user-url')
   console.log(userLink)
    switch (url) {
    case `${baseURL}/api/userProfile`:
      hideAllShowUserProfilePage(userPageClasses);
      break;
    case `${baseURL}/api/community`:
      hideAllShowCommunity();
      break;
    case `${baseURL}/api/chatList`:
      hideAllShowChatList();
      break;
    case `${baseURL}/api/chatPage`:
      hideAllShowChatPage(userLink)
      break;
    
    default:
      hideAllShowHomePage()
      break;
  }
    
}