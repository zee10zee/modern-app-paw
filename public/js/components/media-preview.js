// previewing the uploaded file

    function handleFilePreview(e,previewContainer){
      const selectedFile = e.target.files[0]
      console.log(previewContainer)
    //   the below checks if the isVideo is actually accessible and callable
      let isVideoFile = isVideo(selectedFile.name) || null
      let previewFile = previewContainer.querySelector('video,img')
       
      if(!previewFile){
        const mediaFile = isVideoFile ? 'video':'img'
        previewFile = document.createElement(mediaFile)
        if(previewContainer.querySelector('svg')){
            const svgElement = previewContainer.querySelector('svg')
            svgElement.remove()
            previewContainer.appendChild(previewFile)
        }else{
            previewContainer.prepend(previewFile)
        }
          

      }else{
      // Replace the element if type changed
      if ((isVideoFile && previewFile.tagName !== 'VIDEO') ||
          (!isVideoFile && previewFile.tagName !== 'IMG')) {
        const newFile = document.createElement(isVideoFile ? 'video' : 'img');
        previewContainer.replaceChild(newFile, previewFile);
        previewFile = newFile;
      }
    }
      const reader = new FileReader()
      previewFile.src = ''
      reader.onload = (e)=>{
       previewFile.src = e.target.result
      }

      if(selectedFile.type.startsWith('video/')){
         reader.readAsDataURL(selectedFile)
      }else if(selectedFile.type.startsWith('image/')){
        reader.readAsDataURL(selectedFile)
      }else{
        console.log('please upload only vidoes and images')
      }
    }