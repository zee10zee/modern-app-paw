const postForm = document.getElementById('postForm')
const newPostAlert = document.getElementById('newPostAlert')
const postAlert = sessionStorage.getItem('newPost')
const newMemoryContainer = document.querySelector('.newMemoryContainer')

postForm.addEventListener('submit', async(e)=>{
    e.preventDefault()

    const formData = new FormData(postForm)

    const response = await axios.post('/api/newPost', formData, {});
    // we have access to the new post and comments / so we will work on the spa of it soon ...

     console.log(response.data)
    if(response.status === 200 && response.data.success){
        sessionStorage.setItem('newPost', 'new memory added successfully !')
        const newPost = response.data.newPostData
        // check empty posts
        if(document.querySelector('.no-post')) postsContainer.innerHTML = ''
        updateUIpost(newPost)
        console.log(newMemoryContainer, 'NEW MEMORY CONTAINER OR MODAL')
        postForm.reset()
        newMemoryContainer.style.display = "none"   
        setupEventListener() 
    }
})

 function updateUIpost(newPost){
  const postDiv = document.createElement('div')
  postDiv.classList.add('posts')
  postDiv.dataset.postId = newPost.id
  postDiv.setAttribute('id', newPost.id)
     let commentDiv = '';
             
                newPost.comments.forEach(comment =>{
                   if(!comment) console.log('no comments yet')
                // commentDiv = 
               })

    
  postDiv.innerHTML += 
  `<img class="ownerPhoto" src="${newPost.user_profilepicture}" alt="Profile picture">
                 <div class="title-date-burger"> 
                     <span id="date" class="date">${new Date(newPost.created_at). toLocaleDateString()}</span>
                      ${newPost.is_owner ?`
                    <div id="gear" class="gear">⋮</div>
                  `:''}                                    
               </div>

                  <div class="title-date-burger"> 
                 <h2 class="title"> ${newPost.title}
                   <span id="date" class="date">${new Date(newPost.created_at).toLocaleDateString()}</span>
                 </h2>
               </div>
               <p class="description">${newPost.description.substring(0,100)} </p>

               ${newPost.description.length > 100 ?`
               <a class="showMoreLink" title="${newPost.description}" href="/api/showOnePost/${newPost.id}">Read more...</a>
               `:""}

                  <div class="mediaContainer">
                    ${renderMedia(newPost.mediafile)}
                  </div>`

        const newPostInfo = `<div class="likes-comments-share" style="display:flex; justify-content : space-between;">
                  <div class="like">
                     <form class="likeForm" action="/api/post/${newPost.id}/like" method="post">
                      <button class="likeBtn" data-post-id="${newPost.id}">❤️</button>
                      </form>
                      <p id="likesCount" class="likesCount">${newPost.likes_count}</p>
                  </div>
                  <div class="commentsCount">
                    <button id="commentButton" class="CommentBtn" data-post-id="${newPost.id}">💬</button>
                    <p class="commentCount">${newPost.comments_count}</p>
                  </div>

                  <div class="share">
                    <form action="/api/share/id">
                      <button class="shareBtn" data-post-id="${newPost.id}">↗️</button>
                    </form>
                  
                    <p class="sharesCount">${newPost.total_shares}</p>
                  
                  </div>
                 
                </div>

                 <form  id="commentForm">
                      <input type="hidden" name="post_id" value="${newPost.id}"> 
                      <input type="text" name="comment" id="comment" class="commentInput" placeholder="type your comment">
                 </form>
                  <div class="commentsContainer">
                  ${commentDiv}
                  </div>
                 <div class="container commentEditContainer" id="commentEditContainer"></div>`

        //   postDiv.append(newPostInfo)
        postDiv.innerHTML += newPostInfo
        postsContainer.prepend(postDiv)
}

// allert success post creation
if(newPostAlert && postAlert){
    newPostAlert.textContent = postAlert

    setTimeout(() => {
        newPostAlert.style.display = "none"
    }, 3000);
    sessionStorage.removeItem('newPost'); // ✅ clear it after use
}

const addNewMemoryLink = document.querySelector('.addNewPostBtn')
// clicking the new memory button 
addNewMemoryLink.addEventListener('click', (e)=>{
    const newMemoryModal = document.querySelector('.newMemoryContainer')
    newMemoryModal.style.display = 'block'
})

// close the modal if no post creation 
document.querySelector('.newPostCancel').addEventListener('click', (e)=>{
    e.preventDefault()
    console.log('closed')
    newMemoryContainer.style.display = "none"
})