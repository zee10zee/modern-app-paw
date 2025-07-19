const token = window.location.pathname.split('/').pop()
const container = document.querySelector('.userProfileContainer')
const baseUrl = 'http://localhost:3000/';
const profileContained = new Set();
const mediaList = document.querySelector('.media-list');

// Buttons directly
const postBtn = document.querySelector('.postedPics');
const profileBtn = document.querySelector('.profiePics');
const videosBtn = document.querySelector('.videos');

let loginUserPosts = [];
let loginProfile = null;

window.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading')
    loading.classList.remove('hidden')
    // Load content...  

  try {
    const res = await axios.get(`/api/loginUserProfile/${token}`);
    // return console.log(res)
    if (res.status !== 200) throw new Error('Server error');
    // return console.log(res)
    const { user, posts } = res.data;
    // return console.log(user)
    document.title = `${user.firstname}'s profile`;

       const leftContainer = document.querySelector('.left-container')
        console.log(leftContainer)

    leftContainer.innerHTML = loadUserInfo(user)
    // Show post images on page load
    loginUserPosts = posts.map(post =>{ 
        return post.mediafile
    })
     loginProfile = user
    renderMedia(loginUserPosts, 'post', user);

  } catch (err) {
    console.error('Failed to load user media:', err);
  }
  loading.classList.add('hidden')
});

// Event listeners for buttons
postBtn.addEventListener('click', () => {
  clearMedia();
  renderMedia(loginUserPosts, 'post', loginProfile);
});

profileBtn.addEventListener('click', () => {
  clearMedia();
  renderMedia(loginUserPosts, 'profile', loginProfile);
});

videosBtn.addEventListener('click', () => {
  clearMedia();
  const posts = loginUserPosts.find(post =>{ return post.includes('videos')})
 console.log(posts)
  if(posts){
    renderMedia(loginUserPosts, 'videos', loginProfile);
  }else{
    mediaList.innerHTML = "<h2>No videos yet </h2>"
  }
});


// Show images
function renderMedia(media, type, user){
    if (type === 'post' && media) {
     const images = media.filter(image =>{
        return !image.includes('videos')
     })
      appendImage(images);
    }else if (type === 'profile' && user.profilepicture) {
      appendImage(user.profilepicture);
    }else if(type === 'videos' && media){
      const videos = media.filter(video =>{
         return video.includes('videos')
      })
      appendImage(videos);
    }
}

// Add image
function appendImage(path) {
  // return console.log(path)

  if(Array.isArray(path)){
     path.forEach(post =>{

 let file = null;
   const normalizedPost = post.replace(/\\/g, '/');
    file = normalizedPost.includes('videos/')? 
     document.createElement('video') : file = document.createElement('img')

    //  on when zoomed after clicking on full screen !
//  if(file.tagName === 'VIDEO'){
//     file.controls = true;
//  }

  file.src = baseUrl + normalizedPost;
  file.alt = 'media';
  file.loading = 'lazy';
  file.className = 'w-full h-auto rounded shadow';
  mediaList.appendChild(file);
  })
  }else{
  const img = document.createElement('img');
  img.src = baseUrl + path.replace(/\\/g, '/');
  img.alt = 'media';
  img.loading = 'lazy';
  img.className = 'w-full h-auto rounded shadow';
  mediaList.appendChild(img);
  }
}

// Clear images before switching
function clearMedia() {
  mediaList.innerHTML = '';
}


// load side bar left user info
function loadUserInfo(user){
       return `       
       <div class="flex">
           <h2 class="text-xl font-semibold mb-4">${user.firstname}'s Info</h2>
          <!-- Edit Icon (Pen) - 3 Versions -->
<div style="display: flex; gap: 20px; align-items: center; width : 20px">
  <!-- Filled Style -->
  <button class="clicker px-4 py-2 bg-purple-600 text-white rounded hover:bg-blue-700 transition" style="margin-left: 80px">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.71 7.04C21.1 6.65 21.1 6 20.71 5.63L18.37 3.29C18 2.9 17.35 2.9 16.96 3.29L15.12 5.12L18.87 8.87L20.71 7.04ZM3 17.25V21H6.75L17.81 9.93L14.06 6.18L3 17.25Z"/>
  </svg>
  </button>
</div>
       </div>
        <div class="space-y-2 text-sm">
          <p><strong>Name:</strong> ${user.firstname}</p>
          <p><strong>Groups:</strong></p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Photography Club</li>
            <li>Travel Buddies</li>
          </ul>
        </div>
        `
    }
