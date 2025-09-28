 const shareContentModal = document.querySelector('.editShareContentModal')

modal.addEventListener('click', (e)=>{
const editBtnOfModal = e.target.classList.contains('postEditBtn')   
        const sharePostId = parseInt(e.target.dataset.postId);
        const is_sharedPost = modal.classList.contains('is_shared_post')
        if(editBtnOfModal && is_sharedPost){
         modal.classList.remove('actual')
         loadSharePostEditForm(sharePostId,shareContentModal)
         shareContentModal.style.display = "block"       
    }
})

async function loadSharePostEditForm(postId,container){

    try{
    const respone = await axios.get(`/api/editPost/${postId}`);
    if(respone.data.success && respone.status === 200){

        const editingPost = respone.data.post

        const sharerMessage = editingPost.title

        const postId = editingPost.id
        
        container.style.display = "flex"
        container.innerHTML = loadShareMessageModal(postId,sharerMessage)
    }else{
        container.innerHTML = '<h3>issue at poping the edit message modal!</h3> <p> please Stay Patient !</p>'
    }

    }catch(err){
        console.log(err)
        // container.textContent = err.message
    }
   
}


function loadShareMessageModal(postId,sharerMessage){
return `
<span class="closep">❌</span>
<form class="editMessageInput">
  <input type="text" name="message" id="message" class="message" value="${sharerMessage}">
  <button data-post-id="${postId}" class="saveBtn">Save</button>
</form>`
}

shareContentModal.addEventListener('click', (e)=>{
    console.log(e.target)
    const closeBtn = e.target.classList.contains('closep')
    if(closeBtn){
        shareContentModal.style.display = "none"
    }
})
