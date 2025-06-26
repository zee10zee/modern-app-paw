
// const socket = io()
const msgReceiverName = document.querySelector('.receiver')
const userId = window.location.pathname.split('/').pop()
// console.log(userId)
window.addEventListener('DOMContentLoaded', async()=>{
  const response = await axios.get(`/api/chat/${userId}/receiver`)
     if(response.status === 200){
        const user = response.data.receiver;
         const loginUserId = response.data.senderId; 
         msgReceiverName.textContent = user.firstname;
     }
})