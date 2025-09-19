

const modalContainer = document.querySelector('.editShareContentModal')
    modalContainer.addEventListener('click', (e)=>{
         const saveBtn = e.target

        if(saveBtn.classList.contains('saveBtn')){
            // e.preventDefault()
            const postId = parseInt(e.target.dataset.postId);
            updateSharePostMessage(e,postId,modalContainer)
        }
    })




const updateSharePostMessage = async(event,postId, modalContainer)=>{
    event.preventDefault()
   const sharerMessageInput = modalContainer.querySelector('.message')
   const sharerMessage = sharerMessageInput.value
  try{
     const res = await axios.patch(`/api/update/message/${postId}`, {sharer_message : sharerMessage})

    //   return console.log(res.data)
   if(res.status === 200 && res.data.success){
       const updatedPost = res.data.updated_message;
       const newMessage = updatedPost.title;
    //    console.log(updatedPost, postsContainer)
       const targetedPost = postsContainer.querySelector(`.posts[data-post-id="${postId}"]
        `);

          modalContainer.style.display = "none"
         const messageElement = targetedPost.querySelector('.sharer_message')
         console.log(targetedPost, messageElement)
       messageElement.textContent = newMessage
       
      

    //    pop the success message !
       popSuccessMessage()
   }
  }catch(err){
     modalContainer.textContent = err;
     console.log(err)
  }
}

function popSuccessMessage(){
    modalContainer.style.display = "block"
       modalContainer.style.color = "#fff"
       modalContainer.style.background = 'darkgreen'
       modalContainer.innerHTML = 'message updated successfully !'
       setTimeout(() => {
        modalContainer.innerHTML = ''
        modalContainer.style.display = "none"
       }, 2000);
}