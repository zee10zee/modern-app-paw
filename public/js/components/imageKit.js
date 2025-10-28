
async function fileUploadOnImageKit(file){
const signupForm = document.getElementById('signUpForm')

  // first upload the image on imageKit
    const imgKitAuthResponse = await axios.get('/imageKit/auth')

    if(imgKitAuthResponse.status === 200 && 
       imgKitAuthResponse.data.success){
        console.log(imgKitAuthResponse, ' file name ', file)

       const {authElements} = imgKitAuthResponse.data
       const pub_key = `public_nArfg7wpXuzoz3r/mtoDlG5MNZs=`

        const formData = new FormData()
        formData.append('file', file)
        formData.append('fileName', file.name)
        formData.append('token', authElements.token)
        formData.append('signature', authElements.signature)
        formData.append('expire', authElements.expire)
        formData.append('publicKey', pub_key)

    //   uploading the file directly to imgkit after confirmation from server
      const uploadRes = await axios.
      post('https://upload.imagekit.io/api/v1/files/upload', formData)

      if(uploadRes.status === 200){
          const fileUrl = uploadRes.data.url
             return fileUrl
        //   send data to server to save on db
      }
      
    }
}