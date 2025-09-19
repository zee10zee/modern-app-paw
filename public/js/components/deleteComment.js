modal.addEventListener('click', (e)=>{
    if(e.target.classList.contains('commentDeleteBtn')){
     
      // post id comes from the global post id
       const commentId = e.target.dataset.commentId
       const postDiv = postsContainer.querySelector(`.posts[data-post-id="${postId}"]`)
     
       const commentDiv = postDiv.querySelector(`.comment[data-comment-id="${commentId}"]`)

         
        deleteComment(commentId, commentDiv, postId)
    }
})


const deleteComment = async(comId, commentDiv, postId)=>{     
     try{
        const response = await axios.delete(`/api/comment/${parseInt(postId)}/${comId}/delete`)
    console.log(response.data)
        const remainingComments = response.data.allComments;
        const commentCountElement = postsContainer.querySelector(`.posts[data-post-id="${postId}"]`)?.querySelector('.commentCount')
     if(response.data.success && response.status === 200){
        commentDiv.remove()
         commentCountElement.textContent = remainingComments.length;
     }
     }catch(err){
        console.log(err)
        alert(err)
     }
}