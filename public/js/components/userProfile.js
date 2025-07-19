
const token = window.location.pathname.split('/')[2];
const userId = window.location.pathname.split('/').pop();
const baseUrl = 'http://localhost:3000/';
const profileContained = new Set();
const mediaList = document.querySelector('.media-list');

// Buttons directly
const postBtn = document.querySelector('.postedPics');
const profileBtn = document.querySelector('.profiePics');
const videosBtn = document.querySelector('.videos');

let userPost = [];
let profilePic = null;

window.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading')
loading.classList.remove('hidden')
// Load content...

  try {
    const res = await axios.get(`/api/userProfile/${token}/${userId}`);
    if (res.status !== 200) throw new Error('Server error');

    const { user, posts } = res.data;
    document.title = `${user.firstname}'s profile`;
    document.querySelector('.user').textContent = `${user.firstname}'s Uploaded files`;

       const leftContainer = document.querySelector('.left-container')
        console.log(leftContainer)

        leftContainer.innerHTML = loadUserInfo(user)


    // Show post images on page load
    userPost = posts.map(post =>{ return post.mediafile})
     console.log(userPost)
     profilePic = user
    renderMedia(userPost, 'post', user);

  } catch (err) {
    console.error('Failed to load user media:', err);
  }
  loading.classList.add('hidden')
});

// Event listeners for buttons
postBtn.addEventListener('click', () => {
  clearMedia();
  renderMedia(userPost, 'post', profilePic);
});

profileBtn.addEventListener('click', () => {
  clearMedia();
  renderMedia(userPost, 'profile', profilePic);
});

videosBtn.addEventListener('click', () => {
  clearMedia();
  const posts = userPost.find(post =>{ return post.includes('videos')})
 console.log(posts)
  if(posts){
    renderMedia(userPost, 'videos', profilePic);
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
 if(Array.isArray(path)){
     path.forEach(post =>{

 let file = null;
   const normalizedPost = post.replace(/\\/g, '/');
    file = normalizedPost.includes('videos/')? 
     document.createElement('video') : file = document.createElement('img')

 if(file.tagName === 'VIDEO'){
    file.controls = true;
 }

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
           <h2 class="text-xl font-semibold mb-4" style="width:fit-content">${user.firstname}'s Info</h2>
        <a href="/api/chatpage/${user.id}" id="chatUser"clicker px-4 py-2 text-white rounded transition style="margin-left: auto">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="35" height="35" fill="#0084ff">
            <path d="M18 2C9.2 2 2 8.8 2 17.2c0 4.7 2.1 8.8 5.5 11.6v5.2l5.1-2.8c1.6.4 3.3.6 5.4.6 8.8 0 16-6.8 16-15.2S26.8 2 18 2zm2.6 18.6l-4.3-4.5-7.3 4.5 8.8-9 4.3 4.5 7.3-4.5-8.8 9z"/>
          </svg>
        </a >
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


