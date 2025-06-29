const postForm = document.getElementById('postForm')
const newPostAlert = document.getElementById('newPostAlert')
const postAlert = sessionStorage.getItem('newPost')
console.log(postAlert,newPostAlert)
if(newPostAlert && postAlert){
    newPostAlert.textContent = postAlert

    setTimeout(() => {
        newPostAlert.style.display = "none"
    }, 3000);
    sessionStorage.removeItem('newPost'); // ✅ clear it after use
}

postForm.addEventListener('submit', async(e)=>{
    e.preventDefault()

    const formData = new FormData(postForm)

    const response = await axios.post('/api/newPost', formData, {});
    // we have access to the new post and comments / so we will work on the spa of it soon ...
    // const newPost = response.data.post
    // const comments = response.data.commentsOfPost

    // return console.log(response.data)
    if(response.status === 201){
        sessionStorage.setItem('newPost', 'new memory added successfully !')
        console.log(response.data.message)
        window.location.href="/"
    }else{
        console.log('failure in creating new memory')
    }

})