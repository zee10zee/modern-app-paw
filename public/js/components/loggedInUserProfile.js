const token = window.location.pathname.split('/')[2]
const userId = window.location.pathname.split('/').pop()

const container = document.querySelector('.userProfileContainer')
const baseUrl = 'http://localhost:3000/';
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
    const res = await axios.get(`/api/userProfile/${token}/${userId}`);
    if (res.status !== 200) throw new Error('Server error');
      //  return console.log(res)

    const { user } = res.data;
    
    document.title = `${user.firstname}'s profile`;

       const leftContainer = document.querySelector('.left-container')
       const rightContainer = document.querySelector('.right-container')
        console.log(leftContainer)

    leftContainer.innerHTML = loadUserInfo(user)
    rightContainer.innerHTML = loadSecurityInfo(user)


    function loadSecurityInfo(user){
      return `
      ${user.is_owner ?`
       <div class="security-info space-y-2 text-sm">
           <h1>security Info</h1>
          <p><strong>Email:</strong> ${user.email}   <button>Edit</button></p>
           ${user.password ?`
          <p><strong>Password:</strong>*********  
          <span>Edit</span> <span>view</span></p>
          `:''}
            <button class="disable-account-btn">Disable account</button>
        </div>
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
  loading.classList.add('hidden')
});

// Event listeners for buttons


function loadUploadedImages(){
  const imgTypes = ['jpg','.png' , '.gif' , '.webp' ,'.bmp' , '.tiff','.tif' ,'.heic' , '.avif']
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

  postBtn.addEventListener('click', () => {
  clearMedia();
  renderPhotos()
});

profileBtn.addEventListener('click', () => {
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
  file.className = 'w-full h-auto rounded shadow';
  mediaList.appendChild(file);
 
}

// Clear images before switching
function clearMedia() {
  mediaList.innerHTML = '';
}


// load side bar left user info
function loadUserInfo(user){
       return `       
       <div class="coverPhoto-profile relative w-full mb-16">
        <!-- Cover photo -->
        <div class="cover w-full h-48">
          <img src="https://images.pexels.com/photos/14557814/pexels-photo-14557814.jpeg" 
              alt="cover photo"
              class="w-full h-full object-cover">
        </div>

        <!-- Profile picture -->
        <div class="profile absolute left-1/2 -translate-x-1/2 -bottom-10">
          <img src="${user.profilepicture}" 
              alt="profile picture"
              class="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md hover:shadow-lg transition-shadow duration-300">
        </div>
      </div>

      ${!user.is_owner ? `
        <a  href="/api/chatpage/${user.id}/${user.usertoken}" 
            class="block w-[90%] bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition mb-4 mx-auto text-center">
            Go to Chat !
        </a>
        `:""}

        <div class="space-y-2 text-sm">
           <h1>PersonaL Info</h1>
          <p><strong>Name:</strong> ${user.firstname}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>date of birth:</strong>01/10/1998</p>
        
          
          <div class="hobbies">
           <h1>hobbies:</h1>
          <ul>
              <li>Photography Club</li>
              <li>football</li>
          </ul>
          </div>
          

          <div class="groups">
            <h1>Groups Your are in :</h1>
            <ul class="list-disc list-inside text-gray-600">
              
              <li>Photography Club</li>
              <li>Travel Buddies</li>
            </ul>
          </div>
          <div class="ratings">
            <h1>Ratings :</h1>
            <ul class="list-disc list-inside text-gray-600">
              <li>total posts : 4</li>
              <li>total likes : 4</li>
              <li>total comments :4 </li>
              <li>total shares : 4</li>
            </ul>
          </div>

        </div>
        `
    }
