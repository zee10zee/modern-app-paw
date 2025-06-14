
window.addEventListener('DOMContentLoaded', (e)=>{
    const postsContainer = document.getElementById('postsContainer')
    console.log(postsContainer.querySelector('.posts'))
    postsContainer.addEventListener('keypress', async(e)=>{
          const postId = e.target.closest('.posts')?.dataset.postId;
          console.log(postId)

        if(e.target.classList.contains('commentInput') && e.key === 'Enter'){
            await handleComment(e)
        }
    });


    async function handleComment(event){
        event.preventDefault()
        const form = event.target.parentElement
        const postId = form.querySelector('[name="post_id"]').value
        const commentText = form.querySelector('[name="comment"]').value
        // sending comment to the server
        const res = await axios.post(`/api/post/${postId}/comment`, {comment : commentText})
        if(res.status === 200){
            const newComments = res.data.postComments
             const lastComment = newComments[newComments.length - 1]
             updateCommentUI(postId,lastComment)
             form.reset()
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
                    <div class="text-date" style="display: flex; justify-content: space-between; align-items : center">
                    <p id="text">${newComment.comment}</p>
                    <small id="date">${newCommentDate}</small>
                    </div>
                </div>
            `
            commentsContainer.insertAdjacentHTML('afterbegin', commentHTML)
}