var express = require("express");
const router = express.Router();

var exe = require("../connection");



//login admin
router.get("/login", (req, res) => {
  res.render("admin/login.ejs");
});

router.post("/adminlogin", async (req, res) => {
  const { adminemail, adminpass } = req.body;
  var sql = `select* from admin where Email=? AND Password=?`;
  var d = await exe(sql, [adminemail, adminpass]);

  if (d.length > 0) {
    req.session.admin_id = d[0].Id;
    req.session.admin_name = d[0].Name;
    res.redirect("/admin");
  } 
  else {
    res.redirect("/admin/login");
  }
});






//create admin
router.get("/sign", (req, res) => {
  if (req.session.admin_id) {
    res.render("admin/signup.ejs");
  } 
  else {
    res.redirect("/admin/login");
  }
});
//insert
router.post("/saveadmin", async (req, res) => {
  if (req.session.admin_id) {
    const { adminname, adminemail, adminno, adminpass, admindesc } = req.body;
    var sql = `insert into admin(Name,Email,Number,Password,Description) values(?,?,?,?,?)`;
    var values = [adminname, adminemail, adminno, adminpass, admindesc];
    await exe(sql, values);
    res.redirect("/admin/profile");
  } 
  else {
    res.redirect("/admin/login");
  }
});

//delete admin
router.get('/deladmin/:id',async(req,res)=>{
    if (req.session.admin_id) {
        var id=req.params.id;
        var sql=`delete from admin where Id=?`;
        await exe(sql,[id]);
        res.redirect("/admin/profile");
    }
    else {
        res.redirect("/admin/login");
    }
})

//update admin
router.post('/updateadmin',async(req,res)=>{
     if(req.session.admin_id){

        var id=req.session.admin_id;
        const {adminname,adminemail,adminno,adminpass,admindesc}=req.body;

        var sql=`update admin set Name=?, Email=?, Password=?, Description=? where Id=?`;
        var values=[adminname,adminemail,adminno,adminpass,admindesc,id];

        await exe(sql,values);
        res.redirect('/admin/profile')
     }
     else {
        res.redirect("/admin/login");
    }
})


//profile admin
router.get("/profile", async(req, res) => {
  if (req.session.admin_id) {
    var sql=`select* from admin where Id=?`;
    var d=await exe(sql,[req.session.admin_id]);
    res.render("admin/profile.ejs",{data:d[0]});
  } 
  else {
    res.redirect("/admin/login");
  }
});

//logout admin
router.get("/logout", (req, res) => {
  if (req.session.admin_id) {
    req.session.admin_id = "";
  }
  res.redirect("/");
});





//home admin
// user
router.get("/", async (req, res) => {
    if (req.session.admin_id) {
      var sql = `select* from user`;
      var d = await exe(sql);
      res.render("admin/index.ejs", { data: d });
    } 
    else {
      res.redirect("/admin/login");
    }
  });
  
  //view user profile
  router.get("/view/:id", async(req, res) => {
    if (req.session.admin_id) {
      var id=req.params.id;

      var sql=`select* from cart where user_id=?`;
      var d=await exe(sql,[id]);
      //total price add to cart
      var sql2=`select sum(Price * quantity) as Total from cart where user_id=?`;
      var d1=await exe(sql2,[id]);
      
      res.render("admin/shoppingcart.ejs",{data:d,total:d1[0].Total});
    } 
    else {
      res.redirect("/admin/login");
    }
  });
  
  // delete user
  router.get("/del/:id", async (req, res) => {
    if (req.session.admin_id) {
      var id = req.params.id;
      var sql = `delete from user where id=?`;
      await exe(sql, [id]);
      res.redirect("/");
    } 
    else {
      res.redirect("/admin/login");
    }
  });
  



