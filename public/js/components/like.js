

const postContainer = document.getElementById('postsContainer')
postContainer.addEventListener('click', async(e)=>{
   e.preventDefault()
   console.log('clicked')
//    return console.log(e.target.classList.contains('likeBtn'))
   const likeBtn = e.target.classList.contains('likeBtn');
   if(likeBtn){
       const btnContainer = e.target.closest('.posts') || e.target.closest('.editPostContainer')
       const postId = btnContainer.dataset.postId;
       console.log(postId)
       const form =btnContainer.querySelector('.likeForm')
       if(form){
          await handlePostLike(postId)
       }else{
        console.log('not found the form')
       }
   }
})


const handlePostLike=  async(id)=>{
   const res = await axios.post(`/api/post/${id}/like`, {})
   if(res.status !== 200){
      return console.log('error liking the post ')
   }

   console.log('post liked success')
   sessionStorage.setItem('like-success', res.data.message)
   const likes = res.data.postLikes
   console.log(likes)

   const likeCount = document.getElementById('likesCount')
   likeCount.textContent = likes
}
