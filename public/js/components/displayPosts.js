
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
        profile.classList.add('profilePic')
        const profileLink = document.createElement('a')
        profileLink.classList.add('profileImageLink')

        profileLink.href = `/userProfile/${userToken}/${loggedInUserId}`
        profile.src = photo
        profileLink.append(profile)
        container.append(profileLink)
        })
    }
    let Allposts = []
    let AllComments = []
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


const renderPosts = (posts,container)=>{
     
        posts.forEach((post)=>{
          // return console.log(post.id)
             const postDIV = document.createElement('div')
             postDIV.classList.add('posts', post.is_shared && 'shared')
             postDIV.dataset.postId = post.id
             postDIV.setAttribute('id', post.id)
              
             
             const actualPostDate = getTimeAgo(post.created_at)

             const originalPost = post.original_post
            
             
             const media = renderMedia(post.mediafile)
       
            //  comments variables
             let commentsHTML = ''
                           
             if(post.comments.length > 0){

              AllComments = post.comments
              // return console.log(AllComments[0])
                post.comments.forEach(comment =>{
                commentsHTML += loadComments(comment)
               })
              } 
         
              let postHeader = `${!post.is_shared ? `
    
      <img class="ownerPhoto" src="${post.poster_profile}" alt="Profile picture">

      <div class="postHeaderContent">
        <div class="postHeaderTop">
            <span class="posterName">${post.poster_name}</span>
            ${post.is_owner ? `<div id="gear" class="gear">⋮</div>` : ''}
        </div>
        <span class="postDate">${actualPostDate}</span>
      </div>

    <h2 class="title">${post.title}</h2>
    <p class="description">${post.description.substring(0,100)}</p>
    ${post.description.length > 100 ? `
      <a class="showMoreLink" title="${post.description}" href="/api/showOnePost/${post.id}">Read more...</a>
    ` : ''}

    <div class="mediaContainer">
      ${media}
    </div>
  </div>
` : `
  <!-- Shared Post -->

    <div class="sharedPostContent">
      <div class="sharedPostTop">
      <div class="profile-date"> 
        <img class="ownerPhoto" src="${post.sharer_profile}" alt="Profile picture">
        <span id="date">${actualPostDate}</span>
      </div>

        ${post.is_share_post_owner ? `<div id="gear" class="gear">⋮</div>` : ''}
      </div>

      <p class="sharer_message">${post.title}</p>

      <div class="shared_post" data-post-id="${originalPost.id}">
        <div class="sharedPostOwner">
          <img class="ownerPhoto" src="${originalPost.owner.profilepicture}" alt="Profile picture">
          <div>
            <a href="/userProfile/${originalPost.owner.usertoken}/${originalPost.owner.id}" class="userProfileLink">${originalPost.owner.firstname}</a>
            <p class="postDate">${getTimeAgo(originalPost.created_at)}</p>
          </div>
        </div>

        <h2 class="title">${originalPost.title}</h2>
        <p class="description">${originalPost.description.substring(0,100)}</p>
        ${originalPost.description.length > 100 ? `
          <a class="showMoreLink" title="${originalPost.description}" href="/api/showOnePost/${originalPost.id}">Read more...</a>
        ` : ''}

        <div class="mediaContainer">
          ${renderMedia(originalPost.mediafile)}
        </div>
      </div>
    </div>
`}`

// <!-- comments info section -->
const comments_area = `
<div class="commentsArea">
  <!-- Like -->
  <div class="likeSection">
    <form class="likeForm" action="/api/post/${post.id}/like" method="post">
      <button class="likeBtn" data-post-id="${post.id}">❤️</button>
    </form>
    <p id="likesCount" class="likesCount">${post.likes_count}</p>
  </div>

  <!-- Comments -->
  <div class="commentSection">
    <button id="commentButton" class="CommentBtn" data-post-id="${post.id}">💬</button>
    <p class="commentCount">${post.comments_count}</p>
  </div>

  <!-- Share -->
  <div class="shareSection">
    <form action="/api/share/id">
      <button class="shareBtn" data-post-id="${post.id}">↗️</button>
    </form>
    <p class="sharesCount">${post.total_shares}</p>
  </div>
</div>

<!-- Comment Input -->
<form id="commentForm" class="commentInputForm">
  <input type="hidden" name="post_id" value="${post.id}">
  <input type="text" name="comment" id="comment" class="commentInput" placeholder="Type your comment">
</form>

<!-- Comments List -->
<div class="commentsContainer">
  ${commentsHTML}
</div>

<div class="commentEditContainer" id="commentEditContainer"></div>
`;

postDIV.innerHTML = postHeader + comments_area
container.appendChild(postDIV)
  })
}

