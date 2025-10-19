
const container = document.querySelector('.userProfileContainer')
const baseUrl = 'http://localhost:3000/';

const messageBtn = document.querySelector('.chatBtn');
 const profileImgLink = bottomNav.querySelector('.profileImageLink')

  // const {token,userId} =  getTokenAndUserId(profileImgLink)

let loginUserPosts = [];
let loginProfile = null;
let owner;

document.addEventListener('click', (e)=>{
  if(e.target.closest('.fullscreenModal')) toggleFullscreen(e)
})

const userProfileContainer = document.querySelector('.userProfileContainer')
userProfileContainer.addEventListener('click', async(e)=>{
  e.preventDefault()
   const storedLink = localStorage.getItem('clickedOwnerLink')
  const targetEl = storedLink|| profileImgLink
  const {token,userId} =  getTokenAndUserId(targetEl)
  
  const mediaList = userProfileContainer.querySelector('.mediaList')
  
  if(e.target.classList.contains('postedPics')){
 clearMedia();
 console.log(targetEl)

  await renderPhotos(mediaList,token,userId)
  }

   else if(e.target.classList.contains('profilePics')){
    clearMedia();
   await renderProfiles(mediaList,token,userId)
  }

   else if(e.target.classList.contains('videos')){
 clearMedia();
   await renderVideos(mediaList, token,userId)
  }

  else if(e.target.classList.contains('chatBtn')){
    const data = await fetchUser(token,userId)
    const owner = data.owner

  console.log('profile header clicked')
  
    // e.preventDefault()
     console.log('message btn clicked', owner)
     window.location.href = `/api/chatpage/${owner.id}/${owner.usertoken}`
  }
  // else if(e.target.closest('.update-profile-logo')){
  //       console.log('you clicked the update profile')

  //       const parent = e.target.closest('.update-profile-logo')
  //       const input = parent.querySelector('.updateProfileInput')

  //       console.log(parent, 'parent ',input, 'input', input["type"], 'type of input')
  //   }
})


function getTokenAndUserId(el){
  console.log(el)
const link = el || el.getAttribute('href') //we sent the link from the cliced post owner

const splittedUrl = link.split('/')
 console.log(splittedUrl)
const segments = splittedUrl.filter(segment => segment)
 console.log(segments)

const token = segments[1]
const userId = segments[2]
console.log(token,userId)
return {token,userId}
}

async function loadUploadedImages(token,userId){
  const imgTypes = ['jpg','.png' , '.gif' , '.webp' ,'.bmp' ,'svg', '.tiff','.tif' ,'.heic' , '.avif']

  const data = await fetchUser(token,userId)
console.log(data.owner)

  loginUserPosts = data.user.posts
    
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
async function renderPhotos(mediaList,token,userId){
   mediaList.innerHTML = loadSpinner('fotos ..')

       const {uploadedPhotos} = await loadUploadedImages(token,userId)
       console.log(uploadedPhotos)
    if (!uploadedPhotos || uploadedPhotos.length === 0) return mediaList.innerHTML = '<p>No photos yet</p>'

        mediaList.innerHTML = ''
        uploadedPhotos.forEach(post => appendImage( mediaList,post.mediafile)) 
    }

async function renderVideos(mediaList,token,userId){
   mediaList.innerHTML = loadSpinner('videos..')
   const {uploadedVideos} = await loadUploadedImages(token,userId)
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


