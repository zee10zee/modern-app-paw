
import express from "express"
import {Server} from "socket.io"
import http from "http"
import { readFile } from 'fs/promises';
import session from "express-session"
import pkg from "pg"
import path from "path"
import { join } from "path";
import { fileURLToPath } from "url"
import multer, { diskStorage } from "multer"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import crypto from "crypto"
import bcrypt from "bcrypt"
import connectPgSimple from "connect-pg-simple"
import sharedsession from "express-socket.io-session"
import fs from "fs"
import cors from "cors"
import admin from "firebase-admin"
import ImageKit from "imagekit";

const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://memorydom-v2.onrender.com'
  : 'http://localhost:3000'

let notifLoginUser;

dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
console.log(__dirname)// giving me the absolute path from the the root folder of my pc till the file i am in. D:\webDev\node js\memoryDomWithChat\server.js
const app = express()

// Load service account with correct path
let serviceAccount;
try {
  // Try to read from file (for local development)
  serviceAccount = JSON.parse(await readFile(join(__dirname, 'serviceAccountKey.json')));
} catch (error) {
  // Fallback to environment variables (for production)
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: "googleapis.com"
  };
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const server = http.createServer(app)
const io = new Server(server, {
cors: { origin: ['memorydom-v2.vercel.app', 'http://localhost:3000','https://memorydom-v2.onrender.com/'] },
pingInterval: 10000, // send ping every 10s
pingTimeout: 5000,   // disconnect if no pong after 5s
})
;

const {Pool} = pkg;
// postid in  thes string case pool needs an object we should do like : 


  
const pool = new Pool({
    connectionString : process.env.DATABASE_URL || process.env.DB,
    ssl : {
        rejectUnauthorized : false
    }
})


// cors
app.use(cors({
    origin : 
    ['memorydom-v2.vercel.app', 'http://localhost:3000','https://memorydom-v2.onrender.com/'],
    credentials : true
}))


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
    cookie: {
      httpOnly: true, // prevents JS access
      secure: false,  // set true if using HTTPS
      sameSite: "lax",
    }
});


let activeUsers = new Map()
let userUnseenPosts = new Map()


app.use(sessionMiddleware)
// share the session with the socket to access the login users
io.use(sharedsession(sessionMiddleware, {
    autoSave : true
}))

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
    socket.userId = loggedInUser.id
  socket.join(`user-${loggedInUser.id}`)

   activeUsers.set(loggedInUser.id, socket.id)

   console.log(activeUsers.size, activeUsers.keys())
   
//    update the connected user just now

const now = new Date().toISOString()

console.log('logged in user id ', loggedInUser.id)

const updatedUser = await pool.query(`
    UPDATE users SET is_active = true,
     active_at  = $1
     WHERE id = $2 RETURNING *` ,[now, loggedInUser.id])

  if(updatedUser.rowCount === 0) return console.log('failure updateing the connected User')

  console.log('user status updated success proceed !')

  socket.emit('user-joined',{loggedInUser: loggedInUser.firstname, loggedInUserId: loggedInUser.id});

//   typing event
    socket.on('start-typing', (uId)=>{
        const receiver = activeUsers.get(parseInt(uId))
        if(!receiver) return console.log('receiver is not found please check !')

        socket.to(receiver).emit('user-typing', loggedInUser.firstname)

        socket.to(receiver).emit('usertyping-on-chatlist', 
            loggedInUser.firstname)
    })

    // received message listener
    socket.on('newMessage-send', async(data)=>{
        console.log('come from client ', data)
        // return console.log(data.userId)
        const receiverId = parseInt(data.userId)
        const receiver = activeUsers.get(receiverId)
        console.log(receiver, 'receiver', activeUsers.values())
        const con_id = parseInt(data.conversation_id)
         console.log(con_id, typeof(con_id))
        const messageDetails = {
            sender_id : loggedInUser.id,
            receiver_id : receiverId,
            msg : data.msg,
            is_read : 'false',
            conversation_id : con_id
        }

        const newMessage = await pool.query(`
            INSERT INTO chats
            (sender_id, receiver_id, message, is_read, conversation_id)
            VALUES($1, $2, $3,$4, $5) RETURNING *`, 
            [
              messageDetails.sender_id,
              messageDetails.receiver_id, 
              messageDetails.msg, 
              messageDetails.is_read,
              messageDetails.conversation_id
            ])

        if(newMessage.rowCount === 0){
            return console.log('failure saving the chat message in db')
        }

    console.log('successfully saved on db' ,newMessage.rows)

    const receiverInfo = await pool.query(`SELECT firstname,usertoken FROM users WHERE id = $1`, [messageDetails.receiver_id])

    if(receiverInfo.rowCount === 0) return console.log({error : 'no receiver found'});

    // // the first emit
     socket.to(receiver).emit('received-message', {
        newMsg : newMessage.rows[0],
        sender_name : loggedInUser.firstname, 
        receiver_name : receiverInfo.rows[0].firstname,
        receiver_token : receiverInfo.rows[0].usertoken,
        sender_token : loggedInUser.usertoken,
        target : 'receiver'
    })

        socket.emit('received-message', {
            newMsg : newMessage.rows[0],
            sender_name : loggedInUser.firstname, 
            receiver_name : receiverInfo.rows[0].firstname,
            target : 'sender'
        })
    })

  

    socket.on('disconnect', async()=>{

        console.log('user disconnected ')
        // Remove user from activeUsers map
         for(const [userid, socket] of activeUsers.entries()) {
            if(activeUsers.has(userid)){
                 activeUsers.delete(userid);
                 console.log('socket deleted')
                // also update the user on database as is_active false
                await markUserAsInactive(userid)

                setTimeout(() => {
                io.emit('update-users', (activeUsers.entries.length))
                }, 5000);
            }
                
            }
                
    })
})


async function markUserAsInactive(id){
  const inactiveUser = await pool.query('UPDATE users SET is_active = false WHERE id = $1 RETURNING *', [id])

  if(inactiveUser.rowCount === 0) return console.log('failure updating the anactive user')

  console.log('user disconnected and marked as inactive success')
}

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
    res.sendFile(basedir + '/home.html')
})

