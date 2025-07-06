
const postsContainer = document.getElementById('postsContainer')
const editPostContainer = document.getElementById('updateFormContainer')
const userNameHTML = document.querySelector('.activeUser')
const photo = sessionStorage.getItem('loggedIn_profile')
const username = sessionStorage.getItem('loggedIn_user')
     
 const loggedInUser = document.querySelector('.loggedInUser')
        const profile = document.createElement('img')
        profile.classList.add('profilePic')
        const profileLink = document.createElement('a')
        profileLink.href = '/api/currentUser/${postOwner}/profile'
        profileLink.append(profile)
        profile.src = photo
        userNameHTML.textContent = username
        loggedInUser.appendChild(profile)
        
    let Allposts = []
// to get the posts.comments array we need to transform the join table to map like objects 

  function isVideo(filename){
      return /\.(mp4|webm|ogg)$/i.test(filename);
  }

const renderPosts = (posts)=>{
    if(posts.length === 0){
      postsContainer.innerHTML = ''
       return postsContainer.innerHTML = 
    `<div class="no-post">
      <h2 >No posts yet !😴</h2>  <a onclick = "createPost();"href="/api/newPost">Create One  😊 </a>
    </div>`
    }
     
        posts.forEach((post)=>{
           let commentsHTML = ''
           let commentCounts = 0;
          if(Array.isArray(post.comments)){
          post.comments.forEach(comment =>{
           console.log(typeof(comment.commentcounts))
            commentCounts = parseInt(comment.commentcounts)
          })
           const comments = post.comments.flatMap(comment => comment.comments || [])
           comments.forEach(comment =>{
            const commentorProfile = comment.author.profile_picture
             const commentAuthor = comment.author.firstname
             const text = comment.text
             const commentDate = new Date(comment.created_at).toLocaleDateString('en-US',{
                weekday : 'short', 
                month : 'short',
                year : 'numeric'
             });
             commentsHTML+= 
             `
             <div class="comment" data-comment-id="${comment.id}">
             <img class="user-profile" src="${commentorProfile}" alt="user-profile">
            <strong id="author"><a href="/api/userProfile/${comment.author.userId}">${commentAuthor}</a></strong>
                <div class="text-commentGear">
                     <p id="text">${text}</p>
                     ${comment.is_owner?`
                     <div id="comment-gear" data-comment-id = "${comment.id}" class="comment-gear">⋮</div>
                     `:''}
                </div>
                <small id="date" class="date">${commentDate}</small>
                <div class="comment-delete-edit">
                    <span class="close">❌</span>
                      <form id="edit-comment-form">
                        <button class="edit-comment-button" data-comment-id = "${comment.id}">Edit</button>
                      </form>
                      <form id="delete-comment-button">
                        <button class="commentDeleteBtn" data-comment-id = "${comment.id}">Delete</button>
                      </form>
                    
                </div>
                </div>
             `

           })             
          }
             const postDIV = document.createElement('div')
             postDIV.classList.add('posts')
             postDIV.dataset.postId = post.post_id
            
           
             const mediaFile = isVideo(post.mediafile) ? 'video' : 'img'
             const mediaTag = document.createElement(mediaFile)
             mediaTag.src = '/' + post.mediafile
             if(mediaFile === 'video'){
                mediaTag.controls = true
             }
             const ui = document.createElement('div')
             postDIV.innerHTML = `
             <img class="ownerPhoto" src="${post.author_profilepicture}" alt="Profile picture">
             ${!post.postowner?`
              <ul id="userProfile-chat-modal" class="userProfile-chat-modal">
                    <li class="ownerProfile" data-token-id="${post.usertoken}" data-user-id="${post.user_id}">
                        <a  href="/api/authorProfile/${post.usertoken}">${post.author_firstname}'s Profile</a>
                    </li>
                    <li class="userProfile" data-user-id="${post.user_id}">
                        <a  class="userChatLink" href="/api/chatpage/${post.user_id}">Chat with user</a>
                    </li>
              </ul>
              ` : ''}
               <div class="title-date-burger"> 
                 <h2 class="title"> ${post.title}
                   <span id="date" class="date">${new Date(post.created_at).toLocaleDateString()}</span>
                 </h2>
                 ${post.postowner?`
                 <div id="gear" class="gear">⋮</div>
                  `:''}
                 
               </div>
               <p class="description">${post.description.substring(0,100)} 
                  <a class="showMoreLink" href="/api/showPost/${post.post_id}">Read more...</a>
               </p>
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
                    <p class="commentCount">${commentCounts}</p>
                  </div>

                  <div class="share">
                      <button data-post-id="${post.post_id}" class="shareBtn">↗️</button>
                    <p class="sharesCount"></p>
                  </div>
                 
                </div>
                
                 <form action="/api/post/${post.post_id}/comment" method="POST" id="commentForm" class="commentingForm">
                      <input type="hidden" name="post_id" value="${post.post_id}"> 
                      <input type="text" name="comment" id="comment" class="commentInput" placeholder="type your comment">
                 </form>
                 <div class="commentsContainer">
                    ${commentsHTML}
                    <div class="container commentEditContainer" id="commentEditContainer"></div>
                 </div>

                  <div class="share-container">
                  
                  </div>
                 
                <div class="edit-delete">
                
                   <span class="closep">❌</span>
                  <form id="editForm" data-post-id="${post.post_id}">
                    <button class="postEditBtn">Edit</button>
                  </form>
                  <form id="deleteForm" data-post-id="${post.post_id}">
                    <button class="postDeleteBtn">Delete</button>
                 </form>
                  
                </div>

               
             `
            
            postsContainer.appendChild(postDIV)
        })
}

