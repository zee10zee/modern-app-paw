function getTimeAgo(rawDate){
          const date = new Date(rawDate).toLocaleDateString('en-US',{
          weekday : 'short', 
          month : 'short',
          year : 'numeric'
        });

        let time;
        let time_content;
        const hoursAfterPosted = new Date(rawDate).getTime()
        const currentTime = new Date().getTime()
      
         let timeDeff =  currentTime - hoursAfterPosted 
         const secondsPast = Math.floor(timeDeff / 1000)
         const minsPast = Math.floor(timeDeff / (1000 * 60))
        //  return console.log(minsPast)
         const hoursPast = Math.floor(timeDeff / (1000 * 60 * 60))
         const daysPast = Math.floor(timeDeff / (1000 * 60 * 60 * 24))
         const weeksPast = Math.floor(timeDeff / (1000 * 60 * 60 * 24 * 7))
         const monthsPast = Math.floor(timeDeff / (1000 * 60 * 60 * 24 * 7 * 12))
         const yearsPast = Math.floor(timeDeff / (1000 * 60 * 60 * 24 * 365))

      if(secondsPast < 60){
        time = secondsPast
        time_content = 'just now'
      }

     else if(minsPast < 60){
             time = minsPast 
             time_content = 'minute'
         }else if(hoursPast < 24){
          time = hoursPast 
           time_content = 'hour'
         }else if(daysPast < 7){
          time = daysPast 
          time_content = 'day'
         }else if(weeksPast < 7){
           time = weeksPast 
           time_content = 'week'
         }else if(monthsPast < 12){
            time = monthsPast
            time_content = 'month'
         }else{
           time = yearsPast
           time_content = 'year'
         }
         const postHour = new Date(rawDate).getHours()
        // let oneDay = 86400000
         time_content = time <= 1  ||  postHour === 0 ? time_content : time_content + 's' 
          
        //  const removedLastS = time_content.endsWith('s') ? time_content.slice(0,-1) : time_content
        //  OR
        const removedLastS = time_content.replace('/s$/', '')
        const validatedTime = time !== secondsPast ?   time + " " +  time_content + ' ago' : removedLastS

          return validatedTime
          
        }