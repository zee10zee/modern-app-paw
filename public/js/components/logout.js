
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

const logoutForm = document.getElementById('logoutForm')

logoutForm.addEventListener('click', async(e)=>{
    // googleSignOut()
    const response = await axios.post('/api/logout', {})
    if(response.status === 200 && response.data.success){
        const username = sessionStorage.setItem('username', response.data.username)
        window.location.href ="/api/login"
    }
})


async function googleSignOut(){
   try{
    const result = await auth.signOut();

   if(result.status === 200){
     window.location.href ="/api/login"
     sessionStorage.clear()
   }
   }catch(err){
      console.log(err)
   }
}