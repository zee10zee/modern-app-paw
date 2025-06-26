
import express from "express"
import {Server} from "socket.io"
import http from "http"
import ejs from "ejs"
import session from "express-session"
import pkg from "pg"
import path from "path"
import { fileURLToPath } from "url"
import multer, { diskStorage } from "multer"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import crypto from "crypto"
import bcrypt from "bcrypt"
import connectPgSimple from "connect-pg-simple"
import { json } from "stream/consumers"
import sharedsession from "express-socket.io-session"


dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
console.log(__dirname)// giving me the absolute path from the the root folder of my pc till the file i am in. D:\webDev\node js\memoryDomWithChat\server.js
const app = express()

const server = http.createServer(app)
const io = new Server(server)

const {Pool} = pkg;
// since in  thes string case pool needs an object we should do like : 

 console.log('DB connection string:', process.env.DB);
const pool = new Pool({
    connectionString :  process.env.DB,
    ssl : {
        rejectUnauthorized : false
    }
})
const store = connectPgSimple(session)
const sessionMiddleware = session({
    store : new store({
        pool : pool,
       tableName : 'session',
       createTableIfMissing : true,
    //    errorLog : true
    }),
    secret : 'mynewsecret',
    resave : false,
    saveUninitialized : false,
    cookie : {
        secure : false
    }
});

app.use(sessionMiddleware)
// share the session with the socket to access the login users
io.use(sharedsession(sessionMiddleware, {
    autoSave : true
}))
let activeUsers = new Map()
io.on('connection', async(socket)=>{
  const session = socket.handshake.session
  if(!session) {
    console.log('unauthorized connection')
    return socket.disconnect()
  }

  const user = await pool.query(`select * from users where id = $1`, [session.userId])
  if(user.rowCount === 0){
     return console.log('user not found')
  }
  const loggedInUser = user.rows[0]
  activeUsers.set(loggedInUser.id, socket.id)
  console.log(activeUsers)


  socket.emit('user-joined', `${loggedInUser.firstname} joined!`);

//   typing event
    socket.on('user-typing', (uId)=>{
        const receiver = activeUsers.get(uId)
        socket.to(receiver).emit('user-typing', loggedInUser.firstname)
    })

    // received message listener
    socket.on('newMessage-send', (data)=>{
        const receiver = activeUsers.get(data.userId)
     socket.to(receiver).emit('received-message', data)
    })

    socket.on('disconnect', ()=>{
        console.log(socket.id, ' disconnected')
    })
})

// multer setup
const storage = diskStorage({
    destination :function(req,file,cb){
        if(file.mimetype.startsWith('video/')){
           cb(null, 'public/uploads/videos')
        }else if (file.mimetype.startsWith('image/')){
          cb(null, 'public/uploads')
        }else{
            console.log('unsupported file')
        }
    },
    filename : function(req,file,cb){
        const customeName = Date.now() +"-" +Math.floor(Math.random() * 10)
        cb(null, customeName + file.originalname)
    }
});



const upload = multer({
    storage : storage
})


app.use(express.static(path.join(__dirname,'public')))
app.use('/uploads', express.static(path.join(__dirname,'uploads'))) 
// home route
app.use(express.json())
app.use(express.urlencoded({extended : true}))

const basedir = path.join(__dirname,'public','htmlFiles/')
app.get('/',validateLogin,(req,res)=>{
    res.sendFile(basedir + 'home.html')
})

app.get('/api/signup', (req,res)=>{
    res.sendFile(basedir + '/signup.html')
})
app.get('/api/login', (req,res)=>{
    res.sendFile(basedir + '/login.html')
})

