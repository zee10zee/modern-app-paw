
const postsContainer = document.getElementById('postsContainer')
const editPostContainer = document.getElementById('updateFormContainer')
const userNameHTML = document.querySelector('.activeUser')
const photo = sessionStorage.getItem('loggedIn_profile')
const username = sessionStorage.getItem('loggedIn_name')
const userToken = sessionStorage.getItem('loggedIn_userToken')
const loggedInUserId = sessionStorage.getItem('loggedIn_userId')

 console.log(loggedInUserId, 'user id')
 let postId;
     
 const loggedInUser = document.querySelector('.loggedInUser')
 const  profilePicContain = document.querySelectorAll('.profilePicContain')
        
        appendUserProfileOnNav()

    function appendUserProfileOnNav(){
      profilePicContain.forEach(container =>{
            const profile = document.createElement('img')
        profile.classList.add('profilePic','w-8', 'h-8', 'rounded-full', 'object-cover')
        const profileLink = document.createElement('a')
        profileLink.classList.add(
          'flex', 'items-center', 'justify-center',
          'w-8', 'h-8', 'rounded-full', 'overflow-hidden',
          'hover:ring-2', 'hover:ring-blue-400', 'transition'
        )

        profileLink.href = `/userProfile/${userToken}/${loggedInUserId}`
        profile.src = photo
        profileLink.append(profile)
        container.append(profileLink)
        })
    }
    let Allposts = []
// to get the posts.comments array we need to transform the join table to map like objects 

  function isVideo(filename){
      return /\.(mp4|webm|ogg)$/i.test(filename);
  }

   function renderMedia(file){
            const mediaFile = isVideo(file) ? 'video' : 'img'
             const mediaTag = document.createElement(mediaFile)
             mediaTag.id = 'mediaFilePic'
             mediaTag.classList.add('mediaFile')
             mediaTag.src = '/' + file
             if(mediaFile === 'video'){
                mediaTag.controls = true
             }
             return `<div class="mediaContainer">
                    ${mediaTag.outerHTML}
              </div>`
            }

