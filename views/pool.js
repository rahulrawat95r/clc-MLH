var mysql = require("mysql");
var pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "webmits",
  password: "web@mits123",
  database: "councelling",
  connectionLimit: 100,
});

module.exports = pool;
