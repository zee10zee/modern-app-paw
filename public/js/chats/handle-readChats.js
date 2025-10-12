const chatList = document.querySelector('.smChatListContainer')

chatList.addEventListener('click', (e)=>{
    e.preventDefault()
    if(e.target.closest('.chatItem')){
        const itemEL = e.target.closest('.chatItem')
        const itemId = itemEL.dataset.userId;
        console.log('you clicked a chat item', itemId)
    }
})

