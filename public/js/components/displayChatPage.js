
// const socket = io()
const msgReceiverName = document.querySelector('.receiver')
console.log(msgReceiverName)
const userId = window.location.pathname.split('/').pop()
// console.log(userId)

window.addEventListener('DOMContentLoaded', async()=>{
  const response = await axios.get(`/api/chat/${userId}/receiver`)
     if(response.status === 200){
        const user = response.data.receiver;
         msgReceiverName.textContent = user.firstname;
     }
})