app.post('/api/signup',upload.single('profilePicture'),async(req,res)=>{
    const credentials = {
        fname : req.body.fname.trim(),
        email : req.body.email.trim(),
        password : req.body.password.trim(),
    }

    // RANDOM AND STRONG TOKEN / CAN BE USED INSTEAD OF id FOR SECURITY
    const userToken = crypto.randomBytes(32).toString('hex')
    console.log(userToken, 'token')


    const profile = req.file? path.join(`/uploads/${req.file.filename.replace(/\\/g, '/')}`) : null

    const checkduplicate = await pool.query('SELECT * FROM users WHERE  email = $1', [credentials.email])

    if(checkduplicate.rows.length >0){
        console.log('this credential already registered , please log in')
        return res.send('this credential already registered , please log in')
    }

     const tokenExists = await pool.query(`SELECT * FROM users WHERE userToken = $1`, [userToken])

    if(tokenExists.rowCount > 0) return console.log('token is invalid')

    const hashedPassword = await bcrypt.hash(credentials.password,10)

    const newUserQuery = `INSERT INTO users(firstname, email, password, profilepicture, usertoken) VALUES
    ($1,$2,$3,$4, $5) RETURNING *`
    const newUser = await pool.query(newUserQuery, [credentials.fname, credentials.email,hashedPassword,profile, userToken])

    if(newUser.rows.length === 0){
        console.log('user did not save !')
        return res.send('user did not save !')
    }

    console.log('welcome to memorydom ', newUser.rows[0].firstname)
    req.session.userId = newUser.rows[0].id
    res.json({
        newUser : newUser.rows[0],
        isLoggedIn : true,
        userId : req.session.userId
    })
})

// check login route
app.get('/checklogin',(req,res)=>{
    res.json({
        // !! turns any value into strict boolean
        isLoggedIn : !!req.session.userId
    })
})



// login route
    // pool.query('delete from users').then(()=>console.log('users deleted'))

app.post('/api/login', async(req,res)=>{
    const credentials = {
        email : req.body.email,
        password : req.body.password
    }

    try{
        const checkQuery = `SELECT * FROM users WHERE email = $1`
        const ExistingUser = await pool.query(checkQuery, [credentials.email])

// return console.log(credentials.password, ExistingUser.rows[0].password)
    if(ExistingUser.rows.length > 0){
        const user = ExistingUser.rows[0]

            const confirmedPassword = await bcrypt.compare(credentials.password, user.password)
            console.log(credentials.password, user.password)
            if(!confirmedPassword){
                console.log('wrong password')
                return res.json({message : 'wrong passweord used'})
            }

            console.log('welcome back ', ExistingUser.rows[0].firstname)
            req.session.userId = ExistingUser.rows[0].id
        res.json({
            loggedInUser : ExistingUser.rows[0],
            isLoggedIn : true,
            message : 'welcome back user ' + ExistingUser.rows[0].firstname
  })
        
    }else{
        console.log('user not found')
        return res.json({message : 'wrong password or email'})
    }

    
    }catch(err){
        console.log(err)
    }
})

// to get the username for goodbye alert
app.get('/userGoodBye',validateLogin, async(req,res)=>{
    const user = await pool.query('SELECT firstname FROM users WHERE id = $1', [req.session.userId])
    console.log(user.rows)
    if(user.rows.length > 0){
        res.json({
            isLoggedIn : true,
            username : user.rows[0].firstname
        })
    }
})

app.post('/api/logout', validateLogin,(req,res)=>{
   
    req.session.destroy(err =>{
        if(err){
            console.log(err)
            return res.send(err)
        }

        console.log('see you later')
        res.json({
            isLoggedIn : true,
            message : 'see you again!'
        })
    })
})
// node mailer config
const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : 'abedkhan.noori10@gmail.com' ,
        pass : 'xyeergcghglemsjp'
    },
    tls: {
    rejectUnauthorized: false, // 👈 allows self-signed certs
  }
})

 function sendEmail(to,subject,html){
    const mainOptions = {
   from : '"MemoryDom" <abedkhan.noori10@gmail.com>',
   to : to,
   subject : subject,
   html : html
}
  return transporter.sendMail(mainOptions)
}
// password forgottend form

app.get('/api/passwordForgot', (req,res)=>{
    res.sendFile(basedir + 'forgotPassword.html')
})

