var express=require('express');
const router=express.Router();
var exe=require('../connection');

// otp
var sendOTP=require('../Email');

router.get('/',(req,res)=>{
    var name="";
    if(req.session.login_id){
        name=req.session.login_name;
    }
    const obj={usernm:name}
    res.render('user/index.ejs',obj);
})



//login
router.get('/sign',(req,res)=>{
    res.render('user/sign.ejs');
})

router.post('/loginuser',async(req,res)=>{
    const {useremail,userpass}=req.body;
    var sql=`select* from user where useremail='${useremail}' AND userpass='${userpass}'`;
    var data=await exe(sql);
    
    if(data.length>0){

        req.session.user_id=data[0].userid;
        req.session.name=data[0].username;

        var otp=Math.trunc(Math.random()*10000);
        req.session.user_otp=otp;

        sendOTP(useremail,data[0].username,otp);

        res.redirect('/accept_otp');
    }
    else{
        res.redirect('/loginuser');
    }
})
router.get('/accept_otp',(req,res)=>{
    if(req.session.user_id){
       res.render('user/acceptOtp.ejs');
    }
    else{
        res.redirect('/loginuser');
    }
})
router.post('/verifyotp',(req,res)=>{
    if(req.body.otp==req.session.user_otp){

        req.session.login_id=req.session.user_id;
        req.session.login_name=req.session.name;
        res.redirect('/');

    }
    else{
        res.redirect('/accept_otp');
    }
})





//create account
router.get('/signup',(req,res)=>{
    var obj={data:{
        username:"",
        useremail:"",
        userpass:"",
        userCpass:"",
        err:""
    }};
    res.render('user/signup.ejs',obj);
})

router.post('/createAccount',async(req,res)=>{
   
    var obj={data:req.body};
   
     var {username,err,useremail,userpass,userCpass}=req.body;
     
     var regex = /^[a-zA-Z0-9!@#$%^&*]{6,16}$/;
     if(userpass!=userCpass){
        req.body.err="Password is Not same!";
        res.render('user/signup.ejs',obj)
     }
     else{
      if(!regex.test(userpass))
      {
        req.body.err="Please Enter Strong Password!";
        res.render('user/signup.ejs',obj)
      }
      else{

         var sql=`insert into user(username,useremail,userpass) values(?,?,?)`;
         var values=[username,useremail,userpass];
         await exe(sql,values);
         res.redirect('/sign');
      }
     }
})



module.exports=router;