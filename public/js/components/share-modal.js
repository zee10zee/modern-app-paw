
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
         console.log('share on the app')
   
    }
})
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
             mediaTag.src = '/' + sharingPost.mediafile
             if(mediaFile === 'video'){
                mediaTag.controls = true
             }
           const formHtml = `
           <span class="closeShareModal">❌</span>
            <form id="shareForm">
                ${mediaTag.outerHTML}
                <h2 class="sharingPostTitle">${sharingPost.title}</h2>
                <p class="sharingPostDesc">${sharingPost.description}</p>
                <button id="shareBtn">Share on the app!</button>
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

