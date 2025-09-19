// setInterval(() => {
//     getNewPostsCount()
// }, 1000);

let allAvailablePosts;
window.addEventListener('DOMContentLoaded', async() =>{
const res = await axios.get('/api/posts')
  // return console.log(res.data.posts)
    if(res.status === 200){
       allAvailablePosts = res.data.posts
       const postids = allAvailablePosts.map(post => post.id)

       getNewPostsCount()
       
    }
})
const newestPosts = new Set()
let lastPostId = null
const banner = document.querySelector('.banner')
function getNewPostsCount() {

   socket.on('new_posts_alert', data => {
         console.log(data, data.newData)
         
         const count = data.newData.postCount
        //  doing minus count means if one newpost was there the other user does not have those number of posts displayed yet. 
         lastPostId = data.newData.lastPostId - count
         banner.textContent = count > 1 ? `${count} new posts` : `${count} new post`;
         banner.style.display = "block";
   });   
  
}
banner.addEventListener('click', async(e)=>{
    if(postsContainer.children.length === 0) return console.log('no children');
    console.log(lastPostId)
    await fetchNewPosts(lastPostId)
})

async function fetchNewPosts(lastPostId){
   try{
    const res = await axios.get(`/api/latestPosts`, 
    {params : 
        {postid : lastPostId}})

   if(res.status === 200 && res.data.success){
      console.log('fetching new posts ...')
      console.log(res.data)  
      banner.style.display ="none"
      const newestPosts = res.data.newPosts
      viewNewPosts(newestPosts)
    //   telling server to reset the count of new posts
      socket.emit('reset_new_posts_count')
      lastPostId = newestPosts[newestPosts.length - 1].id
    //   we reset the new post id
      console.log(lastPostId, newestPosts, 'newer last post id')
   }
   }catch(err){
    console.log(err)
   }
}

function viewNewPosts(newPosts){
    newPosts.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).
    forEach(post =>{
        updateUIpost(post)
    })
}

