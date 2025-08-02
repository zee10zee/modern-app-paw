
const msgReceiverName = document.querySelector('.receiver')
const chatContainerElement = document.querySelector('.chat-container')

const userId = window.location.pathname.split('/').pop()

window.addEventListener('DOMContentLoaded', async()=>{
  const response = await axios.get(`/api/chat/${userId}/receiver`)
     if(response.status === 200){
        const user = response.data.receiver;
        let loginUserId = response.data.senderId; 
        const id = document.querySelector('uId')
         msgReceiverName.textContent = user.firstname;
     }
})