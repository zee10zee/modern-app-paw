window.addEventListener('DOMContentLoaded', ()=>{
   postsContainer.addEventListener('click', (e)=>{
    const editBtn = e.target.classList.contains('edit-comment-button')
    if(!editBtn) return console.log('no edit btn found'); 
    handleEditButton(e)
})
})

postsContainer.addEventListener('keypress', async(e)=>{
  
    if(e.target.classList.contains('commentInput') && e.key === 'Enter'){
        await handleUpdateComment(e,e.target)
    //     console.log('key press pressed after enter update')
    //     const postDiv = e.target.closest('.posts');
    //    console.log('enter key pressed', postDiv)
    //    const commentInput = postDiv.querySelector('.commentInput')
    // //    console.log(commentInput, postDiv)
    //     // return console.log('i am comment input',commentInput)
    //         await handleUpdateComment(e, commentInput)
    }
})

async function handleUpdateComment(e, inputComment){
    e.preventDefault()
    // return console.log('i am the one',inputComment)
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
       console.log(updatedComment)

       const updatedCommentDate = new Date(updatedComment.created_at).toLocaleDateString('en-US',{
                weekday : 'short', 
                month : 'short',
                year : 'numeric'
             });
       commentDiv.innerHTML = `
             <strong id="author"><a href="/authorProfile/${updatedComment.id}">${updatedComment.author_name}</a></strong>
                    <div class="text-commentGear" style="display: flex; justify-content: space-between; align-items : center">
                        <p id="text">${updatedComment.comment}</p>
                         <div id="comment-gear" class="comment-gear">⋯</div>
                    </div>
                    <div class="comment-delete-edit" style="">
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
          
    }
}

function handleEditButton(e){
    const commentId = e.target.dataset.commentId
       const postDiv = e.target.closest('.posts')
       const commentDiv = e.target.closest(`.comment[data-comment-id = "${commentId}"]`);
       console.log('comment edit button ', commentDiv)
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