function loadComments(comment){
  const commentorProfile = comment.author.profile_picture
  const commentAuthor = comment.author.firstname
  const text = comment.text

  return `<div class="comment" data-comment-id="${comment.id}">
                <img class="user-profile ownerPhoto" src="${commentorProfile}" alt="user-profile">
                ${!comment.is_owner?`
                <strong id="author"><a class="user-link" class="userProfileLink" href="/userProfile/${comment.author.user_token}/${comment.author.user_id}">${commentAuthor}</a></strong>
                `:`<strong id="author"><a class="user-link" href="/userProfile/${comment.author.user_token}">You</a></strong>`}
                <div class="text-commentGear">
                     <p id="text">${text}</p>
                     ${comment.is_owner?`
                     <div id="gear" data-comment-id = "${comment.id}" class="gear">⋮</div>
                     `:''}
                </div>
                <small id="date" class="date">${getTimeAgo(comment.created_at)}</small>
                
                </div>`
 
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

       console.log('modal modal moda l', modal)
      // const mediaModal = document.createElement('div')

      // Add this to your modal creation code

const setupEventListener = (container)=>{
   container.addEventListener('click', async(e)=>{
     const gear = e.target.classList.contains('gear')
     const showMoreLink = e.target.classList.contains('showMoreLink')
     const ownerPhoto = e.target.classList.contains('ownerPhoto');
     const postDiv = e.target.closest('.posts') || e.target.closest('.editPostContainer')
      // const mediaTag = postDiv.querySelector('.mediaFile')
     const imgOrVideo = e.target.classList.contains('mediaFile')
     postId = postDiv ? postDiv.dataset.postId : null; 
      //  return console.log(gear)
    if(gear){
      e.preventDefault()
      const gearBtn = e.target
      let cID = null;
      const postId = gearBtn.closest('[data-post-id]')?.dataset.postId

      if(postId){
        cID = postId
      }else{
        cID = gearBtn.closest('[data-comment-id]')?.dataset.commentId
      }

      loadModalSpinner()
      const {contentId} = await checkPostAuthorAndCommentAuthor(e,cID)
      console.log('content id ', contentId, modal)

      checkMainPostAndSharePost(e,postDiv)
     
      modal.innerHTML = loadSpecificPostModal(contentId)
      openModal(gearBtn)

    }else if(showMoreLink){
      toggleDescriptionExpand(postDiv,e)
    }
    else if(ownerPhoto){
      const photoBtn = e.target
     let finalpostId = null;
     
       // Handle post click
    const sharedPost = photoBtn.closest('.shared_post')

    if(sharedPost) {
       finalpostId = sharedPost.dataset.postId
    }else{
      finalpostId = postId
    }
      loadModalSpinner()
      const {content} = await checkPostAuthorAndCommentAuthor(e,finalpostId)
       const targetContent = content

        if(!targetContent) return console.log('no target post found') 

    const commentElement = e.target.closest('.comment');

    if (!commentElement) {
      console.log('no comment author click')
        getPostAuthorModal(targetContent, e);

    }  else {
        getCommentAuthorModal(targetContent, e);
        console.log('Clicked on something else');
    }
      openModal(photoBtn)

    }

    else if(imgOrVideo){
      toggleFullscreen(e)
    }
    else if(e.target.closest('.chatItem')){
      const href = e.target.closest('.chatItem')?.href
      console.log('go to chat ', href)
       window.location.href =  href
    }
})
}


// USING CLASSES FOR CACHING
//********************* */

class PostsCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.CACHE_DURATION = 30000; // 30 seconds
  }

  // Immediate cache check (0ms delay)
  getPost(postId) {
    const cached = this.cache.get(postId);
    const timestamp = this.timestamps.get(postId);
    const now = Date.now();
    
    if (cached && (now - timestamp < this.CACHE_DURATION)) {
      return { data: cached, source: 'memory', timestamp: now - timestamp };
    }
    return null;
  }

  // Set cache with individual post
  setPost(postId, postData) {
    this.cache.set(postId, postData);
    this.timestamps.set(postId, Date.now());
  }

  // Bulk set cache
  setAllPosts(posts) {
    posts.forEach(post => {
      this.cache.set(post.id.toString(), post);
      this.timestamps.set(post.id.toString(), Date.now());
    });
  }
}