//collections
router.get("/collections", async (req, res) => {
  if (req.session.admin_id) {
    //collections
    var sql = `select* from collections`;
    var d1 = await exe(sql);

    //accessories
    var sql2 = `select* from accessories`;
    var d2 = await exe(sql2);

    const obj = { data: d1, data1: d2 };
    res.render("admin/collection.ejs", obj);
  } 
  else {
    res.redirect("/admin/login");
  }
});

//insert
router.post("/savecoll", async (req, res) => {
  if (req.session.admin_id) {
    const { coll_name, coll_price } = req.body;

    var files = req.files.coll_img;
    var filename = new Date().getTime() + "_" + files.name;
    files.mv("public/uploads/" + filename);

    var sql = `insert into collections(Name,Price,Image) values(?,?,?)`;
    await exe(sql, [coll_name, coll_price, filename]);
    res.redirect("/admin/collections");
  } 
  else {
    res.redirect("/admin/login");
  }
});

// delete
router.get("/del_coll/:id", async (req, res) => {
  if (req.session.admin_id) {
    var id = req.params.id;
    var sql = `delete from collections where Id=?`;
    await exe(sql, [id]);
    res.redirect("/admin/collections");
  } 
  else {
    res.redirect("/admin/login");
  }
});

//update
router.get("/edit_coll/:id", async (req, res) => {
  if (req.session.admin_id) {
    var id = req.params.id;
    var sql = `select* from collections where Id=?`;
    var d = await exe(sql, [id]);
    res.render("admin/editColl.ejs", { data: d[0] });
  } 
  else {
    res.redirect("/admin/login");
  }
});
router.post("/updatecoll", async (req, res) => {
  if (req.session.admin_id) {
    const { coll_id, coll_name, coll_price } = req.body;

    if (req.files) {
      var file = req.files.coll_img;
      var filename = new Date().getTime() + "_" + file.name;
      file.mv("public/uploads/" + filename);
      var sql = `update collections set Image=? where Id=?`;
      await exe(sql, [filename, coll_id]);
    }

    var sql = `update collections set Name=?, Price=? where Id=?`;
    await exe(sql, [coll_name, coll_price, coll_id]);
    res.redirect("/admin/collections");
  } 
  else {
    res.redirect("/admin/login");
  }
});







//accessories
//insert
router.post("/saveacc", async (req, res) => {
  if (req.session.admin_id) {
    const { acc_name, acc_price } = req.body;

    var files = req.files.acc_img;
    var filename = new Date().getTime() + "_" + files.name;
    files.mv("public/uploads/" + filename);

    var sql = `insert into accessories(Name,Price,Image) values(?,?,?)`;
    await exe(sql, [acc_name, acc_price, filename]);
    res.redirect("/admin/collections");
  } 
  else {
    res.redirect("/admin/login");
  }
});

// delete
router.get("/del_acc/:id", async (req, res) => {
  if (req.session.admin_id) {
    var id = req.params.id;
    var sql = `delete from accessories where Id=?`;
    await exe(sql, [id]);
    res.redirect("/admin/collections");
  } 
  else {
    res.redirect("/admin/login");
  }
});

//update
router.get("/edit_acc/:id", async (req, res) => {
  if (req.session.admin_id) {
    var id = req.params.id;
    var sql = `select* from accessories where Id=?`;
    var d = await exe(sql, [id]);
    res.render("admin/editAcc.ejs", { data: d[0] });
  } 
  else {
    res.redirect("/admin/login");
  }
});

router.post("/updateacc", async (req, res) => {
  if (req.session.admin_id) {
    const { acc_id, acc_name, acc_price } = req.body;
    if (req.files) {
      var file = req.files.acc_img;
      var filename = new Date().getTime() + "_" + file.name;
      file.mv("public/uploads/" + filename);

      var sql = `update accessories set Image=? where Id=?`;
      await exe(sql, [filename, acc_id]);
    }

    var sql = `update accessories set Name=?, Price=? where Id=?`;
    await exe(sql, [acc_name, acc_price, acc_id]);
    res.redirect("/admin/collections");
  } 
  else {
    res.redirect("/admin/login");
  }
});




module.exports = router;