const clickHandler = (e, container,parentContainer) => {
            if (!container.contains(e.target) && 
                e.target !== gear && 
                e.target !== parentContainer) {
                container.style.display = "none";
                window.removeEventListener('click', clickHandler);
            }
        };

const setupEventListener = ()=>{
   postsContainer.addEventListener('click', async(e)=>{
     const editBtn = e.target.classList.contains('postEditBtn')
     const deleteBtn = e.target.classList.contains('postDeleteBtn')
     const gear = e.target.classList.contains('gear')
     const showMoreLink = e.target.classList.contains('showMoreLink')
     const userProfile_userChatModal = e.target.classList.contains('userProfile-chat-modal')
     const postOwnerProfileLink = e.target.closest('.ownerProfile')
     const userChatLink = e.target.classList.contains('userChatLink')
     const userProfileUserData = e.target.closest('.userProfile')
     const postEditDeleteModal = e.target.classList.contains('closep')
     const postDiv = e.target.closest('.posts') || e.target.closest('.editPostContainer')
     const postId = postDiv.dataset.postId;
   if(editBtn){
      e.preventDefault()
      editPostContainer.innerHTML = ''
      await loadEditForm(postId,editPostContainer)
    }else if(deleteBtn){
        await deletePost(postId)
        e.preventDefault()
        
    }else if(gear || postEditDeleteModal){
      const editDeleteContainer = postDiv.querySelector('.edit-delete')
      window.removeEventListener('click', editDeleteContainer)

       if(editDeleteContainer.style.display === "block"){
           editDeleteContainer.style.display = "none";
           
     }else {
        editDeleteContainer.style.display = "block";
     }


    }else if(showMoreLink){
        window.location.href=`/api/showPost/${postId}`
    }else if(userChatLink){
     const userid = userProfileUserData.dataset.userId
        window.location.href=`/api/chatpage/${userid}`
    }else if(postOwnerProfileLink){
     const userToken = postOwnerProfileLink.dataset.tokenId
     const userId = postOwnerProfileLink.dataset.userId
        window.location.href=`/userProfile/${userToken}/${userId}`
    }
})
}

// load edit form

