const signupForm = document.getElementById('signUpForm')

const profileLogo = document.getElementById('profile-logo')

//clicking the input file explicityly for file preview
const signUpFileInput = document.querySelector('#profilePicture')

signUpFileInput.addEventListener('change', (e)=>{
     const profileLogo = document.querySelector('#profile-logo')
     if(!profileLogo) return console.log('no profile logo')
     handleFilePreview(e, profileLogo)
})

profileLogo.addEventListener('click', (e)=>{
    document.getElementById('profilePicture').click()
})

signupForm.addEventListener('submit', async(e)=>{
    e.preventDefault()
    const formData = new FormData(signupForm)
    try{
        const response = await axios.post('/api/signup', formData,{
        headers : {
            'Content-type' : 'multipart/form-data' 
        }
    });
    
    if(response.data.isLoggedIn){
        const {newUser} = response.data
        // return console.log(newUser)
        window.loadActiveUserStoredInfoOnSignup(
            newUser.id,
            newUser.firstname,
            newUser.profilepicture,
            newUser.usertoken
        )

        window.location.href="/"
    }else{
        const checkNewUserEl = document.getElementById('newUserCheck')
            console.log(checkNewUserEl)

        // if(checkNewUserEl.style.display === 'none') {
            checkNewUserEl.style.display = "block"
            checkNewUserEl.textContent = response.data.message

            setTimeout(() => {
                checkNewUserEl.style.display = 'none'
            }, 3000);
        // }
        
    }

    }catch(err){
        console.log(err)
    }

})
 function isVideo(filename){
      return /\.(mp4|webm|ogg)$/i.test(filename);
  }
  
window.loadActiveUserStoredInfoOnSignup = (id,name,profilePicture,token)=>{
    sessionStorage.setItem('loggedIn_userId', id)
    sessionStorage.setItem('loggedIn_name', name)
    sessionStorage.setItem('loggedIn_profile', profilePicture)
    sessionStorage.setItem('loggedIn_userToken', token)     
}