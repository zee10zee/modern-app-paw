const signUpBtn = document.querySelector('.signupBtn')
let selectedProfile;
const profileLogo = document.getElementById('profile-logo')
const signupForm = document.getElementById('signUpForm')

//clicking the input file explicityly for file preview
const signUpFileInput = document.querySelector('#profilePicture')

signUpFileInput.addEventListener('change', (e)=>{
     const profileLogo = document.querySelector('#profile-logo')
     if(!profileLogo) return console.log('no profile logo')

    //logo
     selectedProfile = signUpFileInput.files[0]

     handleFilePreview(e, profileLogo)
    //  return console.log(selectedFile)

})

profileLogo.addEventListener('click', (e)=>{
    document.getElementById('profilePicture').click()
})

signupForm.addEventListener('submit', async(e)=>{
    e.preventDefault()
    //authenticate new user
    const result = await checkDuplicate()
    console.log(result)
    if(result.data.success !== true) return displayDuplicate(result)

    // go either with profile or without
    if(selectedProfile){
    const profileUrl = await fileUploadOnImageKit(selectedProfile)
    await saveUserDataOnDB(signupForm,profileUrl)
    }
    
    else{
      await saveUserDataOnDB(signupForm)
    }
})


async function checkDuplicate(){
const formData = new FormData(signupForm)
const newUserEmail = formData.get('email')
 console.log(newUserEmail)
   try{
     const result = await axios.get(`/api/newUser/authenticate`, {params: {email : newUserEmail}})

     return result

   }catch(err){
    console.log(err)
   }
}


async function fileUploadOnImageKit(file){
const signupForm = document.getElementById('signUpForm')

  // first upload the image on imageKit
    const imgKitAuthResponse = await axios.get('/imageKit/auth')

    if(imgKitAuthResponse.status === 200 && 
       imgKitAuthResponse.data.success){
        console.log(imgKitAuthResponse, ' file name ', file)

       const {authElements} = imgKitAuthResponse.data
       const pub_key = `public_nArfg7wpXuzoz3r/mtoDlG5MNZs=`

        const formData = new FormData()
        formData.append('file', file)
        formData.append('fileName', file.name)
        formData.append('token', authElements.token)
        formData.append('signature', authElements.signature)
        formData.append('expire', authElements.expire)
        formData.append('publicKey', pub_key)

    //   uploading the file directly to imgkit after confirmation from server
      const uploadRes = await axios.
      post('https://upload.imagekit.io/api/v1/files/upload', formData)

      if(uploadRes.status === 200){
          const profileUrl = uploadRes.data.url
           console.log(uploadRes)
        //   send data to server to save on db
           return profileUrl
      }
      
    }
}

async function saveUserDataOnDB(form,profile = null){
const formData = new FormData(form)

console.log(formData.get('fname'), 'form data befor send to server')

  const userInfo = {
    fname : formData.get('fname'),
    email : formData.get('email'),
    password : formData.get('password'),
    // profile : profile
  }

  if(!profile){
    console.log('proceed witout profile')
  }else {
    userInfo.profile = profile
  } 
    try{
        signUpBtn.disabled = true
        signUpBtn.innerHTML = loading()

        const response = await axios.post('/api/signup', userInfo,{
        headers : {
            'Content-type' : 'application/json' 
        }
    });

    handleSignUpResult(response)

    }catch(err){
        console.log(err)
    }
}


function handleSignUpResult(response){
  if(response.data.success){
    return userVerified(response)
  }

  displayDuplicate()
}


function userVerified(response){
  
        const {newUser} = response.data
        console.log(newUser)
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
}

function displayDuplicate(response){

   console.log(response)
  const checkNewUserEl = document.getElementById('newUserCheck')

            checkNewUserEl.style.display = "block"
            checkNewUserEl.textContent = response.data.message
            signUpBtn.disabled =false
            signUpBtn.innerHTML = 'Sign up'

            setTimeout(() => {
                checkNewUserEl.style.display = 'none'
            }, 3000);
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

 function isVideo(filename){
      return /\.(mp4|webm|ogg)$/i.test(filename);
  }