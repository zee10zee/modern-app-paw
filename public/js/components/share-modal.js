
socket.on('share_root_notify', data =>{
 const shareContainer1 = document.getElementById('share-container')
        console.log(data.sharedPost)
        const sharedPost = data.sharedPost
        const originalPost = sharedPost.original_post;
        const original_postOwner = originalPost.owner;
   updateSharedpostOnUI(sharedPost,originalPost)
  if(shareContainer1.style.display === 'block') shareContainer1.style.display = "none"
})

 document.body.addEventListener('click', async(e)=>{
        let baseUrl = 'http://localhost:3000'
   const shareContainer = document.getElementById('share-container')
    if(e.target.classList.contains('shareBtn')){
    const targetPostDiv = e.target.closest('.posts')
    const originalPost = targetPostDiv.querySelector('.shared_post')
    
    const originalPostId = targetPostDiv.contains(originalPost) ?  parseInt(originalPost.dataset.postId) : parseInt(targetPostDiv.dataset.postId);
    
     shareContainer.dataset.rootId = originalPostId;

    const parent_share_Id = parseInt(targetPostDiv.dataset.postId)

       shareContainer.classList.remove('hidden')
       shareContainer.classList.add('flex')
      loadShareFormModal(e,shareContainer,originalPostId, parent_share_Id)

    }else if(e.target.classList.contains('closeShareModal')){
        closeShareModal(shareContainer)
        // to facebook link share
    }else if(e.target.textContent.includes('Copy')){
        console.log('copy button')
        const copyElement = e.target.href;
        const postId = parseInt(copyElement.split('/').pop())
        const copyLink = `${baseUrl}/api/showPost/${postId}`
         const copiedText = await navigator.clipboard.writeText(copyLink).then(copiedText => alert('text copied ', copiedText)).catch(err => alert('failure copying the text with : ', err));
        //  share on app button
    }else if(e.target.classList.contains('shareOnApp')){
        e.preventDefault()
         const shareDiv = e.target.closest('.shareForm')
         const platform = e.target.textContent;

         const messageInput = shareDiv.querySelector('#sharer_message_input')
        const message = messageInput.value
        const targetPostDiv = e.target.closest('.posts')

          const parent_share_id = e.target.dataset.postId;
          const rootId = shareContainer.dataset.rootId;

          shareOnTheApp(parent_share_id,messageInput,platform, rootId)
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
        

        const shareContainer1 = document.getElementById('share-container')
        shareContainer1.classList.remove('flex')
          shareContainer1.classList.add('hidden')

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
           const formHtml = `<div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-y-auto max-h-[90vh] relative p-6">
   <!-- Close button -->
<span class="closeShareModal absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl cursor-pointer">❌</span>

<!-- Share Form -->
<form id="shareForm" class="shareForm space-y-4" data-user-token="${sharingPost.user_token}" data-user-id="${sharingPost.post_user_id}">
  
  <!-- Textarea -->
  <textarea name="sharer_message_input" id="sharer_message_input"
    class="sharerMessage_input w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 resize-none"
    placeholder="your message"></textarea>

  <!-- Media preview -->
  <div class="mediaContainer rounded-lg overflow-hidden">
    ${mediaTag.outerHTML}
  </div>

  <!-- Post title -->
  <h2 name="sharingTitle" id="sharingTitle" class="sharingTitle text-lg font-semibold text-gray-800">
    ${sharingPost.title}
  </h2>

  <!-- Post description -->
  <p name="sharingDesc" id="sharingDesc" class="sharingDesc text-gray-600">
    ${sharingPost.description.substring(0,100)}
  </p>

  <!-- Share button -->
  <button data-post-id="${parent_share_id}" class="shareOnApp w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition" id="shareBtn">
    Share on the app!
  </button>
</form>

<!-- Social / external links -->
<div class="links flex flex-wrap gap-2 justify-center mt-4">
  <a class="link facebook bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600" id="${sharingPostId}">facebook</a>
  <a class="link whatsapp bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600" href="">whatsApp</a>
  <a class="link twitter bg-sky-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-sky-600" href="">twitter</a>
  <a class="link telegram bg-blue-400 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-500" href="">telegram</a>
  <a class="link linkedin bg-blue-700 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-800" href="">linkedIn</a>
  <a class="link copyLink bg-gray-700 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-800" href="/api/showPost/${sharingPostId}">Copy Link</a>
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

    shareDiv.classList.add('posts', 'sharer-post')
    let sharePostBody = ''
   

     const mediaFile = isVideo(sharedPost.mediafile) ? 'video' : 'img'
        if(!mediaFile) return console.log('no media image')

        const mediaTag = document.createElement(mediaFile)
        mediaTag.src = '/' + sharedPost.mediafile
        if(mediaFile === 'video'){
          mediaTag.controls = true
        }

    sharePostBody+= `
                <img class="ownerPhoto" src="${sharedPost.sharer_profile}" alt="Profile picture">
           
               <div class="title-date-burger"> 
                   <span id="date" class="date">${new Date(sharedPost.created_at). toLocaleDateString()}</span>
                    ${sharedPost.is_share_post_owner ?`
                  <div id="gear" class="gear">⋮</div>
                `:''}                                    
             </div>
                <p class="sharer_message">${sharedPost.title}</p>

              <div class="shared_post" data-post-id="${originalPost.id}">
                   

                  ${parseInt(sharedPost.sharer_id) !== parseInt(originalPost.owner.id) ?
                `
                 <img class="ownerPhoto" src="${originalPost.owner.profilepicture}" alt="Profile picture">
              `
              :''}

                <div class="title-date-burger"> 
                  <h2 class="title"> ${originalPost.title}
                    <span id="date" class="date">${new Date(originalPost.created_at).toLocaleDateString()}</span>
                  </h2>
                </div>
                  <p class="description">${originalPost.description.substring(0,100)}</p>
                  
                    <a class="showMoreLink" title="${originalPost.description}" href="/api/showOnePost/${originalPost.id}">Read more...</a>s

                  <div class="mediaContainer">
                    ${renderMedia(originalPost.mediafile)}
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
                 <div class="container commentEditContainer" id="commentEditContainer"></div>`
    // container.style.display = "none"
    shareDiv.innerHTML = sharePostBody + comments_area
       postsContainer.prepend(shareDiv)
}

function closeShareModal(container){
   if(container){
     container.style.display = "none"
   }
}
