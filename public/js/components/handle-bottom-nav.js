
const smChatPageContainer = document.querySelector('.smChatListContainer')
const smGroupsContainer = document.querySelector('.smGroupsContainer')
const bottomNav = document.querySelector('.bottom-nav')
const bottomNavchatContainer =  document.querySelector('.bottom-nav-chats')
const userPageContainer =  document.querySelector('.userProfileContainer')

bottomNav.addEventListener('click', async(e)=>{
  postBtn.hide()

  if(e.target.closest('.chats-btn')){
    history.pushState({ screen: "chatList" }, "", "/api/chatList");
    await hideAllShowChatList()


  }else if(e.target.closest('.feeds-btn')){
    console.log('the feed btn clicked')
    history.pushState({ screen: "/" }, "", "/");
    await hideAllShowHomePage()
     
  }else if(e.target.closest('.profilePicContain')){
    e.preventDefault()
    let targetParent;
    history.pushState({ screen: "userProfile" }, "", "/api/userProfile");
    displayUserPageHideAll(e,targetParent)  
  }

  else if(e.target.closest('.groups-btn')){
    history.pushState({ screen: "community" }, "", "/api/community");
    hideAllShowCommunity()
  }
  else if(e.target.closest('.notif-btn')){
     notifDropdown.classList.toggle('reveal')
  } 
 })


 window.addEventListener("popstate", async(event) => {
  console.log("Navigated to:", event.state);
  if (event.state?.screen === "/") {
        await hideAllShowHomePage()

  } else if (event.state?.screen === "chatList") {
    await hideAllShowChatList()
  }else if(event.state?.screen === 'userProfile'){
    displayUserPageHideAll(e,targetParent)
  }else if(event.state?.screen === 'community'){
    hideAllShowCommunity()
  }else if(event.state?.screen === 'chatPage'){
    const receiverLink = localStorage.getItem('chat-list-user-url')
    if(!receiverLink) return console.log('receiver link or url not found')
    await displayChatPageHideAll(receiverLink)
  }
});


async function displayUserPageHideAll(e,targetParent){
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

 async function hideAllShowCommunity(){
    hideHomePage()
    hideUserProfilePage()
    hideChatPage()
    hideChatList()
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
    postBtn.show()
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
      ${user.profilepicture ? `
        <img src="${user.profilepicture}" alt="${user.firstname}">
        `: `<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 496 512.141"><path d="M247.999 0C388.016 0 496 118.389 496 256.07c0 137.697-107.967 256.071-248.001 256.071C107.959 512.141 0 393.771 0 256.07 0 118.358 107.931 0 247.999 0zm53.657 320.057c3.026 6.081 6.868 12.252 11.256 17.431 12.426 14.676 27.506 16.005 45.803 19.544 26.323 5.084 52.237 24.621 64.281 49.814 33.169-41.395 52.802-94.357 52.802-150.776 0-126.587-98.824-235.868-227.799-235.868-129.717 0-227.797 109.983-227.797 235.868 0 56.236 19.502 109.036 52.47 150.37 12.416-27.181 40.412-43.359 68.629-47.133 19.962-2.667 34.23-3.194 44.269-22.046 2.985-5.605 5.258-11.953 7.079-17.878-8.333-8.062-14.741-17.106-16.768-32.853a18.024 18.024 0 01-7.063-2.26c-9.095-5.167-12.523-17.5-13.025-27.288-.523-10.266.063-23.17 8.912-27.045-1.666-23.68 3.353-63.516-21.865-71.141 48.375-59.779 104.134-92.293 146.003-39.115 48.507 2.548 67.054 77.507 32.569 113.283l-.012.118c8.053-.725 15.385 2.774 17.975 10.813 3.137 9.737-3.411 22.969-6.592 31.984-1.213 3.432-2.356 5.883-5.089 8.055-2.447 1.968-5.221 2.846-9.124 2.859-1.124 15.201-7.752 24.138-16.914 33.264zm-6.161 5.912c6.621 12.561 16.337 25.025 27.188 29.516-42.642 31.287-101.513 29.479-145.371 2.741 11.248-6.058 17.742-19.988 21.997-32.815 2.353 2.033 4.705 4.06 7.03 6.125 14.031 12.482 27.871 18.998 41.943 19.132 14.184.135 27.925-6.194 41.613-19.401l5.6-5.298zm-131.174-82.316c2.726-7.803 8.431-7.112 16.488-4.386 3.109 1.62 2.626.922 5.482 1.962-4.203-19.055 5.199-39.899 21.951-49.708 12.191-5.968 27.513-5.575 43.095-9.595 11.129-2.869 22.394-7.99 32.751-19.284 12.85 6.327 22.896 16.524 27.893 34.098 2.832 12.042 3.061 27.858-.569 49.037 9.968-7.552 24.343-6.85 19.821 9.882l-6.177 17.494c-1.476 4.186-2.464 5.701-7.756 5.421-2.334-.124-4.687-1.025-7.031-2.575 2.164 25.812-10.369 34.237-26.049 49.37-24.152 23.306-47.364 22.344-72.432.044-14.682-13.06-27.728-20.996-28.378-47.849-3.809 1.166-7.411 1.378-10.553-.41-6.264-3.562-8.549-13.942-8.889-20.588-.137-2.669-.023-10.191.353-12.913z"/></svg>`}
      </div>
      <div class="user-info">
        <p class="fname">${user.firstname}</p>
        ${user.is_active ? `
        <i class="online-status">Online</i>
        ` : `<i class="online-status">${getTimeAgo(user.active_at)}</i>`}
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
      centerContainer.dataset.userToken = user_token
      centerContainer.dataset.userId = id
        
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