// Usage - instant access
const postsCache = new PostsCache();

async function getPostSuperFast(postId) {
  // 1. Check memory cache first (instant)
  const cached = postsCache.getPost(postId);
  if (cached) {
    console.log(`✅ From memory cache (${cached.timestamp}ms old)`);
    return cached.data;
  }
  
  // 2. If not in cache, fetch and cache it
  const post = await fetchOnePost(postId);
  postsCache.setPost(postId, post);
  
  return post;
}

async function checkPostAuthorAndCommentAuthor(event, finalpostId = null) {

  let contentId = null;
  let content = null;
  console.log(event.target.closest('.comment'));
  
  if (event.target.closest('.comment')) {
    // Handle comment click
    const commentId = event.target.closest('.comment')?.dataset.commentId;
    console.log(commentId)
    if (!commentId) {
      console.error('No commentId found');
      return { contentId: null, content: null };
    }
    
    delete modal.dataset.postId;
    modal.dataset.commentId = commentId;

    // Find the comment efficiently
    let comment = null;
    if(!finalpostId) return console.log('finalpost id is undefined')
      console.log(typeof finalpostId, 'type of final post id')


     const post = await getPostSuperFast(finalpostId)

      comment = post.comments?.find(comment => comment.id === parseInt(commentId));
      if (!comment) return console.log('comment not found') // Stop searching once found
    
    contentId = commentId;
    content = comment
    console.log('Found comment:', content, 'modal', modal);
     return {contentId,content}
    
  } else {
   
    const postId = finalpostId || event.target.closest('data-post-id')?.dataset.postId;

    if(!postId) return console.log('no post id found 322')

    delete modal.dataset.commentId;
    modal.dataset.postId = postId;
    contentId = postId;


    const post = await getPostSuperFast(postId);
     content = post;
     
     contentId = post.id

     console.log('Found post:', content, contentId, 'modal ', modal);
     return {contentId, content}
  }
}
      
function checkMainPostAndSharePost(event,postDiv){

    if(postDiv.querySelector('.shared_post')){
        modal.classList.remove('actual')
        modal.classList.add('is_shared_post')
    }else{
        modal.classList.remove('is_shared_post')
        modal.classList.add('actual')
    }

  event.stopPropagation()
  modal.innerHTML = ''
}

// document.addEventListener('click', (e)=>{
//   if(e.target.closest('.fullscreenModal')) toggleFullscreen(e)
// })

function toggleFullscreen(event){
  let existingModal = document.querySelector('.fullscreenModal') 
  if(existingModal) { document.body.removeChild(existingModal) }

  else{
  const mediaModal = document.createElement('div')
  const clonedMedia = event.target.cloneNode(true)
  mediaModal.innerHTML = ''
  mediaModal.append(clonedMedia)
  document.body.appendChild(mediaModal)
  mediaModal.classList.add('fullscreenModal')
  event.stopPropagation()

  }
}


function loadModalSpinner(){

   modal.style.display = "flex"
   modal.innerHTML = 'loading ..'
   modal.innerHTML = loadSpinner("content")
}

