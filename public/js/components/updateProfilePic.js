

document.addEventListener('click', async(e)=>{
    const profileLayer = e.target.closest('.profilePic-update-logo')
    const updateTextParent = e.target.closest('.update-profile-logo')
    const updateText = updateTextParent.querySelector('.update-profile-text')

    if(updateTextParent && updateText.textContent.includes('Update profile')){
        console.log('clicked and the picker should open')
        const inputEl = document.createElement('input')
        inputEl.type = 'file'
        inputEl.name = 'updateProfileInput'
        inputEl.style.display = "none"
        inputEl.classList.add('updateProfileInput')
        inputEl.accept = 'image/*'
        const profileCover = document.querySelector('.profileCover')
        if(!profileCover) return console.log('cover does not exist');

        document.body.appendChild(inputEl,profileCover)

        profileCover.innerHTML = ''

        handleChangeEvent(inputEl,profileCover)  
       
       inputEl.click()
    }else if(updateTextParent && updateText.textContent.includes('Confirm')){
        
        const input = document.querySelector('.updateProfileInput')

        if(!input) return console.log('no input el')
        const selectedImage = input.files[0]

          updateText.disabled = true
        updateText.innerHTML = loading('updating..')


        // confirm signature and token by server 
        const url = await fileUploadOnImageKit(selectedImage)
        console.log(url, ' file url of updating image')
        
        updateAllUIProfilePages(profileLayer)
        // send to server

        
        await sendToserver(url,updateText)
        // sessionStorage.setItem('loggedIn_profile',newImage)
        updateNavbarUserProfile('.top-nav',url)
    }
})


function updateAllUIProfilePages(profileLayer){
  const prfCover = profileLayer.querySelector('.profileCover')
  const comunityProfile = profileLayer.querySelector('.profileCover')
//   1: navbar login user profile
//   2: post owner user profile
 
}

 function handleChangeEvent(input,profileCover){

    input.addEventListener('change', async(e)=>{
    // profileCover.innerHTML = loadSpinner('profile pic ..')

   if(!input.files || !input.files[0]){
           return console.log('no file selected')
    }

   
        handleFilePreview(e,profileCover)

        // store for later use 
        const img = profileCover.querySelector('img')
        img.classList.add('profilePhoto')

        // change the update profile text to confirm

        const inputParent = profileCover.parentElement;
        const updateText  = inputParent.querySelector('.update-profile-text')

        updateText.textContent = 'Confirm'
    })
}

async function sendToserver(fileUrl,updateTxt){

   try{
     const result = 
     await axios.patch(`/api/user/${loggedInUserId}/profileUpdate`, {fileUrl})

     if(result.status === 200 && result.data.success){

          updateTxt.disabled = false
          updateTxt.innerHTML = 'Save'

        // result.data.updatedPic
        const newImage = result.data.updatedPic.profilepicture
        const message = result.data.message
        const profileCoverContainer = updateTxt.closest('.profilePic-update-logo')
        const pc = profileCoverContainer.querySelector('.profileCover')
        
        createSucessModal(message)

        localStorage.setItem('loggedIn_profile', newImage)
        // change the confirm back to update profile file
        updateTxt.textContent = 'Update profile'

        // updating the profile image of lgin user from session storage
        sessionStorage.setItem('loggedIn_profile',newImage)


      
     }

   }catch(err){
    console.log(err)
   }finally{
    // removing created input after use
    const input = document.querySelector('.updateProfileInput')
    if(!input) return console.log('input not found')
     input.remove()
   }
}

function updateNavbarUserProfile(container,newImage){
    const userNavProfilePic = document.querySelector(container)?.querySelector('.profilePic')
          // changeing the src on the ui
        userNavProfilePic.src = newImage
}

function createSucessModal(message){
    const newModal = document.createElement('div')
    newModal.classList.add('success-modal')
    newModal.textContent = message
    document.body.appendChild(newModal)
}


console.log(localStorage,'what is local storage', sessionStorage, ' this is session storage')

// class updateProfile{
//     constructor(){
//       this.userProfilePage = document.querySelector('.userProfileContainer')
//       this.init()
//     }

//     init(){
//         this.userProfilePage.addEventListener('click', (e)=>{
//             this.handleClick(e)
//         })
//     }

//     handleClick(e){
//         if(e.target.closest('.update-profile-logo')){
//            this.handleUpdateclick(e)
//         }
//     }

//       handleUpdateclick(e){
          
//          this.parent = e.target.closest('.update-profile-logo')
//             this.fileInput = this.parent.querySelector('.updateProfileInput')
            
//             if(!this.fileInput) return console.log('no update file')


//             console.log(this.fileInput, 'now it should be clicing the input file ')
//             this.fileInput.click()
//     }


// }

// const profile = new updateProfile()
// // console.log(profile, 'update profile calsss')