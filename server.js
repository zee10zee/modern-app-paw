
import express from "express"
import {Server} from "socket.io"
import http from "http"
import ejs from "ejs"
import session from "express-session"
import pkg from "pg"
import path from "path"
import { fileURLToPath } from "url"
import multer, { diskStorage } from "multer"
import { existsSync } from "fs"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import crypto from "crypto"
import bcrypt from "bcrypt"

dotenv.config()


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
console.log(__dirname)// giving me the absolute path from the the root folder of my pc till the file i am in. D:\webDev\node js\memoryDomWithChat\server.js
const app = express()
const server = http.createServer(app)
const io = new Server(server)
const {Pool} = pkg;

const db = {
    user : 'postgres',
    host : 'localhost',
    database : 'memoryDomDB',
    password : 'Zohrajan10@',
    port : 5432,
}

const pool = new Pool(db)

app.use(session({
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
        cb(null, 'public/uploads')
    },
    filename : function(req,file,cb){
        const customeName = Date.now() +"-" +Math.floor(Math.random() * 10)
        cb(null, customeName + file.originalname)
    }
});



const upload = multer({
    storage : storage
})
// function checkLoginUser(req,res,next){
//     if(req.session.userId){
//         res.locals.loggedInUser = req.session.userId; 
//     }
//     next()
// }

app.use(express.static(path.join(__dirname,'public')))
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
    (LOWER($1),LOWER($2),LOWER($3),$4) RETURNING *`
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

// check login route
app.get('/checklogin',(req,res)=>{
    res.json({
        // !! turns any value into strict boolean
        isLoggedIn : !!req.session.userId
    })
})

// login route

app.post('/api/login', async(req,res)=>{
    const credentials = {
        email : req.body.email,
        password : req.body.password
    }

    try{
        const checkQuery = `SELECT * FROM users WHERE email = $1 AND password = $2`
    const ExistingUser = await pool.query(checkQuery, [credentials.email, credentials.password])

    if(ExistingUser.rows.length === 0){
        console.log('user not found')
        return res.send('please sign up first')
    }

    console.log('welcome back ', ExistingUser.rows[0].firstname)
    req.session.userId = ExistingUser.rows[0].id
  res.json({
    isLoggedIn : true,
    message : 'welcome back user ' + ExistingUser.rows[0].firstname
  })
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
        user : process.env.APPEMAIL|| 'abedkhan.noori10@gmail.com',
        pass : process.env.APPPASSWORD || 'jisvgxxjvgognoch'
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

// pool.query('delete from tokens').then(()=> console.log('cleared tokens')).catch((err) => console.log(err.stack))

app.post('/api/passwordForgot', async (req,res)=>{
    const email = req.body.forgottenEmail
    console.log(email)
try{
    const existingEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if(existingEmail.rows.length === 0){
        console.log('email not found')
        return res.send('EMAIL IS NOT REGISTERED ')
    }
    
        // creating token
    const token = crypto.randomBytes(32).toString('hex')
     console.log("random token ",token)

    // creating reset Link
    const resetLink = `http://localhost:3000/api/passwordReset/${token}`
    console.log(resetLink)
    const description = `<p>click here to reset the password : <a href="${resetLink}">Reset password</a>`

   const existingToken = await pool.query('SELECT * FROM tokens WHERE token = $1', [token])

     if(existingToken.rowCount > 0){
        console.log('this  token is expired')
        return console.log('this token is expired')
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
    res.sendFile(basedir + 'resetPassword.html');
});

app.post('/api/passwordReset/:token', async(req,res)=>{
   const token = req.params.token
   const {newPassword, confirmPassword} = req.body;
   console.log(newPassword, confirmPassword)

   const checkToken = await pool.query('SELECT * FROM tokens WHERE token = $1', [token])
   const tokenRow = checkToken.rows[0]

//    || condition and new Date()
   if( !tokenRow && tokenRow.expires_at){
       console.log('token is invalid or expired')
       return res.send('token is invalid or expired')
   }
   if(confirmPassword !== newPassword){
      console.log('confirm password does not match the new passweord')
      return res.send('confirm password does not match the new password')
   }

//    const hashedPassword = await bcrypt.hash(newPassword,4)
    // console.log(hashedPassword)
   const newPasswordd = await pool.query(`UPDATE users SET password = $1 WHERE id = $2 RETURNING *`, [newPassword, tokenRow.user_id]);


   if(newPasswordd.rowCount === 0){
      console.log('failure in saving reset password')
      return res.send('reset password fiaulre to save')
   }

   console.log('password updated successfully !')
   res.json({
    message : 'password updated successfully !'
   })
})




function validateLogin(req,res,next){
    if(req.session.userId){
        next()
    }else{
        res.redirect('/api/login')
    }
}


// pool.query('delete from users').then(()=> console.log('deleted users')).catch((err)=>{
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
//      user_id INTEGER REFERENCES users(id))`
//     ).then(()=>{
//         console.log('token table created')
//     }).catch((err)=> console.log(err))


// pool.query('alter TABLE tokens drop column expiryTime').then(()=>{
//     console.log('new column deleted')

// }).catch((err)=> console.log(err, ' while altering'))












const port = process.env.port || 3000
server.listen(port, ()=>{
    console.log('runnin in ' + port)
})

