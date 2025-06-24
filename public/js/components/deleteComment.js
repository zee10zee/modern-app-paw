postContainer.addEventListener('click', (e)=>{
    if(e.target.classList.contains('commentDeleteBtn')){
       const commentId = e.target.dataset.commentId
      //  return console.log(document.querySelector(`.comment[data-comment-id="${commentId}"]`))
       const commentDiv = e.target.closest(`.comment`)

        deleteComment(e,commentId, commentDiv)
    }
})


const deleteComment = async(event,comId, commentDiv)=>{
     event.preventDefault()
     try{
        const response = await axios.delete(`/api/comment/${comId}/delete`)
        console.log(response.data)
     if(response.data.success){
        commentDiv.remove()
     }
     }catch(err){
        console.log(err)
        alert(err)
     }
}