app.post('/api/passwordForgot', async (req,res)=>{
    const email = req.body.forgottenEmail
try{
    const existingEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if(existingEmail.rows.length === 0){
        console.log('email not found')
        return res.status(203).json({message : 'EMAIL IS NOT REGISTERED '})
    }
    console.log(existingEmail.rows[0].email)


        // creating token
    const token = crypto.randomBytes(32).toString('hex')
     console.log("random token ",token)

    // creating reset Link
    const resetLink = `http://localhost:3000/api/passwordReset/${token}`
    const description = `<p>click here to reset the password : <a href="${resetLink}">Reset password</a>`

   const existingToken = await pool.query('SELECT * FROM tokens WHERE token = $1', [token])

     if(existingToken.rowCount > 0){
        console.log('token is already sent check it')
        return console.log('Token is already there !')
     }

    //  we need the 1000 as melisecond because javascript uses date based on melisecond
     const TokenExpiryDate = new Date(Date.now() + 15 * 60 * 1000)

     console.log(TokenExpiryDate.toLocaleTimeString())

     const newTokenQuery = `INSERT INTO tokens (token, user_id,expires_at) VALUES(
     $1, $2, $3) RETURNING *`
     const newToken = await pool.query(newTokenQuery, 
        [token, existingEmail.rows[0].id, TokenExpiryDate]);

     if(newToken.rowCount === 0){
        console.log('failure saving new token')
        return res.send('failure saving new token')
     }

     console.log('token saved success')
     sendEmail(email,'Password Reset', description)

    res.json({
        message : 'reset link sent to your email'
    })

    }catch(err){
        res.status(500).send(err)
    }

})

app.get('/api/passwordReset/:token', async(req,res)=>{
    // const token = res.params.token
    res.sendFile(basedir + 'resetPassword.html');
});

app.post('/api/passwordReset/:token', async(req,res)=>{
   const token = req.params.token
   const {newPassword, confirmPassword} = req.body;
   console.log(newPassword, confirmPassword)

   const checkToken = await pool.query('SELECT * FROM tokens WHERE token = $1', [token])
   const tokenRow = checkToken.rows[0]

//    || condition and new Date()
// console.log(new Date() > tokenRow.expires_at)
   if( !tokenRow || new Date() > tokenRow.expires_at){
       console.log('token is invalid or expired')
    //    return res.status(401).json({message : 'token is invalid or expired please insert your password again'})
       return res.sendFile(basedir + 'expiredToken.html')
   }
   if(confirmPassword !== newPassword){
      console.log('confirm password does not match the new passweord')
      return res.send('confirm password does not match the new password')
   }

   const hashedPassword = await bcrypt.hash(newPassword,10)
    console.log(hashedPassword)
   const newPasswordd = await pool.query(`UPDATE users SET password = $1 WHERE id = $2 RETURNING *`, [hashedPassword, tokenRow.user_id]);


   if(newPasswordd.rowCount === 0){
      console.log('failure in saving reset password')
      return res.send('reset password fiaulre to save')
   }

   console.log('password updated successfully !')
   res.json({
    message : 'password updated successfully !'
   })
})

// user profile
app.get('/userProfile/:token/:id', validateLogin, async(req,res)=>{
    const token = req.params.token;
    const userId = parseInt(req.params.id)
    res.sendFile(basedir + 'userProfile.html')
})

app.get('/api/userProfile/:token/:id', validateLogin, async(req,res)=>{
    const userToken = req.params.token
    const userid = parseInt(req.params.id)

    const userExist = await pool.query(`SELECT * FROM users WHERE usertoken = $1`, [userToken])
    if(userExist.rowCount === 0){
        return res.status(404).json({msg : 'token not found'})
    }

    console.log(userExist)
    const userPosts = await pool.query(`SELECT
        users.id as user_id,
        users.usertoken, 
        users.firstname AS author_firstname, 
        users.profilepicture AS author_profilepicture, 
        posts.id as post_id,
        posts.title,
        posts.description,
        posts.mediafile,
        posts.created_at,
        COUNT(likes.id) AS likeCounts
        FROM posts
        LEFT JOIN users ON users.id = posts.user_id 
        LEFT JOIN likes ON likes.postid = posts.id 
         WHERE posts.user_id = $1
        GROUP BY 
        users.id,                   
        posts.id,
        posts.title,
        posts.description,
        posts.mediafile,
        posts.created_at
        ORDER BY posts.created_at DESC`, [userid]);


        if(userPosts.rowCount === 0){
            return res.json({message : 'posts not found'})
        }


    res.json({
        user : userExist.rows[0],
        post : userPosts.rows
    })
})


