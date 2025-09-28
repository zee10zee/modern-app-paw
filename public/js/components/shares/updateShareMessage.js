

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
     const res = await axios.patch(`/api/update/message/${postId}`
        , 
        {sharer_message : sharerMessage})

    //   return console.log(res.data)
   if(res.status === 200 && res.data.success){
       const updatedPost = res.data.updated_message;
       const newMessage = updatedPost.title;
       modalContainer.style.display = "none"
       
       popSuccessMessage()
        displayNewTitle(newMessage,postId)
   }
  }catch(err){
     modalContainer.textContent = err;
     console.log(err)
  }
}

function displayNewTitle(newMessage,postId){
const targetedPost = postsContainer.querySelector(`.posts[data-post-id="${postId}"]
        `);       
const messageElement = targetedPost.querySelector('.sharer_message')
messageElement.textContent = newMessage
}

function popSuccessMessage(){
       modalContainer.innerHTML = ''
       modalContainer.classList.add('active')
       modalContainer.innerHTML = '</p>message updated successfully !</p>'
       setTimeout(() => {
        modalContainer.classList.remove('active')
        modalContainer.style.display = "none"
       }, 2000);
}