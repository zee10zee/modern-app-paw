
async function fetchUser(token,userId){
 console.log(token, userId, ' FETCH DATA ON USER DATA SCRIPT ')
  try {
    const res = await axios.get(`/api/userProfile/${token}/${userId}`);

    // return console.log(res)
    if (res.status !== 200) throw new Error('Server error');


    const { user } = res.data;
    console.log(user)
      owner = res.data.user;

      return {user,owner}

      } catch (err) {
    console.error('Failed to load user media:', err);
  }
}