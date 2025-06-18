postsContainer.addEventListener('click', (e)=>{
    if(e.target.classList.contains('commentDeleteBtn')){
       const commentId = e.target.dataset.commentId
       const commentDiv = e.target.closest('.posts').querySelector(`.comment[data-comment-id = "${commentId}"]`)

        deleteComment(e,commentId, commentDiv)
    }
})


const deleteComment = async(event,comId, commentDiv)=>{
     event.preventDefault()
     try{
        const response = await axios.delete(`/api/comment/${comId}/delete`)
     if(response.status === 200){
        console.log(response.data.message)
        commentDiv.remove()
         sessionStorage.setItem('comment-deleted', response.data.message)
     }
     }catch(err){
        console.log(err)
        alert(err)
     }
}