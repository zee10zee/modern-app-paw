
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
        const sharer_message = shareDiv.querySelector('#sharer_message_input').value
       
          shareOnTheApp(postId,sharer_message,platform)
    }
})
// function shareOnApp
async function shareOnTheApp(postId,sharer_message,platform){
    
    const post = postsContainer.querySelector(`.posts[data-post-id="${postId}"]`);

    // const platform = platform
    const res = await axios.post(`/api/sharePost`,
       {
         postId: postId,
         platform : platform,
         sharer_message : sharer_message
       })
       return console.log(res.data)
       if(res.data.success){
        const sharedPost = res.data.sharedPost;
        const sharer = res.data.postSharer;

         updateSharedpostOnUI(sharedPost, sharer, postId)
         const shareContainer = postsContainer.querySelector('.share-container')
         shareContainer.style.display = "none"
       }

}

function updateSharedpostOnUI(sharedPost,sharer,postId){
    //a postDiv like container
    const shareDiv = document.createElement('div')
    shareDiv.dataset.shareId = sharedPost.id
    shareDiv.classList.add('.posts')
    shareDiv.innerHTML= `
            <img class="ownerPhoto" src="${sharer.profilepicture}" alt="Profile picture">
              <ul id="userProfile-chat-modal" class="userProfile-chat-modal">
                    <li class="ownerProfile" data-token-id="${sharer.usertoken}" data-user-id="${sharer.user_id}">
                        <a  href="/api/authorProfile/${sharer.usertoken}">${sharer.firstname}'s Profile</a>
                    </li>
                    <li class="userProfile" data-user-id="${sharer.id}">
                        <a  class="userChatLink" href="/api/chatpage/${sharer.id}">Chat with user</a>
                    </li>
              </ul>
               <div class="title-date-burger">
    `

    // original post 
    
    const origianPostDiv = document.createElement('div')
    origianPostDiv.classList.add('sharedPost')
    origianPostDiv.dataset.postId = sharedPost.post_id
    
      let prevousPost = '';
    shareDiv.classList.add('.posts')
     const mediaFile = isVideo(post.mediafile) ? 'video' : 'img'
        if(!mediaFile) return console.log('no media image')

        const mediaTag = document.createElement(mediaFile)
        mediaTag.src = '/' + post.mediafile
        if(mediaFile === 'video'){
          mediaTag.controls = true
        }


prevousPost+= `
     
       <img class="ownerPhoto" src="${sharedPost.author_profilepicture}" alt="Profile picture">
              <ul id="userProfile-chat-modal" class="userProfile-chat-modal">
                    <li class="ownerProfile" data-token-id="${sharedPost.usertoken}" data-user-id="${postOwnerId}">
                        <a  href="/api/authorProfile/${sharedPost.usertoken}">${sharedPost.firstname}'s Profile</a>
                    </li>
                    <li class="userProfile" data-user-id="${postOwnerId}">
                        <a  class="userChatLink" href="/api/chatpage/${postOwnerId}">Chat with user</a>
                    </li>
              </ul>
               <div class="title-date-burger"> 
                 <h2 class="title"> ${sharedPost.title}
                   <span id="date" class="date">${new Date(sharedPost.created_at).toLocaleDateString()}</span>
                 </h2>
                 ${postOwnerId?`
                 <div id="gear" class="gear">⋮</div>
                  `:''}
                 
               </div>
               <p class="description">${sharedPost.description.substring(0,100)} 
                  <a class="showMoreLink" href="/api/showPost/${sharedPost.post_id}">Read more...</a>
               </p>
                  <div class="mediaContainer">
                    ${mediaTag.outerHTML}
                  </div>
                  
               <div class="likes-comments-share" style="display:flex; justify-content : space-between;">
                  <div class="like">
                     <form class="likeForm" action="/api/post/${sharedPost.post_id}/like" method="post">
                      <button class="likeBtn">❤️</button>
                      </form>
                      <p id="likesCount" class="likesCount">${sharedPost.likecounts}</p>
                  </div>
                  <div class="commentsCount">
                    <button id="commentButton" class="commentBtn">💬</button>
                    <p class="commentCount">${sharedPost.commentcounts}</p>
                  </div>

                  <div class="share">
                    <form action="/api/share/id">
                      <button class="shareBtn">↗️</button>
                    </form>
                    <p>12 shares</p>
                  </div>
                 
                </div>

                 <div class="commentsContainer">
                    ${commentsHTML}
                 </div>
    `
       
       postsContainer.appendChild(shareDiv)
       // insertAjacentHTML('insertbeforeend', prevousPost)

    // inside the postDiv another postDiv with indentation
}

async function loadShareFormModal(event, container){
    event.preventDefault()
    container.style.display = "flex"
     container.style.padding = '30px'
    const postId = parseInt(event.target.dataset.postId)
    console.log(postId)
    const response = await axios.get(`/api/share/post/${postId}`) 
    // return console.log(response.data)
    const sharingPost = response.data.sharedPost
    // return console.log(sharingPost)
    const sharingPostId = sharingPost.post_id;
    const href="aa"

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