app.get('/api/signup', (req,res)=>{
    res.sendFile(basedir + '/signup.html')
})
app.get('/api/login', (req,res)=>{
    res.sendFile(basedir + '/login.html')
})

app.post('/api/signup',async(req,res)=>{
    let newUser;
      console.log(req.body)
       let newUserData = {
        fname : req.body.fname.trim().toLowerCase(),
        email : req.body.email.trim().toLowerCase(),
        password : req.body.password.trim().toLowerCase(),
        profile : req.body.profile
      }

      const userExist = await pool.query(`SELECT * FROM users WHERE email = $1 `,[newUserData.email]);

      if(userExist.rowCount > 0) return res.json({message :"email is already registered please log in"})

      // RANDOM AND STRONG TOKEN / CAN BE USED INSTEAD OF id FOR SECURITY
        const userToken = crypto.randomBytes(32).toString('hex')
        console.log(userToken, 'token')

        const tokenExists = await pool.query(`SELECT * FROM users WHERE userToken = $1`, [userToken])

        if(tokenExists.rowCount > 0) return console.log('token is invalid')
        
            // hashing the password into for saving into db
        const hashedPassword = await bcrypt.hash(newUserData.password,10)


        // checking for user profile whether to add or not 
        const newUserQuery = `INSERT INTO users(firstname, email, password, profilepicture, usertoken) VALUES
        ($1,$2,$3,$4, $5) RETURNING *`

        const profile = newUserData.profile || '/static-images/anonymous-user.png'

         newUser = await pool.query(newUserQuery, [newUserData.fname, newUserData.email,hashedPassword,profile, userToken])


    if(newUser.rows.length === 0){
        console.log('user did not save !')
        return res.send('user did not save !')
    }

    console.log('user info ', newUser.rows[0].id)
    console.log('welcome to memorydom ', newUser.rows[0].firstname)
    req.session.userId = newUser.rows[0].id
   
    res.json({
        newUser : newUser.rows[0],
        success : true,
        userId : req.session.userId
    })
})

//image kit auth route

app.get('/imageKit/auth',async(req,res)=>{
    const imgkit = new ImageKit({
        publicKey : process.env.IMGKIT_PUBLIC_KEY,
        privateKey : process.env.IMGKIT_PRIVATE_KEY,
        urlEndpoint : `https://ik.imagekit.io/${process.env.IMAGE_KIT_ID}`
    })

    const imgKitAuthElements = imgkit.getAuthenticationParameters()
    res.json({
        success : true,
        authElements : imgKitAuthElements
    })
})

// user profile update

app.patch('/api/user/:id/profileUpdate', 
    upload.single('updated-profile'), 
    validateLogin, async(req,res)=>{
    const id = parseInt(req.params.id)

    if(!req.file)  return console.log('no file selected !')

        const imgPath = `/uploads/${req.file.filename}`
      const updatedImage = 
      await pool.query(`UPDATE users 
      SET profilepicture = $1 WHERE id = $2 RETURNING *`,[imgPath,req.session.userId])

    if(updatedImage.rowCount === 0) return console.log('failure updating profile')

    res.json({
        message : 'profile image udpated successfully !',
        success :true,
        updatedPic : updatedImage.rows[0],
    })
})

// google login route

app.post('/api/auth/google', async(req,res)=>{
    const {tokenId, authType} = req.body
    let newUserData;
    let newUser;

    if(authType === 'firebase'){
         if(!tokenId) return console.log('token not found')

        // to decode and verify the token id sent from client
      const decodedToken = await admin.auth().verifyIdToken(tokenId)
      const userData = (await admin.auth().getUser(decodedToken.uid)).providerData[0]

      newUserData = {
        fname : decodedToken.name ,
        email : decodedToken.email ,
        profile : userData.photoURL,
        token : tokenId,
        password : null
      }

       const userExist = await pool.query(`SELECT * FROM users WHERE email = $1`,[newUserData.email]);

      if(userExist.rowCount > 0){
        req.session.userId = userExist.rows[0].id
        // UPDATE AND RETURN THE THE GOOGLE INFO OF THE LOGIN USER
        return res.status(200).json({
        messasge : 'user already exists and data updated as preferred successfully !',
        isLoggedIn : true,
        existingUser : await updateUserInfo(newUserData.fname,newUserData.profile,userExist.rows[0].id),
        existed : true
      })
    }

      const newUserQuery = `INSERT INTO users(firstname, email, password, profilepicture, usertoken) VALUES
        ($1,$2,$3,$4,$5) RETURNING *`

       newUser = await pool.query(newUserQuery, [newUserData.fname, newUserData.email,newUserData.password,newUserData.profile, newUserData.token])

       if(newUser.rows.length === 0){
        console.log('user did not save !')
        return res.send('user did not save !')
    }

    console.log('user info ', newUser.rows[0].id)
    console.log('welcome to memorydom ', newUser.rows[0].firstname)
    req.session.userId = newUser.rows[0].id
   
    res.json({
        newUser : newUser.rows[0] || newUserData,
        isLoggedIn : true,
        userId : req.session.userId
    })
    }
})