// posts

app.get('/api/posts',validateLogin, async(req,res)=>{

    const allPosts = await pool.query(`SELECT
        users.id as user_id,
        users.usertoken, 
        users.firstname AS author_firstname, 
        users.profilepicture AS author_profilepicture, 
        posts.id as post_id,
        posts.title,
        posts.description,
        posts.mediafile,
        posts.created_at,
        posts.user_id = $1 AS postOwner,
        COUNT(likes.id) AS likeCounts
        FROM posts
        LEFT JOIN users ON users.id = posts.user_id 
        LEFT JOIN likes ON likes.postid = posts.id 
        GROUP BY 
        users.id,                   
        posts.id,
        posts.title,
        posts.description,
        posts.mediafile,
        posts.created_at
        ORDER BY posts.created_at DESC`, [req.session.userId]);

    if(allPosts.rows.length === 0 ){
        console.log('no posts found')
        return res.json({posts : []})
    }


    // getting all the comments of the posts
    const postsIds = allPosts.rows.map(post => post.post_id)
    console.log("post ids ",postsIds)

    const showCommentsQuery = `
    SELECT comments.post_id,
    JSON_AGG(
    JSON_BUILD_OBJECT(
     'id', comments.id,
     'text', comments.comment,
     'created_at', comments.created_at,
     'is_owner', (comments.user_id = $1),
     'author', JSON_BUILD_OBJECT(
       'firstname', users.firstname,
       'profile_picture', users.profilepicture
        )
      ) ORDER BY comments.created_at
    ) AS comments 
     FROM comments JOIN users ON users.id = comments.user_id
     WHERE comments.post_id = ANY($2)
     GROUP BY comments.post_id
    
    `
    const allComments = await pool.query(showCommentsQuery, [req.session.userId,postsIds])

    // merge the comments to their posts

    const posts = allPosts.rows.map(post =>{
        const postComments = allComments.rows.filter(comment => comment.post_id === post.post_id)
        console.log(postComments, 'posts comments')
        return {
            ...post,
            comments : postComments
        }
    })

    res.json({
        posts : posts
    })
    
});


app.get('/api/newPost', validateLogin, (req,res)=>{
    res.sendFile(basedir + 'newpost.html')
});

app.post('/api/newPost', validateLogin, upload.single('mediaFile'), async(req,res)=>{
    const {ptitle,pdesc} = req.body;
    const currentUser = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);

     let mediaPost = req.file.mimetype.startsWith('video/')? 
     path.join('uploads/videos', req.file.filename) 
     : path.join('uploads', req.file.filename)

     const newPostQuery = (`INSERT INTO posts (title, description, mediafile, user_id)
      VALUES($1, $2,$3, $4) RETURNING *`)
      const newPost = await pool.query(newPostQuery, [ptitle,pdesc,mediaPost,currentUser.rows[0].id])

      if(newPost.rowCount === 0){
         console.log('no post saved to db')
         return res.status(200).json({message : 'failure saving the media file'})
      }

      console.log('file saved success')
      res.json({
        message : 'New post submitted successfully !'
      })


})

const findSpecificTableContent = async(table, tableId)=>{
    const foundData = await pool.query(`SELECT * FROM ${table} WHERE id = $1`,[tableId])
    if(foundData.rowCount === 0){
        console.log('table not found')
        res.send('table not found')
        return;
    }
    return foundData.rows[0]
}

app.get('/api/showPost/:id', (req,res)=>{
    const postId = parseInt(req.params.id)
    res.sendFile(basedir + 'showPost.html')
})

// show a specific post 
app.get('/api/showOnePost/:id', validateLogin, async(req,res)=>{
    const id = parseInt(req.params.id)

    const postExist = await findSpecificTableContent('posts',id)
    if(postExist){
        res.json({
            post : postExist
        })
    }
})

app.get('/api/edit/:id', validateLogin, async(req,res)=>{
    const id = parseInt(req.params.id)

    const postExist = await pool.query('SELECT * FROM posts WHERE id = $1', [id])
    if(postExist.rows.length === 0){
        console.log('no post found')
        return res.json({message : 'No post found'})
    }

    const post = postExist.rows[0]
    res.json({
        post : post
    })
});



