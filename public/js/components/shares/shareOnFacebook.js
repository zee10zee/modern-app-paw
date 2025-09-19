const outModalToUse = document.querySelector('.editShareContentModal')
const shareModal = postsContainer.querySelector('.share-container')
console.log(shareModal, 'share modal')
if(!shareModal) console.log('no share modal is up')

    postsContainer.addEventListener('click',(e)=>{
         e.preventDefault()
        console.log(e.target, ' from on facebook')
        const fbLinkId = e.target.getAttribute('id')

        if(!fbLinkId === postId) return

        // const post_id = shareModal.dataset.rootId === postId ? postId : shareModal.dataset.rootId;

        // let desc = postsContainer.querySelector(`.posts[data-post-id="${post_id}"]`)?.querySelector('.description').textContent;
        //  let title = postsContainer.querySelector(`.posts[data-post-id="${post_id}"]`)?.querySelector('.title').textContent;

        // let image = postsContainer.querySelector('.mediaFile').src;
        // let baseUrl = 'http://localhost:3000'
        // let myUrl= `${baseUrl}/post/?postId=${post_id}`

        // metas fill up dynimca dta
        // let metaUrl = document.querySelector('.fburl')?.content
        // let metaType = document.querySelector('.fbtype')?.content
        // let metaDescription = document.querySelector('.fbdescription')?.content
        // let metaTitle = document.querySelector('.fbtitle')?.content
        // let metaimg = document.querySelector('.fbimage')?.content
    

        // metaDescription = desc
        // metaTitle = title
        // metaimg = image
        // metaType = 'website web app'
        // metaUrl = myUrl

    })