// update userAuth info
async function updateUserInfo(fname,profilePic,userId){
  const updatedInfo = await pool.query(`UPDATE users 
    SET firstname = $1, profilepicture = $2
    WHERE id = $3 RETURNING * `, [fname,profilePic,userId])

    if(updatedInfo.rowCount === 0) return console.log('failure updating user info')
    return updatedInfo.rows[0]
}

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

         // handle the null password users who has already signed up via google 
            if(ExistingUser.rows[0].password === null) return res.json({message : 'You have signed up via google!'}) 

            const confirmedPassword = await bcrypt.compare(credentials.password, user.password)
            console.log(credentials.password, user.password)
            if(!confirmedPassword){
                console.log('wrong password')
                return res.json({message : 'wrong passweord used'})
            }
           


            console.log('welcome back ', ExistingUser.rows[0].firstname)
            req.session.userId = ExistingUser.rows[0].id
            const result = ExistingUser.rows[0]
        res.json({
            loggedInUser : await updateUserInfo(result.firstname,result.profilepicture,result.id),
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

let username = ''
app.post('/api/logout', validateLogin, async(req,res)=>{
   const activeUser = activeUsers.get(req.session.userId)
   console.log(activeUser, 'socket of user id active user id')

    const user = await pool.query('SELECT firstname FROM users WHERE id = $1', [req.session.userId])
    if(!user) return console.log('user not found')
    
        username = user.rows[0].firstname 

    
    req.session.destroy(err =>{
        if(err){
            console.log(err)
            return res.send(err)
        }

        
        res.clearCookie('connect.sid'); // clear session cookie
        res.json({  success : true, username : username})
    })
})
// node mailer config
const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : process.env.APPEMAIL,
        pass : process.env.APPPASSWORD
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
    const resetLink = `${baseUrl}/api/passwordReset/${token}`
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
//
   if(confirmPassword !== newPassword){
      console.log('confirm password does not match the new password')
      return res.json({message : 'confirm password does not match the new password'})
   }

   const hashedPassword = await bcrypt.hash(newPassword,10)
    console.log(hashedPassword)
   const newPasswordd = await pool.query(`UPDATE users SET password = $1 WHERE id = $2 RETURNING *`, [hashedPassword, tokenRow.user_id]);


   if(newPasswordd.rowCount === 0){
      console.log('failure in saving reset password')
      return res.json({message : 'reset password fiaulre to save'})
   }

   console.log('password updated successfully !')
   res.json({
    message : 'password updated successfully !', 
    newPassword : newPassword,
    confirmpas : confirmPassword,
    success : true
   })
})


app.get('/userProfile/:token/:id',validateLogin,async(req,res)=>{
    const token = req.params.token
    const {id} = req.params

   res.sendFile(basedir + 'userProfile.html')
});


app.get('/api/userProfile/:token/:userId',validateLogin,async(req,res)=>{
    const token = req.params.token;
    const userId = parseInt(req.params.userId);
      console.log(token, userId, typeof(userId))
    try{
        const userWithPosts = await pool.query(`SELECT 
        users.*,
        COALESCE(json_agg(posts.*) FILTER(WHERE posts.id IS NOT NULL),'[]') as posts, 
        (users.id = $1) AS is_owner 
        FROM users 
        LEFT JOIN posts ON posts.user_id = users.id
        WHERE users.id = $2 
        AND users.usertoken = $3
        GROUP BY users.id`,[req.session.userId, userId,token])

    if(userWithPosts.rowCount === 0){
        
        return res.json({error : 'USER NOT FOUND'})
    }
 console.log(userWithPosts.rows[0])

    res.json({
        user : userWithPosts.rows[0],
        success : true,
    })
    }catch(err){
        return console.log(err)
    }
})

// fetch latest posts
app.get('/api/latestPosts', validateLogin, async(req,res)=>{
    const {postid} = req.query
    console.log(typeof(postid), 'last date of post on server')

     if (!postid) {
    return res.status(400).json({ success: false, message: "Missing postid param" });
  }
 
    // // get all meta data of the recent posts
    const latestPosts = await pool.query(`SELECT 
        posts.*,
        posts.id as post_id,
        users.id as user_id,
        users.firstname AS user_firstname,
        users.profilepicture user_profilepicture,
        users.usertoken as user_token,
        (SELECT COUNT(*) FROM likes WHERE likes.postid = posts.id) AS likes_count,
        (SELECT COUNT(*)  FROM comments WHERE comments.post_id = posts.id) AS comments_count,
      
        (SELECT COUNT (*) FROM posts p2 WHERE p2.parent_share_id = posts.id) AS total_shares,
        (SELECT COUNT (*) FROM posts p3 WHERE p3.parent_share_id = posts.id) AS direct_shares,
        (posts.user_id = $1) AS is_owner,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', comments.id,
                    'text', comments.comment,
                    'created_at', comments.created_at,
                    'is_owner', comments.user_id = $1,
                    'author', JSON_BUILD_OBJECT(
                        'id', users.id,
                        'firstname', users.firstname,
                        'profile_picture', users.profilepicture,
                        'user_token', users.usertoken
                    )
            )
          ) FILTER(where comments.id IS NOT NULL),
           '[]' ::JSON
        )AS comments 
        FROM posts 
        LEFT JOIN comments ON comments.post_id = posts.id
        LEFT JOIN users ON posts.user_id = users.id
        WHERE posts.id > $2
        GROUP BY posts.id,users.id, comments.id
           `,[req.session.userId, postid])

        if(latestPosts.rowCount === 0) return console.log('post info not found')
        
        userUnseenPosts.set(req.session.userId,0)

        res.json({
            newPosts : latestPosts.rows,
            success : true
        })
})



