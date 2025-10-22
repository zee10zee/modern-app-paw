
const resetPasswordForm = document.getElementById('resetPasswordForm')
const password = document.getElementById('newPassword')
const confirmPs = document.getElementById('confirmPassword')
// give me the last part of the url after /
const token = window.location.pathname.split('/').pop()
const resetSubmitBtn = document.querySelector('.resetSubmitBtn')
const resetContainer = document.querySelector('.resetContainer')
const expiredMessage = sessionStorage.getItem('email-sent')
const failureMsg = document.querySelector('.failure-msg')

resetPasswordForm.addEventListener('submit', async(e)=>{
    e.preventDefault()
   try{
     resetSubmitBtn.disabled = true
     resetSubmitBtn.innerHTML = loading()
     const response = await axios.post(`/api/passwordReset/${token}`, {
        newPassword : password.value,
        confirmPassword : confirmPs.value
    })

       if(response.status === 200 && response.data.success){
        sessionStorage.setItem('passwordReset', 'password updated successfully !')
        resetSubmitBtn.disabled = false
          resetSubmitBtn.textContent = 'Confirm And Logout'
          window.location.href= "/api/login"
       }else{
        e.preventDefault()
        resetSubmitBtn.disabled = false
         resetSubmitBtn.textContent ='Send'
         sessionStorage.setItem('expire-invalidToken', response.data.message)

        //  const diffPas = 
         const message =  response.data.message
         failureMsg.innerHTML = `<h1>${message}</h1>`
         setTimeout(() => {
          failureMsg.classList.add('active')
         }, 3000);
       }
   }catch(err){
    console.log(err)
   }
})

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