
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
        sessionStorage.setItem('loggedIn_profile', response.data.loggedInUser.profilepicture)
        sessionStorage.setItem('loggedIn_name', response.data.loggedInUser.firstname)
        window.location.href="/"
    }else{
        console.log('please sign up first')
        sessionStorage.setItem('signUpMsg', 'Wrong Email or Password!')
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