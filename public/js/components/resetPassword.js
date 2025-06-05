
const resetPasswordForm = document.getElementById('resetPasswordForm')
const password = document.getElementById('newPassword')
const confirm = document.getElementById('confirmPassword')
// give me the last part of the url after /
const token = window.location.pathname.split('/').pop()

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
       }
   }catch(err){
    console.log(err)
   }
})