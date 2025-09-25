

const deletePost = async(postId)=>{

   if(!postId) return console.log('post id undefined')

    const confirmDelete = prompt('are you sure deleting the post ?')
    
  if(!confirmDelete || !confirmDelete.toLowerCase().includes('yes')) return console.log('delete canceled .')
    console.log('proceed deleting ...')

  try{
    const res = await axios.delete(`/api/post/delete/${postId}`, {})

  if(res.status !== 200 && !res.data.success) return alert('server failure deleting the post ', res.data.error);
       console.log('file delete success')
        const targetPost = postsContainer.querySelector(`.posts[data-post-id="${postId}"]`)
        targetPost.remove()
        
        // load empty state
        const postsLength = postsContainer.children.length
        console.log(postsLength,postsContainer.children)
        if(postsLength === 0)  checkPostsEmpty()
   
  }catch(err){
    console.log(err)
      alert(err)
}
}