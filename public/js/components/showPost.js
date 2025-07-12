// const paramId = window.location.pathname.split('/').pop()
// const showPostContainer = document.getElementById('showPostContainer')

//  function isVideo(filename){
//       return /\.(mp4|webm|ogg)$/i.test(filename);
//   }
// window.addEventListener('DOMContentLoaded', async(e)=>{
//    const res = await axios.get(`/api/showOnePost/${paramId}`)
//    console.log(res.data)
//    if(res.status === 200){
//     const post = res.data.post
//       loadSpecificPost(post)
//    }
// });

// const loadSpecificPost = (post)=>{
//    const mediaFile = isVideo(post.mediafile) ? 'video' : 'img'
//              const mediaTag = document.createElement(mediaFile)
//              mediaTag.src = '/' + post.mediafile
//              mediaTag.classList.add('mediaFile')
//              console.log(post.mediafile)
//              if(mediaFile === 'video'){
//                 mediaTag.controls = true
//              }

//              const postDiv = document.createElement('div')
//              postDiv.dataset.postId = post.id
//              postDiv.classList.add('postDiv')
//    postDiv.innerHTML = `
//               <div class="title-date-burger">
//                  <h2 class="title">${post.title}
//                    <span id="date" class="date">${new Date(post.created_at).toLocaleDateString()}</span>
//                  </h2>
//                  <div id="gear" class="gear">...</div>
                 
//                </div>
//                <p class="description">${post.description} </p>
               
//                ${mediaTag.outerHTML}
               
//                <div class="edit-delete">
//                 <form id="editForm" data-post-id="${post.id}">
//                     <button class="postEditBtn">Edit</button>
//                 </form>
//                 <form id="deleteForm" data-post-id="${post.id}">
//                     <button class="postDeleteBtn">Delete</button>
//                 </form>
//                </div>
//                `
//         showPostContainer.appendChild(postDiv)
// }



// showPostContainer.addEventListener('click', async(e)=>{
//      const editBtn = e.target.classList.contains('postEditBtn')
//      const deleteBtn = e.target.classList.contains('postDeleteBtn')
//      const gear = e.target.classList.contains('gear')
//      const postDiv = e.target.closest('.postDiv')
//      const postId = postDiv.dataset.postId;
//      const mediaTag = postDiv.querySelector('.mediaFile')
//      const imgOrVideo = e.target.classList.contains('mediaFile')

//    if(editBtn || deleteBtn){
//       window.location.href="/"
//     e.preventDefault()

//     }else if(gear){
//         e.preventDefault()
//        const editDeleteContainer = postDiv.querySelector('.edit-delete')
//        if(editDeleteContainer.style.display === "block") {
//         editDeleteContainer.style.display = "none";
//     } else {
//         editDeleteContainer.style.display = "block";
//     }
//     }else if(imgOrVideo){
//         e.preventDefault()
//         console.log('media file clicked')
//         mediaTag.classList.toggle('fullScreenImage')
//     }
// })
