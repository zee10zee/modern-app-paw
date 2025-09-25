// const notifDropdown = document.querySelector('#notifDropdown')
const notifBtnDesktop = document.getElementById('notifBtn')
const notifBtnMobile = document.getElementById('notifBtnMobile')
const notifDropdown = document.getElementById('notifDropdown')

function toggleDropdown(e,button) {
  
  hideDropdownButVisible()

  const rect = button.getBoundingClientRect()
  if (window.innerWidth >= 768) {
  // Desktop → center under the button
  notifDropdown.style.left = `${rect.left + rect.width / 2 - notifDropdown.offsetWidth / 2}px`
  notifDropdown.style.top = `${rect.bottom + 5}px`;
} else {
  // Mobile → align with screen left edge or button
//   notifDropdown.classList.add('w-full')
  notifDropdown.style.left = `10px` // or `${rect.left}px` if you want it to follow button
  notifDropdown.style.bottom = `50px`
}
   showNotifDropdown(e,notifDropdown)
}

function hideDropdownButVisible(){
  // Temporarily show it to get width
  notifDropdown.style.display = "block";
  notifDropdown.style.visibility = "hidden"; // keep invisible
  const width = notifDropdown.offsetWidth; 
  notifDropdown.style.visibility = "visible"; // show properly
  notifDropdown.style.position = "fixed";
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
notifDropdown.prepend(notif_item);


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