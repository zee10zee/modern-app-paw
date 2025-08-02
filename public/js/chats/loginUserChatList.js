
window.addEventListener('DOMContentLoaded', async(e)=>{ 
    const chatListContainer = document.querySelector('.chat-list-container');
    const res = await axios.get(`/api/loginUserChats`)

    if(res.status === 200 && res.data.success){
        try {
        let chats = res.data.chats;
        // return console.log(chats);

        
        if(chats.length === 0){
            chatListContainer.innerHTML = '<p class="noChat">No chat yet !</p>';
            return;
        }
        const latestChats = chats.reduce((acc, chat) => {
        const otherUserId = chat.other_user_id;
        if (!acc[otherUserId] || new Date(chat.created_at) > new Date(acc[otherUserId].created_at)) {
            acc[otherUserId] = chat; // Keep the newest chat
        }
        return acc;
        }, {});


const latestChatsArray = Object.values(latestChats);

        latestChatsArray.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');
            chatItem.innerHTML = `
                <a href="/chat/${chat.receiver_id}">
                    <strong><p class="receiver">${chat.other_user_name}</p></strong>
                    <p class="last-message">${chat.message}</p>
                </a>
            `;
            chatListContainer.appendChild(chatItem);
        });
    }
    catch (error) {
        console.error('Error loading chats:', error);
        chatListContainer.innerHTML = '<p class="error">Failed to load chats.</p>';
    }
    } else {
        console.error('Failed to fetch chats');
        document.querySelector('.chat-list-container').innerHTML = '<p class="error">Failed to load chats.</p>';            
}
})