
postsContainer.addEventListener('click', (e)=>{
    if(e.target.classList.contains('sharePost-edit-comment-button')){
        const commentInputDiv = e.target.closest('.posts')

        const commentInput = commentInputDiv.querySelector('.shareCommentInput')
        const targetCommentDiv = e.target.closest('.comment')
        const commentText = targetCommentDiv.querySelector('#text').textContent
        commentInput.value = commentText
        commentInput.classList.add('editMode')
        commentInput.dataset.commentUpdateId = targetCommentDiv.dataset.commentId;
        console.log(targetCommentDiv, commentInput)
        commentInput.focus()
    }
})