app.get('/api/posts',validateLogin, async(req,res)=>{
    // Original posts query

    notifLoginUser = req.session.userId
    
    const original_posts = `
        SELECT posts.*,
        posts.id AS post_id,
        poster.id as poster_id,
        poster.usertoken AS poster_token,
        poster.firstname AS poster_name,
        poster.profilepicture AS poster_profile,

        (SELECT COUNT(*) FROM likes WHERE likes.postid = posts.id) AS likes_count,
        (SELECT COUNT(*)  FROM comments WHERE comments.post_id = posts.id) AS comments_count,
      
      (SELECT COUNT (*) FROM posts p2 WHERE p2.root_post_id = posts.id) AS total_shares,

        (posts.user_id = $1) AS is_owner
        FROM posts 
          LEFT JOIN users AS poster ON poster.id = posts.user_id 
        WHERE parent_share_id IS NULL 

        GROUP BY 
        posts.id,
        poster.id
         
        
        `

    const shared_posts = `
        SELECT
        posts.*,
        posts.id AS post_id,
        posts.parent_share_id,
        posts.root_post_id,
    
        sharer.id AS sharer_id,
        sharer.firstname AS sharer_name,
        sharer.profilepicture AS sharer_profile,
        sharer.usertoken AS sharer_token,

        -- Original post data as JSON
        (SELECT json_build_object(
            'id', op.id,
            'title', op.title,
            'description', op.description,
            'mediafile', op.mediafile,
            'created_at', op.created_at,
            'owner', json_build_object(
                'id', ou.id,
                'usertoken', ou.usertoken,
                'firstname', ou.firstname,
                'profilepicture', ou.profilepicture,
                'is_owner', ou.id = $1
            )
        ) FROM posts op
        JOIN users ou ON ou.id = op.user_id
        WHERE op.id = posts.root_post_id) AS original_post,

        (SELECT COUNT(*) FROM likes WHERE likes.postid = posts.id) AS likes_count,
        (SELECT COUNT(*)  FROM comments WHERE comments.post_id = posts.id) AS comments_count,
      
        (SELECT COUNT (*) FROM posts p2 WHERE p2.parent_share_id = posts.id) AS total_shares,
        (SELECT COUNT (*) FROM posts p3 WHERE p3.parent_share_id = posts.id) AS direct_shares,

        (posts.user_id = $1) AS is_share_post_owner

        FROM posts
        LEFT JOIN users AS sharer ON sharer.id = posts.user_id 
        WHERE posts.parent_share_id  IS NOT NULL AND posts.root_post_id IS NOT NULL

        ORDER BY posts.id DESC 
        
        `

         const originalQuery = await pool.query(original_posts, [req.session.userId])
         const sharedQuery = await pool.query(shared_posts, [req.session.userId])
        const [originals,shares] = await Promise.all([originalQuery, sharedQuery])
// Combine results
const allPosts = [...originals.rows, ...shares.rows].sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
   if(allPosts.length === 0){
    console.log('no posts or shrae posts')
     return res.json({
        posts  : [],
        isEmpty : true
     })
   }   

   
    // getting all the comments of the posts
    const postsIds = allPosts.map(post => post.post_id)

    // const shareIds = allPosts.filter(post =>post.is_shared).map(post => post.share_id)

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
      ) ORDER BY comments.created_at DESC
    ) AS comments 
     FROM comments JOIN users ON users.id = comments.user_id
     WHERE comments.post_id = ANY($2)
     GROUP BY comments.post_id
    `

    const postComments= await pool.query(actualPostComments,[req.session.userId,postsIds])

    const postsWithComments = allPosts.map(post => {
  const comments = postComments.rows.find(c => c.post_id === post.post_id)?.comments || [];
    
  return { ...post, comments };
});

//    return console.log("posts and comment ",postsWithComments)

    res.json({
        posts : postsWithComments
    })
    
});



// add new memory
app.post('/api/newPost', validateLogin,async(req,res)=>{
    const userId=  req.session.userId
    
    const lastPostId = (await createNewPost(req.body,userId))?.id || null
     console.log(lastPostId)

    // getting new post and its whole meta data
      const lastestPosts = await pool.query(`SELECT 
        posts.*,
        posts.id as post_id,
        users.id as user_id,
        users.firstname AS user_firstname,
        users.profilepicture user_profilepicture,
        users.usertoken as user_token,
        (SELECT COUNT(*) FROM likes WHERE likes.postid = posts.id) AS likes_count,
        (SELECT COUNT(*)  FROM comments WHERE comments.post_id = posts.id) AS comments_count,
      
        (SELECT COUNT (*) FROM posts p2 WHERE p2.parent_share_id = posts.id) AS total_shares,
        (SELECT COUNT (*) FROM posts p3 WHERE p3.parent_share_id = posts.id) AS direct_shares,
        (posts.user_id = $1) AS is_owner,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', comments.id,
                    'text', comments.comment,
                    'created_at', comments.created_at,
                    'is_owner', comments.user_id = $1,
                    'author', JSON_BUILD_OBJECT(
                        'id', users.id,
                        'firstname', users.firstname,
                        'profile_picture', users.profilepicture,
                        'user_token', users.usertoken
                    )
            )
          ) FILTER(where comments.id IS NOT NULL),
           '[]' ::JSON
        )AS comments 
        FROM posts 
        LEFT JOIN comments ON comments.post_id = posts.id
        LEFT JOIN users ON posts.user_id = users.id
        WHERE posts.user_id = $1 AND posts.id = $2
        GROUP BY posts.id,users.id, comments.id
           `, [req.session.userId,lastPostId])

           if(lastestPosts.rowCount === 0) return console.log('post info not found')

            await getPostCounts(req.session.userId,lastPostId)

      res.json({
        message : 'New post submitted successfully !',
        newPostData : lastestPosts.rows[0],
        success : true,
        isFresh: true
      })
})

 async function createNewPost(body,userId){

     console.log(body.ptitle,body.pdesc,body.newMedia,userId, 'post info before isnert')

    const newPostQuery = (`INSERT INTO posts (title, description, mediafile, user_id)
      VALUES($1, $2,$3, $4) RETURNING *`)
      const newPost = await pool.query(newPostQuery, 
        [body.ptitle,body.pdesc,body.newMedia,userId])

      if(newPost.rowCount === 0){
         return console.log('no post saved to db')
      }
         console.log(newPost.rows[0], 'from db')
        return newPost.rows[0]
    }

    // get newPostCount and lastPost id of each use and emit to client
    async function getPostCounts(userId,lastpostId){
    //   get all connected sockets
       const allSockets = await io.fetchSockets()

    //    getting and emitting new post count and last postId
       allSockets.forEach((socket) =>{
        // skip the loggin user
        if(socket.userId === userId) return

        // get the current count of new posts like maybe 3 new posts
        const currentData = userUnseenPosts.get(socket.userId) ||{postCount : 0, lastPostId : null} //if 0 

        const newData = {
            postCount : currentData.postCount + 1,
            lastPostId : lastpostId
        }

        // add the newly incremented count of post in the map
        userUnseenPosts.set(socket.userId,newData)

        // emit to each room of conneced users
         return io.to(`user-${socket.userId}`).emit('new_posts_alert',
        {newData})
    })
    }

const findSpecificTableContent = async(table, columnId)=>{
    const foundData = await pool.query(`SELECT * FROM ${table} WHERE id = $1`,[columnId])
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
    (SELECT COUNT(*) FROM posts AS sharedPost WHERE sharedPost.parent_share_id = $1) AS shares_count,
     (
      SELECT json_agg(
        json_build_object(
        'id', comments.id,
        'text',comments.comment,
        'created_at',comments.created_at,
        'is_owner',comments.user_id = $2,
        'author', json_build_object(
        'firstname', users.firstname,
        'userId', users.id,
        'profile_picture',users.profilepicture,
        'user_token', users.usertoken
        )
        )ORDER BY comments.created_at DESC
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
       console.log(updatedPostWithData.rows[0])

    res.json({
        message : 'memory updated successfully !',
        updatedPost : updatedPostWithData.rows[0]
    })
})

// delete post

app.delete('/api/post/delete/:id', validateLogin, async(req,res)=>{
    const postId = req.params.id
   try{

     const likes = await pool.query(`DELETE FROM likes WHERE postid = $1 RETURNING *`,[postId])

    const comments = await pool.query(`DELETE FROM comments WHERE post_id = $1 RETURNING *`, [postId])

    const post = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [postId])
    if(post.rowCount === 0){
        console.log('failure deleting the post from db')
        return res.json({message : 'No post found!'});
    }

     const deletingPost = post.rows[0]
     if(deletingPost.mediafile){
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
     }
   

    console.log('post deleted success')
    
    res.json({
        message : 'post deleted successfully !',
        deletedPost : deletingPost,
        success: true
    })
   }catch(error){
      if(error.code){
        console.log(error)
        return res.status(400).json({error : error})
      }
   }
})
async function FetchNotificationsCount(loginUserId){
     // counts notifications latest update

        const allUserNotifications = await pool.query(`SELECT * FROM notifications where receiver_id = $1`, [loginUserId])

        if(allUserNotifications.rowCount === 0) { console.log('0 length now.')
        }
        return allUserNotifications.rows
}


// likes 

app.post('/api/post/:id/like', validateLogin, async(req,res)=>{
    const id = parseInt(req.params.id)
    const loggedInUserId = req.session.userId;

    const loginUser = await pool.query('SELECT firstname FROM users WHERE id=  $1', [loggedInUserId])

    if(!loginUser.rowCount === 0) return res.status(404).json({error : 'no active user'})

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

    //   send notification

    const postOwner = await pool.query(`SELECT * FROM posts WHERE id = $1 `, [id])

    if(postOwner.rowCount === 0) return res.json({error : 'postOwner not found'})
         console.log(postOwner.rows[0])
        const receiverId = postOwner.rows[0].user_id
        const receiverName = postOwner.rows[0].firstname;
      const notif_receiver = activeUsers.get(receiverId)

      if(!notif_receiver) console.log('user if offline now though')
      
        const notifMessage = `${loginUser.rows[0].firstname} has Liked Your Post !`
        const postId = postOwner.rows[0].id

      
        //   saving the notification into the db
        const newNotif = await pool.query(`INSERT INTO notifications 
        (type,message,from_userid,receiver_id,post_id)
        VALUES($1,$2,$3,$4,$5) RETURNING *; `, ['like',notifMessage,loggedInUserId,receiverId,postId])

        if(newNotif.rowCount === 0) return res.status(404).json({error : 'failure saving notification !'})
        
            //   counting likes and sending it to client for display
      const countPostLikes = await pool.query('SELECT COUNT (id) AS like_counts FROM likes WHERE postid = $1', [id])

      if(countPostLikes.rowCount === 0){
        return console.log('failure getting the likes count of the post')
      }
        if(receiverId !== loggedInUserId){

         const countNewNotifs = await FetchNotificationsCount(receiverId)


              //   sending real time to client !
            io.to(notif_receiver).emit('like_notif', {
                message : newNotif.rows[0].message,
                timestamp : newNotif.rows[0].timestamp,
                post_id : newNotif.rows[0].post_id,
                receiverId : receiverId,
                likesCount : countPostLikes.rows[0].like_counts,
                notifsCount : countNewNotifs.length
            })

        }else{
        console.log('no notify self user!');
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

    // postOwner
    const post = await pool.query(`SELECT * FROM posts WHERE id = $1`, [postId])

   console.log('post id', post.rows[0],'user id',req.session.userId)

    if(post.rowCount === 0) return console.log(post.rows, ' something is wrong getting the post id of the comment notfication')

    //    after posting new comment we gotta get ALL COMMENTS of that exact post
   const allComments = await pool.query(`SELECT 
    users.firstname AS author_name,
    users.profilepicture AS user_profile_picture,
    users.usertoken as userToken,
    comments.*,
   (comments.user_id = $2) AS is_owner
    FROM comments 
    JOIN users ON comments.user_id = users.id
    WHERE comments.post_id = $1
    ORDER BY comments.created_at`, [postId,req.session.userId])

    if(allComments.rowCount === 0) return console.log('no COMMENTS found !')


    const receiverId =  post.rows[0].user_id

    // saving into notification
      const notif_receiver = activeUsers.get(receiverId)
  

      if(!notif_receiver) console.log('no receiver found')
        
        const notifMessage = `${currentUser.rows[0].firstname} has Commented on Your Post !`

      if(receiverId !== req.session.userId){
        //   saving the notification into the db
        const newNotif = await pool.query(`INSERT INTO notifications 
        (type,message,from_userid,receiver_id,post_id)
        VALUES($1,$2,$3,$4,$5) RETURNING *; `, ['Comment',notifMessage,currentUser.rows[0].id,receiverId,postId])

        if(newNotif.rowCount === 0) return res.status(404).json({error : 'failure saving notification !'})

        const countNewNotifs = await FetchNotificationsCount(receiverId)

        console.log('notification count after comment ', countNewNotifs.length)

         //   sending real time to client !
            io.to(notif_receiver).emit('comment_notif', {
                message : newNotif.rows[0].message,
                timestamp : newNotif.rows[0].timestamp,
                post_id : newNotif.rows[0].post_id,
                receiverId : receiverId,
                comments : allComments.rows,
                commentor : currentUser.rows[0],
                notifsCount : countNewNotifs.length
            })

      }else{
        console.log('no notify self user!');
      }

   console.log('successfully commented')
   res.json({
    message : 'comment successfully made !',
    postComments : allComments.rows,
    currentUser : currentUser.rows[0],
    success: true,
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

      console.log('update comment', updatedCommentUser.rows[0])
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

    const allComments = await pool.query(`SELECT * FROM comments WHERE post_id = $1`, [postId])

    if(allComments.rowCount === 0){
        console.log('no comment for now !')
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
        posts.id as post_id,
        posts.user_id AS post_user_id,
        posts.title,
        posts.description,
        posts.mediafile,
        posts.parent_share_id,
        posts.root_post_id,
        posts.created_at,
        users.id as user_id,
        users.firstname AS author_firstname, 
        users.profilepicture AS author_profilepicture, 
        users.usertoken AS user_token,
        original_post.description as originalPostDesc,
        original_post.mediafile as originalPostFile,
        original_post.title as originalPostTitle

        FROM posts
        LEFT JOIN users ON posts.user_id = users.id
        LEFT JOIN posts as original_post ON original_post.id = posts.id 
        where posts.id = $1
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
    const { platform,parent_share_id, root_postId,sharer_message} = req.body;
    const userId = req.session.userId;

    
     const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.session.userId])

     if(user.rowCount === 0) return res.json({error : 'user not found'})

        const newPostAsShare = await pool.query(`INSERT INTO posts(title,description,mediafile,user_id,is_shared,parent_share_id, root_post_id)
        VALUES($1,NULL,NULL,$2,true,$3,$4) RETURNING *`, [sharer_message,userId,parent_share_id, root_postId])

        if(newPostAsShare.rowCount === 0) {
            return res.status(404).json({error : 'failure while saving the sharePost on db'})
        }

        const newShare = await pool.query(`INSERT INTO shares (
        post_id, 
        user_id, 
        on_platform, 
        sharer_message,
        user_token
        )
        VALUES($1, $2, $3,$4, $5) RETURNING *
        `, [parent_share_id,req.session.userId,platform, sharer_message,user.rows[0].usertoken]);

        if(newShare.rowCount === 0){
            return res.status(404).json({error : 'failure saving the shared file', success: false})
        }

        //post owner id
         const root_post_owner_id = await pool.query(`SELECT user_id FROM posts WHERE id = $1`, [parseInt(root_postId)])

        //  post parent owner id
        const parent_post_owner_id = await pool.query(`SELECT user_id FROM posts WHERE id = $1`, [parseInt(parent_share_id)])

        const root_ownerId = parseInt(root_post_owner_id.rows[0].user_id)
        const parent_ownerId = parseInt(parent_post_owner_id.rows[0].user_id)
        // const originalUserId = newPostAsShare.rows[0].user_id
          
        const sharedPostAndSharer = await pool.query(`
        SELECT
        posts.*,
        posts.id AS post_id,
        posts.parent_share_id,
        posts.root_post_id,
        (posts.root_post_id IS NULL AND posts.parent_share_id IS NULL) as isNot_shared,
    
        sharer.id AS sharer_id,
        sharer.firstname AS sharer_name,
        sharer.profilepicture AS sharer_profile,
        sharer.usertoken As sharer_token,

        -- Original post data as JSON
        (SELECT json_build_object(
            'id', op.id,
            'title', op.title,
            'description', op.description,
            'mediafile', op.mediafile,
            'created_at', op.created_at,
            'owner', json_build_object(
                'id', ou.id,
                'usertoken', ou.usertoken,
                'firstname', ou.firstname,
                'profilepicture', ou.profilepicture,
                'is_owner' , op.user_id = $1
            )
        ) FROM posts op
        JOIN users ou ON ou.id = op.user_id
        WHERE op.id = posts.root_post_id) AS original_post,

        (SELECT COUNT(*) FROM likes WHERE likes.postid = posts.id) AS likes_count,
        (SELECT COUNT(*)  FROM comments WHERE comments.post_id = posts.id) AS comments_count,
        (SELECT COUNT(*)  FROM posts p1 WHERE p1.root_post_id = posts.id) AS total_shares,
        (posts.user_id = $1) AS is_share_post_owner

        FROM posts
        LEFT JOIN users AS sharer ON sharer.id = posts.user_id 
        WHERE posts.parent_share_id  IS NOT NULL AND posts.root_post_id IS NOT NULL

        ORDER BY posts.id DESC 
        `, [req.session.userId])

        if(sharedPostAndSharer.rowCount === 0){
            console.log('no shared file yet !')
        }

         const postOwnerSocket = activeUsers.get(root_ownerId)
         const parentOwnerSocket = activeUsers.get(parent_ownerId)
         const sharedPost =  sharedPostAndSharer.rows[0]
            
            const parentOwner_notif_message = `${user.rows[0].firstname} has shared you post`
            
            const root_notif_message = `${user.rows[0].firstname} has shared you post`
            const postId = newPostAsShare.rows[0].id
         
    try{
       if(root_ownerId === req.session.userId){
            console.log('login user !')
        }else{
            console.log('different user ')
            createNotification(postOwnerSocket,sharedPost, root_notif_message, userId, root_ownerId, postId)
        }

    }catch(error){
        console.log('some error while saving notification and sending them ... ', error)
    }
            

      const sharesCounts = await pool.query(`
    SELECT 
        p1.id as current_post_id,
        p1.parent_share_id as immediate_parent_id,
          -- Count of shares for the immediate parent (if exists)
        (SELECT COUNT(*) FROM posts p2 WHERE p2.parent_share_id = p1.parent_share_id) as parent_shares_count,
      
        -- Get the root post ID using a subquery
        (WITH RECURSIVE find_root AS (
            SELECT id, parent_share_id
            FROM posts WHERE id = $1
            UNION ALL
            SELECT p.id, p.parent_share_id
            FROM posts p
            JOIN find_root fr ON p.id = fr.parent_share_id
        )
        
        SELECT id FROM find_root WHERE parent_share_id IS NULL
        ) as root_post_id,

         -- Count of shares for the root post
        (SELECT COUNT(*) FROM posts p3 
         WHERE p3.root_post_id = (
             WITH RECURSIVE find_root2 AS (
                 SELECT id, parent_share_id
                 FROM posts WHERE id = $1
                 UNION ALL
                 SELECT p.id, p.parent_share_id
                 FROM posts p
                 JOIN find_root2 fr ON p.id = fr.parent_share_id
             )
             SELECT id FROM find_root2 WHERE parent_share_id IS NULL
         )
        ) as root_shares_count
        
         
    FROM posts p1
    WHERE p1.id = $1
