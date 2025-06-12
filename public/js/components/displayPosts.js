
const postsContainer = document.getElementById('postsContainer')
const editPostContainer = document.getElementById('updateFormContainer')
    let Allposts = []


  function isVideo(filename){
      return /\.(mp4|webm|ogg)$/i.test(filename);
  }

const renderPosts = (posts)=>{
  
        posts.forEach((post)=>{
             const postDIV = document.createElement('div')
             postDIV.classList.add('posts')
             postDIV.dataset.postId = post.post_id
           
             const mediaFile = isVideo(post.mediafile) ? 'video' : 'img'
             const mediaTag = document.createElement(mediaFile)
             mediaTag.src = '/' + post.mediafile
             console.log(post.mediafile)
             if(mediaFile === 'video'){
                mediaTag.controls = true
             }
             const ui = document.createElement('div')
             ui.innerHTML = `
               <div class="title-date-burger">
                 <h2 class="title">${post.title}
                   <span id="date" class="date">${new Date(post.created_at).toLocaleDateString()}</span>
                 </h2>
                 <div id="gear" class="gear">⚙️</div>
                 
               </div>
               <p class="description">${post.description.substring(0,100)} 
                  <a class="showMoreLink" href="/api/showPost/${post.post_id}">Read more...</a>
               </p>
                ${mediaTag.outerHTML}
               <div class="likes-comments-share" style="display:flex; justify-content : space-between;">
                  <div class="like">
                     <form class="likeForm" action="/api/post/${post.id}/like" method="post">
                      <button class="likeBtn">❤️</button>
                      </form>
                      <p id="likesCount">${post.likecounts}</p>
                  </div>
                  <div class="comment">
                    <form action="/api/comment/id">
                      <button class="commentBtn">💬</button>
                    </form>
                    <p>12 comments</p>
                  </div>

                  <div class="share">
                    <form action="/api/share/id">
                      <button class="shareBtn">↗️</button>
                  </form>
                    <p>12 shares</p>
                  </div>
                </div>

                <div class="edit-delete">
                  <form id="editForm" data-post-id="${post.id}">
                    <button class="postEditBtn">Edit</button>
                  </form>
                  <form id="deleteForm" data-post-id="${post.id}">
                    <button class="postDeleteBtn">Delete</button>
                 </form>
                
                </div>
             `
             postDIV.append(ui)
            postsContainer.appendChild(postDIV)
        })
}


const setupEventListener = ()=>{
   postsContainer.addEventListener('click', async(e)=>{
     const editBtn = e.target.classList.contains('postEditBtn')
     const deleteBtn = e.target.classList.contains('postDeleteBtn')
     const gear = e.target.classList.contains('gear')
     const showMoreLink = e.target.classList.contains('showMoreLink')
     const postDiv = e.target.closest('.posts') || e.target.closest('.editPostContainer')
     const postId = postDiv.dataset.postId;
     console.log(postId);
   if(editBtn){
      e.preventDefault()
      await loadEditForm(postId)
    }else if(deleteBtn){
        await deletePost(postId)
        e.preventDefault()
    }else if(gear){
       const editDeleteContainer = postDiv.querySelector('.edit-delete')
       if(editDeleteContainer.style.display === "block") {
        editDeleteContainer.style.display = "none";
    } else {
        editDeleteContainer.style.display = "block";
    }

    }else if(showMoreLink){
        window.location.href=`/api/showPost/${postId}`
    }
})
}

// load edit form

