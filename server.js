
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
app.use(session({
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
}))

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
app.use('/uploads', express.static('uploads')); 
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

    const profile = req.file? path.join(__dirname,'public/uploads',req.file.filename) : null

    const checkduplicate = await pool.query('SELECT * FROM users WHERE  email = $1', [credentials.email])

    if(checkduplicate.rows.length >0){
        console.log('this credential already registered , please log in')
        return res.send('this credential already registered , please log in')
    }

    const hashedPassword = await bcrypt.hash(credentials.password,10)

    const newUserQuery = `INSERT INTO users (firstname, email, password, profilepicture) VALUES
    ($1,$2,$3,$4) RETURNING *`
    const newUser = await pool.query(newUserQuery, [credentials.fname, credentials.email,hashedPassword,profile])

    if(newUser.rows.length === 0){
        console.log('user did not save !')
        return res.send('user did not save !')
    }

    console.log('welcome to memorydom ', newUser.rows[0].firstname)
    req.session.userId = newUser.rows[0].id
    res.json({
        isLoggedIn : true,
        userId : req.session.userId
    })
})

// pool.query('delete from users').then(()=> console.log('user deleted'))

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
        return res.json({message : 'EMAIL IS NOT REGISTERED '})
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
       return res.send('token is invalid or expired')
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


// posts

app.get('/api/posts', async(req,res)=>{
    const allPosts = await pool.query(`SELECT users.firstname, users.profilepicture, posts.id as post_id,
        posts.title,
        posts.description,
        posts.mediafile,
        posts.created_at,
        COUNT(likes.id) AS likeCounts
        FROM posts
        LEFT JOIN users ON users.id = posts.user_id 
        LEFT JOIN likes ON likes.postid = posts.id 
        GROUP BY 
        users.id,                   
        users.firstname, 
        users.profilepicture,
        posts.id,
        posts.title,
        posts.description,
        posts.mediafile,
        posts.created_at
        ORDER BY posts.created_at DESC`);

    if(allPosts.rows.length === 0 ){
        console.log('no posts found')
        return res.send('no posts found')
    }

    res.json({
        posts : allPosts.rows
    })
    
})

app.get('/api/newPost', validateLogin, (req,res)=>{
    res.sendFile(basedir + 'newpost.html')
})

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
     


    let updatedFile;
    if(req.file){
        updatedFile = await pool.query(`UPDATE posts SET title = $1, description = $2, mediafile = $3 WHERE id = $4 RETURNING *,
        (SELECT COUNT(*) FROM likes WHERE "postid" = posts.id) AS likeCounts`, [newTitle,newDesc,mediaFile,postId])
        
    }else{
       updatedFile = await pool.query('UPDATE posts SET title = $1, description = $2 WHERE id = $3 RETURNING *', [newTitle,newDesc,postId])
    }

    if(updatedFile.rowCount === 0){
        console.log('failure updating the post')
        return res.json({message : 'failure updating the post'})
    }

    console.log('memory updated successfully !', updatedFile.rows[0])
    res.json({
        message : 'memory updated successfully !',
        updatedPost : updatedFile.rows[0]
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
    console.log('the params postiD', id)
    const postExists = await pool.query('SELECT * FROM posts WHERE id = $1', [id])
    if(postExists.rowCount === 0){
        return res.send('post not found')
    }

    // first check if the post is already liked 
    const existedLike = await pool.query('SELECT * FROM likes WHERE postid = $1 AND userid = $2', [id, req.session.userId])
    if(existedLike.rowCount > 0){
        console.log('you have already liked this post')
        return res.json({message : 'post has already been liked'})
    }

    const loggedInUserId = req.session.userId;

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

       console.log(countPostLikes.rows[0].like_counts)
      console.log('post has successfully been liked')
      res.json({
        message : 'you have liked the post',
        postLikes : countPostLikes.rows[0].like_counts
      })
})


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
//     user_id INTEGER REFERENCES users(id),
//     created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`).then(()=> console.log('posts created')).catch((err)=> console.log(err))

// pool.query('alter TABLE users alter column password type TEXT').then(()=>{
//     console.log('COLUMN TYPE UPDATED')

// }).catch((err)=> console.log(err, ' while altering'))

// const likes = pool.query(`CREATE TABLE IF NOT EXISTS likes(id SERIAL PRIMARY KEY,
//                           created_at TIMESTAMP DEFAULT NOW(), 
//                           userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
//                           postId INTEGER REFERENCES posts (id) ON DELETE CASCADE,
//                           UNIQUE(userId, postId))`);

// likes.then(()=>console.log('likes created ')).catch((err)=>{
//     console.log(err)
// })

// thing we will need for production 
// 1: loading functionality till the data loads









const listeningPort=  3000
server.listen(listeningPort, ()=>{
    console.log('runnin in ' + listeningPort)
})

