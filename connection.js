var mysql=require('mysql');

var conn=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'Fashion',
    port:3306
})

conn.connect((err,data)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log(data);
    }
})

var util=require('util');
var exe=util.promisify(conn.query).bind(conn);
module.exports=exe;