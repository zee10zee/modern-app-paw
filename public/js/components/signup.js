const signupForm = document.getElementById('signUpForm')


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

window.loadActiveUserStoredInfoOnSignup = (id,name,profilePicture,token)=>{
    sessionStorage.setItem('loggedIn_userId', id)
    sessionStorage.setItem('loggedIn_name', name)
    sessionStorage.setItem('loggedIn_profile', profilePicture)
    sessionStorage.setItem('loggedIn_userToken', token)     
}