const homeRightContainer = document.querySelector('.rightContainer')
window.addEventListener('DOMContentLoaded', (e)=>{
    fetchCommunity(homeRightContainer)
});

socket.on('update-users', (data)=>{
    console.log(data, 'user disconnected !')
    fetchCommunity(homeRightContainer)

})

socket.on('user-joined', (data)=>{
    console.log(data, 'user joined !')
    fetchCommunity(homeRightContainer)

})