// // open modal
function openModal(target) {
   
  console.log(target)
  if (!target) return;

  modal.style.display = "flex"
  modal.style.zIndex ='10000000'

//   // return console.log(target,modal)
 const targetRect = target.getBoundingClientRect();
const postdiv = target.closest('.posts');
const postDivRect = postdiv.getBoundingClientRect();

// // Calculate top position (add scrollY to convert to document coordinates)
const top = targetRect.bottom + window.scrollY;

// // Calculate centered left position (viewport coordinates)
let left = targetRect.left + targetRect.width / 2 - modal.offsetWidth / 2 + scrollX;

// // Convert to document coordinates by adding scrollX
left += window.scrollX;

console.log('Initial left:', left);

// // Set boundaries relative to document coordinates
const minLeft = postDivRect.left + window.scrollX;
const maxLeft = postDivRect.right + window.scrollX - modal.offsetWidth;

console.log('Min and max lefts:', minLeft, maxLeft);

// // Clamp modal's left so it stays inside postDiv
left = Math.max(minLeft, Math.min(left, maxLeft));

// console.log('Final left:', left);

// Apply styles (fixed the syntax error)
modal.style.left = `${left}px`;
modal.style.top = `${top}px`;
  // Close modal when clicking outside
  document.addEventListener('click', function handler(e) {
    if (!modal.contains(e.target) || e.target.classList.contains('closep')) {
      modal.style.display = 'none';
      document.removeEventListener('click', handler);
    }

       
       if(e.target.classList.contains('.mediaFile') || e.target.classList.contains('collapseFullScreen')){
          const mediaModal = document.createElement('div')
          const clone = e.target.cloneNode(true)
          console.log(clone, 'clone of media file')
          mediaModal.appendChild(clone)
         mediaFullScreen.classList.add('fullscreenMedia')
       }else{
         mediaFile.style.display = "none"
       }
  });
}

  
// pop of modal on clicking user profile
function popUserProfileAndChat(post){
  return `
  ${!post.is_owner 
    ? `
      <div class="action-item">
        <a  href="/userProfile/${post.user_token}/${post.user_id}" class="user-profile-link">
          ${post.username}'s profile
        </a>
      </div>
      <div class="action-item">
        <a class="userChatLink" href="/api/chatpage/${post.user_id}/${post.user_token}" class="user-chat-link">
          Chat with ${post.username}
        </a>
      </div>
    ` 
    : `
      <div class="action-item">
        <a href="/userProfile/${post.user_token}/${post.user_id}" class="user-profile-link">
          Your profile
        </a>
      </div> 
    </div`}
`
};


function getCommentAuthorModal(targetComment,e){
  const newOrEditedComment = e.target.classList.contains('new') || e.target.classList.contains('edited')
  let displayComment = null

  console.log(newOrEditedComment)
  if(!newOrEditedComment) {
      displayComment = {
       id : targetComment.id,
       user_id : targetComment.author.user_id,
       user_token : targetComment.author.user_token,
       username : targetComment.author.firstname,
       is_owner : targetComment.author.is_owner
     }
  }else{
     displayComment = {
       id : targetComment.id,
       user_id : targetComment.user_id,
       user_token : targetComment.usertoken,
       username : targetComment.author_name,
       is_owner : targetComment.is_owner
     }
  }
  
  appendToModal(displayComment,e)
}


// display user profile and chat modal
function getPostAuthorModal(targetPost,e){
      let displayPost = null
        
        if(targetPost.is_shared && e.target.closest('.shared_post')){
           console.log(targetPost, 'original post')

          const originalPost = targetPost.original_post
          displayPost = {
            id : originalPost.id,
            user_id : originalPost.owner.id,
            user_token : originalPost.owner.usertoken,
            username : originalPost.owner.firstname,
            is_owner : originalPost.owner.is_owner
          }

      }else{
          console.log('poster,sharer,post')

        displayPost = {
          id : targetPost.id,
          username : targetPost.poster_name || targetPost.sharer_name || targetPost.username,
          user_token: targetPost.poster_token || targetPost.sharer_token|| targetPost.user_token,
          user_id : targetPost.poster_id || targetPost.sharer_id || targetPost.user_id,
          is_owner : targetPost.is_owner || targetPost.is_share_post_owner || targetPost.is_owner
        }
      }

      appendToModal(displayPost,e)
     
      }


function appendToModal(displayPost,e){
 console.log('comes from appendTomodal', displayPost)
  if(displayPost){
         modal.innerHTML = ''
        modal.innerHTML = popUserProfileAndChat(displayPost)
        modal.style.display = "flex"
        e.stopPropagation()
      }
}


      // load modal of user delete and edit post modal
function loadSpecificPostModal(postOrCommentid){        
    return `
  <span class="closep">❌</span>
  ${modal.dataset.postId ? `
    <form id="editForm">
      <button data-post-id="${postOrCommentid}" class="postEditBtn">Edit</button>
    </form>
    <form id="deleteForm">
      <button data-post-id="${postOrCommentid}" class="postDeleteBtn">Delete</button>
    </form>
  ` : `
    <form id="edit-comment-form">
      <button class="commentEditBtn" data-comment-id="${postOrCommentid}">Edit</button>
    </form>
    <form id="delete-comment-button">
      <button class="commentDeleteBtn" data-comment-id="${postOrCommentid}">Delete</button>
    </form>
  `}

`
}

   
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
<h1 id="update-title" class="updateTitle">Update Post</h1>

