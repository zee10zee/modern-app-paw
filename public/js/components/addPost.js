const postForm = document.getElementById('postForm')
const newPostAlert = document.getElementById('newPostAlert')
const postAlert = sessionStorage.getItem('newPost')
const newMemoryContainer = document.querySelector('.newMemoryContainer')
let newCreatedPost = null;
const addNewMemoryBtn = document.querySelector('.addNewPostBtn')

// empty posts / initial post create btn
postsContainer.addEventListener('click', (e)=>{
   const initialAddPostBtn = e.target.closest('.no-post')?.querySelector('a')

   if(!initialAddPostBtn) return console.log('no such btn found')

   const postModal = document.querySelector('.newMemoryContainer')
   if(postModal && postModal.style.display === 'none') postModal.style.display = "flex"

})


if(!addNewMemoryBtn) console.log('no new btn found')

// clicking the new memory button 
addNewMemoryBtn.addEventListener('click', (e)=>{
     console.log('new post clicked',newMemoryContainer)
    newMemoryContainer.style.display = "flex"
})


const newMemoryModal = newMemoryContainer.querySelector('.modal')


// close the modal if no post creation 
newMemoryModal.addEventListener('click', (e)=>{
  console.log(e.target,e.target.parentElement)
  const newPostCancelBtn = e.target.classList.contains('newPostCancel')
const closeNewPostIcon = e.target.classList.contains('closeModalBtn')

    if(newPostCancelBtn || closeNewPostIcon){
    e.preventDefault() 
       newMemoryContainer.style.display = "none"
    }
})



postForm.addEventListener('submit', async(e)=>{
    e.preventDefault()

    const formData = new FormData(postForm)

    const response = await axios.post('/api/newPost', formData, {});

    if(response.status === 200 && response.data.success){
        sessionStorage.setItem('newPost', 'new memory added successfully !')
        const newPost = response.data.newPostData
        newCreatedPost = newPost
        
        // all posts array update
        Allposts = response.data.allPosts
        
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
  
  const labeledPost = postsContainer.querySelector('[data-is-fresh]')
  console.log(labeledPost)
  const labledExist = labeledPost !== null;

  if(labledExist){ 
    // first way is to remove attribute 
    labeledPost.removeAttribute('data-is-fresh')
    // /second to remove a dataset attribute only
    delete labeledPost.dataset.postDate
  }

  postDiv.dataset.postDate = Date.now()
  postDiv.dataset.isFresh = true;
  postDiv.dataset.postId = newPost.id
  postDiv.setAttribute('id', newPost.id)
     let commentDiv = '';
             
              
  postDiv.innerHTML += 
  `<!-- Post Header -->
<div class="postHeader">
  <img class="ownerPhoto" src="${newPost.user_profilepicture}" alt="Profile picture">

  <div class="postHeaderContent">
    <div class="postHeaderTop">
      <span class="posterName">${newPost.user_firstname}</span>
      ${newPost.is_owner ? `<div id="gear" class="gear">⋮</div>` : ''}
    </div>
    <span class="postDate">${new Date(newPost.created_at).toLocaleDateString()}</span>
  </div>
</div>

<!-- Post Title & Description -->
<h2 class="title">${newPost.title}</h2>
<p class="description">
  ${newPost.description.substring(0,100)}
</p>
${newPost.description.length > 100 ? `
  <a class="showMoreLink" title="${newPost.description}" href="/api/showOnePost/${newPost.id}">Read more...</a>
` : ''}

<!-- Media -->
<div class="mediaContainer">
  ${renderMedia(newPost.mediafile)}
</div>

<!-- Comments & Likes Area -->
<div class="commentsArea">
  <!-- Like -->
  <div class="likeSection">
    <form class="likeForm" action="/api/post/${newPost.id}/like" method="post">
      <button class="likeBtn" data-post-id="${newPost.id}">❤️</button>
    </form>
    <p id="likesCount" class="likesCount">${newPost.likes_count}</p>
  </div>

  <!-- Comments -->
  <div class="commentSection">
    <button id="commentButton" class="CommentBtn" data-post-id="${newPost.id}">💬</button>
    <p class="commentCount">${newPost.comments_count}</p>
  </div>

  <!-- Share -->
  <div class="shareSection">
    <form action="/api/share/id">
      <button class="shareBtn" data-post-id="${newPost.id}">↗️</button>
    </form>
    <p class="sharesCount">${newPost.total_shares}</p>
  </div>
</div>

<!-- Comment Input -->
<form id="commentForm" class="commentInputForm">
  <input type="hidden" name="post_id" value="${newPost.id}">
  <input type="text" name="comment" id="comment" class="commentInput" placeholder="Type your comment">
</form>

<!-- Comments List -->
<div class="commentsContainer">
  ${commentDiv}
</div>

<!-- Comment Edit Container -->
<div class="commentEditContainer" id="commentEditContainer"></div>
`
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