`, [newPostAsShare.rows[0].id]);

        if(sharesCounts.rowCount === 0) console.log('no root id found')

       
        res.json({
            sharedPost : sharedPostAndSharer.rows[0],
            message : 'file shared successfully !',
            success : true,
            root_parent_sharesCount : sharesCounts.rows[0],
        })
})

// CREATE NOTIFICATION FUNCTION 

async function createNotification(receiver,sharedPost,message,userId,ownerId,postId) {
  // This waits for completion
  const newNotification = await pool.query(`INSERT INTO notifications 
        (type,message,from_userid,receiver_id,post_id)
        VALUES($1,$2,$3,$4,$5) RETURNING *; `, ['Share',message,userId,ownerId,postId])

     // Get updated count AFTER insertion
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM notifications WHERE receiver_id = $1 AND is_seen = $2`,
    [ownerId,false]
  );
  
    const notificationData = newNotification.rows[0]
  const unreadCount = parseInt(countResult.rows[0].count);

  
  // This fires and continues immediately (non-blocking)
  io.to(receiver).emit('share_root_notify', {
    shareMessage :  notificationData.message,
    shareTime : notificationData.timestamp,
    sharePostId : notificationData.post_id,
    sharedPost,
    notifsCount: unreadCount 
  });

  // Return whatever you need for your application logic

  return notificationData
         
}

