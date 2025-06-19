
const RecoveryForm = document.getElementById('recoveryForm')
const email = document.getElementById('forgottenEmail'); 
const message = document.querySelector('.message')


RecoveryForm.addEventListener('submit', async(e)=>{
    e.preventDefault()
   try{
     const res = await axios.post('/api/passwordForgot',{
        forgottenEmail : email.value
    })
        console.log(res.data)

      if(res.status === 200){
         sessionStorage.setItem('email-sent', res.data.message)
         showTempMsg()
      }else{
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
