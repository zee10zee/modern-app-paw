
 import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
  import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut ,
  } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

  
const firebaseConfig = {
    apiKey:"AIzaSyDpAiaYOjaw7QfGq5AoTDbmuUlwmHbdRu8",
    authDomain:"memorydom-b2fc2.firebaseapp.com",
    projectId:"memorydom-b2fc2",
    storageBucket:"memorydom-b2fc2.firebasestorage.app",
    messagingSenderId: "1093648218152",
    appId:"1:1093648218152:web:0e0a92cffadb8459c31d1d",
    measurementId: "G-TQXVYBJM71"
  };

  // Initialize Firebase
const app = initializeApp(firebaseConfig)
// get auth
const auth = getAuth(app)

// Handle VS Code Dev Tunnels domain
const currentHostname = window.location.hostname;
console.log(currentHostname)

if (currentHostname.includes('devtunnels.ms')) {
    auth.settings.domain = currentHostname;
    console.log('✅ Firebase configured for Dev Tunnels:', currentHostname);
}
// create googgle auth provider 
const provider = new GoogleAuthProvider()

async function signInWithGoogle(){
    try{
      const result = await signInWithPopup(auth,provider)
      if(!result) return console.log('something went wrong')

     const user = result.user
     
     const tokenId =await user.getIdToken()
     
      const res = await axios.post('/api/auth/google', {tokenId : tokenId, authType : 'firebase'})
     console.log(res, 'response from google verifiy')
      if(res.status === 200 && res.data.isLoggedIn){
        // return console.log(res)
        const {existingUser} = res.data
      // return console.log(existingUser)
        const {newUser} = res.data
        const loggedInUser = res.data.existed ? existingUser : newUser
        

        window.loadActiveUserStoredInfoOnAuth(
          loggedInUser.id,
          loggedInUser.firstname,
          loggedInUser.profilepicture,
          loggedInUser.usertoken )
        window.location.href = "/"
      }else{
        console.log('something is wrong logging in via google !')
      }

    }catch(err){
        console.log(err)
         if (err.code === 'auth/popup-blocked') {
            alert('Popup was blocked! Please allow popups for this site.');
        } else if (err.code === 'auth/popup-closed-by-user') {
            console.log('User closed the popup');
        }
    }
}

document.querySelector('#googleLoginBtn').addEventListener('click', async(e)=>{
    console.log('clicked')
     await signInWithGoogle()
}) 

const logoutBtn = document.querySelector('#logoutForm')

if(logoutBtn){

logoutBtn.addEventListener('click', (e)=>{
    sessionStorage.clear()
    auth.signOut()
})

}

window.loadActiveUserStoredInfoOnAuth = (id,name,profilePicture,token)=>{
    sessionStorage.setItem('loggedIn_userId', id)
    sessionStorage.setItem('loggedIn_name', name)
    sessionStorage.setItem('loggedIn_profile', profilePicture)
    sessionStorage.setItem('loggedIn_userToken', token)     
}