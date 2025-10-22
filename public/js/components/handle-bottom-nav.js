
const smChatPageContainer = document.querySelector('.smChatListContainer')
const smGroupsContainer = document.querySelector('.smGroupsContainer')
const bottomNav = document.querySelector('.bottom-nav')
const bottomNavchatContainer =  document.querySelector('.bottom-nav-chats')
const userPageContainer =  document.querySelector('.userProfileContainer')

bottomNav.addEventListener('click', async(e)=>{
  postBtn.hide()

  if(e.target.closest('.chats-btn')){
    await hideAllShowChatList()

  }else if(e.target.closest('.feeds-btn')){
    console.log('the feed btn clicked')
    postBtn.show()
    await hideAllShowHomePage()
     
  }else if(e.target.closest('.profilePicContain')){
    e.preventDefault()
    let targetParent;
   
    const parentEl = e
    const parent_parent_el = e.target.closest('.profileImageLink')
    const link = parent_parent_el.getAttribute('href')
    console.log(link)
    localStorage.setItem('clickedOwnerLink',link)

     if(parentEl){
       targetParent = parentEl.target.closest('.action-item,.profilePicContain,.profileImageLink')
    }else{
      console.log('looking at static parnet')
      targetParent = document.querySelector('.action-item, .profilePicContain, .profileImageLink')
    }

    await hideAllShowUserProfilePage(targetParent)
  }
  else if(e.target.closest('.groups-btn')){
    hideAllShowCommunity()
  }
  else if(e.target.closest('.notif-btn')){
     notifDropdown.classList.toggle('reveal')
  } 
 })


 async function hideAllShowCommunity(){
    hideHomePage()
    hideUserProfilePage()
    hideChatPage()
    smGroupsContainer.classList.add('active')
    // smGroupsContainer.innerHTML = loadSpinner('groups')
    await fetchCommunity(smGroupsContainer)
    setView('.smGroupsContainer')
 }

 function setView(viewName){
  localStorage.setItem('last-active-window', viewName)
 }

 async function hideAllShowChatList(){
    hideHomePage()
    hideUserProfilePage()
    hideChatPage()
    hideCommunity()
    smChatPageContainer.classList.add('active')
    smChatPageContainer.innerHTML = loadSpinner('chats')
    await fetchAndRenderChatList()
    setView('.smChatListContainer')
 }
async function hideAllShowHomePage(){
  hideUserProfilePage()
    hideChatList()
    hideChatPage()
    hideCommunity()
    postsContainer.innerHTML = loadSpinner('posts')
    await showHomePage()
    setView('.posts-container')
}

 async function hideAllShowUserProfilePage(targetParent){
    hideHomePage()
    hideChatList()
    hideChatPage()
    hideCommunity()
    userPageContainer.classList.add('active')
    userPageContainer.innerHTML = loadSpinner('user profile..')

    if(!targetParent) return console.log('No valid user profile parent found !')
    
       console.log(targetParent, ' target parent')
     await getSectionsAndLoadUserPage(targetParent)
     setView('.userProfileContainer')
 }

 function hideChatPage(){
  const chatPage = document.querySelector('.chatPageContainer')
  if(chatPage) chatPage.classList.remove('active')
 }

  function hideCommunity(){
  const communityContainer = document.querySelector('.smGroupsContainer')
  if(communityContainer) communityContainer.classList.remove('active')
 }

async function fetchCommunity(container){
  container.innerHTML = loadSpinner('community..')
  const res = await axios.get('/api/users/community')
  
  //  console.log(res.data.success, res.status === 200)
  if(res.status === 200 && res.data.success){
    console.log('proceed')
    const community = res.data.community_users;

    const community_array = Array.from(community)

    container.innerHTML = ''
  const communityTitle = document.createElement('h2')

    communityTitle.textContent = `Community`
    container.append(communityTitle)
    container.classList.add('striking-box')
  
    community_array.forEach(user => container.append(loadCommunity(user)))

}
}

function loadCommunity(user){
  const userlist = document.createElement('ul')
  const eachList = document.createElement('li')
  userlist.classList.add('community-list')
  eachList.classList.add('user','online')

  eachList.innerHTML = `
      <div class="profile">
        <img src="${user.profilepicture}" alt="${user.firstname}">
      </div>
      <div class="user-info">
        <p class="fname">${user.firstname}</p>
        <i class="online-status">Online</i>
      </div>
 `

 userlist.append(eachList)
 return userlist
}

let user_token;
let id;

 async function getSectionsAndLoadUserPage(parent){
  
     const splittedUrl =  parent.getAttribute('href').split('/')
     const segments = splittedUrl.filter(segment => segment)

      user_token = segments[1];
      id = segments[2]
 
       const {profileHeader, userInfo, securityInfo} = 
       await fetchDataAndUserSections(user_token, id)
       
        loadUserPageUi(profileHeader,userInfo,securityInfo)
 }
 function appendElementTo(el, container){
   container.appendChild(el)
 }


 async function loadUserPageUi(profileHead,userInfo,securityInfo){
        const profileGrid = createElement('div','profileGrid')
        const profileHeader = handleProfileHeader(profileHead)
        const leftContainer = handleLeftContainer(userInfo,securityInfo)
         console.log(profileHeader)

        const centerContainer = await handleCenterContainer()
        const rightContainer =  handleRightContainer()

        profileGrid.append(leftContainer,centerContainer,rightContainer)
        const genDiv = profileHeader.outerHTML +  profileGrid.outerHTML
        userPageContainer.innerHTML = genDiv
        userPageContainer.classList.add('active')
 }


 function handleProfileHeader(profileHeader){
  const profileHeaderDiv = createElement('div','profileHeader')
        profileHeaderDiv.innerHTML = profileHeader
        return profileHeaderDiv
 }

 function handleLeftContainer(userInfo,securityInfo){
  const leftContainer = createElement('div','leftContainer')
        leftContainer.innerHTML = userInfo + securityInfo
        return leftContainer;
 }

function handleRightContainer(){
  const rawContent = ` <h2 class="sidebarTitle">Right Sidebar</h2>
        <p class="sidebarText">Optional content like ads or friend suggestions.</p>`

        const rightContainer = createElement('div','rightContainer')
        rightContainer.innerHTML =  rawContent
        return rightContainer;
}

 async function handleCenterContainer(){
  const centerContainer = createElement('div','centerContainer')
      
        
        centerContainer.textContent = ''

        const photosWithVideos =  createElement('div','photosWithVideos')
        const mediaList =  createElement('div','mediaList')

        mediaList.innerHTML = loadSpinner('photos ...')

        const linkToken = user_token
        const userId = id

          const {uploadedPhotos} = await loadUploadedImages(linkToken,userId)
         console.log('RECAP ', uploadedPhotos)
         const initialImages = uploadedImages(uploadedPhotos)

        if(typeof initialImages === 'string') {
          
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
        return centerContainer
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
        console.log(data, 'data catch point media')
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

 function hideChatList(){
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
