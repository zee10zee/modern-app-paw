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
    console.log(response.data)
    if(response.data.isLoggedIn){
        sessionStorage.setItem('loggedIn_profile', response.data.newUser.profilepicture)
        sessionStorage.setItem('loggedIn_name', response.data.newUser.firstname)
        window.location.href="/"
    }

    }catch(err){
        console.log(err)
    }

})