
postsContainer.addEventListener('click', (e)=>{
    const shareContainer = postsContainer.querySelector('.share-container')
    if(e.target.classList.contains('shareBtn')){
        loadShoreFormModal(e, shareContainer)
    }else if(e.target.classList.contains('closeShareModal')){
        closeShareModal(shareContainer)
    }else if(e.target.classList.contains('link')){
        const baseUrl = 'http://localhost:3000'
        const linktag = e.target.href;
        const url =  linktag
        const fbLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        // return console.log(fbLink)
        window.open(fbLink, '_blank')
    }
})
async function loadShoreFormModal(event, container){
    event.preventDefault()
    container.style.display = "flex"
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
                <button id="shareBtn">Share</button>
            </form>

            <div class="links" style="display: flex; gap : 10px;">
                <a class="link" href="/api/showPost/${sharingPostId}">facebook</a>
                <a class="link" href="https://wa.me/?text=from_memory_dom%20${href}">whatsApp</a>
                <a class="link" href="https://twitter.com/intent/tweet?url=${href}&text=from_memory_dom
">twitter</a>
                <a class="link" href="https://t.me/share/url?url=${href}&text=from_memory_dom
">telegram</a>
                <a class="link" href="https://www.linkedin.com/sharing/share-offsite/?url=${href}
">linkedIn</a>
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

