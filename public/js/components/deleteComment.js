postContainer.addEventListener('click', (e)=>{
    if(e.target.classList.contains('commentDeleteBtn')){
       const commentId = e.target.dataset.commentId
       const commentDiv = e.target.closest(`.comment`)
       const postDiv = e.target.closest('.posts')

       const postId = postDiv.dataset.postId || postDiv.dataset.shareId
      //  const targetPost = Allposts.find(post => post.post_id === parseInt(postId) || post.share_id === parseInt(postId))
      //  return console.log(targetPost.comments.length, postId)
      console.log(postId)
        deleteComment(e,commentId, commentDiv, postId)
    }
})

// async function getComments(postId){
//    const commentRes = await axios.get(`/api/post/${postId}/${postId}/comments`)
//    return console.log('comments : ', commentRes)
// }



const deleteComment = async(event,comId, commentDiv, postId)=>{
     event.preventDefault()
     
     try{
        const response = await axios.delete(`/api/comment/${parseInt(postId)}/${comId}/delete`)

        const remainingComments = response.data.allComments;
        console.log(remainingComments.length)
        const commentCountElement = event.target.closest('.posts')?.querySelector('.commentCount')
     if(response.data.success){
        commentDiv.remove()
        
         commentCountElement.textContent = remainingComments.length;
     }
     }catch(err){
        console.log(err)
        alert(err)
     }
}