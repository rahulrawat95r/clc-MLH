var mysql = require("mysql");
// var pool = mysql.createPool({
//   host: "localhost",
//   port: 3306,
//   user: "webmits",
//   password: "Web@mits123",
//   database: "clc",
//   connectionLimit: 100,
// });

var pool = mysql.createPool ({
  host : "localhost",
  port : 3306,
  user : "rahul",
  password : "kake",
  database : "councelling2",
  connectionLimit : 200
})

module.exports = pool;
