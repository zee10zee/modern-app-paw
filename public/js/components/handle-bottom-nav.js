
const chatPageContainer = document.querySelector('.smChatListContainer')
const bottomNav = document.querySelector('.bottom-nav')
const bottomNavchatContainer =  document.querySelector('.bottom-nav-chats')
const userPageContainer =  document.querySelector('.userProfileContainer')

bottomNav.addEventListener('click', async(e)=>{
  
  if(e.target.closest('.chats-btn')){
    await hideAllShowChatPage()

  }else if(e.target.closest('.feeds-btn')){
    console.log('the feed btn clicked')
    await hideAllShowHomePage()
     
  }else if(e.target.closest('.profileImageLink')){
    e.preventDefault()
    await hideAllShowUserProfilePage(e)
  }
  else if(e.target.closest('.groups-btn')){
    alert('groups are under work , enjoy the rest !!')
  }
  else if(e.target.closest('.notif-btn')){
     
     notifDropdown.classList.toggle('reveal')
  } 
 })

 async function hideAllShowChatPage(){
    hideHomePage()
    hideUserProfilePage()
    chatPageContainer.classList.add('active')
    chatPageContainer.innerHTML = loadSpinner('chats')
    await fetchAndRenderChatList()
 }
async function hideAllShowHomePage(){
  hideUserProfilePage()
    hideChatPage()
    postsContainer.innerHTML = loadSpinner('posts')
    await showHomePage()
}
 async function hideAllShowUserProfilePage(e){
    hideHomePage()
    hideChatPage()
    userPageContainer.classList.add('active')
    userPageContainer.innerHTML = loadSpinner('loading user profile..')
    
    await getSectionsAndLoadUserPage(e)
 }


 async function getSectionsAndLoadUserPage(e){

  const parent = e.target.closest('.profileImageLink') || e.target
     const splittedUrl =  parent.getAttribute('href').split('/')
     const segments = splittedUrl.filter(segment => segment)
   
       const {profileHeader, userInfo, securityInfo} = 
       await fetchDataAndUserSections(segments[1], segments[2])
       
        loadUserPageUi(profileHeader,userInfo,securityInfo)
    // }
 }
 function appendElementTo(el, container){
   container.appendChild(el)
 }


 async function loadUserPageUi(profileHeader,userInfo,securityInfo){
 
        const profileHeaderDiv = createElement('div','profileHeader')
        profileHeaderDiv.innerHTML = profileHeader

        const leftContainer = createElement('div','leftContainer')
        leftContainer.innerHTML = userInfo + securityInfo
        
        const profileGrid = createElement('div','profileGrid')
        const centerContainer = createElement('div','centerContainer')
      
        
        centerContainer.textContent = ''

        const photosWithVideos =  createElement('div','photosWithVideos')
        const mediaList =  createElement('div','mediaList')

        mediaList.innerHTML = loadSpinner('photos ...')
          const {uploadedPhotos} = await loadUploadedImages()

         const initialImages = uploadedImages(uploadedPhotos)

        if(typeof initialImages === 'string') {
          console.log('yes')
          mediaList.innerHTML = initialImages
        }else{
          mediaList.innerHTML = ''
          // return console.log(initialImages, 'initial images')
          initialImages.forEach(img => mediaList.appendChild(img))
        }

        const h2 = createElement('h2','mediaTitle')
        const mediaTabs = createElement('div','mediaTabs')

        h2.textContent = 'Uploaded Files'
        
        mediaTabs.innerHTML =`
        <div class="mediaTabs">
          <button class="clicker postedPics">Photos</button>
          <button class="clicker profilePics">Profile Pics</button>
          <button class="clicker videos">Videos</button>
        </div>
       `
        photosWithVideos.append(h2,mediaTabs,mediaList)
        centerContainer.appendChild(photosWithVideos)


        const rawContent = ` <h2 class="sidebarTitle">Right Sidebar</h2>
        <p class="sidebarText">Optional content like ads or friend suggestions.</p>`

        const rightContainer = createElement('div','rightContainer')
        rightContainer.innerHTML =  rawContent

        profileGrid.append(leftContainer,centerContainer,rightContainer)

        const genDiv = `
          ${profileHeader} 
           ${profileGrid.outerHTML}
        `

        userPageContainer.innerHTML = genDiv
        userPageContainer.classList.add('active')
 }

  function uploadedImages(uploadedPhotos){
      if (!uploadedPhotos || uploadedPhotos.length === 0){
        return '<p>No photos yet</p>'
      }

      return uploadedPhotos.map(post => createMediaFile(post.mediafile))
   } 

 function createMediaFile(path) {

 let file = null;
   const normalizedPost = path.replace(/\\/g, '/') 
    file = normalizedPost.includes('videos/')? 
     document.createElement('video') : document.createElement('img')
   console.log(file)
  
  file.src = !normalizedPost.startsWith('https') ? baseUrl + normalizedPost : normalizedPost;
 file.alt = 'media';
file.loading = 'lazy';
file.className = 'mediaItem';
return file;

}

 async function fetchDataAndUserSections(token,id){
  const data = await fetchUser(token,id)
       console.log(data, 'data')
        const userInfo = loadSections(data.user).userInfo
        const securityInfo = loadSections(data.user).securityInfo
        const profileHeader = loadSections(data.user).profileHeader

      return {userInfo,securityInfo,profileHeader}
 }

 function createElement(tag,className){
     const el = document.createElement(tag)
     el.classList.add(className)
     return el
 }

  function hideHomePage(){
   const allContainer = document.querySelector('.chats-posts-users')
        // hide the main home container
   allContainer.classList.add('hide')

 }

 function hideChatPage(){
  chatListContainer.classList.remove('active')
}

function hideUserProfilePage(){
  userProfileContainer.classList.remove('active')
}


// get totoal unread chat counts of lgin user

async function getUnreadChatCount(){
  try{
    const {data} =await axios.get('/api/chatsCount')
    console.log(data)
  const unreadCounts = data.totalUnreadChats

  if(unreadCounts){
    const chatCountEl = document.querySelector('.count-chats')
    chatCountEl.textContent = unreadCounts
  }
  }catch(err){
    console.log(err.message, err)
  }
}


document.addEventListener('DOMContentLoaded', async(e)=>{
  await getUnreadChatCount()
})