app.put('/api/post/update/:id', validateLogin, upload.single('newFile'),async(req,res)=>{
    const postId = parseInt(req.params.id)
    const {newTitle,newDesc} = req.body;
    const loggedInUser = req.session.userId;
    // check if the its post owner 

    const postOwner = await pool.query(`SELECT user_id from posts WHERE id = $1`, [postId])

    if(postOwner.rowCount === 0){
        return res.status(404).json({message : 'post not found'})
    }

    if(postOwner.rows[0].user_id !== loggedInUser){
        return res.status(403).json({message : 'you are not authorized to update this post !'})
    }

      let mediaFile = null;
      if(req.file){
         if(req.file.mimetype.startsWith('video/')){
           mediaFile = path.join('uploads/videos', req.file.filename)
            console.log(mediaFile)
       }else if(req.file.mimetype.startsWith('image/')){ 
           mediaFile = path.join('uploads', req.file.filename)
            console.log(mediaFile)
       }
      }else{
        console.log('no file!')
      }

    //   media file updation
    let updatedPost;
    if(req.file){
        updatedPost = await pool.query(`
            UPDATE posts 
            SET title = $1, 
            description = $2, 
            mediafile = $3 
            WHERE id = $4 RETURNING *`, [newTitle,newDesc,mediaFile,postId])
        
    }else{
       updatedPost = await pool.query(`
        UPDATE posts 
        SET title = $1, 
        description = $2 
        WHERE id = $3 
        RETURNING *
        `,[newTitle,newDesc,postId])
    }

    if(updatedPost.rowCount === 0){
        console.log('failure updating the post')
        return res.json({message : 'failure updating the post'})
    }

    
    const updatedPostWithDataQuery = `
    SELECT posts.*,
    (SELECT COUNT(*) FROM likes WHERE "postid" = $1) AS likecounts,
     (
      SELECT json_agg(
        json_build_object(
        'id',comments.id,
        'text',comments.comment,
        'created_at',comments.created_at,
        'is_owner',comments.user_id = $2,
        'author', json_build_object(
        'firstname', users.firstname,
        'profile_picture',users.profilepicture
        )
        )ORDER BY comments.created_at
        ) FROM comments 
        JOIN users ON users.id = comments.user_id
        WHERE comments.post_id = $1
        
      )AS comments

        FROM posts WHERE posts.id = $1
    `
    const updatedPostWithData = await pool.query(updatedPostWithDataQuery, [postId, loggedInUser]);
   
    if(updatedPostWithData.rowCount === 0){
        return res.json({message : 'failed to updated the post'})
    }
       console.log(updatedPostWithData.rows)

    res.json({
        message : 'memory updated successfully !',
        updatedPost : updatedPostWithData.rows[0]
    })
})

// delete post

app.delete('/api/post/delete/:id', validateLogin, async(req,res)=>{
    const postId = parseInt(req.params.id)

    const post = await pool.query('DELETE FROM posts WHERE id = $1', [postId])
    if(post.rowCount === 0){
        console.log('failure deleting the post from db')
        return res.json({message : 'post deleted successfully!'});
    }
    
    console.log('post deleted success')
    res.json({
        message : 'post deleted successfully !',
        deletedPost : post.rows[0]
    })
})


// likes 

app.post('/api/post/:id/like', validateLogin, async(req,res)=>{
    const id = parseInt(req.params.id)
    const loggedInUserId = req.session.userId;

    console.log('the params postiD', id)
    const postExists = await pool.query('SELECT * FROM posts WHERE id = $1', [id])
    if(postExists.rowCount === 0){
        return res.send('post not found')
    }

    // first check if the post is already liked 
    const existedLike = await pool.query('SELECT * FROM likes WHERE postid = $1 AND userid = $2', [id, req.session.userId])
    if(existedLike.rowCount > 0){
        console.log('you have already liked this post')
        const deletedLike = await pool.query('DELETE FROM likes WHERE userid = $1 AND postid = $2 RETURNING *', [req.session.userId,id]);
         let postLikes = null;
        if(deletedLike.rowCount > 0){
        
        const postLikes = await pool.query('SELECT COUNT(*) AS like_counts FROM likes WHERE postid = $1', [id])

        if(postLikes.rowCount > 0){
           return res.json(
            {error : 'you have already liked this post',
             postLikes : postLikes.rows[0].like_counts 
            })
        }
      }    
    }

    const newLike = await pool.query(`INSERT INTO likes (userid,postid)
        VALUES($1,$2) RETURNING * `,[loggedInUserId, id])

      if(newLike.rowCount === 0){
        console.log('failure in saving the like on db')
        return res.json({message : 'failure saving likes on db'})
      }

      const countPostLikes = await pool.query('SELECT COUNT (*) AS like_counts FROM likes WHERE postid = $1', [id])

      if(countPostLikes.rowCount === 0){
        return console.log('failure getting the likes count of the post')
      }

      console.log('post has successfully been liked')
      res.json({
        message : 'you have liked the post',
        postLikes : countPostLikes.rows[0].like_counts
      })
})




