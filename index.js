var express=require('express');
const app=express();

//static file serve
app.use(express.static('public/'));
// req body data
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//file uploading
var upload=require('express-fileupload');
app.use(upload());

//session
var session=require('express-session');
app.use(session({
    resave:true,
    saveUninitialized:true,
    secret:"Prachi"
}))

//user route
var userRoute=require('./routes/userRoute');
app.use('/',userRoute);

//admin route
var adminRoute=require('./routes/adminRoute');
app.use('/admin',adminRoute);


//server start
const PORT=3000 || process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})