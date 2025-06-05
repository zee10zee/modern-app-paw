const loggedinLink = document.getElementById('login')
const signupLink = document.getElementById('signup')
const logoutLink = document.getElementById('logout')
window.addEventListener('DOMContentLoaded',async(e)=>{
   const response = await axios.get('/')

   if(response.data.isLoggedIn){
     console.log('logged in user is active')
          loggedinLink.style.display = "none"       
   }else{
        signupLink.style.display = "none"
        loggedinLink.style.display = "none"
   }
})