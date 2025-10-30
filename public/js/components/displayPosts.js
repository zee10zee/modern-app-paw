
const postsContainer = document.getElementById('postsContainer')
const editPostContainer = document.getElementById('updateFormContainer')
const userNameHTML = document.querySelector('.activeUser')
const photo = localStorage.getItem('loggedIn_profile')
const username = localStorage.getItem('loggedIn_name')
const userToken = localStorage.getItem('loggedIn_userToken')
const loggedInUserId = localStorage.getItem('loggedIn_userId')
console.log(photo, 'login user profilephoto', userToken, username)

 console.log(loggedInUserId, 'user id')
 let postId;
     
 const loggedInUser = document.querySelector('.loggedInUser')
 const upLink = `/userProfile/${userToken}/${loggedInUserId}`
 const  profilePicContain = document.querySelectorAll('.profilePicContain')
   

        appendUserProfileOnNav()

    function appendUserProfileOnNav(){
      profilePicContain.forEach(container =>{
      container.setAttribute('href', upLink)


        const profile = document.createElement('img')
        const ownerNameEl = document.createElement('div')
        ownerNameEl.textContent = username
        ownerNameEl.classList.add('navUsername')

        profile.classList.add('profilePic')
        const profileLink = document.createElement('a')
        profileLink.classList.add('profileImageLink')

        profileLink.href = upLink
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
             mediaTag.src = file
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
      <button class="likeBtn" data-post-id="${post.id}">
      ${post.isliked ? `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 117.42"><path d="M66.71 3.55L81.1 37.26l36.58 3.28v-.01c1.55.13 2.91.89 3.85 2.01a5.663 5.663 0 011.32 4.13v.01a5.673 5.673 0 01-1.69 3.57c-.12.13-.25.25-.39.36L93.25 74.64l8.19 35.83c.35 1.53.05 3.06-.73 4.29a5.652 5.652 0 01-3.54 2.52l-.14.03c-.71.14-1.43.15-2.12.02v.01c-.75-.13-1.47-.42-2.11-.84l-.05-.03-31.3-18.71-31.55 18.86a5.664 5.664 0 01-7.79-1.96c-.38-.64-.62-1.33-.73-2.02-.1-.63-.09-1.27.02-1.89.02-.13.04-.27.08-.4l8.16-35.7c-9.24-8.07-18.74-16.1-27.83-24.3l-.08-.08a5.64 5.64 0 01-1.72-3.7c-.1-1.45.36-2.93 1.4-4.12l.12-.13.08-.08a5.668 5.668 0 013.77-1.72h.06l36.34-3.26 14.44-33.8c.61-1.44 1.76-2.5 3.11-3.05 1.35-.54 2.9-.57 4.34.04.69.29 1.3.71 1.8 1.22.53.53.94 1.15 1.22 1.82l.02.06zm10.19 37.2L61.85 5.51a.42.42 0 00-.09-.14.42.42 0 00-.14-.09.427.427 0 00-.35 0c-.1.04-.19.12-.24.24L45.98 40.75c-.37.86-1.18 1.49-2.18 1.58l-37.9 3.4c-.08.01-.16.02-.24.02-.06 0-.13.02-.18.05-.03.01-.05.03-.07.05l-.1.12c-.05.08-.07.17-.06.26.01.09.04.18.09.25.06.05.13.11.19.17l28.63 25c.77.61 1.17 1.62.94 2.65l-8.51 37.22-.03.14c-.01.06-.02.12-.01.17a.454.454 0 00.33.36c.12.03.24.02.34-.04l32.85-19.64c.8-.5 1.85-.54 2.72-.02L95.43 112c.08.04.16.09.24.14.05.03.1.05.16.06v.01c.04.01.09.01.14 0l.04-.01c.12-.03.22-.1.28-.2.06-.09.08-.21.05-.33L87.8 74.28a2.6 2.6 0 01.83-2.55l28.86-25.2c.04-.03.07-.08.1-.13.02-.04.03-.1.04-.17a.497.497 0 00-.09-.33.48.48 0 00-.3-.15v-.01c-.01 0-.03 0-.03-.01l-37.97-3.41c-1-.01-1.93-.6-2.34-1.57z" fill="#ffcf00"/></svg>
         ` : 
         `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 117.1"><defs><style>.cls-1{fill:#ffd401;}</style></defs><title>star-symbol</title><path class="cls-1" d="M64.42,2,80.13,38.7,120,42.26a3.2,3.2,0,0,1,1.82,5.62h0L91.64,74.18l8.9,39A3.19,3.19,0,0,1,98.12,117a3.27,3.27,0,0,1-2.46-.46L61.41,96.1,27.07,116.64a3.18,3.18,0,0,1-4.38-1.09,3.14,3.14,0,0,1-.37-2.38h0l8.91-39L1.09,47.88a3.24,3.24,0,0,1-.32-4.52,3.32,3.32,0,0,1,2.29-1l39.72-3.56L58.49,2a3.24,3.24,0,0,1,5.93,0Z"/></svg>`
        }
      </button>
    </form>
    <p id="likesCount" class="likesCount">${post.likes_count}</p>
  </div>

  <!-- Comments -->
  <div class="commentSection">
    <button id="commentButton" class="CommentBtn" data-post-id="${post.id}">
      <?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="111.686px" height="122.879px" viewBox="0 0 111.686 122.879" enable-background="new 0 0 111.686 122.879" xml:space="preserve"><g><path d="M83.896,5.08H27.789c-12.491,0-22.709,10.219-22.709,22.71v40.079c0,12.489,10.22,22.71,22.709,22.71h17.643 c-2.524,9.986-5.581,18.959-14.92,27.241c17.857-4.567,31.642-13.8,41.759-27.241h3.051c12.488,0,31.285-10.219,31.285-22.71V27.79 C106.605,15.299,96.387,5.08,83.896,5.08L83.896,5.08z M81.129,41.069c-4.551,0-8.24,3.691-8.24,8.242s3.689,8.242,8.24,8.242 c4.553,0,8.242-3.691,8.242-8.242S85.682,41.069,81.129,41.069L81.129,41.069z M30.556,41.069c-4.552,0-8.242,3.691-8.242,8.242 s3.69,8.242,8.242,8.242c4.551,0,8.242-3.691,8.242-8.242S35.107,41.069,30.556,41.069L30.556,41.069z M55.843,41.069 c-4.551,0-8.242,3.691-8.242,8.242s3.691,8.242,8.242,8.242c4.552,0,8.241-3.691,8.241-8.242S60.395,41.069,55.843,41.069 L55.843,41.069z M27.789,0h56.108h0.006v0.02c7.658,0.002,14.604,3.119,19.623,8.139l-0.01,0.01 c5.027,5.033,8.148,11.977,8.15,19.618h0.02v0.003h-0.02v40.079h0.02v0.004h-0.02c-0.004,8.17-5.68,15.289-13.24,20.261 c-7.041,4.629-15.932,7.504-23.104,7.505v0.021H75.32v-0.021h-0.576c-5.064,6.309-10.941,11.694-17.674,16.115 c-7.443,4.888-15.864,8.571-25.31,10.987l-0.004-0.016c-1.778,0.45-3.737-0.085-5.036-1.552c-1.852-2.093-1.656-5.292,0.437-7.144 c4.118-3.651,6.849-7.451,8.826-11.434c1.101-2.219,1.986-4.534,2.755-6.938h-10.95h-0.007v-0.021 c-7.656-0.002-14.602-3.119-19.622-8.139C3.138,82.478,0.021,75.53,0.02,67.871H0v-0.003h0.02V27.79H0v-0.007h0.02 C0.021,20.282,3.023,13.46,7.878,8.464C7.967,8.36,8.059,8.258,8.157,8.16c5.021-5.021,11.968-8.14,19.628-8.141V0H27.789L27.789,0 z"/></g></svg>
    </button>
    <p class="commentCount">${post.comments_count}</p>
  </div>

  <!-- Share -->
  <div class="shareSection">
    <form action="/api/share/id">
      <button class="shareBtn" data-post-id="${post.id}">
       
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3791 3729" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"><path d="M713 1152c197 0 375 80 504 209 29 29 56 61 80 95l1125-468c-36-85-55-178-55-275 0-197 80-375 209-504S2883 0 3080 0s375 80 504 209 209 307 209 504-80 375-209 504-307 209-504 209-375-80-504-209c-22-22-43-46-62-71l-1132 471c29 77 45 161 45 248 0 54-6 106-17 157l1131 530c11-13 23-26 36-39 129-129 307-209 504-209s375 80 504 209 209 307 209 504-80 375-209 504-307 209-504 209-375-80-504-209-209-307-209-504c0-112 26-219 73-313l-1092-512c-34 66-78 126-130 177-129 129-307 209-504 209s-375-80-504-209S2 2062 2 1865s80-375 209-504 307-209 504-209zm2742-815c-96-96-229-156-376-156s-280 60-376 156-156 229-156 376 60 280 156 376 229 156 376 156 280-60 376-156 156-229 156-376-60-280-156-376zm0 2303c-96-96-229-156-376-156s-280 60-376 156-156 229-156 376 60 280 156 376 229 156 376 156 280-60 376-156 156-229 156-376-60-280-156-376zM1089 1488c-96-96-229-156-376-156s-280 60-376 156-156 229-156 376 60 280 156 376 229 156 376 156 280-60 376-156 156-229 156-376-60-280-156-376z" fill-rule="nonzero"/></svg>
        
      </button>
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

let contentData = null;
let isDataReady = false;
let fetchedContent = null;

const setupEventListener = (container)=>{
  container.addEventListener('mouseover', async(e)=>{
  const ownerPhoto = e.target.classList.contains('ownerPhoto');
  const gear = e.target.classList.contains('gear')
  const postDiv = e.target.closest('.posts') || e.target.closest('.editPostContainer')
  postId = postDiv ? postDiv.dataset.postId : null; 
  const cID = findClickedPostOrComment(e.target)
    if(gear){
         
         contentData = await checkPostAuthorAndCommentAuthor(e,cID)        
          isDataReady = true 
    }
  })

   container.addEventListener('click', async(e)=>{
     const gear = e.target.classList.contains('gear')
     const showMoreLink = e.target.classList.contains('showMoreLink')
     const ownerPhoto = e.target.classList.contains('ownerPhoto');
     const postDiv = e.target.closest('.posts') || e.target.closest('.editPostContainer')
     const imgOrVideo = e.target.classList.contains('mediaFile')
     postId = postDiv ? postDiv.dataset.postId : null; 
      //  return console.log(gear)
    if(gear && isDataReady){
      e.preventDefault()
      const gearBtn = e.target
       checkMainPostAndSharePost(e,postDiv)
       loadModalSpinner()
       modal.innerHTML = loadSpecificPostModal(contentData.contentId)
       openModal(gearBtn)    

    }else if(showMoreLink){
      toggleDescriptionExpand(postDiv,e)
    }
    else if(ownerPhoto){
      const cID = findClickedPostOrComment(e.target)
       openModal(e.target)
       showLoading(modal, 'loading ..')

      const contentData = await checkPostAuthorAndCommentAuthor(e,cID)    
      const tpost = handleModalAndLinks(e,contentData.content)
      modal.innerHTML = popUserProfileAndChat(tpost)
      openModal(e.target)
      e.stopPropagation()
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


function findClickedPostOrComment(gearBtn){
  let cID = null;
      const postId = gearBtn.closest('[data-post-id]')?.dataset.postId

      if(postId){
        cID = postId
      }else{
        cID = gearBtn.closest('[data-comment-id]')?.dataset.commentId
      }

      return cID
}

function createModal(){
  const newModal = document.createElement('div')
      newModal.classList.add('post-user-modal')
  return newModal
}


 function handleModalAndLinks(e,targetContent){
 
    e.preventDefault()
     const photoBtn = e.target
    
  if(!targetContent) return console.log('no target post found') 

      const commentElement = e.target.closest('.comment');

      if (!commentElement) {
        console.log('no comment author click')
          const postModal = getPostAuthorModal(targetContent, e);
          return postModal

      }  else {
        
          const commentModal =  getCommentAuthorModal(targetContent, e);
          return commentModal
      }
  }

  class postModal {
    constructor(){

    }
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
    modal.style.display = "flex"
    hideLoading(modal)
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
  console.log('loading is running !')
    modal.innerHTML = ''   
   modal.style.display = "flex"
   modal.innerHTML = loadSpinner("content")
}

// // open modal
function openModal(target) {
  if (!target) return;
 console.log('after clicking the owner profile ')
  modal.style.display = "flex"
  modal.style.zIndex ='10000000'
 console.log(target, 'open modal target should be show after hover and click')
 const targetRect = target.getBoundingClientRect();
const postdiv = target.closest('.posts');
const postDivRect = postdiv.getBoundingClientRect();

// // Calculate top position (add scrollY to convert to document coordinates)
const top = targetRect.bottom + window.scrollY;

// // Calculate centered left position (viewport coordinates)
let left = targetRect.left + targetRect.width / 2 - modal.offsetWidth / 2 + scrollX;

// // Convert to document coordinates by adding scrollX
left += window.scrollX;

// Set boundaries relative to document coordinates
const minLeft = postDivRect.left + window.scrollX;
const maxLeft = postDivRect.right + window.scrollX - modal.offsetWidth;

// Clamp modal's left so it stays inside postDiv
left = Math.max(minLeft, Math.min(left, maxLeft));

modal.style.left = `${left}px`;
modal.style.top = `${top}px`;

handleMediaAndModalClick()
}

function handleMediaAndModalClick(){
  // Close modal when clicking outside
  document.addEventListener('click', function handler(e) {
      if (!modal.contains(e.target) || e.target.classList.contains('closep')) {
        modal.style.display = 'none';
        document.removeEventListener('click', handler);
      }

      handleMediaFullscreen(e)
  });
}

function handleMediaFullscreen(event){
  const mediaFullScreen = document.createElement('div')
  if(event.target.classList.contains('.mediaFile') || event.target.classList.contains('collapseFullScreen')){
    const mediaModal = document.createElement('div')
    const clone = event.target.cloneNode(true)
    console.log(clone, 'clone of media file')
    mediaModal.appendChild(clone)
    mediaFullScreen.classList.add('fullscreenMedia')
  }else{
    mediaFile.style.display = "none"
  }
}
  
// pop of modal on clicking user profile
function popUserProfileAndChat(post){
  return `
  ${!post.is_owner 
    ? `
      <div class="action-item" href="/userProfile/${post.user_token}/${post.user_id}" user-data-id="${post.user_id}">
        <a  href="/userProfile/${post.user_token}/${post.user_id}" class="user-profile-link">
          ${post.username}'s profile
        </a>
      </div>
      <div class="action-item" href="/api/chatpage/${post.user_id}/${post.user_token}" class="user-chat-link" user-data-id="${post.user_id}">
        <a class="userChatLink" href="/api/chatpage/${post.user_id}/${post.user_token}" class="user-chat-link">
          Chat with ${post.username}
        </a>
      </div>
    ` 
    : `
      <div class="action-item" href="/userProfile/${post.user_token}/${post.user_id}" class="user-profile-link" user-data-id="${post.user_id}">
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
  
  return displayComment
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

        return displayPost
     
      }


function appendToModal(displayPost,e){

  if(displayPost){
         modal.innerHTML = ''
        
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
   const leftContainer = document.querySelector('.chat-list-container')
    postsContainer.classList.add('striking-box')
    leftContainer.classList.add('striking-box')

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

class newPostBtn{

  constructor(){
    this.postBtn = document.querySelector('.add-btn')
    console.log('post btn ', this.postBtn)
  }
  show(){
    
    if(!this.postBtn) return console.log('no post btn fond')
    this.postBtn.style.display = "flex"
    console.log('is showing')
  }

  hide(){
    if(!this.postBtn) return console.log('no post btn fond')
    this.postBtn.style.display = "none"
    console.log('bt is hiding')
  }
}

const postBtn = new newPostBtn() 


function hideAddPostBtn(){
const addNwePostBtn = document.querySelector('.addNewPostBtn')
  addNwePostBtn.classList.add('hide')
}

function loadHomePosts(posts){
  const allContainer = document.querySelector('.chats-posts-users')
  const container = postsContainer
  // window.innerWidth > 800 ? postsContainer :  allContainer
  
  container.innerHTML = ''
  renderPosts(posts, container)
  setupEventListener(container)
}

function loadSpinner(content){
   return ` 
    <div id="loading" class="loading">
     <p>loading ${content} ..</p>
       <div class="spinner"></div>
    </div>`
}


const getAllposts = async()=>{
  const res = await axios.get('/api/posts')
  // return console.log(res.data.posts)
    if(res.status === 200){

      modal.style.display = "none"
      modal.style.display = "flex"
      hideLoading(modal)
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
