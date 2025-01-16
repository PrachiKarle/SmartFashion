var express = require("express");
const router = express.Router();
var exe = require("../connection");
var sendOTP = require("../Email");




//home page
router.get("/", async (req, res) => {
  //username if login
  var name = "";
  if (req.session.login_id) {
    name = req.session.login_name;
  }

  //new arrivals
  var sql = `select* from collections order by Id DESC LIMIT 3;`;
  var d1 = await exe(sql);

  const obj = { usernm: name, data: d1 };
  res.render("user/index.ejs", obj);
});





//customer care page
router.get("/customercare", (req, res) => {
  //username
  var name = "";
  if (req.session.login_id) {
    name = req.session.login_name;
  }

  const obj = { usernm: name };
  res.render("user/customer.ejs", obj);
});

router.post("/savecontact", async (req, res) => {
  //insert  if login
  if (req.session.login_id) {
    const { username, useremail, userno, usermsg } = req.body;

    var sql = `insert into contact(user_id,user_name,user_email,user_no,user_msg) values(?,?,?,?,?)`;
    var values = [req.session.login_id, username, useremail, userno, usermsg];
    await exe(sql, values);

    res.redirect("/");
  }
  //not login
  else {
    res.redirect("/sign");
  }
});





//collections
router.get("/collection", async (req, res) => {
  //username
  var name = "";
  if (req.session.login_id) {
    name = req.session.login_name;
  }

  //collections data
  var sql = `select* from collections`;
  var d1 = await exe(sql);

  const obj = { usernm: name, data: d1 };
  res.render("user/collection1.ejs", obj);
});






// accessories
router.get("/accessories", async (req, res) => {
  //username
  var name = "";
  if (req.session.login_id) {
    name = req.session.login_name;
  }

  //accessories data
  var sql = `select* from accessories`;
  var d1 = await exe(sql);

  const obj = { usernm: name, data: d1 };
  res.render("user/accessories.ejs", obj);
});



//view product
router.get('/view/:id/:tname',async(req,res)=>{
  //username
  var name = "";
  if (req.session.login_id) {
    name = req.session.login_name;
  }

  var id=req.params.id;
  var tnm=req.params.tname;
  var sql=`select* from ${tnm} where Id=?`;
  var d=await exe(sql,[id]);
  res.render('user/viewProd.ejs',{data:d[0],usernm:name,tname:tnm});
})




//add to cart 
router.post('/addtocart',async(req,res)=>{
  if(req.session.login_id){
    const {tname,id,quantity}=req.body;

    var l_id=req.session.login_id;

    var sql1=`select* from ${tname} where Id=?`;
    var d=await exe(sql1,[id]);

    var sql=`insert into cart(user_id,Name,Category,Price,Image,quantity) values(?,?,?,?,?,?)`;
    var values=[l_id, d[0].Name,tname,parseInt(d[0].Price.substr(1)),d[0].Image,quantity];
    await exe(sql,values);
    res.redirect('/cart');
  }
  else {
    res.redirect("/sign");
  }
})


//cart
router.get('/cart',async(req,res)=>{
   //username
   var name = "";

   if(req.session.login_id)
   {
      name = req.session.login_name;
      var id=req.session.login_id;
      var sql=`select* from cart where user_id=?`;
      var d=await exe(sql,[id]);
      
      //total price add to cart
      var sql2=`select sum(Price * quantity) as Total from cart where user_id=?`;
      var d1=await exe(sql2,[id]);
      
      res.render('user/shoppingcart.ejs',{data:d,usernm:name,total:d1[0].Total});
   }
   else{
    res.redirect("/sign");
   }
   
})


//user profile
router.get('/userprofile',async(req,res)=>{
   //username
   var name = "";
    if(req.session.login_id)
    {
          name = req.session.login_name;
          var id=req.session.login_id;
          var sql=`select* from user where id=?`;
          var d=await exe(sql,[id]);
          res.render('user/userProfile.ejs',{usernm:name,data:d[0]});
    }
    else{
      res.redirect("/sign");
    }
})

// update user
router.post('/updateuser',async(req,res)=>{
  if(req.session.login_id)
  {
  
    const {username,useremail,userpass}=req.body;
    var id=req.session.login_id;
    var sql=`update user set username=?,useremail=?,userpass=? where id=?`;
    var values=[username,useremail,userpass,id];
    await exe(sql,values);
    res.redirect('/userprofile');

  }
  else{
      res.redirect("/sign");
  }
})





//login
router.get("/sign", (req, res) => {
  //login form
  res.render("user/sign.ejs");
});

router.post("/loginuser", async (req, res) => {
  const { useremail, userpass } = req.body;

  //check user exists
  var sql = `select* from user where useremail=? AND userpass=?`;
  var data = await exe(sql, [useremail, userpass]);

  // if yes
  if (data.length > 0) {
    //login success
    req.session.user_id = data[0].id;
    req.session.name = data[0].username;

    //generate otp for email verification
    var otp = Math.trunc(Math.random() * 10000);
    req.session.user_otp = otp;

    //send otp 
    sendOTP(useremail, data[0].username, otp);

    res.redirect('/acceptotp');
  } 
  // if not exists then login
  else {
    res.redirect('/sign');
  }
});


router.get('/acceptotp', (req, res) => {
  if (req.session.user_id) {
    res.render("user/acceptOtp.ejs");
  } 
  else {
    res.redirect('/loginuser');
  }
});


router.post("/verifyotp", (req, res) => {
  // check otp
  if (req.body.otp == req.session.user_otp) {
    req.session.login_id = req.session.user_id;
    req.session.login_name = req.session.name;
    res.redirect("/");
  } 
  else {
    res.redirect("/accept_otp");
  }
});





//create account
router.get("/signup", (req, res) => {
  var obj = {
    data: {
      username: "",
      useremail: "",
      userpass: "",
      userCpass: "",
      err: "",
    },
  };
  res.render("user/signup.ejs", obj);
});

router.post("/createAccount", async (req, res) => {

  var obj = { data: req.body };

  var { username, err, useremail, userpass, userCpass } = req.body;

  var regex = /^[a-zA-Z0-9!@#$%^&*]{6,16}$/;

  //if password not matches
  if (userpass != userCpass) {
    req.body.err = "Password is Not same!";
    res.render("user/signup.ejs", obj);
  } 
  else {
    //check strong password
    if (!regex.test(userpass)) {
      req.body.err = "Please Enter Strong Password!";
      res.render("user/signup.ejs", obj);
    } 
    //insert 
    else {
      var sql = `insert into user(username,useremail,userpass) values(?,?,?)`;
      var values = [username, useremail, userpass];
      await exe(sql, values);
      res.redirect("/sign");
    }
  }
});




module.exports = router;
