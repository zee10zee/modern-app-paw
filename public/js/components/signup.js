const signupForm = document.getElementById('signUpForm')
const signUpBtn = document.querySelector('.signupBtn')

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

        signupForm.disabled = true
        signUpBtn.innerHTML = loading()

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

        signUpBtn.disabled =false
        signUpBtn.innerHTML = 'Sign up'

        window.location.href="/"
    }else{
        const checkNewUserEl = document.getElementById('newUserCheck')
            console.log(checkNewUserEl)

            checkNewUserEl.style.display = "block"
            checkNewUserEl.textContent = response.data.message

            setTimeout(() => {
                checkNewUserEl.style.display = 'none'
            }, 3000);
        
    }

    }catch(err){
        console.log(err)
    }

})
 function isVideo(filename){
      return /\.(mp4|webm|ogg)$/i.test(filename);
  }
  
window.loadActiveUserStoredInfoOnSignup = (id,name,profilePicture,token)=>{
    localStorage.setItem('loggedIn_userId', id)
    localStorage.setItem('loggedIn_name', name)
    localStorage.setItem('loggedIn_profile', profilePicture)
    localStorage.setItem('loggedIn_userToken', token)     
}

function loading(){
  return `
  <div class="btn-loader-container">
    <div class="ring-loader">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <span>Signing in...</span>
  </div>
`;
}