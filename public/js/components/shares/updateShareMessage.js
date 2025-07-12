

const modalContainer = document.querySelector('.editShareContentModal')
    modalContainer.addEventListener('click', (e)=>{
         const saveBtn = e.target

        if(saveBtn.classList.contains('saveBtn')){
            // e.preventDefault()
            const shareId = e.target.dataset.shareId;

            updateSharePostMessage(e,shareId,modalContainer)
        }
    })




const updateSharePostMessage = async(event,shareId, modalContainer)=>{
    event.preventDefault()
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
       messageElement.textContent = newMessage
       modalContainer.style.display = "none"

    //    pop the success message !
       modalContainer.style.display = "block"
       modalContainer.style.color = "#fff"
       modalContainer.innerHTML = 'message updated successfully !'
       setTimeout(() => {
        modalContainer.innerHTML = ''
        modalContainer.style.display = "none"
       }, 2000);
   }
  }catch(err){
     modalContainer.textContent = err;
     console.log(err)
  }

}