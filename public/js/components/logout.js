
const logoutForm = document.getElementById('logoutForm')

// alert the goodbye user
async function getUsername(){
  try{
    const result = await axios.get('/userGoodBye')
   console.log(result)

   if(result.data.isLoggedIn){
        const username = result.data.username
        sessionStorage.setItem('username', username)
        window.location.href="/api/login"
   }
  } catch(err){
    console.log(err)
  }
}


logoutForm.addEventListener('click', async(e)=>{
    getUsername()
    console.log('logged out')
    const response = await axios.post('/api/logout', {})
    if(response.status === 200){
        console.log('see you later')
        window.location.href ="/api/login"
    }
})
