const notif_dropdown = document.querySelector('#notifDropdown')
const notifBtnDesktop = document.getElementById('notifBtn')
const notifBtnMobile = document.getElementById('notifBtnMobile')
const notifDropdown = document.getElementById('notifDropdown')

function toggleDropdown(e,button) {
  const rect = button.getBoundingClientRect()
  notifDropdown.style.left = `${rect.left + rect.width / 2 - notifDropdown.offsetWidth / 2}}px`
  notifDropdown.style.top = window.innerWidth >= 768 
      ? `${rect.bottom + window.scrollY + 5}px`   // desktop: below button
      : `${rect.top + window.scrollY - notifDropdown.offsetHeight - 5}px` // mobile: above button
  notifDropdown.classList.toggle('hidden')
  notifDropdown.classList.toggle('opacity-0')
  notifDropdown.classList.toggle('opacity-100')
   showNotifDropdown(e,notif_dropdown)
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


if(!hasMatch) notif_dropdown.innerHTML = res.data.empty_message;
})



function showNotifDropdown(event,ddcontainer){
ddcontainer.classList.remove('hidden')    
ddcontainer.classList.toggle('opacity-100');
ddcontainer.classList.toggle('visible');
event.stopPropagation()
}


// close notificaiotn modal if outside clicked
window.addEventListener('click', (e)=>{
    if(!notif_dropdown.contains(e.target)) {
        notif_dropdown.classList.remove('flex')
        notif_dropdown.classList.add('hidden')
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
const notif_dropdown = document.querySelector('#notifDropdown')
    const notif_item = document.createElement('li')
    notif_item.classList.add('notif_item','px-3', 'py-2', 'hover:bg-gray-100', 'cursor-pointer')
    notif_item.innerHTML = `
 
    <a href="#${postId}" class="flex flex-col gap-1">
      <p class="notifText text-gray-800 text-sm font-medium truncate">${message}</p>
      <small class="notif_date text-gray-500 text-xs">${formatDate(date)}</small>
    </a>  
   `
   
   notif_dropdown.prepend(notif_item)

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