// comments

app.post('/api/post/:id/comment', validateLogin, async(req,res)=>{
    const {comment} = req.body
   const postId = parseInt(req.params.id)
   const commentQuery =(`INSERT INTO comments (comment, post_id, user_id)
    VALUES($1,$2,$3) RETURNING *`)
   const newComment = await pool.query(commentQuery, [comment, postId, req.session.userId])
   if(newComment.rowCount === 0){
    console.log('failure saving comments on db')
    return res.send('failure saving comment on db')
   }

//    after posting new comment we gotta get ALL COMMENTS of that exact post
   const allComments = await pool.query(`SELECT 
    users.firstname AS author_name,
    users.profilepicture AS user_profile_picture,
    comments.* FROM comments 
    JOIN users ON comments.user_id = users.id
    WHERE comments.post_id = $1
    ORDER BY comments.created_at`, [postId])

    if(allComments.rowCount === 0){
        return console.log('no COMMENTS found !')
    }

    console.log(allComments.rows)

   console.log('successfully commented')
   res.json({
    message : 'comment successfully made !',
    postComments : allComments.rows
   });
})

app.patch('/api/comment/:id/update', validateLogin, async(req,res)=>{
    const commentId = parseInt(req.params.id)
    const {comment} = req.body
    if(!comment || !comment.trim()){
        return res.status(400).json({messag: 'comment content is required'})
    }

     const commentCheck = await pool.query(`SELECT * FROM comments WHERE id = $1`, [commentId])

     if(commentCheck.rowCount === 0){
        return res.status(404).json({message : 'comment not found'})
     }

     if(commentCheck.rows[0].user_id !== req.session.userId){
      return res.status(403).json({message : "you are not authorized to edit this"});
     }

    const updateCommentQuery = `UPDATE comments SET comment  = $1 WHERE id = $2 RETURNING *`
    const UpdatedComment = await pool.query(updateCommentQuery,[comment, commentId])

    if(UpdatedComment.rowCount === 0){
        console.log('failure updating comment in db')
        return res.json({message : 'no comment updated'})
    }

    console.log('comment updated successfully !')
    console.log(UpdatedComment.rows[0])

    const updatedCommentUser = await pool.query(`
          SELECT users.firstname AS author_name, 
          users.profilepicture AS user_profile_picture,
          comments.* 
          FROM comments 
          JOIN users ON comments.user_id = users.id
          WHERE comments.id = $1
        `, [commentId]);

        if(updatedCommentUser.rowCount === 0){
            console.log('join failure')
            return res.status(404).json({message : 'getting updated comments with users failed'})
        }

        
    res.json({
        updatedComment : updatedCommentUser.rows[0]
    })

});


app.delete('/api/comment/:id/delete', validateLogin, async(req,res)=>{
    const commentId = parseInt(req.params.id)

    const deletingComment = await pool.query(`SELECT 
        users.firstname,
        users.profilepicture, comments.*
        FROM comments JOIN users ON comments.user_id = users.id 
        WHERE comments.id = $1`, [commentId])

    if(deletingComment.rowCount === 0){
        return res.status(404).json({message : 'comment not found!'})
    }

    const deletedComment = await pool.query(`DELETE FROM comments WHERE id = $1 AND user_id = $2`, [commentId, req.session.userId])

    if(deletedComment.rowCount === 0){
        return res.status(404).json({success : false,message : 'You aint authorized to delete this !'})

    }

    console.log('comment deleted !')
     res.json({
       deletedComment : deletedComment.rows[0],
       message : 'comment sucessfully deleted !',
       success : true
    })
});