const renderPosts = (posts)=>{
     
        posts.forEach((post)=>{
          // return console.log(post.id)
             const postDIV = document.createElement('div')
             postDIV.classList.add('posts')
             postDIV.dataset.postId = post.id
             postDIV.setAttribute('id', post.id)

             const originalPost = post.original_post
            
             
             const media = renderMedia(post.mediafile)
       
            //  comments variables
             let commentsHTML = ''
                           
             if(post.comments.length > 0){
                post.comments.forEach(comment =>{
                commentsHTML += loadComments(comment)
               })
              } 
         
              let postHeader = `
  <div class="bg-white rounded-lg shadow p-4 mb-6">
    <!-- Post Header -->
    ${!post.is_shared ? `
      <div class="flex items-start gap-3">
        <img class="ownerPhoto w-12 h-12 rounded-full object-cover" src="${post.poster_profile}" alt="Profile picture">

        <div class="flex-1">
          <div class="flex justify-between items-start">
            <span id="date" class="date text-xs text-gray-500">${new Date(post.created_at).toLocaleDateString()}</span>
            ${post.is_owner ? `
              <div id="gear" class="gear cursor-pointer text-gray-600">⋮</div>
            ` : ''}
          </div>

          <h2 class="title text-lg font-semibold text-gray-800 mt-1">${post.title}</h2>
          <p class="description text-gray-700 mt-2">${post.description.substring(0,100)}</p>
          ${post.description.length > 100 ? `
            <a class="showMoreLink text-blue-600 text-sm" title="${post.description}" href="/api/showOnePost/${post.id}">Read more...</a>
          ` : ''}

          <div class="mediaContainer mt-3">
            ${media}
          </div>
        </div>
      </div>
    ` : `
      <!-- Shared Post -->
      <div class="flex items-start gap-3">
        <img class="ownerPhoto w-12 h-12 rounded-full object-cover" src="${post.sharer_profile}" alt="Profile picture">

        <div class="flex-1">
          <div class="flex justify-between items-start">
            <span id="date" class="date text-xs text-gray-500">${new Date(post.created_at).toLocaleDateString()}</span>
            ${post.is_share_post_owner ? `
              <div id="gear" class="gear cursor-pointer text-gray-600">⋮</div>
            ` : ''}
          </div>

          <p class="sharer_message text-sm text-gray-600 italic">${post.title}</p>

          <div class="shared_post border rounded-md p-3 mt-2 bg-gray-50" data-post-id="${originalPost.id}">
            <div class="flex items-center gap-2 mb-2">
              <img class="ownerPhoto w-10 h-10 rounded-full object-cover" src="${originalPost.owner.profilepicture}" alt="Profile picture">
              <div>
                <a href="/userProfile/${originalPost.owner.usertoken}/${originalPost.owner.id}" class="userProfileLink text-sm font-medium text-gray-800">${originalPost.owner.firstname}</a>
                <p class="text-xs text-gray-500">${new Date(originalPost.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <h2 class="title text-base font-semibold text-gray-800">${originalPost.title}</h2>
            <p class="description text-gray-700 mt-1">${originalPost.description.substring(0,100)}</p>
            ${originalPost.description.length > 100 ? `
              <a class="showMoreLink text-blue-600 text-sm" title="${originalPost.description}" href="/api/showOnePost/${originalPost.id}">Read more...</a>
            ` : ''}

            <div class="mediaContainer mt-3">
              ${renderMedia(originalPost.mediafile)}
            </div>
          </div>
        </div>
      </div>
    `}
  </div>
`

              // comments info section
      const comments_area = `
  <div class="flex justify-between items-center text-gray-600 mt-3">
    <!-- Like -->
    <div class="flex items-center gap-2">
      <form class="likeForm" action="/api/post/${post.id}/like" method="post">
        <button class="likeBtn text-xl" data-post-id="${post.id}">❤️</button>
      </form>
      <p id="likesCount" class="likesCount text-sm">${post.likes_count}</p>
    </div>

    <!-- Comments -->
    <div class="flex items-center gap-2">
      <button id="commentButton" class="CommentBtn text-xl" data-post-id="${post.id}">💬</button>
      <p class="commentCount text-sm">${post.comments_count}</p>
    </div>

    <!-- Share -->
    <div class="flex items-center gap-2">
      <form action="/api/share/id">
        <button class="shareBtn text-xl" data-post-id="${post.id}">↗️</button>
      </form>
      <p class="sharesCount text-sm">${post.total_shares}</p>
    </div>
  </div>

  <!-- Comment Input -->
  <form id="commentForm" class="mt-3 flex gap-2">
    <input type="hidden" name="post_id" value="${post.id}">
    <input type="text" name="comment" id="comment" class="commentInput flex-1 border border-gray-300 rounded px-3 py-1 text-sm" placeholder="Type your comment">
  </form>

  <!-- Comments List -->
  <div class="commentsContainer mt-3 space-y-3">
    ${commentsHTML}
  </div>

  <div class="container commentEditContainer" id="commentEditContainer"></div>
`

              postDIV.innerHTML = postHeader + comments_area
              postsContainer.appendChild(postDIV)
        })
}

function loadComments(comment){
  const commentorProfile = comment.author.profile_picture
  const commentAuthor = comment.author.firstname
  const text = comment.text
  const commentDate = new Date(comment.created_at).toLocaleDateString('en-US',{
    weekday : 'short', 
    month : 'short',
    year : 'numeric'
  });

  return `
    <div class="comment flex items-start gap-2 p-2 bg-gray-50 rounded" data-comment-id="${comment.id}">
      <img class="user-profile w-8 h-8 rounded-full object-cover" src="${commentorProfile}" alt="user-profile">
      <div class="flex-1">
        ${!comment.is_owner ? `
          <strong id="author"><a class="user-link userProfileLink text-sm font-semibold text-gray-800" href="/userProfile/${comment.author.user_token}/${comment.author.user_id}">${commentAuthor}</a></strong>
        ` : `
          <strong id="author"><a class="user-link text-sm font-semibold text-gray-800" href="/userProfile/${comment.author.user_token}">You</a></strong>
        `}
        <div class="text-commentGear flex justify-between items-start">
          <p id="text" class="text-sm text-gray-700">${text}</p>
          ${comment.is_owner ? `
            <div id="comment-gear" data-comment-id="${comment.id}" class="comment-gear cursor-pointer text-gray-500 ml-2">⋮</div>
          ` : ''}
        </div>
        <small id="date" class="date text-xs text-gray-400">${commentDate}</small>
      </div>
    </div>
  `
}

const clickHandler = (e, container,parentContainer) => {
            if (!container.contains(e.target) && 
                e.target !== gear && 
                e.target !== parentContainer) {
                container.style.display = "none";
                window.removeEventListener('click', clickHandler);
            }
        };

      let modal = document.querySelector('.general_modal')


const setupEventListener = ()=>{
   postsContainer.addEventListener('click', async(e)=>{
     const editBtn = e.target.classList.contains('postEditBtn')
     const deleteBtn = e.target.classList.contains('postDeleteBtn')
     const gear = e.target.classList.contains('gear')
     const showMoreLink = e.target.classList.contains('showMoreLink')
     let userProfile_userChatModal = e.target.classList.contains('userProfile-chat-modal')
     const ownerPhoto = e.target.classList.contains('ownerPhoto');
    
     const userProfileUserData = e.target.closest('.userProfile')
     const postEditDeleteModal = e.target.classList.contains('closep')
     const commentorNameLink = e.target.classList.contains('user-link');
     const postDiv = e.target.closest('.posts') || e.target.closest('.editPostContainer')
      const mediaTag = postDiv.querySelector('.mediaFile')
     const imgOrVideo = e.target.classList.contains('mediaFile')
     postId = postDiv ? postDiv.dataset.postId : null; 
      //  return console.log(gear)
    if(gear || postEditDeleteModal){
          e.preventDefault()
          console.log(modal)
          modal.dataset.commentId = ''
          modal.dataset.postId = postId
          
          modal.classList.add(
            postDiv.contains(postDiv.querySelector('.shared_post')) 
            ? 
            "is_shared_post" : 'actual')

          // showModalAt(e.pageX,e.pageY)
          e.stopPropagation()
         modal.innerHTML = ''
         modal.innerHTML = loadSpecificPostModal(postId)
         modal.classList.remove('hidden')
         modal.classList.add('flex')

    }else if(showMoreLink){
      // expand the description
      
      toggleDescriptionExpand(postDiv,e)
     
    }else if(ownerPhoto){
      
      let displayPost = null

      const targetPost = Allposts.find(post => post.id === parseInt(postId))

      if(targetPost.is_shared && e.target.closest('.shared_post')){
          const originalPost = targetPost.original_post
          displayPost = {
            id : originalPost.id,
            user_id : originalPost.owner.id,
            usertoken : originalPost.owner.usertoken,
            username : originalPost.owner.firstname,
            is_owner : originalPost.owner.is_owner
          }

         console.log('original post closest parent ',e.target.closest('.shared_post'), displayPost)
      }else{
        displayPost = {
          id : targetPost.id,
          username : targetPost.poster_name || targetPost.sharer_name,
          usertoken: targetPost.poster_token || targetPost.sharer_token,
          user_id : targetPost.poster_id || targetPost.sharer_id,
          is_owner : targetPost.is_owner || targetPost.is_share_post_owner
        }
          console.log('actual post parent ', e.target.closest('.posts'),displayPost)
      }
      
      modal.innerHTML = ''
      modal.innerHTML = popUserProfileAndChat(displayPost)
      modal.classList.remove('hidden')
      modal.classList.add('flex')
      e.stopPropagation()

    }else if(commentorNameLink){
      const targetHTML = e.target.closest('.comment')?.querySelector('.user-link')

      window.location.href = targetHTML.getAttribute('href')
    }else if(imgOrVideo){
        e.preventDefault()
        
        mediaTag.classList.toggle('fullScreenImage')
    }
})
}
  
// pop of modal on clicking user profile
function popUserProfileAndChat(post){
  return `<ul class="bg-white rounded-lg shadow-md p-2 text-sm space-y-2 
           w-full max-w-md sm:max-w-sm md:max-w-md">
  ${!post.is_owner ?`
    <li>
      <a href="/userProfile/${post.usertoken}/${post.user_id}" 
         class="userProfileLink block px-4 py-3 rounded hover:bg-gray-100 text-gray-700 text-base sm:text-sm">
         ${post.username}'s profile
      </a>
    </li>
    <li>
      <a href="/api/chatpage/${post.id}/${post.usertoken}" 
         class="userChatLink block px-4 py-3 rounded hover:bg-gray-100 text-gray-700 text-base sm:text-sm">
         chat with ${post.username}
      </a>
    </li>
  `:
    `<li class="px-4 py-3 text-gray-500 text-base sm:text-sm">
    <a href="/userProfile/${post.usertoken}/${post.user_id}" 
         class="userProfileLink block px-4 py-3 rounded hover:bg-gray-100 text-gray-700 text-base sm:text-sm">
          Your profile</li>
      </a>
   `
  }
</ul>
`
}


function loadSpecificPostModal(postOrCommentid){        
    return `<div class="edit-delete bg-white rounded-lg shadow-md p-3 space-y-2">
  <span class="closep cursor-pointer text-red-500 float-right">❌</span>
  ${modal.dataset.postId ? `
    <form id="editForm">
      <button data-post-id="${postOrCommentid}" class="postEditBtn w-full bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">Edit</button>
    </form>
    <form id="deleteForm">
      <button data-post-id="${postOrCommentid}" class="postDeleteBtn w-full bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">Delete</button>
    </form>
  ` : `
    <form id="edit-comment-form">
      <button class="commentEditBtn w-full bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600" data-comment-id="${postOrCommentid}">Edit</button>
    </form>
    <form id="delete-comment-button">
      <button class="commentDeleteBtn w-full bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600" data-comment-id="${postOrCommentid}">Delete</button>
    </form>
  `}
</div>
`
}



function showModalAt(x,y){
   modal.style.left = `${x - 200}px`;
          modal.style.top = `${y + 7}px`;
          modal.style.display = 'block';
}

 document.addEventListener('click', (e)=>{
    
      if(!modal.contains(e.target)){
          modal.classList.add('hidden')
      }
    })

    modal.addEventListener('click', async(e)=>{
    const editBtnOfModal = e.target.classList.contains('postEditBtn')
    const DeleteBtnOfModal = e.target.classList.contains('postDeleteBtn')
     const postOwnerProfileLink = modal.querySelector('.userProfileLink')
     const userChatLink = modal.querySelector('.userChatLink')
       const postId = modal.dataset.postId; 
      if(editBtnOfModal && modal.classList.contains('actual')){
         
          e.preventDefault()
          editPostContainer.innerHTML = ''
          await loadEditForm(postId,editPostContainer)
          editPostContainer.style.zIndex = 20000;
         
      }

      else if(DeleteBtnOfModal){
        e.preventDefault()
        await deletePost(postId)
      }else if(userChatLink){
      console.log(userChatLink.href)
        window.location.href = userChatLink.href;
    }else if(postOwnerProfileLink){
        window.location.href = postOwnerProfileLink.href
    }

      //  modal.style.display = "none"
    })

   


    


{/* //load edit form */}
const loadEditForm = async(postId,editPostContainer)=>{
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
                `:`<strong id="author"><a class="user-link" href="/loginUserProfile/${comment.author.user_token}">You</a></strong>`}
                <div class="text-commentGear">
                     <p id="text">${comment.text}</p>
                     ${comment.is_owner?`
                     <div id="comment-gear" data-comment-id = "${comment.id}" class="comment-gear">⋮</div>
                     `:''}
                </div>
                <small id="date" class="date">${commentDate}</small>
                
                </div>`
}



    // const deleteForm = postsContainer.deleteForm

  document.addEventListener('DOMContentLoaded', async(e)=>{

    // display the login user profile picture 
        // appendUserProfileOnNav()


  const res = await axios.get('/api/posts')
  // return console.log(res.data.posts)
    if(res.status === 200){
        Allposts = res.data.posts
         console.log(Allposts)
        if(Allposts && Array.isArray(Allposts)){
          if(Allposts.length === 0 && postsContainer.children.length === 0) return checkEmptyPosts()

          postsContainer.innerHTML = ''
          loadPostsOnLoad()
          setupEventListener()
        }else{
          console.log('posts is not an array here !')
        }
    }  
})


//    const lastPostId = postsContainer.children[0].dataset.postId
//    const lastPost = Allposts.find(post => post.id === Number(lastPostId))
//           const lastSeen = new Date().toISOString()





function checkEmptyPosts(){
           postsContainer.innerHTML = ''
          return postsContainer.innerHTML = 
          `<div class="no-post">
            <h2 >No posts yet !😴</h2>  
            <a class = "initialCreatePostBtn" href="/api/newPost">Create One  😊 </a>
          </div>`
}


 function loadPostsOnLoad(){
    renderPosts(Allposts)
  }


 function toggleDescriptionExpand(postDiv,event){
       const showText = event.target.closest('.showMoreLink')
       const descEl =  postDiv.querySelector('.description')
       const shortenedDesc = descEl.textContent.length
       const fullText = showText.getAttribute('title')
       console.log(shortenedDesc)
      if(showText.textContent.includes('Read')){
        
        descEl.textContent = `${fullText}`
        showText.textContent = 'show less'
      }else{
        descEl.textContent = `${fullText.substring(0,100)}`
        showText.textContent = 'Read more'
      }
      }


function closeAnyModal(modalElement,secondContainer){
  window.addEventListener('click', (e)=>{
    const containerArea = e.target.closest('.posts');

    if(modalElement.style.display !== "none" && !containerArea || secondContainer){
         modalElement.style.display = "none"
  }
  })
}


// empty posts / create new post btn
postsContainer.addEventListener('click', (e)=>{
   const initialAddPostBtn = e.target.closest('.no-post')?.querySelector('a')

   if(!initialAddPostBtn) return console.log('no such btn found')

   const postModal = document.querySelector('.newMemoryContainer')
   if(postModal && postModal.style.display === 'none') postModal.style.display = "block"

})