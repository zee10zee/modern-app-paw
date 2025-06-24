


window.addEventListener('DOMContentLoaded', (e)=>{
    const postsContainer = document.getElementById('postsContainer')
    
    // on submitting the comment
    postsContainer.addEventListener('keypress', async(e)=>{
          const commentInput = e.target
          console.log(commentInput)
          const commentDiv = e.target.closest('.posts').querySelector('.comment')

        if(e.target.classList.contains('commentInput') && e.key === 'Enter'){
            e.preventDefault()
            if(!commentInput.classList.contains('editingMode')){
                if(!commentInput.dataset.commentId){
                    await handleComment(e)
                }
            }
        }
    });

   
    async function handleComment(event){
        event.preventDefault()
        const form = event.target.parentElement
        const postId = form.querySelector('[name="post_id"]').value
        const commentText = form.querySelector('.commentInput').value
        console.log(commentText)

        let method = 'post';
        let url = `/api/post/${postId}/comment`

        // sending comment to the server
        const res = await axios[method](url,{comment : commentText})
    
                const allNewComments = res.data.postComments
                const lastComment = allNewComments[allNewComments.length - 1]
                updateCommentUI(postId,lastComment)
                form.reset()
    }
})




// UPDATE COMMENTS UI
const updateCommentUI = (postId,newComment)=>{
    const postDiv = 
            postsContainer.querySelector(`.posts[data-post-id="${postId}"]`)
            if(!postsContainer) return;
            console.log(newComment)
            const commentsContainer = postDiv.querySelector('.commentsContainer')

      const newCommentDate = new Date(newComment.created_at).toLocaleDateString('en-US',{
                weekday : 'short', 
                month : 'short',
                year : 'numeric'
             });
      
            const commentHTML = 
            `
                <div class="comment" data-comment-id="${newComment.id}">
                    <img class="user-profile" src="${newComment.user_profile_picture}" alt="user-profile">   
                     <strong id="author"><a href="/authorProfile/${newComment.id}">${newComment.author_name}</a></strong>
                     <div class="text-commentGear" style="display: flex; justify-content: space-between; align-items : center">
                        <p id="text">${newComment.comment}</p>
                        <div id="comment-gear" class="comment-gear" data-comment-id ="${newComment.id}">⋮</div>
                     </div>
                     <div class="comment-delete-edit" >
                        <span class="closep">❌</span>
                        <form id="edit-comment-form">
                            <button class="edit-comment-button" data-comment-id = "${newComment.id}">Edit</button>
                        </form>
                        <form id="delete-comment-button">
                            <button class="commentDeleteBtn" data-comment-id = "${newComment.id}">Delete</button>
                        </form>
                    </div>
                    <small id="date" class="date">${newCommentDate}</small>
                        
                </div>
            `
            commentsContainer.insertAdjacentHTML('afterbegin', commentHTML)

        }
