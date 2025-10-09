
const container = document.querySelector('.userProfileContainer')
const baseUrl = 'http://localhost:3000/';

const messageBtn = document.querySelector('.chatBtn');
 const parent = bottomNav.querySelector('.profileImageLink')

const splittedUrl =  parent.getAttribute('href').split('/')
console.log(splittedUrl)
const segments = splittedUrl.filter(segment => segment)
console.log(segments)

const token = segments[1]
const userId = segments[2]

let loginUserPosts = [];
let loginProfile = null;
let owner;

document.addEventListener('click', (e)=>{
  if(e.target.closest('.fullscreenModal')) toggleFullscreen(e)
})

const userProfileContainer = document.querySelector('.userProfileContainer')
userProfileContainer.addEventListener('click', async(e)=>{
  e.preventDefault()
  const mediaList = userProfileContainer.querySelector('.mediaList')

  if(e.target.classList.contains('postedPics')){
 clearMedia();
  await renderPhotos(mediaList)
  }

   else if(e.target.classList.contains('profilePics')){
 clearMedia();

   await renderProfiles(mediaList,token,userId)
  }

   else if(e.target.classList.contains('videos')){
 clearMedia();
   await renderVideos(mediaList)
  }

  else if(e.target.classList.contains('chatBtn')){{
    const data = await fetchUser(token,userId)
    const owner = data.owner

  console.log('profile header clicked')
  
    // e.preventDefault()
     console.log('message btn clicked', owner)
     window.location.href = `/api/chatpage/${owner.id}/${owner.usertoken}`
  }
  }
})

async function loadUploadedImages(){
  const imgTypes = ['jpg','.png' , '.gif' , '.webp' ,'.bmp' ,'svg', '.tiff','.tif' ,'.heic' , '.avif']

  const data = await fetchUser(token,userId)
  loginUserPosts = data.user.posts
  // const photos = loginUserPosts.filter(post => {return post.mediafile})
  // console.log(photos)
    
    const uploadedPhotos = loginUserPosts.filter(post =>{
       return post.parent_share_id === null && imgTypes.some(ext => post.mediafile.toLowerCase().includes(ext)) 
    })


       const uploadedVideos = loginUserPosts.filter(post =>{
     return post.parent_share_id === null && !imgTypes.some(ext => post.mediafile.toLowerCase().includes(ext)) 
  })

   console.log(uploadedPhotos)

  return {uploadedPhotos,uploadedVideos}
  }

  
// Show images
async function renderPhotos(mediaList){
   mediaList.innerHTML = loadSpinner('fotos ..')

       const {uploadedPhotos} = await loadUploadedImages()
       console.log(uploadedPhotos)
    if (!uploadedPhotos || uploadedPhotos.length === 0) return mediaList.innerHTML = '<p>No photos yet</p>'

        mediaList.innerHTML = ''
        uploadedPhotos.forEach(post => appendImage( mediaList,post.mediafile)) 
    }

async function renderVideos(mediaList){
   mediaList.innerHTML = loadSpinner('videos..')
   const {uploadedVideos} = await loadUploadedImages()
   if(!uploadedVideos || uploadedVideos.length === 0) return mediaList.innerHTML = '<p>No videos yet</p>'

      mediaList.innerHTML = '' // so it removes the spinnner 
      uploadedVideos.forEach(video => appendImage(mediaList,video.mediafile))
}

async function renderProfiles(mediaList,token,userId){
   mediaList.innerHTML = loadSpinner('profile pics..')

  const userData = await fetchUser(token,userId)
  loginProfile = userData.user

  if (!loginProfile) return mediaList.innerHTML = '<p>No profile photos yet</p>'

  mediaList.innerHTML = ''
  appendImage(mediaList,loginProfile.profilepicture)
}

// Add image
function appendImage(mediaList,path) {

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
  const mediaList = userProfileContainer.querySelector('.mediaList')

  mediaList.innerHTML = '';
}


