
const tokenpart = window.location.pathname.split('/')
const token = tokenpart[2]
const userId = window.location.pathname.split('/').pop()
console.log(token, userId)
const mediaList = document.querySelector('.media-list')
const baseUrl = `http://localhost:3000/`
let currentView = '';
const profileContained = new Set()
window.addEventListener('DOMContentLoaded', async()=>{
const mediaContainer = document.querySelector('.photosWithVideos')

    const res = await axios.get(`/api/userProfile/${token}/${userId}`)

    if(res.status !== 200) return console.log('err server problem')
        const user = res.data.user;
        const posts = res.data.post;
        document.title= `${user.firstname}'s profile`
        
// Event delegation for menu clicks
document.addEventListener('click', (e) => {
    // Profile menu clicked
    if (e.target.classList.contains('media-file') && currentView !== 'profiles') {
        // Clear and show profile images
        mediaList.innerHTML = '';
        posts.forEach(post => {
            if (post.author_profilepicture) {
                displayProfileImages(post.author_profilepicture);
            }
        });
    }
    // Posts menu clicked
    else if (e.target.classList.contains('media-file') && currentView !== 'posts') {
        // Clear and show post images
        mediaList.innerHTML = '';
        posts.forEach(post => {
            if (post.mediafile) {
                displayPostImages(post.mediafile);
            }
        });
    }
});



})


function displayProfileImages(imgpath) {
    // Clear previous content
    mediaList.innerHTML = '';
    currentView = 'profiles';
    
    const img = document.createElement('img');
    const correctedPath = imgpath.replace(/\\/g, '/');
    img.src = baseUrl + correctedPath;
    img.alt = 'Profile picture';
    img.classList.add('profilePics');
    mediaList.appendChild(img);
}

function displayPostImages(imgpath) {
    // Clear previous content
    mediaList.innerHTML = '';
    currentView = 'posts';
    
    const img = document.createElement('img');
    const correctedPath = imgpath.replace(/\\/g, '/');
    img.src = baseUrl + correctedPath;
    img.alt = 'Post image';
    img.classList.add('postedPics');
    mediaList.appendChild(img);
}

