console.log('dropdowns')

window.addEventListener('DOMContentLoaded', (e) =>{
const dropdown = document.querySelector('#notifDropdown')
if(!dropdown) return console.log('no dropdown found') 

handleDropdownClick(dropdown)
})


function handleDropdownClick(dropdown){
    dropdown.addEventListener('click', (e) =>{
        console.log('dropdown clicked')

        if(e.target.closest('.notif_close')){
            console.log('close clicked')
            dropdown.classList.remove('reveal')
        }else if(e.target.closest('.notif_item')){
            e.preventDefault()
            console.log('notif item clicked')
            const id = e.target.closest('.notif_item')?.getAttribute('id')
            closeDropdown()
            goToThisPost(id)
        }
    })
}


function closeDropdown(){
    notifDropdown.classList.remove('reveal')
}

function goToThisPost(id){
    const post = postsContainer.querySelector(`.posts[data-post-id="${id}"]`)
    console.log('the post ', post)
    post.scrollIntoView({
        behavior : 'smooth',
        block : 'center'
    })

    post.classList.add('highlight')
   setTimeout(() => {
    post.classList.remove('highlight')
   }, 3000);
}