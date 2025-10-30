
socket.on('share_root_notify', data =>{
 const shareContainer1 = document.getElementById('share-container')
        console.log(data.sharedPost)
        const sharedPost = data.sharedPost
        const originalPost = sharedPost.original_post;
        const original_postOwner = originalPost.owner;
   updateSharedpostOnUI(sharedPost,originalPost)
  if(shareContainer1.style.display === 'block') shareContainer1.style.display = "none"
})

let appShareBtn;
 document.body.addEventListener('click', async(e)=>{
        let baseUrl = 'http://localhost:3000'
   const shareContainer = document.getElementById('share-container')
    if(e.target.classList.contains('shareBtn')){
    const targetPostDiv = e.target.closest('.posts')
    const originalPost = targetPostDiv.querySelector('.shared_post')
    
    const originalPostId = targetPostDiv.contains(originalPost) ?  parseInt(originalPost.dataset.postId) : parseInt(targetPostDiv.dataset.postId);
    
     shareContainer.dataset.rootId = originalPostId;

    const parent_share_Id = parseInt(targetPostDiv.dataset.postId)    

      console.log(shareContainer)
      shareContainer.style.display = "flex"

      loadShareFormModal(e,shareContainer,originalPostId, parent_share_Id)

    }else if(e.target.classList.contains('closeShareModal')){
        closeShareModal(shareContainer)
        // to facebook link share
    }else if(e.target.textContent.includes('Copy')){
        console.log('copy button')
        const copyElement = e.target.href;
        const postId = parseInt(copyElement.split('/').pop())
        const copyLink = `${baseUrl}/api/showPost/${postId}`
         const copiedText = await navigator.clipboard.writeText(copyLink)
         console.log(copiedText, 'copied text')

        //  .then(copiedText => alert('text copied ', copiedText)).catch(err => alert('failure copying the text with : ', err));
        //  share on app button
    }else if(e.target.classList.contains('shareOnApp')){
        e.preventDefault()
        appShareBtn = e.target.classList.contains('shareOnApp')
        showLoading(appShareBtn, 'sharing ..')
         const shareDiv = e.target.closest('.shareForm')
         const platform = e.target.textContent;

         const messageInput = shareDiv.querySelector('#sharer_message_input')
        const message = messageInput.value
        const targetPostDiv = e.target.closest('.posts')

          const parent_share_id = e.target.dataset.postId;
          const rootId = shareContainer.dataset.rootId;

          await shareOnTheApp(parent_share_id,messageInput,platform, rootId)
    }
})

// function shareOnApp
async function shareOnTheApp(parent_share_id,messageInput,platform,rootPostId){
// return console.log(postId, 'postid')
    const res = await axios.post(`/api/sharePost`,
       {
         platform : platform,
         parent_share_id: parent_share_id,
         root_postId : rootPostId,
         sharer_message : messageInput.value
       })
        // return console.log(res.data)
       if(res.data.success && res.status === 200){
         hideLoading(appShareBtn)
         Allposts = res.data.allPosts
        const shareContainer1 = document.getElementById('share-container')
        shareContainer1.style.display = "none"
        const sharedPost = res.data.sharedPost
        const originalPost = sharedPost.original_post;
        const original_postOwner = originalPost.owner;
        const sharesCounts = res.data.root_parent_sharesCount;

          // parent post update counts
          let parentPost = document.getElementById(sharesCounts.immediate_parent_id);
            const parentPost_counts = sharesCounts.parent_shares_count
            const parentPost_share_count_El = parentPost.querySelector('.sharesCount')

            parentPost_share_count_El.textContent = sharesCounts.parent_shares_count
            console.log(parentPost,parentPost_share_count_El, parentPost_counts)

        // root post update shares
        const rootOfCurrentPost = postsContainer.querySelector(`.posts[data-post-id="${sharesCounts.root_post_id}"]`)
        const root_shares_count = sharesCounts.root_shares_count
        const countRootPost_sharesEl = rootOfCurrentPost.querySelector('.sharesCount')
        // return console.log(sharedPost, 'SHARED POST')
        countRootPost_sharesEl.textContent = sharedPost.isnot_shared ? parentPost_counts : root_shares_count;
        
         updateSharedpostOnUI(sharedPost,originalPost);
         messageInput.value = ''
       }

}

