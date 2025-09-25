
socket.on('comment_notif', data =>{
    // const newComment = data.newComment
    const commentor = data.commentor
    const comments = data.comments;
    // return console.log(, 'LAST COMMENT')
    const newComment = comments[comments.length - 1]

    updateCommentUI(data.post_id,newComment)
    const postDiv = postsContainer.querySelector(`.posts[data-post-id="${data.post_id}"]`);
    
    const commentCountElement = postDiv.querySelector('.commentCount')
    commentCountElement.textContent = comments.length;
    
})


window.addEventListener('DOMContentLoaded', (e)=>{
    const postsContainer = document.getElementById('postsContainer')
    
    // on submitting the comment
    postsContainer.addEventListener('keypress', async(e)=>{
          const commentInput = e.target
        if(e.target.classList.contains('commentInput') && e.key === 'Enter'){
            // return console.log(commentInput)

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
        const postId = parseInt(form.querySelector(`[name="post_id"]`).value)
        const commentText = form.querySelector('.commentInput').value
        const postDiv = event.target.closest(`.posts[data-post-id="${postId}"]`)
        const commentCountElement = postDiv.querySelector('.commentCount')
         
        let method = 'post';
        let url = `/api/post/${postId}/comment`
        // sending comment to the server
        const res = await axios[method](url,{comment : commentText})

           if(res.status === 200 && res.data.success){
                const allNewComments = res.data.postComments
                const currentUser = res.data.currentUser
                   AllComments = res.data.allRecentComments;
                    console.log(allNewComments)
                const lastComment = allNewComments[allNewComments.length - 1]
                updateCommentUI(postId,lastComment)
                commentCountElement.textContent = allNewComments.length;
                form.reset()
           }
            
    }
})

// UPDATE COMMENTS UI
const updateCommentUI = (postId,newComment)=>{
    // return console.log(newComment)
    
    const postDiv = 
            postsContainer.querySelector(`.posts[data-post-id="${postId}"]`)
            if(!postsContainer) return;
            console.log(newComment)
            const commentsContainer = postDiv.querySelector('.commentsContainer')
            const prevousLebeledComment = commentsContainer.querySelector('.new')
            if(prevousLebeledComment) commentsContainer.classList.remove('new')


      const newCommentDate = new Date(newComment.created_at).toLocaleDateString('en-US',{
                weekday : 'short', 
                month : 'short',
                year : 'numeric'
             });
      
            const commentHTML = 
            `
                <div class="comment new" data-comment-id="${newComment.id}">
                <img class="user-profile ownerPhoto" src="${newComment.user_profile_picture}" alt="user-profile">
                ${!newComment.is_owner?`
                <strong id="author"><a class="user-link" class="userProfileLink" href="/userProfile/${newComment.usertoken}/${newComment.user_id}">${newComment.author_name}</a></strong>
                `:`<strong id="author"><a class="user-link" href="/userProfile/${newComment.usertoken}">You</a></strong>`}
                <div class="text-commentGear">
                     <p id="text">${newComment.comment}</p>
                     ${newComment.is_owner?`
                     <div id="gear" data-comment-id = "${newComment.id}" class="gear">⋮</div>
                     `:''}
                </div>
                <small id="date" class="date">${newCommentDate}</small>
                
                </div>
            `
            commentsContainer.insertAdjacentHTML('afterbegin', commentHTML)
        }
        