<form id="updateForm" class="updateForm" data-post-id="${post.id}" enctype="multipart/form-data">
  <input type="text" name="newTitle" id="newTitle" class="updateInput" value="${post.title}">

  <textarea name="newDesc" id="newDesc" class="updateTextarea">${post.description}</textarea>

  <div class="fileInputContainer">
    ${mediaTag.outerHTML}
    <button type="button" class="newImageBtn">New Image</button>
    <input type="file" name="newFile" id="newFile" class="fileInput" accept="video/*,image/*">
    </div>
    

  <div class="updateActions">
    <button type="submit" class="updateButton">Update</button>
    <button type="button" class="closeModal">Cancel</button>
  </div>
</form>

            `

            editPostContainer.appendChild(editingPost)
            editPostContainer.style.display = "flex"
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
                `:`<strong id="author"><a class="user-link" href="/userProfile/${comment.author.user_token}">You</a></strong>`}
                <div class="text-commentGear">
                     <p id="text">${comment.text}</p>
                     ${comment.is_owner?`
                     <div id="gear" data-comment-id = "${comment.id}" class="gear">⋮</div>
                     `:''}
                </div>
                <small id="date" class="date">${commentDate}</small>
                
                </div>`
}

  document.addEventListener('DOMContentLoaded', async(e)=>{

    postsContainer.innerHTML = loadSpinner('posts')

    try{
      const Allposts = await getAllposts()
      
        if(Allposts && Array.isArray(Allposts)){
          if(Allposts.length === 0 && postsContainer.children.length === 0) return checkEmptyPosts()

      loadHomePosts(Allposts)
        }else{
          console.log('posts is not an array here !')
        } 
    }catch(err){
      console.log(err)
    }
    
})

// const allContainer = document

window.addEventListener('resize', async(e)=>{
 const viewPortSize = window.innerWidth 
  let size;
 console.log(viewPortSize)
  if(viewPortSize > 800){
    const allContainer = document.querySelector('.chats-posts-users')  
  allContainer.innerHTML = ''

  const leftContainer = createElement('div', 'leftContainer')
  leftContainer.classList.add('chat-list-container')
  fetchAndRenderChats(leftContainer)

  // right container
  const rightContainer = createElement('div', 'rightContainer')
  rightContainer.innerHTML = `<h2>Community</h2>
  <ul class="community-list">
    <!-- Online users first -->
    <li class="user online">
      <div class="profile">
        <img src="/static-images/anonymous-user.png" alt="Ali">
      </div>
      <div class="user-info">
        <p class="fname">Ali</p>
        <i class="online-status">Online</i>
      </div>
    </li>

    <!-- Offline users -->
    <li class="user offline">
      <div class="profile">
        <img src="/uploads/1751110235162-1free-html5-and-css3-login-forms.jpg.avif" alt="Sara">
      </div>
      <div class="user-info">
        <p class="fname">Sara</p>
        <i class="online-status">2 hours ago</i>
      </div>
    </li>
  </ul>`

  const centerContainer = createElement('div', 'posts-container')
  centerContainer.setAttribute('id', 'postsContainer')
  const posts = await getAllposts()
  renderPosts(posts, centerContainer)

  allContainer.innerHTML = 
  `${leftContainer.outerHTML}
    ${centerContainer.outerHTML}
    ${rightContainer.outerHTML}
   `
   setupEventListener(allContainer)   

  }else{
    size = 'mobile size'
  }
   setTimeout(() => {
    console.log(size)
  }, 250);
})



function loadHomePosts(posts){
  const allContainer = document.querySelector('.chats-posts-users')
  const container = window.innerWidth > 800 ? postsContainer :  allContainer
  
  container.innerHTML = ''
  renderPosts(posts, container)
  setupEventListener(container)
}

function loadSpinner(content){
   return ` 
     <p>loading ${content} ..</p>
    <div id="loading" class="loading">
       <div class="spinner"></div>
    </div>`
}


const getAllposts = async()=>{
  const res = await axios.get('/api/posts')
  // return console.log(res.data.posts)
    if(res.status === 200){
    return Allposts = res.data.posts
}}

const fetchOnePost = async(postId)=>{

  const allPosts = await getAllposts()
  const post = allPosts.find(post => post.id === parseInt(postId))
  return post
}

function checkEmptyPosts(){
           postsContainer.innerHTML = ''
          return postsContainer.innerHTML = 
          `<div class="no-post">
            <h2 >No posts yet !😴</h2>  
            <a class = "initialCreatePostBtn" href="/api/newPost">Create One  😊 </a>
          </div>`
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
