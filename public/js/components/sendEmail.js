
const RecoveryForm = document.getElementById('recoveryForm')
const email = document.getElementById('forgottenEmail'); 
RecoveryForm.addEventListener('submit', async(e)=>{
    e.preventDefault()
   try{
     const res = await axios.post('/api/passwordForgot',{
        forgottenEmail : email.value
    })
    console.log(res.data)
   }catch(err){
    console.log(err)
   }
})