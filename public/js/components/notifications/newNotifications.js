// const notifDropdown = document.querySelector('#notifDropdown')
const notifBtnDesktop = document.getElementById('notifBtn')
const notifBtnMobile = document.getElementById('notifBtnMobile')
const notifDropdown = document.getElementById('notifDropdown')

function toggleDropdown(e,button) {
  
  const rect = button.getBoundingClientRect()
   showNotifDropdown(e,notifDropdown)
}

notifBtnDesktop.addEventListener('click', e => toggleDropdown(e,e.currentTarget))
notifBtnMobile.addEventListener('click', e => toggleDropdown(e,e.currentTarget))

  let hasMatch = false;
   let post_id;
   let countNotifs;
window.addEventListener('DOMContentLoaded',async(e)=>{
   const res = await axios.get('/api/allNotifications')
//    return console.log(res.data)
   const notifications = res.data.notifications;

 
   if(notifications && notifications.length > 0){
   notifications.forEach((n)=>{
    post_id = n.post_id;
   if(n.receiver_id === parseInt(loggedInUserId)){ 
       hasMatch = true;
       displayNewNotifications(n.message,n.timestamp,n.post_id)
        countNotifs = res.data.notSeen_notifs.count
       const notCountEl = document.querySelectorAll('#notCount').forEach(not =>{
         not.textContent = countNotifs
       })
   }
   }) 
}


if(!hasMatch) notifDropdown.innerHTML = res.data.empty_message;
})



function showNotifDropdown(event,ddcontainer){
ddcontainer.style.display = "block"
event.stopPropagation()
}


// close notificaiotn modal if outside clicked
window.addEventListener('click', (e)=>{
    if(!notifDropdown.contains(e.target)) {
        notifDropdown.style.display = "none"
    }
})

// listening to like notification
socket.on('like_notif', data =>{
     console.log(data)
    displayNewNotifications(data.message,data.timestamp,data.post_id)
   const notCountEl = document.querySelector('#notCount').textContent = data.notifsCount;
})


// listening to comment_notification notification
socket.on('comment_notif', data =>{
     console.log(data)
    displayNewNotifications(data.message,data.timestamp,data.post_id)
    const notCountEl = document.querySelector('#notCount').textContent = data.notifsCount;
})

socket.on('share_root_notify', data =>{
    console.log(data)
    displayNewNotifications(data.shareMessage,data.shareTime,data.sharePostId)
    console.log(data.notifsCount, 'notifs count')
const notCountEl = document.querySelector('#notCount').textContent = data.notifsCount;
})

function displayNewNotifications(message,date,postId){
const notifDropdown = document.querySelector('#notifDropdown');
const notif_item = document.createElement('li');
notif_item.classList.add('notif_item');
notif_item.innerHTML = `
  <a href="#${postId}" class="notif_link">
    <p class="notifText">${message}</p>
    <small class="notif_date">${formatDate(date)}</small>
  </a>  
`;

notifDropdown.innerHTML = `
  <div class="notif_topbar">
    <h3 class="notif_title">Notifications</h3>
    <button class="notif_close" aria-label="Close">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
           viewBox="0 0 24 24" fill="none" stroke="currentColor" 
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
  <ul class="notif_list">
    ${notif_item.outerHTML}
  </ul>
`;

}


function formatDate(timestamp){
    const date = new Date(timestamp)
const formattedDate  = date.toLocaleDateString('en-US', {month : 'short'}) + 
'-' + date.toLocaleDateString('en-US',{weekday : 'short'})
    const timeFormat = date.toLocaleTimeString('en-US', {hour : '2-digit', minute : '2-digit', hour12 : true}
    )
    const timeAndDate = timeFormat

    return timeAndDate;
}