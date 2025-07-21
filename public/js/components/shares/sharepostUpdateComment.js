postsContainer.addEventListener('keypress', (e)=>{
   if(e.target.classList.contains('editMode') && e.key === 'Enter'){
    // e.preventDefault()
        console.log('enter key pressed ')
        updateSharePostComment(e)

   }
})


async function updateSharePostComment(e){
    e.preventDefault()
     const inputForm = e.target.closest('.posts')?.querySelector('.commentingForm')
        const commentId = e.target.dataset.commentUpdateId;
        const postsHTML = e.target.closest(`.posts`)
        const commentHTML = postsHTML.querySelector(`.comment[data-comment-id="${commentId}"]`)
        // return console.log(commentHTML)

        const commentElement = commentHTML.querySelector('#text')
        console.log(commentElement, commentHTML)

    const formElement = new FormData(inputForm)
    const newComment = formElement.get('comment')

    // return console.log(newComment)
    const res = await axios.patch(`/api/sharePost/comment/${commentId}/edit`, {
        comment : newComment
    })

    if(res.status === 200 && res.data.success){
        const updatedComment = res.data.updatedComment;
        commentElement.textContent = updatedComment.comment;
        const commentInput = inputForm.querySelector('.shareCommentInput')
        commentInput.classList.remove('editMode')
        commentInput.dataset.commentUpdateId = null;
        commentInput.value = ""

    }
}