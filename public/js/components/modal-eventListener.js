modal.addEventListener('click', async(e)=>{
    const editBtnOfModal = e.target.classList.contains('postEditBtn')
    const DeleteBtnOfModal = e.target.classList.contains('postDeleteBtn')
     const postOwnerProfileLink = e.target.classList.contains('user-profile-link')
     const commentorLink = e.target.classList.contains('user-link');
     const userChatLink = e.target.classList.contains('userChatLink')
       const postId = modal.dataset.postId; 
      let target = e.target
     
      if(editBtnOfModal && modal.classList.contains('actual')){
           modal.classList.remove('is_shared_post')
          e.preventDefault()
          editPostContainer.innerHTML = ''
          await loadEditForm(postId,editPostContainer)
         
      }else if(DeleteBtnOfModal){
        e.preventDefault()
        await deletePost(postId)
      }

      if(userChatLink){
        // e.preventDefault()
         window.location.href = target.href
      }else if(postOwnerProfileLink){
        e.preventDefault()
          hideAllShowUserProfilePage(e)
      }
    })