const loadEditForm = async(postId)=>{
  const editingPost =  document.createElement('div')
  editingPost.classList.add('editPostContainer')
  editingPost.dataset.postId = postId

  const response = await axios.get(`/api/edit/${postId}`)

        if(response.status === 200){
            const post = response.data.post;
            console.log(post)
            const mediaFile = isVideo(post.mediafile)?'video' : 'img'
            const mediaTag = document.createElement(mediaFile)
            mediaTag.src = post.mediafile
            mediaTag.classList.add('previewFile')
            // return console.log(mediaTag.src)
            
            editingPost.innerHTML = `
                <h1 id="update-title">Update Post</h1>
                <form id="updateForm" data-post-id="${post.id}" enctype="multipart/form-data">
                <input type="text" name="newTitle" id="newTitle" value="${post.title}">
                <textarea name="newDesc" id="newDesc">${post.description}</textarea>
                <div class="file-input flex-class">
                     ${mediaTag.outerHTML}
                     <button class="newImage">New Image</button>
                    <input type="file" name="newFile" id="newFile" class="hiddenFile" accept="video/*,image/*" style="display:none">
                </div>
                <button class="updateButton">Update</button>
                 <button class="closeModal">Cancel</button>
            </form>
            `

            editPostContainer.appendChild(editingPost)
            editPostContainer.style.display = "block"
    }
}

// clicking the eidt button functionlity
editPostContainer.addEventListener('click', (e)=>{
        const newImageBtn = e.target.classList.contains("newImage")
        const updateEditFormButton = e.target.classList.contains("updateButton")
        const cancelUpdateButton = e.target.classList.contains("closeModal")
       if(newImageBtn){
        const parentDiv = e.target.parentElement
            const targetFileBtn = parentDiv.querySelector('.hiddenFile')
            targetFileBtn.click()
            e.preventDefault()
            // getting the display file
            targetFileBtn.addEventListener('change', handleFilePreview)
       }else if(updateEditFormButton){
          // e.preventDefault()
         const updateform = e.target.parentElement
         console.log(updateform)
         updateform.addEventListener('submit', async(e)=>{
            e.preventDefault()
            const post_id = updateform.dataset.postId
            console.log(updateform)
            await handleUpdatePost(post_id, updateform)
         })
       }else if(cancelUpdateButton){
        e.preventDefault()
        console.log('clsoe button')
          editPostContainer.style.display= "none"

       }
    })

    // previewing the uploaded file
    function handleFilePreview(e){
      const selectedFile = e.target.files[0]
      console.log(selectedFile)
      const previewContainer = e.target.closest('.file-input')
      console.log(previewContainer)
      let isVideoFile = isVideo(selectedFile.name)
      let previewFile = previewContainer.querySelector('video,img')
       
      if(!previewFile){
        const mediaFile = isVideo(selectedFile.name)? 'video':'img'
        previewFile = document.createElement(mediaFile)
        previewContainer.prepend(previewFile)
      }else{
      // Replace the element if type changed
      if ((isVideoFile && previewFile.tagName !== 'VIDEO') ||
          (!isVideoFile && previewFile.tagName !== 'IMG')) {
        const newFile = document.createElement(isVideoFile ? 'video' : 'img');
        previewContainer.replaceChild(newFile, previewFile);
        previewFile = newFile;
      }
    }
      const reader = new FileReader()
      previewFile.src = ''
      reader.onload = (e)=>{
       previewFile.src = e.target.result
      }

      if(selectedFile.type.startsWith('video/')){
         reader.readAsDataURL(selectedFile)
      }else if(selectedFile.type.startsWith('image/')){
        reader.readAsDataURL(selectedFile)
      }else{
        console.log('please upload only vidoes and images')
      }
    }

     // hande post update

    const handleUpdatePost = async(postId, updateform)=>{
        const formData = new FormData(updateform)
        console.log(formData)
        try{
          const response = await axios.put(`/api/post/update/${postId}`, formData, {})
         console.log(response.data)
         if(response.status === 200){
          console.log(Allposts.length)
        const updatedPost = response.data.updatedPost
        const postIndex = Allposts.findIndex(post => post.post_id === parseInt(postId))

        Allposts.forEach(post => {
           updatedPost = post[postIndex]
        })
        

          console.log(editPostContainer.firstElementChild)
 //  get the post by id and then put in dom to change the ui
            // disappearing the edit form
            editPostContainer.style.display = "none"
             const postsDiv = postContainer.firstElementChild;
             console.log(postsDiv)

            const mediaFile = isVideo(updatedPost.mediafile)?'video' : 'img'
            const mediaTag = document.createElement(mediaFile)
            mediaTag.src = updatedPost.mediafile
            mediaTag.classList.add('previewFile')
            
            postsDiv.innerHTML = `
               <div class="title-date-burger">
                 <h2 class="title">${updatedPost.title}
                   <span id="date" class="date">${new Date(updatedPost.created_at).toLocaleDateString()}</span>
                 </h2>
                 <div id="gear" class="gear">⚙️</div>
                 
               </div>
               <p class="description">${updatedPost.description.substring(0,100)} 
                  <a class="showMoreLink" href="/api/showPost/${updatedPost.post_id}">Read more...</a>
               </p>
                ${mediaTag.outerHTML}
               <div class="likes-comments-share" style="display:flex; justify-content : space-between;">
                  <div class="like">
                     <form class="likeForm" action="/api/post/${updatedPost.id}/like" method="post">
                      <button class="likeBtn">❤️</button>
                      </form>
                      <p id="likesCount">${updatedPost.likecounts}</p>
                  </div>
                  <div class="comment">
                    <form action="/api/comment/id">
                      <button class="commentBtn">💬</button>
                    </form>
                    <p>12 comments</p>
                  </div>

                  <div class="share">
                    <form action="/api/share/id">
                      <button class="shareBtn">↗️</button>
                  </form>
                    <p>12 shares</p>
                  </div>
                </div>

                <div class="edit-delete">
                  <form id="editForm" data-post-id="${updatedPost.id}">
                    <button class="postEditBtn">Edit</button>
                  </form>
                  <form id="deleteForm" data-post-id="${updatedPost.id}">
                    <button class="postDeleteBtn">Delete</button>
                 </form>
                
                </div>
             `
             postContainer.prepend(postsDiv)
         }
       

        }catch(err){
          console.log(err)
          editPostContainer.classList.remove('hidden')
        }
    }

    // delete post
