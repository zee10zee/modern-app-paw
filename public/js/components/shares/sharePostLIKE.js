// const postsContainer = document.getElementById('postsContainer')
postsContainer.addEventListener('click', (e)=>{
     const likeBtnElement = e.target;
     console.log(likeBtnElement)
     if(!likeBtnElement) return;
     if(likeBtnElement.classList.contains('sharePostLikeBtn')){
        const shareId = likeBtnElement.dataset.shareId;
        // return console.log(shareId)
        if(!shareId) return;
        const postDiv = likeBtnElement.closest(`.posts[data-share-id="${shareId}"]`)
         console.log(postDiv)
        handleSharePostLike(e,shareId)
     }

})


const handleSharePostLike = async(event,shareId)=>{
    event.preventDefault()
    console.log(shareId)
    const likeResult = await axios.post(`/api/likeSharePost/${shareId}`)
    if(likeResult.status === 200){
     let likesCount = likeResult.data.likesCount; 
     const likesContainer = event.target.closest(`.posts[data-share-id="${shareId}"]`)

     const likesCountElement = likesContainer.querySelector('.likesCount')
     likesCountElement.textContent = likesCount
    }
}