const loadEditForm = async(postId,editPostContainer)=>{
  closeAnyModal(editPostContainer)
  const editingPost =  document.createElement('div')
  editingPost.classList.add('editPostContainer')
  editingPost.dataset.postId = postId

  const response = await axios.get(`/api/edit/${postId}`)

        if(response.status === 200){
            const post = response.data.post;
            const mediaFile = isVideo(post.mediafile)?'video' : 'img'
            const mediaTag = document.createElement(mediaFile)
            mediaTag.src = post.mediafile
            mediaTag.setAttribute('name', 'previewFile')
            mediaTag.classList.add('previewFile')
            
            editingPost.innerHTML = `
                <h1 id="update-title">Update Post</h1>
                <form id="updateForm" data-post-id="${post.id}" enctype="multipart/form-data">
                <input type="text" name="newTitle" id="newTitle" value="${post.title}">
                <textarea name="newDesc" id="newDesc">${post.description}</textarea>
                <div class="file-input flex-class">
                     ${mediaTag.outerHTML}
                     <button class="newImage">New Image</button>
                    <input type="file" name="newFile" id="newFile" class="hiddenFile" accept="video/*,image/*" style="display:none">
                </div>
                <button class="updateButton">Update</button>
                 <button class="closeModal">Cancel</button>
            </form>
            `

            editPostContainer.appendChild(editingPost)
            editPostContainer.style.display = "block"
    }
}