const deletePost = async(postId)=>{
  try{
    const res = await axios.delete(`/api/post/delete/${postId}`, {})
  console.log(res)
  if(res.status === 200){
    console.log('file delete success')
    window.location.href="/"
  }
  }catch(err){
    console.log(err)
  }
}


    // update only posts locally with no refresh just from db
    // const updatePostOnDom =(post)=>{
    //   // return console.log(posts)
    //    const postDiv = document.querySelector('.posts')
    //    if(!postDiv) return;

    //   //  postDiv.dataset.postId;
    //   const titleEl = postDiv.querySelector('.title')
    //   titleEl.textContent = post.title
    //   const dateEl = postDiv.querySelector('.date')///poroblem seems to be here !
    //   dateEl.innerHTML = `<span class="date">${new Date(post.created_at).toLocaleDateString()}</span>`

    //   const desc = postDiv.querySelector('.desc')
    //   desc.innerHTML = `${post.descriptoin.substring(0,100)}....
    //     <a href="/">Read more</a>
    //   `

    //   const mediaContainer = postDiv.querySelector('video,img')?.parentElement;
    //   console.log(mediaContainer)
    //   if(mediaContainer && post.mediafile){
    //     mediaContainer.innerHTML = ''
    //      const mediaFile = isVideo(post.mediafile)? 'video' : 'img'
    //      const mediaEl = document.createElement(mediaFile)
    //      mediaFile.classList.add('mediaFile')
    //      mediaEl.src = post.mediafile
    //      if(mediaEl.tagName === 'VIDEO') mediaEl.controls = true;
    //      mediaContainer.append(mediaEl)
    //   }
    // }


    // const deleteForm = postsContainer.deleteForm

  document.addEventListener('DOMContentLoaded', async(e)=>{
  const res = await axios.get('/api/posts')

    if(res.status === 200){
        Allposts = res.data.posts
        // return console.log(posts)
        if(Allposts && Array.isArray(Allposts)){
           renderPosts(Allposts)
        }else{
          console.log('posts is not an array here !')
        }
    }  
      setupEventListener()
})
