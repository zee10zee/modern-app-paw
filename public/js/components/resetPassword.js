
const resetPasswordForm = document.getElementById('resetPasswordForm')
const password = document.getElementById('newPassword')
const confirm = document.getElementById('confirmPassword')
// give me the last part of the url after /
const token = window.location.pathname.split('/').pop()

const resetContainer = document.querySelector('.resetContainer')
const expiredMessage = sessionStorage.getItem('email-sent')


resetPasswordForm.addEventListener('submit', async(e)=>{
    e.preventDefault()
   try{
     const response = await axios.post(`/api/passwordReset/${token}`, {
        newPassword : password.value,
        confirmPassword : confirm.value
    })

       if(response.status === 200){
        console.log('password updated successfully !')
        sessionStorage.setItem('passwordReset', 'password updated successfully !')
          window.location.href= "/api/login"
       }else{
         sessionStorage.setItem('expire-invalidToken', response.data.message)

         const message = sessionStorage.getItem('expired-invalidToken')
         resetContainer.innerHTML = `<h1>${message}</h1>`
       }
   }catch(err){
    console.log(err)
   }
})