async function loadShareFormModal(event, container, rootId,parent_share_id){

    event.preventDefault()
  
    const response = await axios.get(`/api/share/post/${rootId}`) 
     
    const sharingPost = response.data.sharedPost
    const sharingPostId = sharingPost.id

    if(response.status === 200){ 
     console.log(sharingPost, 'all the shred post information')

         const mediaFile = isVideo(sharingPost.mediafile) ? 'video' : 'img'
             const mediaTag = document.createElement(mediaFile)
             mediaTag.classList.add('mediaTag')
             mediaTag.src = sharingPost.mediafile
             mediaTag.dataset.postFile = sharingPost.mediafile 
             if(mediaFile === 'video'){
                mediaTag.controls = true
             }
           const formHtml = `
<!-- Share Container (modal box itself) -->
<div class="share-container">
  <!-- Close button -->
  <span class="closeShareModal">❌</span>

  <!-- Share Form -->
  <form id="shareForm" class="shareForm" 
        data-user-token="${sharingPost.user_token}" 
        data-user-id="${sharingPost.post_user_id}">

    <!-- Textarea -->
    <textarea 
      name="sharer_message_input" 
      id="sharer_message_input"
      class="sharerMessage_input"
      placeholder="your message"></textarea>

    <!-- Media preview -->
    <div class="mediaContainer">
      ${mediaTag.outerHTML}
    </div>

    <!-- Post title -->
    <h2 name="sharingTitle" id="sharingTitle" class="sharingTitle">
      ${sharingPost.title}
    </h2>

    <!-- Post description -->
    <p name="sharingDesc" id="sharingDesc" class="sharingDesc">
      ${sharingPost.description.substring(0,100)}
    </p>

    <!-- Share button -->
    <button data-post-id="${parent_share_id}" class="shareOnApp" id="shareBtn">
      Share on the app!
    </button>
  </form>

  <!-- Social / external links -->
  <div class="links">
    <a title="facebook" class="link facebook" id="${sharingPostId}"><svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 509.64"><rect fill="#0866FF" width="512" height="509.64" rx="115.612" ry="115.612"/><path fill="#fff" d="M287.015 509.64h-92.858V332.805h-52.79v-78.229h52.79v-33.709c0-87.134 39.432-127.522 124.977-127.522 16.217 0 44.203 3.181 55.651 6.361v70.915c-6.043-.636-16.536-.953-29.576-.953-41.976 0-58.194 15.9-58.194 57.241v27.667h83.618l-14.365 78.229h-69.253V509.64z"/></svg></a>
    <a title="WhatsApp" class="link whatsapp" href=""><svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 241.19"><defs><style>.cls-1{fill:#25d366;fill-rule:evenodd;}</style></defs><title>whatsapp-color</title><path class="cls-1" d="M205,35.05A118.61,118.61,0,0,0,120.46,0C54.6,0,1,53.61,1,119.51a119.5,119.5,0,0,0,16,59.74L0,241.19l63.36-16.63a119.43,119.43,0,0,0,57.08,14.57h0A119.54,119.54,0,0,0,205,35.07v0ZM120.5,219A99.18,99.18,0,0,1,69.91,205.1l-3.64-2.17-37.6,9.85,10-36.65-2.35-3.76A99.37,99.37,0,0,1,190.79,49.27,99.43,99.43,0,0,1,120.49,219ZM175,144.54c-3-1.51-17.67-8.71-20.39-9.71s-4.72-1.51-6.75,1.51-7.72,9.71-9.46,11.72-3.49,2.27-6.45.76-12.63-4.66-24-14.84A91.1,91.1,0,0,1,91.25,113.3c-1.75-3-.19-4.61,1.33-6.07s3-3.48,4.47-5.23a19.65,19.65,0,0,0,3-5,5.51,5.51,0,0,0-.24-5.23C99,90.27,93,75.57,90.6,69.58s-4.89-5-6.73-5.14-3.73-.09-5.7-.09a11,11,0,0,0-8,3.73C67.48,71.05,59.75,78.3,59.75,93s10.69,28.88,12.19,30.9S93,156.07,123,169c7.12,3.06,12.68,4.9,17,6.32a41.18,41.18,0,0,0,18.8,1.17c5.74-.84,17.66-7.21,20.17-14.18s2.5-13,1.75-14.19-2.69-2.06-5.7-3.59l0,0Z"/></svg></a>

    <a title="twitter" class="link twitter" href=""><svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 462.799"><path fill-rule="nonzero" d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z"/></svg></a>
    <a title="telegram" class="link telegram" href=""><svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 512"><defs><linearGradient id="prefix__a" gradientUnits="userSpaceOnUse" x1="256" y1="3.84" x2="256" y2="512"><stop offset="0" stop-color="#2AABEE"/><stop offset="1" stop-color="#229ED9"/></linearGradient></defs><circle fill="url(#prefix__a)" cx="256" cy="256" r="256"/><path fill="#fff" d="M115.88 253.3c74.63-32.52 124.39-53.95 149.29-64.31 71.1-29.57 85.87-34.71 95.5-34.88 2.12-.03 6.85.49 9.92 2.98 2.59 2.1 3.3 4.94 3.64 6.93.34 2 .77 6.53.43 10.08-3.85 40.48-20.52 138.71-29 184.05-3.59 19.19-10.66 25.62-17.5 26.25-14.86 1.37-26.15-9.83-40.55-19.27-22.53-14.76-35.26-23.96-57.13-38.37-25.28-16.66-8.89-25.81 5.51-40.77 3.77-3.92 69.27-63.5 70.54-68.9.16-.68.31-3.2-1.19-4.53s-3.71-.87-5.3-.51c-2.26.51-38.25 24.3-107.98 71.37-10.22 7.02-19.48 10.43-27.77 10.26-9.14-.2-26.72-5.17-39.79-9.42-16.03-5.21-28.77-7.97-27.66-16.82.57-4.61 6.92-9.32 19.04-14.14z"/></svg></a>
    <a title="linkedIn" class="link linkedin" href=""><svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.31"><defs><style>.cls-1{fill:#0a66c2;}.cls-1,.cls-2{fill-rule:evenodd;}.cls-2{fill:#fff;}</style></defs><title>linkedin-app</title><path class="cls-1" d="M27.75,0H95.13a27.83,27.83,0,0,1,27.75,27.75V94.57a27.83,27.83,0,0,1-27.75,27.74H27.75A27.83,27.83,0,0,1,0,94.57V27.75A27.83,27.83,0,0,1,27.75,0Z"/><path class="cls-2" d="M49.19,47.41H64.72v8h.22c2.17-3.88,7.45-8,15.34-8,16.39,0,19.42,10.2,19.42,23.47V98.94H83.51V74c0-5.71-.12-13.06-8.42-13.06s-9.72,6.21-9.72,12.65v25.4H49.19V47.41ZM40,31.79a8.42,8.42,0,1,1-8.42-8.42A8.43,8.43,0,0,1,40,31.79ZM23.18,47.41H40V98.94H23.18V47.41Z"/></svg></a>
    <a title="Copy Link" class="link copyLink" href="/api/showPost/${sharingPostId}">
      <?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 111.07 122.88" style="enable-background:new 0 0 111.07 122.88" xml:space="preserve"><style type="text/css"><![CDATA[
	.st0{fill-rule:evenodd;clip-rule:evenodd;}
]]></style><g><path class="st0" d="M97.67,20.81L97.67,20.81l0.01,0.02c3.7,0.01,7.04,1.51,9.46,3.93c2.4,2.41,3.9,5.74,3.9,9.42h0.02v0.02v75.28 v0.01h-0.02c-0.01,3.68-1.51,7.03-3.93,9.46c-2.41,2.4-5.74,3.9-9.42,3.9v0.02h-0.02H38.48h-0.01v-0.02 c-3.69-0.01-7.04-1.5-9.46-3.93c-2.4-2.41-3.9-5.74-3.91-9.42H25.1c0-25.96,0-49.34,0-75.3v-0.01h0.02 c0.01-3.69,1.52-7.04,3.94-9.46c2.41-2.4,5.73-3.9,9.42-3.91v-0.02h0.02C58.22,20.81,77.95,20.81,97.67,20.81L97.67,20.81z M0.02,75.38L0,13.39v-0.01h0.02c0.01-3.69,1.52-7.04,3.93-9.46c2.41-2.4,5.74-3.9,9.42-3.91V0h0.02h59.19 c7.69,0,8.9,9.96,0.01,10.16H13.4h-0.02v-0.02c-0.88,0-1.68,0.37-2.27,0.97c-0.59,0.58-0.96,1.4-0.96,2.27h0.02v0.01v3.17 c0,19.61,0,39.21,0,58.81C10.17,83.63,0.02,84.09,0.02,75.38L0.02,75.38z M100.91,109.49V34.2v-0.02h0.02 c0-0.87-0.37-1.68-0.97-2.27c-0.59-0.58-1.4-0.96-2.28-0.96v0.02h-0.01H38.48h-0.02v-0.02c-0.88,0-1.68,0.38-2.27,0.97 c-0.59,0.58-0.96,1.4-0.96,2.27h0.02v0.01v75.28v0.02h-0.02c0,0.88,0.38,1.68,0.97,2.27c0.59,0.59,1.4,0.96,2.27,0.96v-0.02h0.01 h59.19h0.02v0.02c0.87,0,1.68-0.38,2.27-0.97c0.59-0.58,0.96-1.4,0.96-2.27L100.91,109.49L100.91,109.49L100.91,109.49 L100.91,109.49z"/></g></svg>
    </a>
  </div>
</div>

`
       container.innerHTML = formHtml
    }else{
      const error = res.data.error
      console.log(error) 
    }
}

