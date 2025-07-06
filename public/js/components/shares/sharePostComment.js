postsContainer.addEventListener('keypress', (e)=>{
    const targetElement = e.target;
    const commentInputElement = targetElement.classList.contains('shareCommentInput')

    if(!commentInputElement && e.key=== 'Enter'){
    e.preventDefault()
        handleCommenting(e)
    }        
})



function handleCommenting(event){
    event.preventDefault()
    console.log(event)
}