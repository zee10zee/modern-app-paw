
postsContainer.addEventListener('click', async(e)=>{
        let baseUrl = 'http://localhost:3000'

    const shareContainer = postsContainer.querySelector('.share-container')
    if(e.target.classList.contains('shareBtn')){
        loadShoreFormModal(e, shareContainer)
    }else if(e.target.classList.contains('closeShareModal')){
        closeShareModal(shareContainer)
    }else if(e.target.classList.contains('facebook')){
        const linktag = e.target.href;
        const url =  linktag
        const fbLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        // sharePostOn(platformLink,parseConnectionUrl, newTab)
        window.open(fbLink, '_blank')
    }else if(e.target.textContent.includes('Copy')){
        console.log('copy button')
        const copyElement = e.target.href;
        const postId = parseInt(copyElement.split('/').pop())
        const copyLink = `${baseUrl}/api/showPost/${postId}`
         const copiedText = await navigator.clipboard.writeText(copyLink).then(copiedText => alert('text copied ', copiedText)).catch(err => alert('failure copying the text with : ', err));
    }else if(e.target.classList.contains('shareOnApp')){
         alert('share on the app')
         const shareDiv = e.target.closest('.shareForm')
         const platform = e.target.textContent;
         const postId = e.target.dataset.postId;
         console.log(postId)
       
          shareOnTheApp(postId,shareDiv,platform)
    }
})
// function shareOnApp
async function shareOnTheApp(postId,shareDiv,platform){
    
  const title = shareDiv.querySelector('.sharingTitle').textContent
    const description = shareDiv.querySelector('.sharingDesc').textContent
    const file = shareDiv.querySelector('.mediaTag').getAttribute('src')
     console.log(file)
    // const platform = platform
    const res = await axios.post(`/api/sharePost/${postId}`,
       {
         sharingTitle : title,
         sharingDesc : description,
         sharing_file : file,
         platform : platform
       })

       if(res.data.success){
         console.log('post shared success')
         alert('shared file success, UI sould be now updated to see the changes !')
         window.href="/"
         const shareContainer = postsContainer.querySelector('.share-container')
         shareContainer.style.display = "none"
       }

}
async function loadShoreFormModal(event, container){
    event.preventDefault()
    container.style.display = "flex"
     container.style.padding = '30px'
    const postId = parseInt(event.target.dataset.postId)
    console.log(postId)
    const response = await axios.get(`/api/share/post/${postId}`) 
    console.log(response.data)
    const sharingPost = response.data.sharedPost
    const sharingPostId = sharingPost.post_id;
    const href="aa"
    if(response.status === 200){
        generateMeta(sharingPost)
         
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
            <form id="shareForm" class="shareForm">
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

function generateMeta(post){
    const baseURL = 'http://localhost:3000'
    const metaData = [
        {property : `og:title`, content : post.title},
        {property : `og:description`, content : post.description},
        {property : `og:file`, content : baseURL + post.mediafile},
        {property : `og:url`, content : `${baseURL}/api/showPost/${post.post_id}`},
    ]


    for(let i = 0; i< 4; i++){
        const meta = document.createElement('meta')
        meta.setAttribute('property', metaData[i].property)
        meta.setAttribute('content', metaData[i].content)
        document.head.appendChild(meta)
    }
}

