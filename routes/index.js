var express = require('express');
const pool = require('./pool');
var router = express.Router();

/* GET home page. */

// User Login Page

router.get('/', function(req, res, next) {
    res.render ('landing');
});


router.get ('/aboutus',(req,res)=>{
  res.render ('aboutUs');
})

// router.get ('/',(Req,res)=>{

//   res.render ('a')
// })

module.exports = router;
