
let socket = io()

socket.on('connect', ()=>{
   console.log('connected to the socket')
})
// console.log('like',socket)
socket.on('like_notif', (data)=>{
   console.log(data.post_id)
   const postDiv = postContainer.querySelector(`.posts[data-post-id="${data.post_id}"]`)
   let postLikeBtn = postDiv.querySelector('#likesCount')   
   postLikeBtn.textContent = data.likesCount
})

const postContainer = document.getElementById('postsContainer')
postContainer.addEventListener('click', async(e)=>{
   e.preventDefault()
   console.log('clicked')
//    return console.log(e.target.classList.contains('likeBtn'))
   const likeBtn = e.target.classList.contains('likeBtn');
   if(!likeBtn) return;
       const btnContainer = e.target.closest('.posts') || e.target.closest('.editPostContainer')
       const postId = parseInt(btnContainer.dataset.postId);
          await handlePostLike(postId)      
})


const handlePostLike = async(id)=>{
   const res = await axios.post(`/api/post/${id}/like`, {})
   //  return console.log(res)
   console.log('post liked success')
   sessionStorage.setItem('like-success', res.data.message)
   console.log(res.data)
   let likes = res.data.postLikes
   const postDiv = postContainer.querySelector(`.posts[data-post-id="${id}"]`)
   let postLikeBtn = postDiv.querySelector('#likesCount')
   
   postLikeBtn.textContent = likes
}