// edit post sharer
app.get('/api/editPost/:post_id', validateLogin, async(req,res)=>{
    const postId = parseInt(req.params.post_id)
 
    const post = await pool.query(`SELECT * FROM posts WHERE id = $1`, [postId])
    if(post.rowCount === 0) return res.status(404).json({message : 'not found post'})
     console.log(post.rows[0])
     res.json({
         post : post.rows[0],
         success : true
     })
 })


app.patch('/api/update/message/:postId', validateLogin, async(req,res)=>{
    const postId = parseInt(req.params.postId);
    const {sharer_message} = req.body;
    // const userId = req.session.userId;
    const findSharePost = await pool.query('SELECT * FROM posts WHERE id = $1;',[postId])

        const updatedPostTitle = await pool.query(`UPDATE posts SET title = $1 WHERE id = $2 RETURNING *;`, [sharer_message,postId])

         if(updatedPostTitle.rowCount === 0) return res.status(404).json({error : 'update data not found'})

            res.json({
                updated_message : updatedPostTitle.rows[0],
                message : 'post successfully updated !',
                success : 'true'
            })
})

// notifications

app.get('/api/allNotifications', validateLogin, async(req,res)=>{

    const myNotifications = await pool.query(`SELECT * FROM notifications 
        WHERE receiver_id =  $1`, [req.session.userId])
    
    if(myNotifications.rowCount > 0){

        const unSeenNotifs = await pool.query(`SELECT COUNT(id) FROM notifications WHERE is_seen  = $1 AND receiver_id = $2`,[false,req.session.userId])

        if(unSeenNotifs.rowCount === 0) {
            console.log({message : 'no notifications yet '})
        }
         return res.json({
            notifications : myNotifications.rows,
            success : true,
            notSeen_notifs : unSeenNotifs.rows[0]
         })
    }

    res.json({empty_message : 'NO notifications for Now !'})
})

