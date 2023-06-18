var express = require('express');
var router = express.Router();
var pool = require("./pool");


/* Get the users page */

router.get ('/seatAvailability', (req,res)=>{
  let year = new Date ();
  year = year.getFullYear ();

    pool.query (`select sum(seats) as sum from total_seats where year = ?`,[year], (err,obj)=>{
      if (err){
        console.log (err);
        
        

        res.render ('userPage' , {vacantSeats : "0" , admittedstudents : "0" , update : "NA"});
      }
      
      else{
        pool.query (`select count(*) as count from admittedstudents where year = ?`,[year],(err2,obj2)=>{
          if (err2){
            console.log (err2);
            
            res.render ('userPage' , {vacantSeats : obj[0].sum , admittedstudents : "0" , update : "NA"});
          }
          
          else{
            pool.query ('select * from activity where act = "seats"',(err3,obj3)=>{
              if (err3){
                console.log (err3);
                
                res.render ('userPage' , {vacantSeats : obj[0].sum , admittedstudents : obj2[0].count , update : "NA"});
              }
              
              else{
                console.log (obj , obj2 , obj3)
                res.render ('userPage' , {vacantSeats : obj[0].sum , admittedstudents : obj2[0].count , update : obj3[0].time});
              }

              
                
              })
            }
          })
      }
    })

})



/* Rendering the vacant seats page for users*/

router.get ('/seats',(req,res)=>{

  pool.query (`select * from activity where act = "seats"`,(err,obj)=>{
    if (err){
      console.log (err);

      res.render ('usersVacantSeats', {update : "NA"});
    }
    
    else{
      
      res.render ('usersVacantSeats', {update : obj[0].time});
    }
  })

 
})
module.exports = router;
