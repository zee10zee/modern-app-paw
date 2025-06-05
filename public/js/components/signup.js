const signupForm = document.getElementById('signUpForm')
const alertTag = document.getElementById('validateAlert')
const signupAlert = sessionStorage.getItem('signUpMsg')
if(signupAlert && alertTag){
     alertTag.textContent =signupAlert
      sessionStorage.removeItem('signUpMsg');
    setTimeout(() => {
     alertTag.style.display = "none"
    }, 3000);
}

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
        window.location.href="/"
    }

    }catch(err){
        console.log(err)
    }

})