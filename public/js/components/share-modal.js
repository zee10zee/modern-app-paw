
postsContainer.addEventListener('click', async(e)=>{
        let baseUrl = 'http://localhost:3000'

    const shareContainer = postsContainer.querySelector('.share-container')
    if(e.target.classList.contains('shareBtn')){
        loadShareFormModal(e, shareContainer)
        // closing modal form
    }else if(e.target.classList.contains('closeShareModal')){
        closeShareModal(shareContainer)
        // to facebook link share
    }else if(e.target.classList.contains('facebook')){
        const linktag = e.target.href;
        const url =  linktag
        const fbLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        // sharePostOn(platformLink,parseConnectionUrl, newTab)
        window.open(fbLink, '_blank')
        // copy button
    }else if(e.target.textContent.includes('Copy')){
        console.log('copy button')
        const copyElement = e.target.href;
        const postId = parseInt(copyElement.split('/').pop())
        const copyLink = `${baseUrl}/api/showPost/${postId}`
         const copiedText = await navigator.clipboard.writeText(copyLink).then(copiedText => alert('text copied ', copiedText)).catch(err => alert('failure copying the text with : ', err));
        //  share on app button
    }else if(e.target.classList.contains('shareOnApp')){
         const shareDiv = e.target.closest('.shareForm')
         const platform = e.target.textContent;
         const postId = e.target.dataset.postId;
        const messageInput = shareDiv.querySelector('#sharer_message_input')
        const message = messageInput.value
          shareOnTheApp(postId,messageInput,platform)
    }
})
// function shareOnApp
async function shareOnTheApp(postId,messageInput,platform){
    
    const post = postsContainer.querySelector(`.posts[data-post-id="${postId}"]`);

    // const platform = platform
    const res = await axios.post(`/api/sharePost`,
       {
         postId: postId,
         platform : platform,
         sharer_message : messageInput.value
       })
         console.log(res.data)
       if(res.data.success){
        const sharedPost = res.data.sharedPost;
        console.log(sharedPost.likesCount);


         updateSharedpostOnUI(sharedPost, postId)
         const actualPostofShared = postsContainer.querySelector(`.posts[data-post-id = "${postId}"]`)
         actualPostofShared.querySelector('.sharesCount').textContent = sharedPost.shares_count
         console.log(actualPostofShared)
         const shareContainer = postsContainer.querySelector('.share-container')
         shareContainer.style.display = "none"
         messageInput.value = ''
       }

}

