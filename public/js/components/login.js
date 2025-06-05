
const loginForm = document.getElementById('loginForm')
const email = document.getElementById('email')
const password = document.getElementById('password')
const usernameAlert = sessionStorage.getItem('username')
const goodByeAlert = document.getElementById('goodByeAlert')
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

     console.log(response.data)
    if(response.data.isLoggedIn){
        window.location.href="/"
    }else{
        console.log('please sign up first')
        sessionStorage.setItem('signUpMsg', 'Please sign up first !')
        window.location.href='/api/signup'
    }
})