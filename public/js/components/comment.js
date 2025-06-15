
window.addEventListener('DOMContentLoaded', (e)=>{
    const postsContainer = document.getElementById('postsContainer')

    // on submitting the comment
    postsContainer.addEventListener('keypress', async(e)=>{
          const postDiv = e.target.closest('.posts')
          

        if(e.target.classList.contains('commentInput') && e.key === 'Enter'){
           
            await handleComment(e, true, 3)
            await handleComment(e);
        }
    });

    // trigger edit comment button
    postsContainer.addEventListener('click', (e)=>{
        e.preventDefault()
      
        if(e.target.classList.contains('edit-comment-button')){ 
            const postDIV = e.target.closest('.comment')
             const postFormInput =postDIV.querySelector('[name="comment"]');
             const commentDiv = e.target.closest('.comment')
             const commentDataId = commentDiv.dataset.commentId;
             const commentInput = commentDiv.closest('.posts').querySelector('.commentInput')


            //  adding a data comment to the comment input
             commentInput.dataset.edittingId = commentDataId              
             
             const targetedComment = commentDiv.querySelector('p').textContent
             postFormInput.value = targetedComment
             postFormInput.focus()
             postFormInput.select()

             commentInput.classList.add('editing-mode')

        }
    })



    // pop up edit modal


    async function handleComment(event, isEdit = false, commentId = null){
        event.preventDefault()
        const form = event.target.parentElement
        const postId = form.querySelector('[name="post_id"]').value
        const commentText = form.querySelector('.commentInput').value

        let method = isEdit? 'put' : 'post';
        let url = isEdit ? `/api/comment/${commentId}/edit` : 
        `/api/post/${postId}/comment`

        // sending comment to the server
        const res = await axios[method](url,{comment : commentText})
    
        if(res.status === 200){
            if(isEdit){
                isEdit = true;
             console.log('room for editing ', commentId)
            }else{
                const newComments = res.data.postComments
                const lastComment = newComments[newComments.length - 1]
                updateCommentUI(postId,lastComment)
                form.reset()
            }
        }
    }
})


// UPDATE COMMENTS UI
const updateCommentUI = (postId,newComment)=>{

      const newCommentDate = new Date(newComment.created_at).toLocaleDateString('en-US',{
                weekday : 'short', 
                month : 'short',
                year : 'numeric'
             });

            const postDiv = 
            postsContainer.querySelector(`.posts[data-post-id="${postId}"]`)
            if(!postsContainer) return;
            console.log(newComment)
            const commentsContainer = postDiv.querySelector('.commentsContainer')
            const commentHTML = 
            `
                <div class="comment" data-comment-id="${newComment.id}">
                <strong id="author">${newComment.author_name}</strong>
                    <div class="text-commentGear" style="display: flex; justify-content: space-between; align-items : center">
                  <p id="text">${newComment.comment}</p>
                     <div id="comment-gear" class="comment-gear">⋯</div>
                    </div>
                    <div class="comment-delete-edit" style="">
                        <form id="edit-comment-form">
                            <button class="edit-comment-button">Edit</button>
                        </form>
                        <form id="delete-comment-button">
                            <button>Delete</button>
                        </form>
                    </div>
                    <small id="date" class="date">${newCommentDate}</small>
                        </div>
                    </div>
            `
            commentsContainer.insertAdjacentHTML('afterbegin', commentHTML)

        }

        // editing comment using modal SPA