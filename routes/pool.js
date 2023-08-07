var mysql = require("mysql2");
// var pool = mysql.createPool({
//   host: "localhost",
//   port: 3306,
//   user: "rahul",
//   password: "kake",
//   database: "councelling2",
//   connectionLimit: 100,
// });


// railway sql 
var pool = mysql.createPool({
  host: "containers-us-west-91.railway.app",
  port: 5536,
  user: "root",
  password: "OdZAyqlOOvoeaVSxDzOI",
  database: "railway",
  connectionLimit: 100,
});

module.exports = pool;
