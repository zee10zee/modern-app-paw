
// const tokenpart = window.location.pathname.split('/')
// const token = tokenpart[2]
// const userId = window.location.pathname.split('/').pop()
// console.log(token, userId)
// const mediaList = document.querySelector('.media-list')
// const baseUrl = `http://localhost:3000/`

// const profileContained = new Set()
// window.addEventListener('DOMContentLoaded', async()=>{
// const mediaContainer = document.querySelector('.photosWithVideos')

//     const res = await axios.get(`/api/userProfile/${token}/${userId}`)

//     if(res.status !== 200) return console.log('err server problem')
//         const user = res.data.user;
//         const posts = res.data.post;
//         document.title= `${user.firstname}'s profile`

//             posts.forEach(p =>{
//                 if(p.mediafile) displayPostImages(p.mediafile)
//             // if (p.mediafile.match(/\.(jpg|jpeg|png|gif|avif|webp)$/i) || 
//             //     p.mediafile.startsWith('data:image/')) {
//             // }   
//         })

//         mediaContainer.addEventListener('click', (e)=>{
//             posts.forEach(post =>{
//                  if(e.target.classList.contains('profiePics')){
//                 if(post.author_profilepicture && !profileContained.has(post.author_profilepicture)){
//                 displayProfiles(post.author_profilepicture)
//                 }
//             }
//             else if(e.target.classList.contains('postedPics')){
//               displayPostImages(post.mediafile)
//             }
//             })
           
//         })

// })

// function displayPostImages(imgpath){
//     const img = document.createElement('img')
//     // img.dataset.postId = post.post_id;
//     let correctedPath = imgpath.replace(/\\/g, '/');
//         const imgURL = baseUrl + correctedPath
//         img.src = imgURL
//         img.alt = 'pic'
//         mediaList.appendChild(img)
// }

// function displayProfiles(profile){
//     const profileImage = document.createElement('img')
//     // profileImage.dataset.userId = post.user_id;
//     const path = profile.replace(/\\/g, '/');
//     const profileIUrl = baseUrl + path 
//     profileImage.src = profileIUrl
//     mediaList.appendChild(profileImage)
//     profileContained.add(profile)
// }

const token = window.location.pathname.split('/')[2];
const userId = window.location.pathname.split('/').pop();
const baseUrl = 'http://localhost:3000/';
const profileContained = new Set();
const mediaList = document.querySelector('.media-list');

// Buttons directly
const postBtn = document.querySelector('.postedPics');
const profileBtn = document.querySelector('.profiePics');

let allPosts = [];

window.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading')
loading.classList.remove('hidden')
// Load content...

  try {
    const res = await axios.get(`/api/userProfile/${token}/${userId}`);
    if (res.status !== 200) throw new Error('Server error');

    const { user, post: posts } = res.data;
    allPosts = posts;
    document.title = `${user.firstname}'s profile`;

    // Show post images on page load
    renderMedia(allPosts, 'post');

  } catch (err) {
    console.error('Failed to load user media:', err);
  }
  loading.classList.add('hidden')
});

// Event listeners for buttons
postBtn.addEventListener('click', () => {
  clearMedia();
  renderMedia(allPosts, 'post');
});

profileBtn.addEventListener('click', () => {
  clearMedia();
  renderMedia(allPosts, 'profile');
});

// Show images
function renderMedia(posts, type) {
  posts.forEach(post => {
    if (type === 'post' && post.mediafile) {
      appendImage(post.mediafile);
    }

    if (type === 'profile' && post.author_profilepicture && !profileContained.has(post.author_profilepicture)) {
      appendImage(post.author_profilepicture);
      profileContained.add(post.author_profilepicture);
    }
  });
}

// Add image
function appendImage(path) {
  const img = document.createElement('img');
  img.src = baseUrl + path.replace(/\\/g, '/');
  img.alt = 'media';
  img.loading = 'lazy';
  img.className = 'w-full h-auto rounded shadow';
  mediaList.appendChild(img);
}

// Clear images before switching
function clearMedia() {
  mediaList.innerHTML = '';
}



