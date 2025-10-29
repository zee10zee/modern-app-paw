modal.addEventListener('click', async(e)=>{
    const editBtnOfModal = e.target.classList.contains('postEditBtn')
    const DeleteBtnOfModal = e.target.classList.contains('postDeleteBtn')
     const postOwnerProfileLink = e.target.classList.contains('user-profile-link')
     const commentorLink = e.target.classList.contains('user-link');
     const userChatLink = e.target.classList.contains('userChatLink')
       const postId = modal.dataset.postId; 
     
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
        e.preventDefault()
       const link = e.target.closest('.userChatLink')?.getAttribute('href')

       console.log(link)
        const {receiverId} = getReceiverIdAndToken(link)
         console.log(receiverId)
         
         await createNewConversation(receiverId)

        if(window.innerWidth > 800){
           console.log('show large size chat page')
          await createContainerAndAppendChatPage(e)
          toggleHomeMenu()
        }else{
          const userLink = getReceiverLink(e,'.user-profile-link')
          storeOnLocalStorage('chat-list-user-url',userLink)
          hideAllPages()
          const smChatPageContainer = document.querySelector('.chatPageContainer')
          await loadChatPage(smChatPageContainer,userLink)
          postBtn.hide()
        }

         modal.style.display = 'none'; 

      }else if(postOwnerProfileLink){
        e.preventDefault()
          const el = e.target.closest('.action-item')
          const link = el.getAttribute('href')
          console.log(link)
          const clickedPostOwner = localStorage.setItem('clickedOwnerLink',link)

          hideAllShowUserProfilePage(el)
          modal.style.display = 'none';
      }
    })

    async function createNewConversation(userId2){
      try{
        const res = await axios.post(`api/conversation/new`,
          {userId2 : userId2})

      if(res.status === 200 && res.data.success){
         console.log(res.data.message, 'MESSAGE READ IT !')

        const conver_id = res.data.conversation.id
        sessionStorage.setItem('conver_id', conver_id) 
        const savedConversationId = sessionStorage.getItem('conver_id')
        return console.log('saved conversation id ', savedConversationId, ' of buddy user ', userId2)

      }
      }catch(err){

        console.log(err)
      }
    }