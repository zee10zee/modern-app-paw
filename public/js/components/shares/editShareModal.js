 const shareContentModal = document.querySelector('.editShareContentModal')

modal.addEventListener('click', async(e)=>{
         

const editBtnOfModal = e.target.classList.contains('postEditBtn')   
        const sharePostId = parseInt(e.target.dataset.postId);
        const is_sharedPost = modal.classList.contains('is_shared_post')
        if(editBtnOfModal && is_sharedPost){
        shareContentModal.innerHTML = loadSpinner('your message..')
         modal.classList.remove('actual')
         await loadSharePostEditForm(sharePostId,shareContentModal)
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
  <button class="cancel">Cancel</button>
</form>`
}

shareContentModal.addEventListener('click', (e)=>{
    const cancel = e.target.classList.contains('cancel')
    if(cancel){
        e.preventDefault()
        shareContentModal.style.display = "none"
    }
})
