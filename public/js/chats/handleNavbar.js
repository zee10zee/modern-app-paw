
function getNavbar(){ 
    return `
    <div class="left">
            <h1><span id="receiver" class="receiver"></span></h1>
            </div>
        <div class="right">
            <ul>
               
                <div class="loggedInUser" style="display: flex; gap: 20px; align-items: center;">
                    <a href="/" class="chat-icon" title="Chats">💬</a>

                    <div class="notification-wrapper">
                    <button class="notif-btn" title="Notifications">🔔</button>
                    <div class="notif-dropdown" style="display: none;">
                        <p>No new notifications</p>
                    </div>
                    </div>

                    <form id="logoutForm" action="/api/logout" method="post">
                    <button>Log out</button>
                    </form>
                </div>
            </ul>
        </div>
`
}

window.addEventListener('DOMContentLoaded',(e)=>{
    const chatNavbar = document.querySelector('.nav')
    chatNavbar.innerHTML = getNavbar()
})

window.addEventListener('popstate', (event) => {
  if (event.state?.page === 'chatList') {
    fetchAndRenderChats();
  }
});

 const chatLink = document.querySelector('.chat-icon')
   if(chatLink){
   chatLink.addEventListener('click', (e) => {
  e.preventDefault()
  history.pushState({ page: 'chatList' }, '', '/');
  // fetchAndRenderChats()
  e.preventDefault()
});
   }


