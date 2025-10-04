const token = window.location.pathname.split('/')[2]
const userId = window.location.pathname.split('/').pop()

const container = document.querySelector('.userProfileContainer')
const baseUrl = 'http://localhost:3000/';
const mediaList = document.querySelector('.mediaList');



function toggleFullscreen(event){
  let existingModal = document.querySelector('.fullscreenModal') 
  // console.log(existingModal.classList.contains('fullscreenModal'))
  if(existingModal) { document.body.removeChild(existingModal) }

  else{
  const mediaModal = document.createElement('div')
  const clonedMedia = event.target.cloneNode(true)
  mediaModal.innerHTML = ''
  mediaModal.append(clonedMedia)
  document.body.appendChild(mediaModal)
  mediaModal.classList.add('fullscreenModal')
  event.stopPropagation()

  }
}

document.addEventListener('click', (e)=>{
  if(e.target.closest('.fullscreenModal')) toggleFullscreen(e)
})

mediaList.addEventListener('click', (e)=>{
  console.log('media list ,',e.target.tagName)
  if(e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO'){
     console.log('yes its an iamg or vid')
     toggleFullscreen(e)
  }
})



// Buttons directly
const postBtn = document.querySelector('.postedPics');
const profileBtn = document.querySelector('.profilePics');
const videosBtn = document.querySelector('.videos');
const messageBtn = document.querySelector('.chatBtn');
const leftContainer = document.querySelector('.userInfo')
const securityInfoContainer = document.querySelector('.securityInfo')
const profileHeaderContainer = document.querySelector('.profileHeader')

let loginUserPosts = [];
let loginProfile = null;
let owner;
window.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading')
    // Load content...  

  try {
    const res = await axios.get(`/api/userProfile/${token}/${userId}`);
    if (res.status !== 200) throw new Error('Server error');


    const { user } = res.data;
    console.log(user)
      owner = res.data.user;

    document.title = `${user.firstname}'s profile`;
    loading.classList.add('deactive')

       
    leftContainer.innerHTML = loadUserInfo(user)
    profileHeaderContainer.innerHTML = loadprofileHeader(user)
    securityInfoContainer.innerHTML = loadSecurityInfo(user)


    function loadprofileHeader(){

      const username = user.firstname.split(' ')[0]
      const lastname = user.firstname.split(' ').pop()

      return `<header class="profileHeader">
  <img src="${user.profilepicture}" alt="${username} profile picture" class="profilePhoto">

  <div class="profileDetails">
    <h1 class="profileName">${username} ${lastname}</h1>
    <p class="profileUsername">@${username}</p>
    <p class="profileBio">"Passionate about capturing the world through my lens 📸 | Traveler, coffee enthusiast, and lifelong learner 🌍☕ | Sharing moments, stories, and creativity one post at a time ✨"</p>

    <div class="profileStats">
      <div class="stat">
        <span class="statNumber">10</span>
        <span class="statLabel">Posts</span>
      </div>
      <div class="stat">
        <span class="statNumber">400</span>
        <span class="statLabel">Followers</span>
      </div>
      <div class="stat">
        <span class="statNumber">$50</span>
        <span class="statLabel">Following</span>
      </div>
    </div>

    <div class="profileActions">
      ${!user.is_owner ?
      `<button class="followBtn">${user.isFollowing ? 'Unfollow' : 'Follow'}</button>
      <button class="chatBtn">Message</button>
      `:``}
    </div>
  </div>
</header>
`
    }
    function loadSecurityInfo(user){
      return `
      ${user.is_owner ?`
       <h2 class="securityTitle">Security Info</h2>
    
    <p><strong>Email:</strong> ${user.email} <button class="editBtn">Edit</button></p>

    ${user.password ? `
      <p>
        <strong>Password:</strong> *********  
        <span class="editBtn">Edit</span> 
        <span class="viewBtn">View</span>
      </p>
    ` : ''}

    <button class="disableAccountBtn">Disable account</button>
        `:""}
      `
    }
    // Show post images on page load
    loginUserPosts = user.posts.map(post =>{ 
        return post   
      })
     loginProfile = user
        renderPhotos()

  } catch (err) {
    console.error('Failed to load user media:', err);
  }
  loading.classList.remove('active')
});

// Event listeners for buttons


function loadUploadedImages(){
  const imgTypes = ['jpg','.png' , '.gif' , '.webp' ,'.bmp' ,'svg', '.tiff','.tif' ,'.heic' , '.avif']
        console.log(loginUserPosts)
    const uploadedPhtos = loginUserPosts.filter(post =>{
        console.log(post.mediafile)
       return post.parent_share_id === null && imgTypes.some(ext => post.mediafile.toLowerCase().includes(ext)) 
    })

       const uploadedVideos = loginUserPosts.filter(post =>{
     return post.parent_share_id === null && !imgTypes.some(ext => post.mediafile.toLowerCase().includes(ext)) 
  })

  return {uploadedPhtos,uploadedVideos}
  }


profileHeaderContainer.addEventListener('click', (e)=>{
  console.log('profile header clicked')
  if(e.target.classList.contains('chatBtn')){
    // e.preventDefault()
    console.log('message btn clicked', owner)
     window.location.href = `/api/chatpage/${owner.id}/${owner.usertoken}`
  }
})

  postBtn.addEventListener('click', () => {
  clearMedia();
  renderPhotos()
});

profileBtn.addEventListener('click', () => {
  console.log('profie buton clicked')
  clearMedia();
  renderProfiles()
});

videosBtn.addEventListener('click', () => {
  clearMedia();
  renderVideos()
})

// Show images
function renderPhotos(){
       const {uploadedPhtos} = loadUploadedImages()
    if (!uploadedPhtos || uploadedPhtos.length === 0) return mediaList.innerHTML = '<p>No photos yet</p>'
        uploadedPhtos.forEach(img => appendImage(img.mediafile)) 
    }

function renderVideos(){
   const {uploadedVideos} = loadUploadedImages()
   if(!uploadedVideos || uploadedVideos.length === 0) return mediaList.innerHTML = '<p>No videos yet</p>'
      uploadedVideos.forEach(video => appendImage(video.mediafile))
}

function renderProfiles(){
  if (!loginProfile) return mediaList.innerHTML = '<p>No profile photos yet</p>'
  appendImage(loginProfile.profilepicture)
}

// Add image
function appendImage(path) {

 let file = null;
   const normalizedPost = path.replace(/\\/g, '/') 
    file = normalizedPost.includes('videos/')? 
     document.createElement('video') : file = document.createElement('img')
   console.log(file)
    //  on when zoomed after clicking on full screen !
 if(file.tagName === 'VIDEO'){
    file.controls = true;
 }

  file.src = !normalizedPost.startsWith('https') ? baseUrl + normalizedPost : normalizedPost;
 file.alt = 'media';
file.loading = 'lazy';
file.className = 'mediaItem';
mediaList.appendChild(file);
 
}

// Clear images before switching
function clearMedia() {
  mediaList.innerHTML = '';
}


// load side bar left user info
function loadUserInfo(user){
       return `
    <div class="userInfoHeader">
      <h2 class="userInfoTitle">${user.firstname}'s Info</h2>
    </div>

    <div class="userInfoBody">
      <p><strong>Name:</strong> ${user.firstname}</p>
      <p><strong>Groups:</strong></p>
      <ul class="userGroups">
        <li>Photography Club</li>
        <li>Travel Buddies</li>
      </ul>
    </div>
`
    }