function updateSharedpostOnUI(sharedPost,postId){
    //a postDiv like container
    const shareDiv = document.createElement('div')
    shareDiv.dataset.shareId = sharedPost.id
    shareDiv.classList.add('posts')
    let sharerHeader = ''
   let sharer_comment_part = ''
     let prevousPost = '';

     const mediaFile = isVideo(sharedPost.mediafile) ? 'video' : 'img'
        if(!mediaFile) return console.log('no media image')

        const mediaTag = document.createElement(mediaFile)
        mediaTag.src = '/' + sharedPost.mediafile
        if(mediaFile === 'video'){
          mediaTag.controls = true
        }

    sharerHeader+= `
            <img class="ownerPhoto" src="${sharedPost.sharer_profile}" alt="Profile picture">
             ${!sharedPost.postowner?`
              <ul id="userProfile-chat-modal" class="userProfile-chat-modal">
                    <li class="ownerProfile" data-token-id="${sharedPost.sharer_user_token}" data-user-id="${sharedPost.sharer_id}">
                        <a  href="/api/authorProfile/${sharedPost.sharer_user_token}">${sharedPost.sharer_name}'s Profile</a>
                    </li>
                    <li class="userProfile" data-user-id="${sharedPost.sharer_id}">
                        <a  class="userChatLink" href="/api/chatpage/${sharedPost.sharer_id}">Chat with user</a>
                    </li>
              </ul>
              `:''}
                 <div class="title-date-burger"> 
                     <span id="date" class="date">${new Date(sharedPost.shared_at). toLocaleDateString()}</span>
                      ${sharedPost.postowner ?`
                    <div id="gear" class="gear">⋮</div>
                  `:''}                                    
               </div>
                  <p class="sharer_message">${sharedPost.sharer_message}</p>


               <div class="edit-delete">
                
                   <span class="closep">❌</span>
                  <form id="editForm" >
                    <button data-share-id="${sharedPost.id}" class="postSharerEditBtn">Edit</button>
                  </form>
                  <form id="deleteForm" >
                    <button data-share-id="${sharedPost.id}" class="postSharerDeleteBtn">Delete</button>
                 </form>
                </div>

    `
     
  prevousPost+= `
    <div class="shared_post" data-post-id="${postId}">
       <img class="ownerPhoto" src="${sharedPost.original_author_profile}" alt="Profile picture">

              ${sharedPost.original_author_id !== sharedPost.sharer_id?
                `
              <ul id="userProfile-chat-modal" class="userProfile-chat-modal">
                    <li class="ownerProfile" data-token-id="${sharedPost.original_user_token}" data-user-id="${sharedPost.original_author_id}">
                        <a  href="/api/authorProfile/${sharedPost.original_user_token}">${sharedPost.original_author_name}'s Profile</a>
                    </li>
                    <li class="userProfile" data-user-id="${sharedPost.original_author_id}">
                        <a  class="userChatLink" href="/api/chatpage/${sharedPost.original_author_id}">Chat with user</a>
                    </li>
              </ul>
              `
              :''}

               <div class="title-date-burger"> 
                 <h2 class="title"> ${sharedPost.title}
                   <span id="date" class="date">${new Date(sharedPost.created_at).toLocaleDateString()}</span>
                 </h2>
               </div>
               <p class="description">${sharedPost.description.substring(0,100)} 
                  <a class="showMoreLink" href="/api/showOnePost/${postId}">Read more...</a>
               </p>
                  <div class="mediaContainer">
                    ${mediaTag.outerHTML}
                  </div>
        </div>
    `
    sharer_comment_part += `
                   <div class="likes-comments-share" style="display:flex; justify-content : space-between;">
                  <div class="like">
                     <form class="likeForm" action="/api/post/${sharedPost.id}/like" method="post">
                      <button class="sharePostLikeBtn" data-share-id="${sharedPost.id}">❤️</button>
                      </form>
                      <p id="likesCount" class="likesCount">${sharedPost.likes_count}</p>
                  </div>
                  <div class="commentsCount">
                    <button id="commentButton" class="sharePostCommentBtn" data-share-id="${sharedPost.id}">💬</button>
                    <p class="commentCount">${sharedPost.comments_count}</p>
                  </div>

                  <div class="share">
                    <form action="/api/share/id">
                      <button class="sharePostShareBtn">↗️</button>
                    </form>
                    <p>12 shares</p>
                  </div>
                 
                </div>

                 <form  id="commentForm" >
                      <input type="hidden" name="share_id" value="${sharedPost.id}"> 
                      <input type="text" name="comment" id="comment" class="shareCommentInput" placeholder="type your comment">
                 </form>
                  <div class="commentsContainer"></div>
                 <div class="container commentEditContainer" id="commentEditContainer"></div>
    `
    shareDiv.innerHTML = sharerHeader + prevousPost + sharer_comment_part
       postsContainer.appendChild(shareDiv)

}

async function loadShareFormModal(event, container){
    event.preventDefault()
    container.style.display = "flex"
     container.style.padding = '30px'
    const postId = parseInt(event.target.dataset.postId)
    console.log(postId)
    const response = await axios.get(`/api/share/post/${postId}`) 
    const sharingPost = response.data.sharedPost
    const sharingPostId = sharingPost.post_id;

    if(response.status === 200){ 
         const mediaFile = isVideo(sharingPost.mediafile) ? 'video' : 'img'
             const mediaTag = document.createElement(mediaFile)
             mediaTag.classList.add('mediaTag')
             mediaTag.src = sharingPost.mediafile
             mediaTag.dataset.postFile = sharingPost.mediafile
            
             if(mediaFile === 'video'){
                mediaTag.controls = true
             }
           const formHtml = `
           <span class="closeShareModal">❌</span>
              

            <form id="shareForm" class="shareForm" data-user-token="${sharingPost.user_token}" data-user-id="${sharingPost.post_user_id}">
             <textarea name="sharer_message_input" id="sharer_message_input" class="sharerMessage_input" placeholder="your message"></textarea>
                ${mediaTag.outerHTML}
                <h2 name="sharingTitle" id="sharingTitle" class="sharingTitle">${sharingPost.title}</h2>
                <p name="sharingDesc" id="sharingDesc" class="sharingDesc">${sharingPost.description}</p>
                <button data-post-id="${sharingPostId}" class="shareOnApp" id="shareBtn">Share on the app!</button>
            </form>

            <div class="links" style="display: flex; gap : 10px;">
                <a class="link facebook" href="/api/showPost/${sharingPostId}">facebook</a>
                <a class="link whatsapp"  href="">whatsApp</a>
                <a class="link twitter"  href="">twitter</a>
                <a class="link telegram"  href="">telegram</a>
                <a class="link linkedin"  href="">linkedIn</a>
                <a class="link copyLink"  href="/api/showPost/${sharingPostId}">Copy Link</a>
            </div>
    `
       container.innerHTML = formHtml
    }
}

function closeShareModal(container){
   if(container){
     container.style.display = "none"
   }
}




