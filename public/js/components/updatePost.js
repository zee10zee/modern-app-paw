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
        e.target.addEventListener('change', handleFilePreview)
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

    // previewing the uploaded file
    function handleFilePreview(e){
      const selectedFile = e.target.files[0]
      const previewContainer = e.target.closest('.fileInputContainer')
      console.log(previewContainer)
      let isVideoFile = isVideo(selectedFile.name)
      let previewFile = previewContainer.querySelector('video,img')
       
      if(!previewFile){
        const mediaFile = isVideo(selectedFile.name)? 'video':'img'
        previewFile = document.createElement(mediaFile)
        previewContainer.prepend(previewFile)
      }else{
      // Replace the element if type changed
      if ((isVideoFile && previewFile.tagName !== 'VIDEO') ||
          (!isVideoFile && previewFile.tagName !== 'IMG')) {
        const newFile = document.createElement(isVideoFile ? 'video' : 'img');
        previewContainer.replaceChild(newFile, previewFile);
        previewFile = newFile;
      }
    }
      const reader = new FileReader()
      previewFile.src = ''
      reader.onload = (e)=>{
       previewFile.src = e.target.result
      }

      if(selectedFile.type.startsWith('video/')){
         reader.readAsDataURL(selectedFile)
      }else if(selectedFile.type.startsWith('image/')){
        reader.readAsDataURL(selectedFile)
      }else{
        console.log('please upload only vidoes and images')
      }
    }

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
        // return console.log(updatedPost[0].comments)
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
            <img class="ownerPhoto" src="${post.profilepicture}" alt="Profile picture">
              
               <div class="title-date-burger"> 
                 <h2 class="title"> ${post.title}
                   <span id="date" class="date">${new Date(post.created_at).toLocaleDateString()}</span>
                 </h2>
                 ${post.user_id?`
                 <div id="gear" class="gear">⋮</div>
                  `:''}
                 
               </div>
               <p class="description" data-full-text="${post.description}">${post.description.substring(0,100)} 
               </p>
               ${post.description.length > 100 ?`
               <a class="showMoreLink" title="${post.description}" href="/api/showPost/${post.post_id}">Read more...</a>
               `:""}

                  <div class="mediaContainer">
                    ${mediaTag.outerHTML}
                  </div>
                  
               <div class="likes-comments-share" style="display:flex; justify-content : space-between;">
                  <div class="like">
                     <form class="likeForm" action="/api/post/${post.id}/like" method="post">
                      <button class="likeBtn">❤️</button>
                      </form>
                      <p id="likesCount" class="likesCount">${post.likecounts}</p>
                  </div>
                  <div class="commentsCount">
                    <button id="commentButton" class="commentBtn">💬</button>
                    <p class="commentCount">${post.commentcounts}</p>
                  </div>

                  <div class="share">
                    <form action="/api/share/id">
                      <button class="shareBtn">↗️</button>
                    </form>
                    <p>${post.shares_count}</p>
                  </div>
                 
                </div>
                
                 <form action="/api/post/${post.id}/comment" method="POST" id="commentForm" class="commentingForm">
                      <input type="hidden" name="post_id" value="${post.id}"> 
                      <input type="text" name="comment" id="comment" class="commentInput" placeholder="type your comment">
                 </form>
                 <div class="commentsContainer">
                    ${commentsDiv}
                    <div class="container commentEditContainer" id="commentEditContainer"></div>
                 </div>
           `
          
             const commentContainer = targetPost.querySelector('.commentsContainer')
             if(!commentContainer) return console.log('comments container not found')

          

        editPostContainer.style.display = "none"
}

// updated post comments 
function loadUpdatedPostComments(comment){
 console.log(comment)
const commentDate = new Date(comment.created_at).toLocaleDateString('en-US',{
                weekday : 'short', 
                month : 'short',
                year : 'numeric'
             });

  return `<div class="comment" data-comment-id="${comment.id}">
                <img class="user-profile" src="${comment.author.profile_picture}" alt="user-profile">
                ${!comment.is_owner?`
                <strong id="author"><a class="user-link" class="userProfileLink" href="/userProfile/${comment.author.user_token}/${comment.author.user_id}">${commentAuthor}</a></strong>
                `:`<strong id="author"><a class="user-link" href="/userProfile/${comment.author.user_token}">You</a></strong>`}
                <div class="text-commentGear">
                     <p id="text">${comment.text}</p>
                     ${comment.is_owner?`
                     <div id="comment-gear" data-comment-id = "${comment.id}" class="comment-gear">⋮</div>
                     `:''}
                </div>
                <small id="date" class="date">${commentDate}</small>
                
                </div>`
}
