var express=require('express');
const router =express.Router();

var exe=require('../connection');

router.get('/',async(req,res)=>{
    var sql=`select* from user`;
    var d=await exe(sql);
    res.render('admin/index.ejs',{data:d});
})



//collections
router.get('/collections',async(req,res)=>{
    var sql=`select* from collections`;
    const obj={data:await exe(sql)};
    res.render('admin/collection.ejs',obj);
})

//insert 
router.post('/savecoll',async(req,res)=>{
     const {coll_name,coll_price}=req.body;

     var files=req.files.coll_img;
     var filename=new Date().getTime()+"_"+files.name;
     files.mv('public/uploads/'+filename);

     var sql=`insert into collections(Name,Price,Image) values(?,?,?)`;
     await exe(sql,[coll_name,coll_price,filename]);
     res.redirect('/admin/collections');
})

// delete
router.get('/del_coll/:id',async(req,res)=>{
    var id=req.params.id;
    var sql=`delete from collections where Id=?`;
    await exe(sql,[id]);
    res.redirect('/admin/collections');
})

//update
router.get('/edit_coll/:id',async(req,res)=>{
    var id=req.params.id;
    var sql=`select* from collections where Id=?`;
    var d=await exe(sql,[id]);
    res.render('admin/editColl.ejs',{data:d[0]});
})


module.exports=router;