// clicking the eidt button functionlity
editPostContainer.addEventListener('click', (e)=>{
    

        const newImageBtn = e.target.classList.contains("newImage")
        const updateEditFormButton = e.target.classList.contains("updateButton")
        const cancelUpdateButton = e.target.classList.contains("closeModal")
       if(newImageBtn){
        const parentDiv = e.target.parentElement
            const targetFileBtn = parentDiv.querySelector('.hiddenFile')
            targetFileBtn.click()
            e.preventDefault()
            // getting the display file
            targetFileBtn.addEventListener('change', handleFilePreview)
       }else if(updateEditFormButton){
          // e.preventDefault()
         const updateform = e.target.parentElement
         console.log(updateform)
         updateform.addEventListener('submit', async(e)=>{
            e.preventDefault()
            const post_id = updateform.dataset.postId
            console.log(updateform)
            await handleUpdatePost(post_id, updateform)
         })
       }else if(cancelUpdateButton){
        e.preventDefault()
        editPostContainer.style.display= "none"

       }
    })

    // previewing the uploaded file
    function handleFilePreview(e){
      const selectedFile = e.target.files[0]
      console.log(selectedFile)
      const previewContainer = e.target.closest('.file-input')
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

    const handleUpdatePost = async(postId, updateform)=>{
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
          editPostContainer.classList.remove('hidden')
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
             let commentsHTML = '';
      if(Array.isArray(post.comments)){

           post.comments.forEach(comment =>{
             const commentAuthor = comment.author.firstname
            console.log('comment and first name of commentor : ', comment.author.id, comment)

            const commentorId = comment.author.userId;
             const text = comment.text
             const commentDate = new Date(comment.created_at).toLocaleDateString('en-US',{
                weekday : 'short', 
                month : 'short',
                year : 'numeric'
             });
            commentsHTML+= 
             `
             <div class="comment" data-comment-id="${comment.id}">
             <a href="/api/userProfile/${commentorId}">
                <img class="user-profile" src="${comment.author.profile_picture}" alt="profle picture">
             </a>
            <strong id="author"><a href="/api/userProfile/${commentorId}">${commentAuthor}</a></strong>

                <div class="text-commentGear">
                     <p id="text">${text}</p>
                     <div id="comment-gear" data-comment-id = "${comment.id}" class="comment-gear">⋮</div>
                </div>
                <small id="date" class="date">${commentDate}</small>
                <div class="comment-delete-edit">
                      <form id="edit-comment-form">
                        <button class="edit-comment-button" data-comment-id = "${comment.id}">Edit</button>
                      </form>
                      <form id="delete-comment-button">
                        <button class="commentDeleteBtn" data-comment-id = "${comment.id}">Delete</button>
                      </form>
                      <span class="close">❌</span>
                   </div>
                
             </div>
             `
            })

          }


           targetPost.innerHTML = ''
           targetPost.innerHTML = `
            <img class="ownerPhoto" src="${post.profilepicture}" alt="Profile picture">
               ${post.is_owner?
                `
              <ul id="userProfile-chat-modal" class="userProfile-chat-modal">
                    <li class="ownerProfile" data-token-id="${post.usertoken}" data-user-id="${post.user_id}">
                        <a  href="/api/authorProfile/${post.usertoken}">${post.firstname}'s Profile</a>
                    </li>
                    <li class="userProfile" data-user-id="${post.user_id}">
                        <a  class="userChatLink" href="/api/chatpage/${post.user_id}">Chat with user</a>
                    </li>
              </ul>
              `: ''}
               <div class="title-date-burger"> 
                 <h2 class="title"> ${post.title}
                   <span id="date" class="date">${new Date(post.created_at).toLocaleDateString()}</span>
                 </h2>
                 ${post.user_id?`
                 <div id="gear" class="gear">⋮</div>
                  `:''}
                 
               </div>
               <p class="description">${post.description.substring(0,100)} 
                  <a class="showMoreLink" href="/api/showPost/${post.post_id}">Read more...</a>
               </p>
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
                    <p>12 shares</p>
                  </div>
                 
                </div>
                
                 <form action="/api/post/${post.id}/comment" method="POST" id="commentForm" class="commentingForm">
                      <input type="hidden" name="post_id" value="${post.id}"> 
                      <input type="text" name="comment" id="comment" class="commentInput" placeholder="type your comment">
                 </form>
                 <div class="commentsContainer">
                    ${commentsHTML}
                    <div class="container commentEditContainer" id="commentEditContainer"></div>
                 </div>
                 
                <div class="edit-delete">
                   <span class="closep">❌</span>
                    <form id="editForm" data-post-id="${post.id}">
                      <button class="postEditBtn">Edit</button>
                    </form>
                    <form id="deleteForm" data-post-id="${post.id}">
                      <button class="postDeleteBtn">Delete</button>
                    </form>
                </div>
           `
          
             const commentContainer = targetPost.querySelector('.commentsContainer')
             if(!commentContainer) return console.log('comments container not found')

          

        editPostContainer.style.display = "none"
}

    // delete post
const deletePost = async(postId)=>{
   if(!postId) return console.log('post id undefined')
    const confirmDelete = prompt('are you sure deleting the post ?')
  if(!confirmDelete || !confirmDelete.toLowerCase().includes('yes')) return console.log('delete canceled .')
    console.log('proceed deleting ...')
  try{
    const res = await axios.delete(`/api/post/delete/${postId}`, {})
  if(res.status !== 200 && !res.data.success) return alert('server failure deleting the post ', res.data.error);
       console.log('file delete success')
        const targetPost = postsContainer.querySelector(`.posts[data-post-id="${postId}"]`)
        targetPost.remove()
   
  }catch(err){
      alert(err)
}
}

    // const deleteForm = postsContainer.deleteForm

  document.addEventListener('DOMContentLoaded', async(e)=>{
  const res = await axios.get('/api/posts')
    if(res.status === 200){
        Allposts = res.data.posts
        // return console.log(posts)
        if(Allposts && Array.isArray(Allposts)){
           renderPosts(Allposts)
        }else{
          console.log('posts is not an array here !')
        }
    }  
      setupEventListener()
})


function closeAnyModal(modalElement){
  window.addEventListener('click', (e)=>{
    const containerArea = e.target.closest('.posts');
    if(modalElement.style.display !== "none" && !containerArea){
         modalElement.style.display = "none"
  }
  })
}