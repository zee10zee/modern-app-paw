window.addEventListener('DOMContentLoaded', ()=>{
   postsContainer.addEventListener('click', (e)=>{
  
    const commId = e.target.dataset.commentId
    const postDiv = e.target.closest('.posts')
    const commentDiv = postDiv.querySelector(`.comment[data-comment-id="${commId}"]`)
    const postId = postDiv.dataset.postId;
  

    modal.addEventListener('click', (e)=>{
        e.preventDefault()
    const editBtn = e.target.classList.contains('commentEditBtn')
      if(editBtn) {
        const commentId = modal.dataset.commentId        
       handleEditButton(postDiv, commentDiv, commentId);
      }
    }) 
    
    
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

    //  check for any comment having class "edited"

    const comments = postsContainer.children[0]
     console.log('comments children ', comments)

    const prevousLebeledComment = postsContainer.querySelector('.edited')
    if(prevousLebeledComment) postsContainer.classList.remove('edited')

const postDiv = inputComment.closest('.posts')
    const commentDiv = postDiv.querySelector(`.comment[data-comment-id="${commentId}"]`);
    if(!commentDiv){
        return console.log('specific comment not found')
    }

    const response = await axios.patch(`/api/comment/${commentId}/update`, {comment : commentContent})
    if(response.status === 200){
       console.log(commentDiv)
       commentDiv.classList.add('edited')
       const updatedComment = response.data.updatedComment
    //    return console.log(updatedComment)

       const updatedCommentDate = new Date(updatedComment.created_at).toLocaleDateString('en-US',{
                weekday : 'short', 
                month : 'short',
                year : 'numeric'
             });
       commentDiv.innerHTML = `
       
                <img class="user-profile ownerPhoto" src="${updatedComment.user_profile_picture}" alt="user-profile">
                ${!updatedComment.is_owner ?`
                <strong id="author"><a class="user-link" class="userProfileLink" href="/userProfile/${updatedComment.usertoken}/${updatedComment.user_id}">${updatedComment.author_name}</a></strong>
                `:`<strong id="author"><a class="user-link" href="/loginUserProfile/${updatedComment.usertoken}">You</a></strong>`}
                <div class="text-commentGear">
                     <p id="text">${updatedComment.comment}</p>
                     ${updatedComment.is_owner?`
                     <div id="gear" data-comment-id = "${updatedComment.id}" class="gear">⋮</div>
                     `:''}
                </div>
                <small id="date" class="date">${updatedCommentDate}</small>
                
               `
           inputComment.classList.remove('editingMode');
            inputComment.removeAttribute('data-editing-comment-id');
            inputComment.value = '';
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
