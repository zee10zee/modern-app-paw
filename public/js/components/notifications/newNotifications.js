
const notifDropdown = document.getElementById('notifDropdown')
const noNotif = document.querySelector('.no-notif')

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

       const notifList = displayNewNotifications(n.message,n.timestamp,n.post_id)
       notifDropdown.appendChild(notifList)
       
        countNotifs = res.data.notSeen_notifs.count
       const notCountEl = document.querySelectorAll('#notCount').forEach(not =>{
         not.textContent = countNotifs
       })
   }
   }) 
}
if(!hasMatch){
    noNotif.innerHTML = res.data.empty_message;
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
const notif_list = createElement('ul','notif_list')
const notif_item = document.createElement('li');
notif_item.classList.add('notif_item');
notif_item.id = postId
notif_item.innerHTML = `
    <p class="notifText">${message}</p>
    <small class="notif_date">${formatDate(date)}</small>
`
notif_list.prepend(notif_item)
noNotif.classList.add('deactive')
return notif_list
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