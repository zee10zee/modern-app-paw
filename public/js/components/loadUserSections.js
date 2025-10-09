function loadSections(user) {
  return {
    userInfo: loadUserInfo(user),
    profileHeader: loadprofileHeader(user),
    securityInfo: loadSecurityInfo(user)
  };
}

// load side bar left user info
function loadUserInfo(user){
       return `
    <div class="userInfoHeader">
      <h2 class="userInfoTitle">${user.firstname}'s Info</h2>
    </div>

    <div class="userInfoBody">
      <p><strong>Name:</strong> ${user.firstname}</p>
      <p><strong>Groups:</strong></p>
      <ul class="userGroups">
        <li>Photography Club</li>
        <li>Travel Buddies</li>
      </ul>
    </div>
`
    }


function loadprofileHeader(user){

  const username = user.firstname.split(' ')[0]
  const lastname = user.firstname.split(' ').pop()

  return `<header class="profileHeader">
<img src="${user.profilepicture}" alt="${username} profile picture" class="profilePhoto">

<div class="profileDetails">
<h1 class="profileName">${username} ${lastname}</h1>
<p class="profileUsername">@${username}</p>
<p class="profileBio">"Passionate about capturing the world through my lens 📸 | Traveler, coffee enthusiast, and lifelong learner 🌍☕ | Sharing moments, stories, and creativity one post at a time ✨"</p>

<div class="profileStats">
  <div class="stat">
    <span class="statNumber">10</span>
    <span class="statLabel">Posts</span>
  </div>
  <div class="stat">
    <span class="statNumber">400</span>
    <span class="statLabel">Followers</span>
  </div>
  <div class="stat">
    <span class="statNumber">$50</span>
    <span class="statLabel">Following</span>
  </div>
</div>

<div class="profileActions">
  ${!user.is_owner ?
  `<button class="followBtn">${user.isFollowing ? 'Unfollow' : 'Follow'}</button>
  <button class="chatBtn" url="/api/chatpage/${user.id}/${user.usertoken}">Message</button>
  `:``}
</div>
</div>
</header>
`
}


function loadSecurityInfo(user){
      return `
      ${user.is_owner ?`
       <h2 class="securityTitle">Security Info</h2>
    
    <p><strong>Email:</strong> ${user.email} <button class="editBtn">Edit</button></p>

    ${user.password ? `
      <p>
        <strong>Password:</strong> *********  
        <span class="editBtn">Edit</span> 
        <span class="viewBtn">View</span>
      </p>
    ` : ''}

    <button class="disableAccountBtn">Disable account</button>
        `:""}
      `
    }
