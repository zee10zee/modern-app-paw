
const RecoveryForm = document.getElementById('recoveryForm')
const email = document.getElementById('forgottenEmail'); 
const message = document.querySelector('.email-success-message')
const sendToeEmailBtn = document.querySelector('.toEmail-sentBtn')

RecoveryForm.addEventListener('submit', async(e)=>{
    e.preventDefault()
   try{
     sendToeEmailBtn.disabled = true
     sendToeEmailBtn.innerHTML = loading('sending')

     const res = await axios.post('/api/passwordForgot',{
        forgottenEmail : email.value
    })
        console.log(res.data)

      if(res.status === 200){
         sessionStorage.setItem('email-sent', res.data.message)
         showTempMsg()
         sendToeEmailBtn.disabled = false
         sendToeEmailBtn.textContent ='Send'
      }else{
        sendToeEmailBtn.disabled = false
         sendToeEmailBtn.textContent ='Send'
        sessionStorage.setItem('email-sent', res.data.message)
        showTempMsg()
        message.style.color = "red"
      }
       
        
      
   }catch(err){
    console.log(err)
   }
})
function showTempMsg(){
  const EmailSendingMessage = sessionStorage.getItem('email-sent')
if(message && EmailSendingMessage){
message.textContent = EmailSendingMessage
message.style.display = "block"
message.style.color = "green"
  setTimeout(() => {
  message.style.display = "none"
  sessionStorage.removeItem('email-sent')
}, 3000);}}


function loading(command = null){
  return `
  <div class="btn-loader-container">
    <div class="ring-loader">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    ${command ? `
    <span>${command}...</span>
    `:`
    <span>Signing in...</span>
    `}
  </div>
`;
}