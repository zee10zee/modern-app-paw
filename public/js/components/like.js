

const postContainer = document.getElementById('postsContainer')
postContainer.addEventListener('click', async(e)=>{
   e.preventDefault()
   console.log('clicked')
//    return console.log(e.target.classList.contains('likeBtn'))
   const likeBtn = e.target.classList.contains('likeBtn');
   if(likeBtn){
       const btnContainer = e.target.closest('.posts') || e.target.closest('.editPostContainer')
       const postId = btnContainer.dataset.postId;
     
          await handlePostLike(postId)
      
   }
})


const handlePostLike=  async(id)=>{
   const res = await axios.post(`/api/post/${id}/like`, {})

   console.log('post liked success')
   sessionStorage.setItem('like-success', res.data.message)
   console.log(res.data)
   let likes = res.data.postLikes
   const likeCount = postContainer.querySelector('#likesCount')
   likeCount.textContent = likes
}
