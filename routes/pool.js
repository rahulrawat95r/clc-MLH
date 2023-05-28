var mysql = require("mysql");
var pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "rahul",
  password: "kake",
  database: "councelling2",
  connectionLimit: 100,
});

module.exports = pool;