// chat 

app.get('/api/chatpage/:id', validateLogin, async(req,res)=>{
    const receiverId = parseInt(req.params.id)

    res.sendFile(basedir + 'chatpage.html')
})

app.get('/api/chat/:id/receiver',validateLogin, async(req,res)=>{
    const receiverId = parseInt(req.params.id)
    
    const checkReceiver = await pool.query(`SELECT * FROM users WHERE id = $1`, [receiverId])
    if(checkReceiver.rowCount === 0){
        return res.status(404).json({message : 'no user found'})
    }

    res.json({
        receiver : checkReceiver.rows[0],
        senderId : req.session.userId
    })
})

// CHATS 

// app.get('/')



function validateLogin(req,res,next){
    if(req.session.userId){
        next()
    }else{
        res.redirect('/api/login')
    }
}


// pool.query('delete from likes').then(()=> console.log('deleted users')).catch((err)=>{
//     console.log(err)
// })
// all tables

// chats

// const chats = pool.query(`CREATE TABLE IF NOT EXISTS chats
//     (id SERIAL PRIMARY KEY, 
//      sender_id  INTEGER REFERENCES users(id),
//      receiver_id INTEGER REFERENCES users(id),
//      message TEXT NOT NULL,
//      is_read BOOLEAN DEFAULT FALSE,
//      token TEXT ,
//      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//      is_groupchat BOOLEAN DEFAULT FALSE
//      )`);

//      chats.then(data =>console.log(data.rows, 'created table ')).then(err => console.log(err));

// users
// const newuser = pool.query(`CREATE TABLE IF NOT EXISTS users 
//     (id SERIAL PRIMARY KEY,
//      firstname VARCHAR(30), 
//      email VARCHAR(50), 
//      password VARCHAR(50), 
//      profilePicture TEXT)`)
//      newuser.then((data)=>console.log('users created')).catch((err)=> console.log(err));

// 2: Tokens

// pool.query(`CREATE TABLE IF NOT EXISTS tokens 
//      (id SERIAL PRIMARY KEY, 
//      token TEXT , 
//      user_id INTEGER REFERENCES users(id),
//      expires_at TIMESTAMP)`
//     ).then(()=>{
//         console.log('token table created')
//     }).catch((err)=> console.log(err))


//  pool.query(`CREATE TABLE IF NOT EXISTS posts 
//     (id SERIAL PRIMARY KEY , 
//     title VARCHAR(30),
//     description TEXT,
//     mediaFile TEXT,
//     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//     created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`).then(()=> console.log('posts created')).catch((err)=> console.log(err))

// pool.query(`ALTER TABLE posts
//     ADD CONSTRAINT post_id_foreignkey 
//     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`).then(()=>{
//     console.log('COLUMN ALTERED SUCCESS !')

// }).catch((err)=> console.log(err, ' occrued'))

// const likes = pool.query(`CREATE TABLE IF NOT EXISTS likes(id SERIAL PRIMARY KEY,
//                           created_at TIMESTAMP DEFAULT NOW(), 
//                           userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
//                           postId INTEGER REFERENCES posts (id) ON DELETE CASCADE,
//                           UNIQUE(userId, postId))`);

// likes.then(()=>console.log('likes created ')).catch((err)=>{
//     console.log(err)
// })

//   const comments = pool.query(`CREATE TABLE IF NOT EXISTS comments 
//     (id SERIAL PRIMARY KEY, 
//     comment TEXT NOT NULL ,
//      post_id INTEGER REFERENCES posts (id),
//      user_id INTEGER REFERENCES users (id),
//      created_at TIMESTAMP DEFAULT NOW())`);
//      comments.then(()=> console.log('comments created ')).catch((err)=>{
//         console.log(err)
//      })
// thing we will need for production 
// 1: loading functionality till the data loads









const listeningPort=  3000
server.listen(listeningPort, ()=>{
    console.log('runnin in ' + listeningPort)
})

