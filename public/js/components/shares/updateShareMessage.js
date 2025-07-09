

const modalContainer = document.querySelector('.editShareContentModal')
    modalContainer.addEventListener('click', (e)=>{
        console.log('clicked the modal container')
         const saveBtn = e.target

        if(saveBtn.classList.contains('saveBtn')){
            // e.preventDefault()
            const shareId = e.target.dataset.shareId;

            updateSharePostMessage(e,shareId,modalContainer)
        }
    })




const updateSharePostMessage = async(event,shareId, modalContainer)=>{
    event.preventDefault()
//    return console.log(modalContainer.querySelector('.message'))
   const sharerMessageInput = modalContainer.querySelector('.message')
   const sharerMessage = sharerMessageInput.value
  try{
     const res = await axios.patch(`/api/update/message/${shareId}`, {sharer_message : sharerMessage})

   if(res.status === 200 && res.data.success){
       const updatedPost = res.data.updated_message;
       const newMessage = updatedPost.sharer_message;
       console.log(updatedPost)
       const targetedPost = postsContainer.querySelector(`.posts[data-share-id="${shareId}"]`);
       
       const messageElement = targetedPost.querySelector('.sharer_message')
    //    return console.log(messageElement,targetedPost)
       messageElement.textContent = newMessage
       modalContainer.style.display = "none"
       alert('message updated successfully !')
   }
  }catch(err){
     modalContainer.textContent = err;
     console.log(err)
  }

}