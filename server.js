
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
import sharedsession from "express-socket.io-session"
import fs from "fs"
import { error } from "console"
import { title } from "process"
import { json } from "stream/consumers"


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
    socket.on('newMessage-send', async(data)=>{
        const receiver = activeUsers.get(data.userId)
        // return console.log(data, loggedInUser.id)
        const messageDetails = {
            sender_id : loggedInUser.id,
            receiver_id : data.userId,
            msg : data.msg,
            is_read : 'false'
        }

        const newMessage = await pool.query(`INSERT INTO chats(sender_id, receiver_id, message, is_read)
            VALUES($1, $2, $3,$4) RETURNING *`, [messageDetails.sender_id,messageDetails.receiver_id, messageDetails.msg, messageDetails.is_read])

        if(newMessage.rowCount === 0){
            return console.log('failure saving the chat message in db')
        }

    console.log('successfully saved on db' ,newMessage.rows)
     socket.to(receiver).emit('received-message', newMessage.rows[0])
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


app.get('/loginUserProfile/:token',validateLogin,async(req,res)=>{
    const token = req.params.token
   res.sendFile(basedir + 'loginUserProfile.html')
});


app.get('/api/loginUserProfile/:token',validateLogin,async(req,res)=>{
    const token = req.params.token;
    const userId = req.session.userId;

    const userExists = await pool.query(`SELECT * FROM users WHERE id = $1 AND usertoken = $2`,[userId, token])

    if(userExists.rowCount === 0){
        return res.json({error : 'USER NOT FOUND'})
    }


    const activeUserPosts = await pool.query(`
        SELECT * FROM posts 
        WHERE posts.user_id = $1
        `, [userId]);

        if(activeUserPosts.rowCount === 0){
            return res.json({error : 'users posts not found'})
        }

    console.log(userExists, activeUserPosts)

        // return console.log(userExists.rows[0])

    res.json({
        user : userExists.rows[0],
        posts : activeUserPosts.rows,
        success : true
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
    const userId = parseInt(req.params.id)

    const userExist = await pool.query(`SELECT * FROM users WHERE usertoken = $1`, [userToken])
    if(userExist.rowCount === 0){
        return res.status(404).json({msg : 'token not found'})
    }

    console.log(userExist)
    const userPosts = await pool.query(`SELECT * FROM posts WHERE user_id = $1`, [userId])

        if(userPosts.rowCount === 0){
            return res.json({message : 'posts not found'})
        }


    res.json({
        user : userExist.rows[0],
        posts : userPosts.rows
    })
})


// posts

app.get('/api/posts',validateLogin, async(req,res)=>{

    // Original posts query
const actualPosts = `SELECT
  users.id as user_id,
  users.usertoken, 
  users.firstname AS author_firstname, 
  users.profilepicture AS author_profilepicture,
  posts.id as post_id,
  posts.title,
  posts.description,
  posts.mediafile,
  posts.created_at,
  posts.user_id = $1 AS is_owner,
  FALSE AS is_shared,  
  NULL AS share_data, 
  COUNT(likes.id) AS likes_count,
  COUNT(comments.id) AS comments_count,
  (SELECT COUNT (*) FROM shares WHERE shares.post_id  = posts.id) AS shares_count
FROM posts
LEFT JOIN users ON users.id = posts.user_id 
LEFT JOIN likes ON likes.postid = posts.id 
LEFT JOIN comments ON comments.post_id = posts.id
GROUP BY 
  users.id,
  posts.id
ORDER BY posts.created_at DESC`;

// parent share id and root post id was add in table share we could use them to tranck the shares count of share post and the all shares of the first post
// Shared posts query
const sharePosts = `SELECT
  shares.id as share_id,
  shares.user_id as user_id,
  shares.user_token as sharer_token,
  users.firstname AS author_firstname,
  users.profilepicture AS author_profilepicture,
  shares.id as post_id,  
  NULL AS title,  
  shares.sharer_message AS description,
  NULL AS mediafile,  
  shares.shared_at AS created_at,
  shares.user_id = $1 AS is_owner,
  shares.root_post_id,
  shares.parent_share_id,
  TRUE AS is_shared,
  JSON_BUILD_OBJECT(
    'original_post_id', original_post.id,
    'original_title', original_post.title,
    'original_description', original_post.description,
    'original_media', original_post.mediafile,
    'original_created_at', original_post.created_at,
    'original_author', JSON_BUILD_OBJECT(
      'id', original_author.id,
      'name', original_author.firstname,
      'profile', original_author.profilepicture,
      'token', original_author.usertoken,
      'is_owner', original_author.id = $1
    )
  ) AS share_data,
  COUNT(DISTINCT share_likes.id) AS likes_count,
  COUNT(DISTINCT share_comments.id) AS comments_count,
  (SELECT COUNT(*) FROM shares WHERE shares.post_id = original_post.id)
FROM shares
LEFT JOIN users ON users.id = shares.user_id
LEFT JOIN posts AS original_post ON original_post.id = shares.post_id
LEFT JOIN users AS original_author ON original_author.id = original_post.user_id
LEFT JOIN likes AS share_likes ON share_likes.share_id = shares.id
LEFT JOIN comments AS share_comments ON share_comments.share_id = shares.id
GROUP BY
 shares.id, 
  users.id,
  original_post.id,
  original_author.id
ORDER BY shares.shared_at DESC`;

const [originalPosts, sharedPosts] = await Promise.all([
  pool.query(actualPosts, [req.session.userId]),
  pool.query(sharePosts, [req.session.userId])
]);

// Combine results
const allPosts = [
  ...originalPosts.rows,
  ...sharedPosts.rows.map(share => ({
    ...share,
  }))
].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

   if(allPosts.length === 0){
    console.log('no posts or shrae posts')
     return res.json({
        posts  : []
     })
   }   

   
    // getting all the comments of the posts
    const postsIds = allPosts.filter(post =>!post.is_shared).map(post => post.post_id)
    const shareIds = allPosts.filter(post =>post.is_shared).map(post => post.share_id)

    const actualPostComments = `
    SELECT comments.post_id,
    COUNT(comments.id) AS commentCounts,
    JSON_AGG(
    JSON_BUILD_OBJECT(
     'id', comments.id,
     'text', comments.comment,
     'created_at', comments.created_at,
     'is_owner', (comments.user_id = $1),
     'author', JSON_BUILD_OBJECT(
        'user_id', users.id,
       'firstname', users.firstname,
       'profile_picture', users.profilepicture,
       'user_token' , users.usertoken
        )
      ) ORDER BY comments.created_at
    ) AS comments 
     FROM comments JOIN users ON users.id = comments.user_id
     WHERE comments.post_id = ANY($2)
     GROUP BY comments.post_id
    `
    const sharePostComments = `
     SELECT comments.share_id,
     JSON_AGG(
     JSON_BUILD_OBJECT(
       'id',comments.id,
       'text', comments.comment,
       'created_at', comments.created_at,
       'is_owner', (comments.user_id = $1),
       'author', JSON_BUILD_OBJECT(
        'user_id', users.id,
        'firstname', users.firstname,
        'profile_picture', users.profilepicture,
        'user_token', users.usertoken
       )
     )ORDER BY comments.created_at
     ) AS comments 
     FROM comments 
     JOIN users ON users.id = comments.user_id
     WHERE comments.share_id = ANY($2)
     GROUP BY comments.share_id
    `

    const [originalPostComments,sharedPostComments] = await Promise.all([
        pool.query(actualPostComments,[req.session.userId,postsIds]),
        pool.query(sharePostComments, [req.session.userId, shareIds])
    ])

    // const allPostComments = [...postComments,...sharePostComments]

    const postsWithComments = allPosts.map(post => {
  const comments = post.is_shared
    ? sharedPostComments.rows.find(c => c.share_id === post.share_id)?.comments || []
    : originalPostComments.rows.find(c => c.post_id === post.post_id)?.comments || [];
    
  return { ...post, comments };
});

 console.log("posts with comments ",postsWithComments)

    res.json({
        posts : postsWithComments
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
      console.log('new post saved !')

      const commentsOfNewPost = await pool.query(`
           SELECT posts.*,
           COUNT(comments.id) AS commentCounts,
           JSON_AGG(
            JSON_BUILD_OBJECT(
            'id' , comments.id,
            'text' , comments.comment,
            'created_at', comments.created_at,
            'is_owner', comments.user_id = $1,
            'author', JSON_BUILD_OBJECT(
              'id', users.id,
              'name', users.firstname,
              'profilePicture', users.profilepicture,
              'user_token', users.usertoken
            )
           )
           )AS comments
            FROM posts 
            LEFT JOIN comments ON comments.post_id = posts.id
            LEFT JOIN users ON users.id = posts.user_id
             WHERE comments.post_id  = $2
             GROUP BY posts.id
        `, [req.session.userId,newPost.rows[0].id])

      console.log('new post saved and comment...', commentsOfNewPost.rows[0])
      res.status(201).json({
        message : 'New post submitted successfully !',
        newPost : newPost.rows[0],
        commentsOfPost : commentsOfNewPost.rows[0]? comments : []
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
    SELECT users.*, posts.*,
    (SELECT COUNT(*) FROM likes WHERE "postid" = $1) AS likecounts,
    (SELECT COUNT(*) FROM comments WHERE "post_id" = $1) AS commentcounts,
     (
      SELECT json_agg(
        json_build_object(
        'id',comments.id,
        'text',comments.comment,
        'created_at',comments.created_at,
        'is_owner',comments.user_id = $2,
        'author', json_build_object(
        'firstname', users.firstname,
        'userId', users.id,
        'profile_picture',users.profilepicture,
        'user_token', users.usertoken
        )
        )ORDER BY comments.created_at
        ) FROM comments 
        JOIN users ON users.id = comments.user_id
        WHERE comments.post_id = $1
        
      )AS comments

        FROM posts JOIN users ON posts.user_id = users.id
        WHERE posts.id = $1
    `
    const updatedPostWithData = await pool.query(updatedPostWithDataQuery, [postId, loggedInUser]);
   
    if(updatedPostWithData.rowCount === 0){
        return res.json({message : 'failed to updated the post'})
    }
       return console.log(updatedPostWithData.rows[0])

    res.json({
        message : 'memory updated successfully !',
        updatedPost : updatedPostWithData.rows[0]
    })
})

// delete post

app.delete('/api/post/delete/:id', validateLogin, async(req,res)=>{
    const postId = parseInt(req.params.id)

   try{
     const likes = await pool.query(`DELETE FROM likes WHERE postid = $1 RETURNING *;`,[postId])

    const comments = await pool.query(`DELETE FROM comments WHERE post_id = $1 RETURNING *`, [postId])

    const post = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [postId])
    if(post.rowCount === 0){
        console.log('failure deleting the post from db')
        return res.json({message : 'No post found!'});
    }

     const deletingPost = post.rows[0]
    //  return console.log(path.join(__dirname,'public',deletingPost.mediafile))
    const filePath = deletingPost.mediafile.startsWith('video/') ?  
    path.join(__dirname,'public', deletingPost.mediafile) : 
    path.join(__dirname,'public', deletingPost.mediafile)
    if(deletingPost.mediafile){
      fs.unlink(filePath, err =>{
        if(err){
            console.log(err)
        }else{
            console.log('post media was deleted from the uploads')
        }
      })
    }else{
        console.log(deletingPost.mediafile)
        console.log('unknown file')
    }

    console.log('post deleted success')
    res.json({
        message : 'post deleted successfully !',
        deletedPost : deletingPost,
        success: true
    })
   }catch(error){
      if(error.code){
        return res.status(400).json({error : error.detail})
      }

      console.error(error)
      res.status(500).json({error : error.detail})
   }
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

   const currentUser = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.session.userId]);

   if(currentUser.rowCount === 0) return res.json({error : 'login user not found'})


//    after posting new comment we gotta get ALL COMMENTS of that exact post
   const allComments = await pool.query(`SELECT 
    users.firstname AS author_name,
    users.profilepicture AS user_profile_picture,
    users.usertoken as usersToken,
    comments.*
    FROM comments 
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
    postComments : allComments.rows,
    currentUser : currentUser.rows[0]
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
          users.usertoken as userstoken,
          comments.*,
          (comments.user_id = $2) AS is_owner
          FROM comments
          JOIN users ON comments.user_id = users.id
          WHERE comments.id = $1
        `, [commentId, req.session.userId]);

        if(updatedCommentUser.rowCount === 0){
            console.log('join failure')
            return res.status(404).json({message : 'getting updated comments with users failed'})
        }

        
    res.json({
        updatedComment : updatedCommentUser.rows[0]
    })

});


app.delete('/api/comment/:post_id/:comment_id/delete', validateLogin, async(req,res)=>{
    const commentId = parseInt(req.params.comment_id)
    const postId = parseInt(req.params.post_id)

      const deletedComment = await pool.query(`DELETE FROM comments WHERE id = $1 AND user_id = $2`, [commentId, req.session.userId])

    if(deletedComment.rowCount === 0){
        return res.status(404).json({success : false,message : 'You aint authorized to delete this !'})
    }

    const allComments = await pool.query(`SELECT * FROM comments WHERE post_id = $1 OR share_id = $1 `, [postId])

    if(allComments.rowCount === 0){
        return console.log('no comment for now !')
    }

    console.log('comment deleted !', deletedComment.rows[0])

     res.json({
       deletedComment : deletedComment.rows[0],
       allComments : allComments.rows,
       message : 'comment sucessfully deleted !',
       success : true
    })
});


// shares
// share pop up
app.get('/api/share/post/:id', validateLogin, async(req,res)=>{
    const postId = parseInt(req.params.id)
    const sharePost = await pool.query(`SELECT
        users.id as user_id,
        users.firstname AS author_firstname, 
        users.profilepicture AS author_profilepicture, 
        users.usertoken AS user_token,
        posts.id as post_id,
        posts.user_id AS post_user_id,
        posts.title,
        posts.description,
        posts.mediafile,
        posts.created_at
        FROM posts
        LEFT JOIN users ON posts.user_id = users.id 
        WHERE posts.id = $1
       `, [postId]);

       if(sharePost.rowCount === 0){
        return res.json({message : 'post not found'})
       }

    console.log(sharePost.rows[0], req.session.userId)
    res.json({
        sharedPost : sharePost.rows[0]
    })

})

app.post('/api/sharePost', validateLogin, async(req,res)=>{
    const shareId = parseInt(req.params.shareId)
    const { platform,postId,sharer_message} = req.body;
    // return console.log(req.session.userId, 'user id when share')
     const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.session.userId])

     if(user.rowCount === 0) return res.json({error : 'user not found'})
        console.log(user.rows[0].usertoken, 'user token')

        const newShare = await pool.query(`INSERT INTO shares (
        post_id, 
        user_id, 
        on_platform, 
        sharer_message,
        user_token
        )
        VALUES($1, $2, $3,$4, $5) RETURNING *
        `, [postId,req.session.userId,platform, sharer_message,user.rows[0].usertoken]);

        if(newShare.rowCount === 0){
            return res.status(404).json({error : 'failure saving the shared file', success: false})
        }

           console.log('file saved successfully !', newShare.rows[0])



        const sharedPostAndSharer = await pool.query(`
            SELECT shares.sharer_message,
            shares.id,
            shares.post_id,
            shares.user_id,
            shares.on_platform,
            shares.shared_at,
            (shares.user_id = $1) AS postOwner,
            posts.id AS post_id,
            posts.title,
            posts.description,
            posts.created_at,
            posts.mediafile,
            original_author.id as original_author_id,
            original_author.firstname as original_author_name,
            original_author.profilepicture as original_author_Profile,
            original_author.usertoken as original_user_token,
            sharer.id as sharer_id,
            sharer.firstname as sharer_name,
            sharer.profilepicture as sharer_profile,
            sharer.usertoken as sharer_user_token,
            (SELECT COUNT(*) FROM likes WHERE post_id = shares.id AND share_id = shares.id) AS likes_count, 
            (SELECT COUNT(*) FROM comments WHERE post_id = shares.id) AS comments_count
            FROM shares
            LEFT JOIN posts ON shares.post_id = posts.id 
            LEFT JOIN users AS original_author ON posts.user_id = original_author.id
            LEFT JOIN users AS sharer ON shares.user_id = sharer.id
            WHERE shares.id = $2
            GROUP BY 
            shares.id,
            posts.id,
            original_author.id,
            sharer.id
            ORDER BY shares.shared_at`, [req.session.userId,newShare.rows[0].id])

            if(sharedPostAndSharer.rowCount === 0){
                console.log('no shared file yet !')
            }

            const mainPost = await pool.query(`SELECT
                posts.id, 
            (SELECT COUNT(*) FROM shares WHERE shares.post_id = posts.id) AS shares_count
            FROM posts WHERE id = $1`, [postId])

            if(mainPost.rowCount === 0) return console.log('no main post')
        res.json({
            mainPost : mainPost.rows[0],
            sharedPost : sharedPostAndSharer.rows[0],
            message : 'file shared successfully !',
            success : true
        })
})


// edit post sharer
app.get('/api/editPost/:share_id', validateLogin, async(req,res)=>{
    const shareId = parseInt(req.params.share_id)
 
    const post = await pool.query(`SELECT * FROM shares WHERE id = $1`, [shareId])
    if(post.rowCount === 0) return res.status(404).json({message : 'not found post'})
     console.log(post.rows[0])
     res.json({
         post : post.rows[0],
         success : true
     })
 })


app.patch('/api/update/message/:shareId', validateLogin, async(req,res)=>{
    const shareId = req.params.shareId;
    const {post_id, sharer_message} = req.body;
    // const userId = req.session.userId;
    const findSharePost = await pool.query('SELECT * FROM shares WHERE id = $1;',[shareId])

    if(findSharePost.rowCount === 0) return res.status(404).json({error : 'share message not found'})
        const updatedMessage = await pool.query(`UPDATE shares SET sharer_message = $1 WHERE id = $2 RETURNING *;`, [sharer_message, shareId])

            if(updatedMessage.rowCount === 0){
                return res.json(403).json({error : 'updating the share message failed !'})
            }

            res.json({
                updated_message : updatedMessage.rows[0],
                message : 'post successfully updated !',
                success : true
            })
})


app.delete('/api/deleteSharerPost/:id', validateLogin, async(req,res)=>{
    const shareId = parseInt(req.params.id);

    const postsExists = await pool.query('SELECT * FROM shares WHERE id = $1', [shareId])

    if(postsExists.rowCount === 0) return res.status(403).json({error: 'No share post found'})

        const deletedPost = await pool.query(`DELETE FROM shares WHERE id = $1`, [shareId])

        if(deletedPost.rowCount === 0) return res.status(401).json({error : 'share post did not deleted from the post'})

            const targetPostShares = await pool.query(`SELECT posts.*,
                shares.*
                FROM shares 
                JOIN posts ON shares.post_id = posts.id
               `)

            if(targetPostShares.rowCount === 0) return console.log('empty')

                // return console.log('SHARE COUNTS ',targetPostShares.rows.shared_data.original_post.auto)

            
            res.json({
                shareCounts : targetPostShares.rows,
                message : 'post successfully deleted!',
                deletedPost : deletedPost.rows[0],
                success : true
            })

})

app.post('/api/likeSharePost/:shareId', validateLogin, async(req,res)=>{
    const shareId = parseInt(req.params.shareId)
    // const {postId,userId} = req.body;
    const userId = req.session.userId;

    const postExists = await pool.query(`select * from shares where id = $1`, [shareId])
    if(postExists.rowCount === 0) return res.status(404).json({error : 'post not found'})
    
    // check if the like has been by login user
    const checkLike = await pool.query(`SELECT * FROM likes WHERE share_id = $1 AND userid = $2`, [shareId, userId])

    if(checkLike.rowCount > 0){
       console.log(checkLike.rowCount)
       const deletedLike = await pool.query(`DELETE FROM likes WHERE share_id = $1 RETURNING *;`, [checkLike.rows[0].share_id])

       if(deletedLike.rowCount === 0) return res.json({error : 'like did not deleted from db'})
        console.log('dislike success')
      const like = await pool.query(`SELECT COUNT(*) as likescount FROM likes WHERE share_id = $1`, [shareId])
      return res.json({
        error : 'you have already liked this post',
        likesCount : like.rows[0].likescount

      })
    }

    const newLike = await pool.query(`INSERT INTO likes (userid, share_id) VALUES($1,$2) RETURNING *`, [req.session.userId, shareId])

    if(newLike.rowCount === 0) return res.json({error : 'like didnt save in db'})

    const likecount = await pool.query(`SELECT COUNT(*) AS likes FROM likes WHERE share_id = $1`, [shareId])

    if(likecount.rowCount > 0){
        res.json({
        success : true,
        likesCount : likecount.rows[0].likes
    })
    }
})

// adding comment of share post
app.post('/api/sharePost/:shareId/comment',validateLogin,async(req,res)=>{
    const {comment} = req.body;
    const shareId = req.params.shareId;

    const newComment = await pool.query(`INSERT INTO comments (comment,user_id,share_id) 
        VALUES($1,$2,$3) RETURNING *`, [comment, req.session.userId,shareId])

    if(newComment.rowCount === 0) return res.json({error : 'comment did not save in db'})


    const commentsAndAuthors = await pool.query(`SELECT 
        users.firstname AS author_name,
        users.profilepicture AS user_profile_picture,
        users.usertoken as userstoken,
        comments.*,
        (comments.user_id = $2) as is_owner
        FROM comments 
        JOIN users ON comments.user_id = users.id
        WHERE comments.share_id = $1
        ORDER BY comments.created_at DESC`, [shareId,req.session.userId])

        if(commentsAndAuthors.rowCount === 0) return res.json({error : 'no comments found'})
            console.log(commentsAndAuthors.rows[0], 'comment and author')
        res.json({
            newComment : newComment.rows[0],
            comments : commentsAndAuthors.rows,
            message : 'comment successfully added',
            success : true
        })          
})

// edit share post comment
app.patch('/api/sharePost/comment/:id/edit', validateLogin, async(req,res)=>{
    const commentId = parseInt(req.params.id)
    const {comment} = req.body

    const commentExist = await pool.query(`SELECT * FROM comments WHERE id = $1`, [commentId])

    if(commentExist.rowCount === 0){
        res.status(404).json({error :'Comment not found'})
    }

    const updatedComment = await pool.query(`UPDATE comments SET comment = $1 WHERE id = $2 RETURNING *`, [comment, commentId])

    if(updatedComment.rowCount === 0) return res.status(404).json({error : 'comment not found'})

     console.log('update comment succes', updatedComment.rows[0])
    res.json({
        success: true,
        updatedComment : updatedComment.rows[0]
    })
})

// chat 

app.get('/api/chatpage/:id', validateLogin, async(req,res)=>{
    const receiverId = parseInt(req.params.id)
    res.sendFile(basedir + 'chatpage.html')
})


// load all messasges on page start
app.get('/api/allChats/:receiverId', validateLogin, async(req,res)=>{
    const receiverId = parseInt(req.params.receiverId);
    const senderId = req.session.userId;
    const initialChats = await pool.query(`SELECT * FROM chats WHERE (sender_id = $1 AND receiver_id = $2)
        OR
     (sender_id = $2 AND receiver_id = $1)`, [senderId, receiverId])

    if(initialChats.rowCount === 0){
        return console.log('no chat yet !')
        // return res.json({error :'no chat found'})
    }

    res.json({
        chats : initialChats.rows,
        success : true
    })
})
// chat buddy name
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

function validateLogin(req,res,next){
    if(req.session.userId){
        next()
    }else{
        res.redirect('/api/login')
    }
}


// pool.query(`ALTER TABLE shares
//     ADD CONSTRAINT fk_shares_user_token
//     FOREIGN KEY (user_token) 
//     REFERENCES users(usertoken)
//     ON DELETE SET NULL`).then(()=> console.log('deleted users')).catch((err)=>{
//     console.log(err)
// })
// all tables

// shares


// pool.query(`CREATE TABLE IF NOT EXISTS shares 
//     (id SERIAL PRIMARY KEY, 
//      post_id INTEGER REFERENCES posts(id),
//      user_id INTEGER REFERENCES users(id),
//      on_platform TEXT NOT NULL,
//       sharer_message TEXT,
//      shared_at TIMESTAMP DEFAULT NOW()
//     )`).then(data =>{
//         console.log('shares creatd !')
//     }).catch(err =>{
//         console.log(err)
//     })

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

// pool.query(`ALTER TABLE shares 
// ALTER COLUMN parent_share_id SET DEFAULT NULL`).then(data => console.log('created')).catch(err =>{
//     console.log(err)
// })

// pool.query(`CREATE INDEX root_post_id_index ON shares(root_post_id)`).then(data => console.log('index created')).catch(err =>{
//     console.log(err)
// })

// pool.query(`ALTER TABLE comments 
//     DROP CONSTRAINT IF EXISTS user_token_fk,
//   ADD CONSTRAINT user_token_fk FOREIGN KEY (user_token) REFERENCES users(usertoken) ON DELETE CASCADE`).then(()=>{
//     console.log('constraint ALTERED SUCCESS !')

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



// pool.query(`ALTER TABLE shares ADD COLUMN IF NOT EXISTS user_token TEXT,
//     ADD CONSTRAINT fk_user_token
//     FOREIGN KEY (user_token) REFERENCES users(usertoken)`
// ).then(() =>console.log('COSNTRAINT conditionaly set !')).catch(err =>console.log(err))


//    pool.query(`ALTER TABLE posts ALTER COLUMN shared_post_id SET DEFAULT NULL`).then(()=>console.log('is_shared column added')).catch((err)=>console.log(err))



const listeningPort=  3000
server.listen(listeningPort, ()=>{
    console.log('runnin in ' + listeningPort)
})

