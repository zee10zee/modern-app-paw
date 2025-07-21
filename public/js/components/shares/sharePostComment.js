postsContainer.addEventListener('keypress', (e)=>{
    if(e.target.classList.contains('shareCommentInput') && e.key === 'Enter' && !e.target.classList.contains('editMode')){
        e.preventDefault()
        const inputElement = e.target;
        const sharePost = e.target.closest('.posts')
        const shareId = sharePost.dataset.shareId;
        console.log(shareId)
        handleCommenting(e,shareId,sharePost)
        inputElement.value = ''
    }    
})



async function handleCommenting(event,shareId,sharePost){
    // event.preventDefault()
    // const commentContainer = sharePost.querySelector('.commentsContainer')
    const formElement = event.target.parentElement;
    const form = new FormData(formElement)
    const comment = form.get('comment')
    // return console.log(comment)
    try{
        const response = await axios.post(`/api/sharePost/${shareId}/comment`, {comment : comment})
    if(response.status === 200 && response.data.success){
        const allComments = response.data.comments;
       console.log(allComments)
        const tartgetComment = allComments[0]
        
        const commentCountElement = sharePost.querySelector('.commentCount')
        // return console.log(tartgetComment.user_id,allComments)
        commentCountElement.textContent = allComments.length;

        const commentContainer = sharePost.querySelector('.commentsContainer')
        const shareCommentElement = document.createElement('div')
        shareCommentElement.classList.add('comment')
        shareCommentElement.dataset.commentId = tartgetComment.id

          shareCommentElement.innerHTML = addNewComment(tartgetComment)
        //   return console.log(commentContainer)
        // commentContainer.insertAdjacentHTML('afterbegin', commentHTML)
          commentContainer.prepend(shareCommentElement)
    }    
    }catch(err){
        console.log(err)
    }
}
function addNewComment(comment){
    const commentDate = new Date(comment.created_at).toLocaleDateString('en-US',{
        weekday : 'short', 
        month : 'short',
        year : 'numeric'
     });
    return `
     
             <img class="user-profile" src="${comment.user_profile_picture}" alt="user-profile">
            ${!comment.is_owner?`
                <strong id="author"><a class="user-link" href="/userProfile/${comment.userstoken}/${comment.user_id}">${comment.author_name}</a></strong>
                `:`<strong id="author"><a class="user-link" href="/loginUserProfile/${comment.userstoken}">You</a></strong>`}
                <div class="text-commentGear">
                     <p id="text">${comment.comment}</p>
                     ${comment.is_owner?`
                     <div id="comment-gear" data-comment-id = "${comment.id}" class="comment-gear">⋮</div>
                     `:''}
                </div>
                <small id="date" class="date">${commentDate}</small>
                ${comment.is_owner?`
                <div class="comment-delete-edit">
                    <span class="close">❌</span>
                      <form id="edit-comment-form">
                        <button class="edit-comment-button" data-comment-id = "${comment.id}">Edit</button>
                      </form>
                      <form id="delete-comment-button">
                        <button class="commentDeleteBtn" data-comment-id = "${comment.id}">Delete</button>
                      </form> 
                </div>
                `:''}
    `
}