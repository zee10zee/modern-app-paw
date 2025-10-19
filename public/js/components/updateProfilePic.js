

document.addEventListener('click', async(e)=>{
    const profileLayer = e.target.closest('.profilePic-update-logo')
    const updateTextParent = e.target.closest('.update-profile-logo')
    const updateText = updateTextParent.querySelector('.update-profile-text')
    console.log(updateText)

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
        console.log('now should be sent to server')
        const input = document.querySelector('.updateProfileInput')

        if(!input) return console.log('no input el')
        const updatedImage = input.files[0]
         console.log(updatedImage)

       
        const formData = new FormData()
        formData.append('updated-profile',updatedImage)

        const prfCover = profileLayer.querySelector('.profileCover')
        // prfCover.innerHTML = ''
        // prfCover.innerHTML = loadSpinner('new image')

        // send to server
        await sendToserver(formData, updateText)
    }
})

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

async function sendToserver(formData,updateTxt){

   try{
     const result = await axios.patch(`/api/user/${loggedInUserId}/profileUpdate`, formData)

     if(result.status === 200 && result.data.success){
    result.data.updatedPic
        const newImage = result.data.updatedPic.profilepicture
        const message = result.data.message
        const profileCoverContainer = updateTxt.closest('.profilePic-update-logo')
        const pc = profileCoverContainer.querySelector('.profileCover')
        
        createSucessModal()
        // change the confirm back to update profile file
        updateTxt.textContent = 'Update profile'

        const userNavProfilePic = document.querySelector('.top-nav')?.querySelector('.profilePic')

        // updating the profile image of lgin user from session storage
        sessionStorage.setItem('loggedIn_profile',newImage)

        console.log('element ', userNavProfilePic, userNavProfilePic.src, ' and thenew image ', newImage)

        // changeing the src on the ui
        userNavProfilePic.src = newImage
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

function createSucessModal(){
    const newModal = document.createElement('div')
    newModal.classList.add('success-modal')
    newModal.textContent = 'profile updated successfully !'
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