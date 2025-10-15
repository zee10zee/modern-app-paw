
const chatsContainer = document.querySelector('.chat-container')
const bodyContainer = document.querySelector('.chats-posts-users')
const url = window.location.pathname.split('/').filter(segment => segment)

let oneToOnChats;
const loggedInUserId = sessionStorage.getItem('loggedIn_userId')







// function loadChatBuddyName(buddyname){
//     const msgReceiverName = document.querySelector('#receiver')
//          msgReceiverName.textContent = buddyname;
// }