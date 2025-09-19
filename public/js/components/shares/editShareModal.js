 const shareContentModal = document.querySelector('.editShareContentModal')

modal.addEventListener('click', (e)=>{
    if(e.target.classList.contains('postEditBtn') && modal.classList.contains('is_shared_post')){
        const sharePostId = parseInt(e.target.dataset.postId);
        const postDiv = e.target.closest('.posts')
       
        loadSharePostEditForm(sharePostId,shareContentModal)
        shareContentModal.style.display = "block"       
    }
})


async function loadSharePostEditForm(postId,container){

    try{
    const respone = await axios.get(`/api/editPost/${postId}`);
    if(respone.data.success && respone.status === 200){
        const editingPost = respone.data.post
         console.log(editingPost)
        const sharerMessage = editingPost.title
        const postId = editingPost.id
        container.style.padding = "30px"
        container.style.display = "block"
        const messageHTML = `
        <span class="closep">❌</span>
        <form class="editMessageInput">
            <input type="text" name="message" id="message" class="message" value="${sharerMessage}">
            <button data-post-id="${postId}" class="saveBtn">Save</button>
        </form>
        `
        container.innerHTML = messageHTML
    }else{
        container.innerHTML = '<h3>issue at poping the edit message modal!</h3> <p> please Stay Patient !</p>'
    }

    }catch(err){
        console.log(err)
        // container.textContent = err.message
    }
   
}


shareContentModal.addEventListener('click', (e)=>{
    console.log(e.target)
    const closeBtn = e.target.classList.contains('closep')
    if(closeBtn){
        shareContentModal.style.display = "none"
    }
})