// chat 

app.get('/api/chatpage/:id/:token', validateLogin, async(req,res)=>{
    const receiverId = parseInt(req.params.id)
    const token = req.params.token
    res.sendFile(basedir + 'chatpage.html')
})


// load all messasges on page start with details
app.get('/api/allChats/:receiverId/:token', validateLogin, async(req,res)=>{
    const receiverId = parseInt(req.params.receiverId);
    const senderId = req.session.userId;
     
    const senderName = await pool.query(`SELECT firstname FROM users WHERE id = $1`, [receiverId])

    if(senderName.rowCount === 0) return res.json({error : 'receiver not found'})


    // const receiverToken = req.params.token;
    const initialChats = await pool.query(`SELECT * FROM chats WHERE (sender_id = $1 AND receiver_id = $2)
        OR
     (sender_id = $2 AND receiver_id = $1)`,[senderId, receiverId])

    if(initialChats.rowCount === 0) console.log('no chat yet !')

    res.json({
        chats : initialChats.rows,
        success : true,
        sender : senderName.rows[0]
    })
})

// list all chats of the user
app.get('/api/userChatList', validateLogin, async(req,res)=>{  
    const loggedInUserId = req.session.userId;
    //  return console.log(loggedInUserId)
    const allChats = await pool.query(`SELECT chats.*,
        sender.id as sender_id, 
        sender.firstname as sender_name,
        sender.usertoken as sender_token,
        receiver.id as receiver_id , 
        receiver.firstname as receiver_name,
        receiver.usertoken as receiver_token
        FROM chats 
        LEFT JOIN users AS sender ON sender.id = chats.sender_id
        LEFT JOIN users AS receiver ON receiver.id = chats.receiver_id
         WHERE 
        (chats.receiver_id = $1) OR (chats.sender_id = $1)
        ORDER BY chats.created_at DESC`, [loggedInUserId])

        if(allChats.rowCount === 0) return res.json({emptyMessage : 'no chats for this user'})

            // return console.log("chats ",allChats.rows)
        res.json({
            chats : allChats.rows,
            success : true
        })
})  


