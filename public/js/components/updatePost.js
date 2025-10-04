const editingPostContainer = document.getElementById('updateFormContainer')
// clicking the eidt button functionlity
editingPostContainer.addEventListener('click', async(e)=>{
        // e.preventDefault()

        const newImageBtn = e.target.classList.contains("newImageBtn")
        const updateEditFormButton = e.target.classList.contains("updateButton")
        const cancelUpdateButton = e.target.classList.contains("closeModal")
        // return console.log(updateEditFormButton,cancelUpdateButton)
       if(newImageBtn){
        console.log('true')
        const targetFileBtn = e.target.closest('.fileInputContainer')?.querySelector('.fileInput')
            targetFileBtn.click()
       }

       else if(e.target.classList.contains('fileInput')){
        // getting the display file
           const fileContainer  = e.target.closest('.fileInputContainer')
           e.target.addEventListener('change', (e)=>{
            handleFilePreview(e,fileContainer)
           })

       }
       
       else if(updateEditFormButton){
        // e.target.preventDefault()
         const updateform = e.target.closest('.updateForm')
         console.log('update form ', updateform)
            const post_id = updateform.dataset.postId
            await handleUpdatePost(e,post_id, updateform)
       }else if(cancelUpdateButton){
        e.preventDefault()
        editPostContainer.style.display= "none"
       }
    })

     // hande post update

    const handleUpdatePost = async(event,postId, updateform)=>{
     console.log(postId,updateform)
         event.preventDefault()
        const formData = new FormData(updateform)
        const newTitle = formData.get('newTitle')
        const newDesc = formData.get('newDesc')
        const postFile = formData.get('newFile')
        console.log("newTitle",newTitle, postFile)

        try{
          const response = await axios.put(`/api/post/update/${postId}`, formData, {})
         console.log(response.data)
         if(response.status === 200){
        const updatedPostResult = response.data.updatedPost
        console.log(updatedPostResult)
        const postIndex = Allposts.findIndex(post => post.post_id === parseInt(postId))
      
             getUpdatedUi(updatedPostResult, postId);
         }


        }catch(err){
          console.log(err)
          editPostContainer.style.display = "flex"
        }
    }

   const getUpdatedUi = (post, postId)=>{
    const targetPost = postsContainer.querySelector(`.posts[data-post-id = "${postId}"]`)
     if(!targetPost) return console.log('target post not found')
      const mediaFile = isVideo(post.mediafile) ? 'video' : 'img'
             if(!mediaFile) return console.log('no media image')

             const mediaTag = document.createElement(mediaFile)
             mediaTag.src = '/' + post.mediafile
             if(mediaFile === 'video'){
                mediaTag.controls = true
             }
      console.log(targetPost)
          let commentsDiv = ''
           
      if(Array.isArray(post.comments)){
        // load updated post comments !
           post.comments.forEach(comment =>{
            // return console.log(comment.author, comment.text)
              commentsDiv += loadUpdatedPostComments(comment)
            })
          }


           targetPost.innerHTML = ''
           targetPost.innerHTML = `
           <div class="postHeader">
  <img class="ownerPhoto" src="${post.profilepicture}" alt="Profile picture">

  <div class="postHeaderContent">
    <div class="postHeaderTop">
      <span class="posterName">${post.firstname}</span>
      ${post.is_owner ? `<div id="gear" class="gear">⋮</div>` : ''}
    </div>
    <span class="postDate">${getTimeAgo(post.created_at)}</span>
  </div>
</div>

<!-- Post Title & Description -->
<h2 class="title">${post.title}</h2>
<p class="description">
  ${post.description.substring(0,100)}
</p>
${post.description.length > 100 ? `
  <a class="showMoreLink" title="${post.description}" href="/api/showOnePost/${post.id}">Read more...</a>
` : ''}

<!-- Media -->
<div class="mediaContainer">
  ${renderMedia(post.mediafile)}
</div>

<!-- Comments & Likes Area -->
<div class="commentsArea">
  <!-- Like -->
  <div class="likeSection">
    <form class="likeForm" action="/api/post/${post.id}/like" method="post">
      <button class="likeBtn" data-post-id="${post.id}">❤️</button>
    </form>
    <p id="likesCount" class="likesCount">${post.likecounts}</p>
  </div>

  <!-- Comments -->
  <div class="commentSection">
    <button id="commentButton" class="CommentBtn" data-post-id="${post.id}">💬</button>
    <p class="commentCount">${post.commentcounts}</p>
  </div>

  <!-- Share -->
  <div class="shareSection">
    <form action="/api/share/id">
      <button class="shareBtn" data-post-id="${post.id}">↗️</button>
    </form>
    <p class="sharesCount">${post.shares_count}</p>
  </div>
</div>

<!-- Comment Input -->
<form id="commentForm" class="commentInputForm">
  <input type="hidden" name="post_id" value="${post.id}">
  <input type="text" name="comment" id="comment" class="commentInput" placeholder="Type your comment">
</form>

<!-- Comments List -->
<div class="commentsContainer">
  ${commentsDiv}
</div>

<!-- Comment Edit Container -->
<div class="commentEditContainer" id="commentEditContainer"></div>

`
      
  const commentContainer = targetPost.querySelector('.commentsContainer')
  if(!commentContainer) return console.log('comments container not found')
  editPostContainer.style.display = "none"
}

// updated post comments 
function loadUpdatedPostComments(comment){

  return `<div class="comment" data-comment-id="${comment.id}">
                <img class="user-profile ownerPhoto" src="${comment.author.profile_picture}" alt="user-profile">
                ${!comment.is_owner?`
                <strong id="author"><a class="user-link" class="userProfileLink" href="/userProfile/${comment.author.user_token}/${comment.author.user_id}">${commentAuthor}</a></strong>
                `:`<strong id="author"><a class="user-link" href="/userProfile/${comment.author.user_token}">You</a></strong>`}
                <div class="text-commentGear">
                     <p id="text">${comment.text}</p>
                     ${comment.is_owner?`
                     <div id="comment-gear" data-comment-id = "${comment.id}" class="comment-gear gear">⋮</div>
                     `:''}
                </div>
                <small id="date" class="date">${getTimeAgo(comment.created_at)}</small>
                
                </div>`
}
