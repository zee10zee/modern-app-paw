

postsContainer.addEventListener('click', async(e)=>{
    const deletBtnElement = e.target;
    const deleteBtn = e.target.classList.contains('postSharerDeleteBtn');
    // return console.log(deletBtnElement)

    if(!deleteBtn) return console.log('not the delete btn')

        const shareId = deletBtnElement.dataset.shareId;
        //    return console.log(shareId, deleteBtn)
         if(!shareId) return console.log('no share id')
            const confirmDelete = prompt('are you sure deleting the post ?')
            if(!confirmDelete || !confirmDelete.toLowerCase().includes('yes')) return console.log('delete canceled !')
                console.log('proceed deleting ...')
       try{
         const deleteResult = await axios.delete(`/api/deleteSharerPost/${shareId}`);
        //  return console.log('shareCounts',.post)
        const sharesOfPost = deleteResult.data.shareCounts
        const oneShare = sharesOfPost.find(post => post.post_id)
        // return console.log(oneShare)

        const parentPost = postsContainer.querySelector(`.posts[data-post-id="${oneShare.post_id}"]`)

        if(deleteResult.status === 200 && deleteResult.data.success){
            const targetPost = deletBtnElement.closest('.posts')
        if(!targetPost) return console.log('post not found')
            targetPost.remove()
            console.log(sharesOfPost.length)
            parentPost.querySelector('.sharesCount').textContent = sharesOfPost.length;
            alert('post successfully deleted !')
        }
       }catch(err){
         alert('oops !', err)
       }
        
})