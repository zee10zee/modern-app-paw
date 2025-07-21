window.addEventListener('DOMContentLoaded', ()=>{
   postsContainer.addEventListener('click', (e)=>{
    const editBtn = e.target.classList.contains('edit-comment-button')
    const commentGear = e.target.classList.contains('comment-gear')
    const commId = e.target.dataset.commentId
    // const comment = e.target.closest(`.comment[data-comment-id = "${commId}"]`);
    const comment = e.target.closest(`.comment`);
         const closeCommentModal = e.target.classList.contains('close')

    if(commentGear || closeCommentModal){
        // one container should be opened at a time
         const commentEditDeleteContainer = comment.querySelector('.comment-delete-edit')
         openActiveContainer(commentEditDeleteContainer)
    }else if(editBtn){
        const commentId = e.target.dataset.commentId
       const postDiv = e.target.closest('.posts')
       const commentDiv = e.target.closest(`.comment[data-comment-id = "${commentId}"]`);
       console.log('comment edit button ', commentDiv)
       handleEditButton(postDiv, commentDiv, commentId)
    }
    
})
})

postsContainer.addEventListener('keypress', async(e)=>{
    if(e.target.classList.contains('commentInput') && e.key === 'Enter'){
        const postDiv = e.target.closest('.posts');
       const commentInput = postDiv.querySelector('.commentInput')
            await handleUpdateComment(e, commentInput)
    }
})

async function handleUpdateComment(e, inputComment){
    e.preventDefault()
    const commentId = inputComment.dataset.editingCommentId
     if(!commentId) return console.log('no comment id found in editing mode')
    const commentContent = inputComment.value
const postDiv = inputComment.closest('.posts')
    const commentDiv = postDiv.querySelector(`.comment[data-comment-id="${commentId}"]`);
    if(!commentDiv){
        return console.log('specific comment not found')
    }
    const response = await axios.patch(`/api/comment/${commentId}/update`, {comment : commentContent})
    if(response.status === 200){
       console.log(commentDiv)
       const updatedComment = response.data.updatedComment
    //    return console.log(updatedComment)

       const updatedCommentDate = new Date(updatedComment.created_at).toLocaleDateString('en-US',{
                weekday : 'short', 
                month : 'short',
                year : 'numeric'
             });
       commentDiv.innerHTML = `
             <img class="user-profile" src="${updatedComment.user_profile_picture}" alt="user-profile">   
              ${!comment.is_owner?`
                <strong id="author"><a class="user-link" href="/userProfile/${comment.author.user_token}/${comment.author.user_id}">${commentAuthor}</a></strong>
                `:`<strong id="author"><a class="user-link" href="/loginUserProfile/${comment.author.user_token}">You</a></strong>`}
                    <div class="text-commentGear" style="display: flex; justify-content: space-between; align-items : center">
                        <p id="text">${updatedComment.comment}</p>
                         <div id="comment-gear" class="comment-gear" data-comment-id = "${updatedComment.id}">⋮</div>
                    </div>
                    <div class="comment-delete-edit">
                        <span class="closep">❌</span>
                        <form id="edit-comment-form">
                            <button class="edit-comment-button" data-comment-id = "${updatedComment.id}">Edit</button>
                        </form>
                        <form id="delete-comment-button">
                            <button class="commentDeleteBtn" data-comment-id = "${updatedComment.id}">Delete</button>
                        </form>
                    </div>
                    <small id="date" class="date">${updatedCommentDate}</small>
       
       `
           inputComment.classList.remove('editingMode');
            inputComment.removeAttribute('data-editing-comment-id');
            inputComment.value = '';
            // as the new edit buttons lose their orgianal effect we need to re handle the clicking of edit button 
    }
}

function handleEditButton(postDiv, commentDiv, commentId){
       const commentInput = postDiv.querySelector('.commentInput')

    //    adding an editing mode so we can differentiate after clicking enter between adding comment and editing
       commentInput.classList.add('editingMode')
    //    and also a EDITING COMMEND ID ATTRIBUTE TO HAVE ACCESS TO THE COMMENT ID
       commentInput.dataset.editingCommentId = commentId
    //    inserting the editing comment text on the input value
        const commentText = commentDiv.querySelector('p').textContent
        commentInput.value = commentText
        commentInput.focus()
        commentInput.select()

}


function openActiveContainer(container){
    if(container.style.display === "block") {
          container.style.display = "none"
          currentOpenModal = null
    } else {
         container.style.display = "block"
         currentOpenModal = container
    }  
   }