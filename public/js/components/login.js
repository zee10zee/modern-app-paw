window.loadActiveUserStoredInfo = () => {}
const loginForm = document.getElementById('loginForm')
const email = document.getElementById('email')
const password = document.getElementById('password')
const usernameAlert = sessionStorage.getItem('username')
const goodByeAlert = document.getElementById('goodByeAlert')
const alertTag = document.getElementById('validateAlert')
// wrong email or password 
const signupAlert = sessionStorage.getItem('signUpMsg')


// goodbye alert
if(usernameAlert && goodByeAlert){
    goodByeAlert.textContent = `See you again ${usernameAlert}`
    sessionStorage.removeItem('username')
    setTimeout(() => {
    goodByeAlert.style.display = "none"
}, 4000);
}


loginForm.addEventListener('submit', async(e)=>{
    e.preventDefault()
    const response = await axios.post('/api/login',{
        email : email.value,
        password : password.value
    });

    if(response.data.isLoggedIn){
        const {loggedInUser} = response.data       
    // calling the globalfunction
        window.loadActiveUserStoredInfo(
            loggedInUser.id,
            loggedInUser.firstname,
            loggedInUser.profilepicture,
            loggedInUser.usertoken
        )

        window.location.href="/"
    }else{
        console.log('please sign up first')
        sessionStorage.setItem('signUpMsg', response.data.message || 'Wrong Email or Password!')
        window.location.href='/api/login'
    }
})

if(signupAlert && alertTag){
     alertTag.textContent =signupAlert
      sessionStorage.removeItem('signUpMsg');
    setTimeout(() => {
     alertTag.style.display = "none"
    }, 3000);
}

window.loadActiveUserStoredInfo = (id,name,profilePicture,token)=>{
    sessionStorage.setItem('loggedIn_userId', id)
    sessionStorage.setItem('loggedIn_name', name)
    sessionStorage.setItem('loggedIn_profile', profilePicture)
    sessionStorage.setItem('loggedIn_userToken', token)     
}