app.get('/api/chatsCount',validateLogin,async(req,res)=>{
   
    const chatsCount = await pool.query(`
    SELECT * FROM chats WHERE 
    receiver_id = $1 AND is_read = false`, [req.session.userId])

    if(chatsCount.rowCount === 0){
        console.log('no new messages ')
        return res.json({message : 'no new chats'})
    } 
    

    res.json({
      totalUnreadChats : chatsCount.rowCount,   
      success : true
    })
})


// mark chats seen 

app.patch('/api/chats/update/isRead', validateLogin, async(req,res)=>{
    const conversationId = parseInt(req.body.id)

   console.log(conversationId)

    const seenChats = await pool.query(`UPDATE chats SET is_read = true
        WHERE chats.conversation_id = $1 AND
        chats.is_read = false RETURNING *`, [conversationId])

    if(seenChats.rowCount === 0) return console.log('failure updating the unseen chats ')
    
    res.json({
        success : true,
        message : 'chats marked as seen !',
        udatedConversation : seenChats.rows[0]
    })
})

// getting community

app.get('/api/users/community', validateLogin, async(req,res)=>{
    const community = await pool.query(`SELECT * FROM users 
        ORDER BY 
        is_active DESC,
        active_at DESC`)

    if(community.rowCount === 0){
        return res.json({
            message : 'no user has joined yet ! be patient',
        })
    }

    res.json({
        community_users : community.rows,
        success : true
    })
})

// create new conversation

app.post('/api/conversation/new',validateLogin, async(req,res)=>{
    const userId2 = parseInt(req.body.userId2);
     console.log(typeof userId2, userId2, req.session.userId)

    const exisingConversation = await pool.query(
        `SELECT * FROM conversations 
         WHERE 
         (sender_id = $1 AND receiver_id = $2)
            OR
          (sender_id = $2 AND receiver_id = $1)
         `,[req.session.userId,userId2])

    if(exisingConversation.rowCount === 0) {
        const newConversation = await pool.query(`
        INSERT INTO conversations (sender_id,receiver_id)
        VALUES($1, $2) RETURNING *; `, [req.session.userId, userId2])

    if(newConversation.rowCount === 0) {
        return res.json({
            error : 'failed  to insert into conversation ',
            success  : false
        })
    }
    
    return res.json({
        message : 'new conversation made',
        success : true,
        conversation : newConversation.rows[0]
    })

    }else {
        return res.json({
            conversation : exisingConversation.rows[0],
            message : 'conversation already under coverage , proceed !',
            success : true
        })
    }
})

// CHATS 
function validateLogin(req,res,next){
    if(!req.session.userId){
        return res.redirect('/api/login')
    }
    next()
}

// pool.query('ALTER TABLE users ADD COLUMN active_at TIMESTAMPTZ DEFAULT NOW()').then(data => console.log(console.log('is active created')))

// pool.query(`CREATE TABLE conversations (
//     id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
//     sender_id INTEGER REFERENCES users(id), 
//     receiver_id INTEGER REFERENCES users(id),
//     created_at timestamp default now(),
//     UNIQUE(sender_id,receiver_id))`
// ).then(data => console.log('new tbale created'))

// pool.query(`create index if not exists idx_chats_conversation_id 
//     ON chats(conversation_id)
//     `
// ).then(data => console.log('index added success')).catch(error => console.log(error))

// pool.query(`ALTER TABLE shares
//     ADD CONSTRAINT fk_shares_user_token
//     FOREIGN KEY (user_token) 
//     REFERENCES users(usertoken)
//     ON DELETE SET NULL`).then(()=> console.log('deleted users')).catch((err)=>{
//     console.log(err)
// })
// all tables

// shares

// pool.query(`SELECT conname
// FROM pg_constraint
// WHERE conrelid = 'shares'::regclass;`).then(data => console.log(data)).catch((err)=> console.log(err))

// pool.query(`CREATE TABLE IF NOT EXISTS shares 
//     (id SERIAL PRIMARY KEY, 
//      post_id INTEGER REFERENCES posts(id) ON CASCADE DELETE,
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

// pool.query(`ALTER TABLE notifications
//     DROP CONSTRAINT IF EXISTS posts_id_fkey,
//   ADD CONSTRAINT posts_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE`).then(()=>{
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

// pool.query(`CREATE TABLE IF NOT EXISTS notifications 
//     (id  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
//      type VARCHAR(255),
//      message TEXT,
//      timestamp TIMESTAMPTZ DEFAULT now(),
//      from_userId INTEGER REFERENCES users(id),
//      receiver_id INTEGER REFERENCES users(id) 
//     )`).then(data =>{
//         console.log('table created success')
//     }).catch((err) =>console.log(err))

// pool.query(`ALTER TABLE shares
//     ADD CONSTRAINT fk_user_token
//     FOREIGN KEY (user_token) REFERENCES users(usertoken)`
// ).then(() =>console.log('COSNTRAINT conditionaly set !')).catch(err =>console.log(err))

// pool.query(`ALTER TABLE users ADD COLUMN joined_at 
//     timestamptz default now()`).then(console.log('new column success')).catch((err)=>{
//         console.log(err)
//     })

// pool.query(`ALTER TABLE posts drop column shared_post_id`).then(console.log('post id')).catch(err => {
//     console.log(err)
// });


//    pool.query(`ALTER TABLE users ALTER COLUMN created_at TYPE timestamptz USING created_at::timestamptz`).then(()=>console.log('is_seen column added')).catch((err)=>console.log(err))


const listeningPort=  3000
server.listen(listeningPort, ()=>{
    console.log('runnin in ' + listeningPort)
})

