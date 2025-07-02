
postsContainer.addEventListener('click', (e)=>{
    if(e.target.classList.contains('postSharerEditBtn')){
        const shareId = e.target.dataset.shareId;
        console.log(shareId)
        const postDiv = e.target.closest('.posts')
        const shareContentModal = document.querySelector('.editShareContentModal')
       loadSharePostEditForm(shareId, shareContentModal)
    }
})


async function loadSharePostEditForm(shareId,container){

    try{
        const respone = await axios.get(`/api/editPost/${shareId}`);
    if(respone.data.success){
        const editingPost = respone.data.post
        const sharerMessage = editingPost.sharer_message
        container.style.padding = "30px"
        container.style.display = "block"
        const messageHTML = `
        <form class="editMessageInput">
            <input type="text" name="message" id="message" class="message" value="${sharerMessage}">
            <button data-share-id="${editingPost.id}" class="saveBtn">Save</button>
        </form>
        `
        container.innerHTML = messageHTML
    }else{
        container.textContent = err.message
    }

    }catch(err){
        console.log(err)
        container.textContent = err.message
    }
   
}