function updateSharedpostOnUI(sharedPost,originalPost){
  // return console.log(sharedPost)
    const shareDiv = document.createElement('div')
    shareDiv.dataset.postId = sharedPost.id
    shareDiv.setAttribute('id', sharedPost.id)

    shareDiv.classList.add('posts', 'shared')
    let sharePostBody = ''
   

     const mediaFile = isVideo(sharedPost.mediafile) ? 'video' : 'img'
        if(!mediaFile) return console.log('no media image')

        const mediaTag = document.createElement(mediaFile)
        mediaTag.src = '/' + sharedPost.mediafile
        if(mediaFile === 'video'){
          mediaTag.controls = true
        }

    sharePostBody+= `
                <!-- Shared Post -->

    <div class="sharedPostContent">
      <div class="sharedPostTop">
       <div class="profile-date"> 
          <img class="ownerPhoto" src="${sharedPost.sharer_profile}" alt="Profile picture">
          <span id="date">${new Date(sharedPost.created_at).toLocaleDateString()}</span>
       </div>

        ${sharedPost.is_share_post_owner ? `<div id="gear" class="gear">⋮</div>` : ''}
      </div>

      <p class="sharer_message">${sharedPost.title}</p>

      <div class="shared_post" data-post-id="${originalPost.id}">
        <div class="sharedPostOwner">
          <img class="ownerPhoto" src="${originalPost.owner.profilepicture}" alt="Profile picture">
          <div>
            <a href="/userProfile/${originalPost.owner.usertoken}/${originalPost.owner.id}" class="userProfileLink">${originalPost.owner.firstname}</a>
            <p class="postDate">${new Date(originalPost.created_at).toLocaleDateString()}</p>
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
`

                 const comments_area = `<div class="likes-comments-share" style="display:flex; justify-content : space-between;">
                  <div class="like">
                     <form class="likeForm" action="/api/post/${sharedPost.id}/like" method="post">
                      <button class="likeBtn" data-post-id="${sharedPost.id}">❤️</button>
                      </form>
                      <p id="likesCount" class="likesCount">${sharedPost.likes_count}</p>
                  </div>
                  <div class="commentsCount">
                    <button id="commentButton" class="CommentBtn" data-post-id="${sharedPost.id}">💬</button>
                    <p class="commentCount">${sharedPost.comments_count}</p>
                  </div>

                  <div class="share">
                    <form action="/api/share/id">
                      <button class="shareBtn" data-post-id="${sharedPost.id}">↗️</button>
                    </form>

                      <p class="sharesCount">${sharedPost.total_shares}</p>
                  </div>
                 
                </div>

                 <form  id="commentForm">
                      <input type="hidden" name="post_id" value="${sharedPost.id}"> 
                      <input type="text" name="comment" id="comment" class="commentInput" placeholder="type your comment">
                 </form>
                  <div class="commentsContainer"></div>
                 <div class="commentEditContainer" id="commentEditContainer"></div>`
   
    shareDiv.innerHTML = sharePostBody + comments_area
       postsContainer.prepend(shareDiv)
}

function closeShareModal(container){
   if(container){
     container.style.display = "none"
   }
}
