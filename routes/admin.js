var express = require("express");
var router = express.Router();
var pool = require("./pool");
var multer = require("multer");
const { v4: uuid, parse } = require("uuid");
var imgname;
var aes256 = require("aes256");
var passkey = "MITSCOUNCELLING";
var imgname = "";
var ExcelToCSV = require("../public/assets/js/ExcelToCSV.js");
var logger = require("../controller/logger");
var ip = require("ip");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const axios = require('axios');
const fs = require('fs');
const path = require ('path');





/* Function for getting the current date and time in formatted manner */

function getFormattedDateTime() {
  const currentDate = new Date();
  
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  return formattedDateTime;
}

/* For storing the images from the google url to server */

function saveImageUrl (imageUrl, imageName){
  const imagePath = path.join('./public/assets/images/admin', imageName);

  axios({
    url: imageUrl,
    responseType: 'stream'
  })
    .then(response => {
      response.data.pipe(fs.createWriteStream(imagePath));
      return new Promise((resolve, reject) => {
        response.data.on('end', resolve);
        response.data.on('error', reject);
      });
    })
    .then(() => {
      // console.log('Image downloaded and saved successfully.');
    })
    .catch(error => {
      console.error('Error downloading and saving the image:', error);
    });
}


/* Multer Storage */

/* For storing IMages  */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/images/admin");
  },
  filename: function (req, file, cb) {
    let ext = file.originalname.split(".");
    ext = ext[ext.length - 1];

    let filename = uuid() + "." + ext;
    imgname = filename;
    cb(null, filename);
  },
});

/* For storing excel files  */
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/assets/files");
  },
  filename: function (req, file, cb) {
    let ext = file.originalname.split(".");
    ext = ext[ext.length - 1];
    cb(null, file.fieldname + "." + ext);
  },
});

const uploadImg = multer({ storage: storage });
const uploadExcel = multer({ storage: storage2 });

//  Rendering creating new Admins Pagee   D

router.get("/addAdminPage", (req, res) => {
  if (req.session.username) {
    if (req.session.type == "Super Admin") {
      let year = new Date ();
      year = year.getFullYear ();

      pool.query("Select * from `adminlogin` where year = ?",  [year] , (err, obj) => {
        if (err) {
          console.log(err);

          let mes = `| Request -> /admin/addAdminPage | IP -> ${req.ip} | DataBase Error | Admin -> ${req.session.username} |`;
          logger.customLogger.log("error", mes);

          res.render("login", { errorBox: " Server Error !" });
        } else {
          for (i = 0; i < obj.length; i++) {
            obj[i].password = aes256.decrypt(passkey, obj[i].password);

            if (obj[i].type == "Super") {
              obj[i].type = "Super Admin";
            }
          }

          let mes = `| Request -> /admin/addAdminPage | IP -> ${req.ip} | New Admin Page Rendered | Admin -> ${req.session.username} |`;
          logger.customLogger.log("info", mes);

          res.render("addAdmin", {
            data: obj,
            adminImg: req.session.profile,
            adminName: req.session.name,
            adminType: req.session.type,
          });
        }
      });
    } else {
      let mes = `| Request -> /admin/addAdminPage | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);

      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    let mes = `| Request -> /admin/addAdminPage | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);

    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Username checking API  used in { addAdmin }    D*/

router.get("/checkUsernameApi", (req, res) => {
  if (req.session.username) {
    if (req.session.type == "Super Admin") {

      let year = new Date ();
      year = year.getFullYear();
      // console.log (req.query.username)
      pool.query(
        "SELECT `username` from `adminlogin` where username = ? and year = ?",
        [req.query.username , year],
        (err, obj) => {
          if (err) {
            console.log(err);

            let mes = `| Request -> /admin/checkUsernameApi | IP -> ${req.ip} | DataBase Error | Admin -> ${req.session.username} |`;
            logger.customLogger.log("error", mes);

            res.send({ error: "A Database Error Has Occured !" });
          } else {
            // console.log (obj);
            if (obj.length == 0) {
              let mes = `| Request -> /admin/checkUsernameApi | IP -> ${req.ip} | Username Checked | Admin -> ${req.session.username} |`;
              logger.customLogger.log("info", mes);

              res.send({ status: 0 });
            } else {
              let mes = `| Request -> /admin/checkUsernameApi | IP -> ${req.ip} | Username Checked | Admin -> ${req.session.username} |`;
              logger.customLogger.log("info", mes);
              // Username Already Present
              res.send({ status: 1 });
            }
          }
        }
      );
    } else {
      let mes = `| Request -> /admin/checkUsernameApi | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);
      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    let mes = `| Request -> /admin/checkUsernameApi | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Admin Creation Form  D*/

router.post("/createAdminForm", uploadImg.single("img"), (req, res) => {
  if (req.session.username) {
    if (req.session.type == "Super Admin") {
      const text = req.body;

      let pass = aes256.encrypt(passkey, text.password);

      /* If no image is there then put account pic as mits logo */
      if (imgname == "") {
        imgname = "mitsLogo.png";
      }

      let year = new Date ();
      year = year.getFullYear ();

      pool.query(
        "INSERT INTO `adminlogin` (`name`, `username`, `password`, `profile`, `type`,`active` , year) values (?,?,?,?,?,'Y',?)",
        [text.name, text.username, pass, imgname, text.acctype , year],
        (err, obj) => {
          if (err) {
            console.log(err);
            imgname = "";

            let mes = `| Request -> /admin/createAdminForm | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
            logger.customLogger.log("error", mes);
            res.redirect("/admin/addAdminPage");
          } else {
            imgname = "";
            let mes = `| Request -> /admin/createAdminForm | IP -> ${req.ip} | Rendering Admin Creation Form | Admin -> ${req.session.username} |`;
            logger.customLogger.log("info", mes);
            res.redirect("/admin/addAdminPage");
          }
        }
      );
    } else {
      imgname = "";
      let mes = `| Request -> /admin/createAdminForm | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);
      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    imgname = "";

    let mes = `| Request -> /admin/createAdminForm | IP -> ${req.ip} | No Login | `;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});



/* First Super Admin Creator */


router.get ('/superadmincreatorpage',(req,res)=>{
    res.render ('superAdmin');
})

router.post("/firstSuperAdmin", uploadImg.single("img"), (req, res) => {

    
      const text = req.body;

      if (text.code == "MITSCOUNCELLINGADMIN"){

        pool.query ('select * from adminlogin where username = ?',[text.username],(err2,obj2)=>{
          if (err2){
            console.log (err2);

            imgname = "";
  
            let mes = `| Request -> /admin/createAdminForm | IP -> ${req.ip} | Database Error | `;
            logger.customLogger.log("error", mes);
            res.render("login", { errorBox: "Server Error !" });


          }

          else if (obj2.length == 0){
            let pass = aes256.encrypt(passkey, text.password);
  
        /* If no image is there then put account pic as mits logo */
            if (imgname == "") {
              imgname = "mitsLogo.png";
            }
      
            let year = new Date ();
            year = year.getFullYear ();
      
            pool.query(
              "INSERT INTO `adminlogin` (`name`, `username`, `password`, `profile`, `type`,`active`, year) values (?,?,?,?,?,'Y',?)",
              [text.name, text.username, pass, imgname, "Super Admin", year],
              (err, obj) => {
                if (err) {
                  console.log(err);
                  imgname = "";
      
                  let mes = `| Request -> /admin/createAdminForm | IP -> ${req.ip} | Database Error | `;
                  logger.customLogger.log("error", mes);
                  res.render("login", { errorBox: "Server Error !" });

                } else {
                  imgname = "";
                  let mes = `| Request -> /admin/createAdminForm | IP -> ${req.ip} | First Super ADmin Created | `;
                  logger.customLogger.log("info", mes);
                  res.redirect("/admin/login");
                }
              }
            );
          }

          else{
            
            imgname = "";

            let mes = `| Request -> /admin/firstSuperAdmin | IP -> ${req.ip} | Admin Already Registered |`;
            logger.customLogger.log("error", mes);

            res.render("login", { errorBox: "Admin Already Registered !" });
          }
        })

        
      }

      else{
        imgname = "";

        let mes = `| Request -> /admin/firstSuperAdmin | IP -> ${req.ip} | INVALID CODE |`;
        logger.customLogger.log("error", mes);

        res.render("login", { errorBox: "Invalid Code !" });
      }
});

/* Admin Activation or Deactivation Feature  */

router.post("/adminActivationFeature", (req, res) => {
  if (req.session.username) {
    if (req.session.type == "Super Admin") {
      if (req.body.action == "delete") {
        let year = new Date();
        year = year.getFullYear ();

        pool.query(
          "update `adminlogin` set active = ? where username = ? and year = ?",
          ["N", req.body.username , year],
          (err, obj) => {
            if (err) {
              console.log(err);
              let mes = `| Request -> /admin/adminActivationFeature | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
              logger.customLogger.log("error", mes);
            }

            let mes = `| Request -> /admin/adminActivationFeature | IP -> ${req.ip} | Admin ${req.session.username} Deleted | Admin -> ${req.session.username} |`;
            logger.customLogger.log("info", mes);
            // res.redirect("/admin/addAdminPage");
            res.send ([])

          }
        );
      } else {
        let year = new Date ();
        year = year.getFullYear ();

        pool.query(
          "update `adminlogin` set active = ? where username = ? and year = ?",
          ["Y", req.body.username , year] ,
          (err, obj) => {
            if (err) {
              console.log(err);

              let mes = `| Request -> /admin/adminActivationFeature | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
              logger.customLogger.log("error", mes);
              res.send ([])

            }

            let mes = `| Request -> /admin/adminActivationFeature | IP -> ${req.ip} | Activating ${req.session.username} | Admin -> ${req.session.username} |`;
            logger.customLogger.log("info", mes);
            res.send ([])

            // res.redirect("/admin/addAdminPage");
          }
        );
      }
    } else {
      let mes = `| Request -> /admin/adminActivationFeature | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);
      // res.render("error", {
      //   message: "You are Not Authorized",
      //   error: { status: 500 },
      // });

      res.send ([])
    }
  } else {
    let mes = `| Request -> /admin/adminActivationFeature | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);
    res.send ([])

    // res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Admitting New Student Page  D*/

router.get("/admitStudentPage", (req, res) => {
  if (req.session.username) {
    if (req.session.type != "Accountant" && req.session.type != "Normal") {
      let mes = `| Request -> /admin/admitStudentPage | IP -> ${req.ip} | Rendering Admit new Student Page | Admin -> ${req.session.username} |`;
      logger.customLogger.log("info", mes);

      let errorTerm = "0";
      if (req.query.error == 1){
        errorTerm = "1";
      }

      else if (req.query.error == 2){
        errorTerm = "Student Registered Successfully !";
      }

      res.render("admitNewStudent", {
        adminImg: req.session.profile,
        adminName: req.session.name,
        adminType: req.session.type,
        newStuAlert : errorTerm
      });
    } else {
      let mes = `| Request -> /admin/admitStudentPage | IP -> ${req.ip} | NO Authorization | Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);

      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    let mes = `| Request -> /admin/admitStudentPage | IP -> ${req.ip} | NO Login |`;
    logger.customLogger.log("warn", mes);

    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Searching student using the roll Numebr   D*/

router.get("/searchStudent", (req, res) => {
  if (req.session.username) {
    if (req.session.type != "Accountant" && req.session.type != "Normal") {
      let year = new Date();
      year = year.getFullYear();

      pool.query(
        "SELECT * FROM `merit_list` where `Rollno` = ? and year = ?",
        [req.query.roll, year],
        (err, obj) => {
          if (err) {
            console.log(err);

            let mes = `| Request -> /admin/searchStudent | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
            logger.customLogger.log("error", mes);
            res.send({ status: 0, msg: "Server Error !" });
          } else {
            if (obj.length == 0) {
              let mes = `| Request -> /admin/searchStudent | IP -> ${req.ip} | No Student Found | Admin -> ${req.session.username} |`;
              logger.customLogger.log("info", mes);

              res.send({ status: 0, msg: "Student Not Found !" });
            } else {
              /* Checking whether or not the student has been already admitted  */

              pool.query(
                "select * from `admittedstudents` where jeerollno = ? and year = ?",
                [req.query.roll, year],
                (err2, obj2) => {
                  if (err) {
                    console.log(err);
                    let mes = `| Request -> /admin/searchStudent | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
                    logger.customLogger.log("error", mes);
                    res.send({ status: 0, msg: "Server Error !" });
                  } else {
                    if (obj2.length == 0) {
                      let mes = `| Request -> /admin/searchStudent | IP -> ${req.ip} | Student Found | Admin -> ${req.session.username} |`;
                      logger.customLogger.log("info", mes);

                      res.send({
                        status: 1,
                        msg: "Student Found !",
                        data: obj[0],
                      });
                    } else {
                      let mes = `| Request -> /admin/searchStudent | IP -> ${req.ip} | Student Already Admitted | Admin -> ${req.session.username} |`;
                      logger.customLogger.log("info", mes);
                      res.send({
                        status: 0,
                        msg: "Student Already Admitted !",
                      });
                    }
                  }
                }
              );
            }
          }
        }
      );
    } else {
      let mes = `| Request -> /admin/searchStudent | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);

      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    let mes = `| Request -> /admin/searchStudent | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);

    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Checking Seat Availability for the student admission  */

router.get("/checkAvailability", (req, res) => {
  if (req.session.username) {
    if (req.session.type != "Accountant" && req.session.type != "Normal") {
      let year = new Date();
      year = year.getFullYear();

      let branch = req.query.branch;

      if (req.query.category == "AIUR" || req.query.category == "EWS") {
        pool.query(
          `select seats from clc_councelling2 where category = ? and branch = ? and year = ? `,
          [req.query.category, req.query.branch, year],
          (err, obj) => {
            if (err) {
              console.log(err);

              let mes = `| Request -> /admin/checkAvailability | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
              logger.customLogger.log("error", mes);
              res.send("");
            } else {
              let mes = `| Request -> /admin/checkAvailability | IP -> ${req.ip} | Fetched Available Seats | Admin -> ${req.session.username} |`;
              logger.customLogger.log("info", mes);

              res.send(obj);
            }
          }
        );
      } else {
        branch = branch.split("_");
        let bfinal = "";
        for (i = 0; i < branch.length - 1; i++) {
          bfinal += branch[i] + " ";
        }

        bfinal += branch[i];

        let x =
          "select " +
          req.query.quota.toLowerCase() +
          " from `clc_councelling` where `category` = '" +
          req.query.category +
          "' AND `branch` = '" +
          bfinal +
          "' and year = '" +
          year +
          "'";
        pool.query(x, (err, obj) => {
          if (err) {
            console.log(err);

            let mes = `| Request -> /admin/checkAvailability | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
            logger.customLogger.log("error", mes);
            res.send("");
          } else {
            let mes = `| Request -> /admin/checkAvailability | IP -> ${req.ip} | Fetched Available Seats | Admin -> ${req.session.username} |`;
            logger.customLogger.log("info", mes);

            res.send(obj);
          }
        });
      }
    } else {
      let mes = `| Request -> /admin/checkAvailability | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);

      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    let mes = `| Request -> /admin/checkAvailability | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);

    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Admit Student Form  */

router.post("/admitStudentForm", (req, res) => {
  if (req.session.username) {
    if (req.session.type != "Accountant" && req.session.type != "Normal") {
      const text = req.body;

      let time = new Date();

      let fDate = getFormattedDateTime();

      pool.query (`update activity set time = ? where act = "seats"`,[fDate],(a,b)=>{});


      pool.query(
        "INSERT INTO `admittedstudents`(`jeerollno`, `Candidate_Type`, `name`, `fathersname`, `Phonenumber`, `branch`, `category`, `subcategory`, `feestatus`, `feereceiptno`, `admissiontime`, `gender`, `dob`, `domicile`, `remarks`,`year`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          text.srollNo,
          text.stype,
          text.sname,
          text.sfather,
          text.sphone,
          // text.ssbranch.replaceAll(" ", "_"),   old 

          text.ssbranch.split(" ").join("_"),   // new 
          text.scategory,
          text.ssubcategory,
          "Not Submitted !",
          0,
          time,
          text.sgender,
          text.sdob,
          text.sdomicile,
          text.remarks,
          time.getFullYear(),
        ],
        (err, obj) => {
          if (err) {
            console.log(err);

            let mes = `| Request -> /admin/admitStudentForm | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
            logger.customLogger.log("error", mes);

            res.redirect("/admin/admitStudentPage?error=1");
          } else {
            let cat = text.ssubcategory.split(" ");
            let branch = text.ssbranch;

            if (cat[0] == "AIUR" || cat[0] == "EWS") {
              // console.log (x);
              pool.query(
                `update clc_councelling2 set seats = seats-1 where category = ? and branch = ? and year = ?`,
                [cat[0], branch, time.getFullYear()],
                (err2, obj2) => {
                  if (err) {
                    console.log (err);
                    let mes = `| Request -> /admin/admitStudentForm | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
                    logger.customLogger.log("error", mes);

                    res.redirect("/admin/admitStudentPage?error=1");
                  } else {
                    pool.query(
                      "update `total_seats` set seats = seats - 1 where branch = ? and year = ?",
                      [branch, time.getFullYear()],
                      (err3, obj3) => {
                        if (err3) {
                          console.log (err3)
                          let mes = `| Request -> /admin/admitStudentForm | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
                          logger.customLogger.log("error", mes);

                          res.redirect("/admin/admitStudentPage?error=1");
                        }

                        let mes = `| Request -> /admin/admitStudentForm | IP -> ${req.ip} | Student ${text.srollNo} Admitted | Admin -> ${req.session.username} |`;
                        logger.customLogger.log("info", mes);

                        const io = req.app.get('socketio');
                        io.emit ('refresh_page','refresing');

                        res.redirect("/admin/admitStudentPage?error=2");
                      }
                    );
                  }
                }
              );
            } else {
              branch = branch.split("_");
              let bfinal = "";
              for (i = 0; i < branch.length - 1; i++) {
                bfinal += branch[i] + " ";
              }

              bfinal += branch[i];

              // console.log (cat[1] + cat[2])
              // console.log (bfinal)
              // console.log (text.scategory);

              let x =
                "update clc_councelling set " +
                cat[1].toLowerCase() +
                cat[2].toLowerCase() +
                " = " +
                cat[1].toLowerCase() +
                cat[2].toLowerCase() +
                " - 1 where branch = '" +
                bfinal +
                "' AND category = '" +
                text.scategory +
                "' and year = '" +
                time.getFullYear() +
                "'";
              // console.log (x);
              pool.query(x, (err2, obj2) => {
                if (err2) {
                  console.log(err2);

                  let mes = `| Request -> /admin/admitStudentForm | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
                  logger.customLogger.log("error", mes);

                  res.redirect("/admin/admitStudentPage?error=1");
                } else {
                  pool.query(
                    "update `total_seats` set seats = seats - 1 where branch = ? and year = ?",
                    [bfinal, time.getFullYear()],
                    (err3, obj3) => {
                      if (err3) {
                        console.log(err3);
                        let mes = `| Request -> /admin/admitStudentForm | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
                        logger.customLogger.log("error", mes);

                        res.redirect("/admin/admitStudentPage?error=1");
                      }

                      let mes = `| Request -> /admin/admitStudentForm | IP -> ${req.ip} | Student ${text.srollNo} Admitted | Admin -> ${req.session.username} |`;
                      logger.customLogger.log("info", mes);

                      const io = req.app.get('socketio');
                      io.emit ('refresh_page','refresing');
                      
                      res.redirect("/admin/admitStudentPage?error=2");


                    }
                  );
                }
              });
            }
          }
        }
      );
    } else {
      let mes = `| Request -> /admin/admitStudentForm | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);

      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    let mes = `| Request -> /admin/admitStudentForm | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);

    res.render("login", { errorBox: "Please Login First !" });
  }
});

// Admitted Student Page   D

router.get("/admittedStudentPage", (req, res) => {
  if (req.session.username) {
    let mes = `| Request -> /admin/admittedStudentPage | IP -> ${req.ip} | Admitted Student Page Rendered | Admin -> ${req.session.username} |`;
    logger.customLogger.log("info", mes);

    res.render("admittedStudent", {
      adminImg: req.session.profile,
      adminName: req.session.name,
      adminType: req.session.type,
    });
  } else {
    let mes = `| Request -> /admin/admittedStudentPage | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Admitted Student Data API */

router.get("/admittedStudentData", (req, res) => {
  if (req.session.username) {
    pool.query(
      "select row_number() over (order by `admissiontime`) as sno, `jeerollno`, `Candidate_Type`, `name`, `fathersname`, `Phonenumber`, `branch`, `category`, `subcategory`, `feestatus`, `feereceiptno`, `admissiontime`, `gender`, `dob`, `domicile`, `remarks` from `admittedstudents` where year = ?",
      [req.query.year],
      (err, obj) => {
        if (err) {
          console.log(err);

          let mes = `| Request -> /admin/admittedStudentData | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
          logger.customLogger.log("error", mes);
          res.render("login", { errorBox: " Server Error !" });
        } else {
          for (i = 0; i < obj.length; i++) {
            let cat = obj[i].subcategory;
            cat = cat.replaceAll(" ", "~");
            // console.log (cat);
            obj[i]["delete"] =
              '<button class="btn btn-danger" onclick=DeleteAlert("/admin/deleteAdmitted?roll=' +
              obj[i].jeerollno +
              "&branch=" +
              obj[i].branch +
              "&category=" +
              cat +
              "&year=" +
              req.query.year +
              '");>Delete</button>';
            // console.log (obj[i])
          }

          let mes = `| Request -> /admin/admittedStudentData | IP -> ${req.ip} | Fetched Admitted Student Data | Admin -> ${req.session.username} |`;
          logger.customLogger.log("info", mes);
          res.send(obj);
        }
      }
    );
  } else {
    let mes = `| Request -> /admin/admittedStudentData | IP -> ${req.ip} | NO Login | `;
    logger.customLogger.log("warn", mes);

    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Deleting an admitted student */

router.get("/deleteAdmitted", (req, res) => {
  if (req.session.username) {
    if (req.session.type != "Accountant" && req.session.type != "Normal") {
      let branch = req.query.branch.replaceAll("_", " ");
      let year = new Date();
      year = req.query.year;

      let fDate = getFormattedDateTime();

      pool.query (`update activity set time = ? where act = "seats"`,[fDate],(a,b)=>{});

      pool.query(
        "delete from `admittedstudents` where `jeerollno` = ? and year = ?",
        [req.query.roll, year],
        (err, obj) => {
          if (err) {
            console.log(err);
            
            let mes = `| Request -> /admin/deleteAdmitted | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
            logger.customLogger.log("error", mes);

            // res.render("error", {
            //   message: "Server Error !",
            //   error: { status: 500 },
            // });

            res.send ([]);
          } else {
            let cat = req.query.category.split("~");

            pool.query(
              "update `total_seats` set `seats` = `seats` + 1 where branch = ? and year = ?",
              [branch, year],
              (err2, obj2) => {
                if (err2) {
                  console.log(err2);
                  let mes = `| Request -> /admin/deleteAdmitted | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
                  logger.customLogger.log("error", mes);
                  // res.render("error", {
                  //   message: "Server Error !",
                  //   error: { status: 500 },
                  // });

                  res.send ([]);

                } else {
                  if (cat[0] == "AIUR" || cat[0] == "EWS") {
                    pool.query(
                      `update clc_councelling2 set seats = seats + 1 where branch = ? and category = ? and year = ?`,
                      [branch, cat[0], year],
                      (err3, obj3) => {
                        if (err3) {
                          console.log(err3);
                          let mes = `| Request -> /admin/deleteAdmitted | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
                          logger.customLogger.log("error", mes);
                          // res.render("error", {
                          //   message: "Server Error !",
                          //   error: { status: 500 },
                          // });

                          res.send ([]);

                        } else {
                          let mes = `| Request -> /admin/deleteAdmitted | IP -> ${req.ip} | Admitted Student ${req.query.roll} Deleted ! | Admin -> ${req.session.username} |`;
                          logger.customLogger.log("info", mes);

                          const io = req.app.get('socketio');
                          io.emit ('refresh_page','refresing');

                          // res.redirect("/admin/admittedStudentPage");

                          res.send ([]);

                        }
                      }
                    );
                  } else {
                    let x =
                      "update `clc_councelling` set " +
                      cat[1] +
                      cat[2] +
                      " = " +
                      cat[1] +
                      cat[2] +
                      ' + 1 where branch = "' +
                      branch +
                      '" And category = "' +
                      cat[0] +
                      '" and year = "' +
                      year +
                      '"';

                    pool.query(x, (err3, obj3) => {
                      if (err3) {
                        console.log(err3);
                        let mes = `| Request -> /admin/deleteAdmitted | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
                        logger.customLogger.log("error", mes);
                        // res.render("error", {
                        //   message: "Server Error !",
                        //   error: { status: 500 },
                        // });

                        res.send ([]);

                      } else {
                        let mes = `| Request -> /admin/deleteAdmitted | IP -> ${req.ip} | Admitted Student ${req.query.roll} Deleted ! | Admin -> ${req.session.username} |`;
                        logger.customLogger.log("info", mes);

                        const io = req.app.get('socketio');
                        io.emit ('refresh_page','refresing');

                        // res.redirect("/admin/admittedStudentPage");

                        res.send ([]);

                      }
                    });
                  }
                }
              }
            );
          }
        }
      );
    } else {
      let mes = `| Request -> /admin/deleteAdmitted | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);

      // res.render("error", {
      //   message: "You are Not Authorized",
      //   error: { status: 500 },
      // });

      res.send ([]);

    }
  } else {
    let mes = `| Request -> /admin/deleteAdmitted | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);

    // res.render("login", { errorBox: "Please Login First !" });

    res.send ([]);
    
  }
});

// Dashboard

router.get("/dashboard", (req, res) => {
  if (req.session.username) {
    let year = new Date();
    year = year.getFullYear();

    pool.query(
      "select sum(`seats`) as sum from `total_seats` where year = ?",
      [year],
      (err, obj) => {
        if (err) {
          console.log(err);
          let mes = `| Request -> /admin/dashboard | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
          logger.customLogger.log("error", mes);
          res.render("dashboard", {
            adminImg: req.session.profile,
            adminName: req.session.name,
            adminType: req.session.type,
            vacantSeats: 0,
            admittedStudents: 0,
          });
        } else {
          pool.query(
            "select count (*) as count from `admittedstudents` where year = ?",
            [year],
            (err2, obj2) => {
              if (err2) {
                console.log(err2);
                let mes = `| Request -> /admin/dashboard | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
                logger.customLogger.log("error", mes);

                res.render("dashboard", {
                  adminImg: req.session.profile,
                  adminName: req.session.name,
                  adminType: req.session.type,
                  vacantSeats: obj[0].sum,
                  admittedStudents: 0,
                });
              } else {
                let mes = `| Request -> /admin/dashboard | IP -> ${req.ip} | Dashboard Rendered | Admin -> ${req.session.username} |`;
                logger.customLogger.log("info", mes);

                res.render("dashboard", {
                  adminImg: req.session.profile,
                  adminName: req.session.name,
                  adminType: req.session.type,
                  vacantSeats: obj[0].sum,
                  admittedStudents: obj2[0].count,
                });
              }
            }
          );
        }
      }
    );
  } else {
    let mes = `| Request -> /admin/dashboard | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Chart data for the dashboard */

router.get("/getChartData", (req, res) => {
  let year = new Date();
  year = year.getFullYear();

  pool.query(
    "SELECT `seats`,`branch` from `total_seats` where year = ? order by branch",
    [year],
    (err, obj) => {
      if (err) {
        console.log(err);
        let mes = `| Request -> /admin/getChartData | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
        logger.customLogger.log("error", mes);
        res.send([]);
      } else {
        let sendData = [];
        let send = {};
        send['branches'] = [];

        for (i = 0; i < obj.length; i++) {
          sendData.push(obj[i].seats);
          send['branches'].push (obj[i].branch);
        }

        send['data'] = sendData;

      
        // console.log (sendData.length);
        let mes = `| Request -> /admin/getChartData | IP -> ${req.ip} | Chart data for the dashboard | Admin -> ${req.session.username} |`;
        logger.customLogger.log("info", mes);
        res.send(send);
      }
    }
  );
});

// Taking the files

router.get("/filesSection", (req, res) => {
  if (req.session.username) {
    if (req.session.type == "Super Admin" ) {

      // console.log (req.query.up);
      if (req.query.up == "1") {
        let mes = `| Request -> /admin/filesSection | IP -> ${req.ip} | Files Uploaded Sucess | Admin -> ${req.session.username} |`;
        logger.customLogger.log("info", mes);
        res.render("dataInput", {
          error: "Files Have Been Uploaded Successfully !",
          adminImg: req.session.profile,
          adminName: req.session.name,
          adminType: req.session.type,
        });
      } 
      else if (req.query.up == "2"){
        let mes = `| Request -> /admin/filesSection | IP -> ${req.ip} | Wrong Files | Admin -> ${req.session.username} |`;
        logger.customLogger.log("warn", mes);
        res.render("dataInput", {
          error: "Wrong File Submission !",
          adminImg: req.session.profile,
          adminName: req.session.name,
          adminType: req.session.type,
        });
      }
      else if (req.query.up == "3"){
        let mes = `| Request -> /admin/filesSection | IP -> ${req.ip} | Server Error | Admin -> ${req.session.username} |`;
        logger.customLogger.log("warn", mes);
        res.render("dataInput", {
          error: "Server Error.. !",
          adminImg: req.session.profile,
          adminName: req.session.name,
          adminType: req.session.type,
        });
      }
      else {
        let mes = `| Request -> /admin/filesSection | IP -> ${req.ip} | Data Input Files | Admin -> ${req.session.username} |`;
        logger.customLogger.log("info", mes);
        res.render("dataInput", {
          error: 0,
          adminImg: req.session.profile,
          adminName: req.session.name,
          adminType: req.session.type,
        });
      }
    } else {
      let mes = `| Request -> /admin/filesSection | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);
      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    let mes = `| Request -> /admin/filesSection | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});

// Taking the Merit List

router.post("/uploadMerit", uploadExcel.single("MERIT_LIST"), (req, res) => {
  if (req.session.username) {
    if (req.session.type == "Super Admin") {
      let year = new Date();
      year = year.getFullYear();

      let data = ExcelToCSV.converter(
        "./public/assets/files/MERIT_LIST.xlsx"
      );


      // console.log (data,'asldfjlkadsf');

      if (typeof( data[0]['URXF'] ) == "undefined"){
        // console.log ('xx');
        
        pool.query(
          "DELETE FROM `merit_list` where year = ?",
          [year],
          (err, obj) => {
            if (err) {
              console.log(err);
              let mes = `| Request -> /admin/uploadMerit | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
              logger.customLogger.log("error", mes);
              res.redirect('/admin/filesSection?up=3');
            } else {
              
              let values1 = [];
              // console.log (data);
              data.forEach((item) => {

                let d = [...Array(20)];

                d[0] = item["SNo."];

                d[1] = item['Rollno'];

                d[2] = item['Name'];

                d[3] = ExcelToCSV.datechanger(item["DOB"]);

                d[4] = item["Gender"];

                d[5] = item["Father"];

                d[6] = item["Category"];

                d[7] = item["Domicile"];

                d[8] = item["Marks (%)"];

                d[9] = item["Maths%"];

                d[10] = item["Physics%"];

                d[11] = item["Chemistry/Bio/BioTech/Tech.Voc%"];

                d[12] = item["Phy.(Obt/Outof)"];

                d[13] = item["Chem.(Obt/Outof)"];

                d[14] = item["Maths(Obt/Outof)"];

                d[15] = item["PCM"];

                d[16] = item["Perc (%)"];

                d[17] = item["JEERank"];


                d[18] = item["Candidate Type"];

                d[19] = year;

                values1.push (d);

                // pool.query(
                //   "INSERT INTO `merit_list` (`SNo`, `Rollno`, `Name`, `DOB`, `Gender`, `Father`, `Category`, `Domicile`, `Marks_per`, `Maths_per`, `Physics_per`,`Chemistry_Bio_BioTech_Tech_Voc_per`,`Phy_Obt_Outof`, `Chem_Obt_Outof`, `Maths_Obt_Outof`,`PCM`, `Perc_per`, `JEERank`, `Candidate_Type`,`year`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ",
                //   [
                //     item["SNo."],
                //     item["Rollno"],
                //     item["Name"],
                //     ExcelToCSV.datechanger(item["DOB"]),
                //     item["Gender"],
                //     item["Father"],
                //     item["Category"],
                //     item["Domicile"],
                //     item["Marks (%)"],
                //     item["Maths%"],
                //     item["Physics%"],
                //     item["Chemistry/Bio/BioTech/Tech.Voc%"],
                //     item["Phy.(Obt/Outof)"],
                //     item["Chem.(Obt/Outof)"],
                //     item["Maths(Obt/Outof)"],
                //     item["PCM"],
                //     item["Perc (%)"],
                //     item["JEERank"],
                //     item["Candidate Type"],
                //     year,
                //   ],
                //   (err2, obj2) => {
                //     // pool.query ("INSERT INTO `merit_list` (`SNo`, `Rollno`, `Name`, `DOB`, `Gender`, `Father`, `Category`, `Domicile`, `Marks_per`, `Maths_per`, `Physics_per`,`Chemistry_Bio_BioTech_Tech_Voc_per`,`Phy_Obt_Outof`, `Chem_Obt_Outof`, `Maths_Obt_Outof`,`PCM`, `Perc_per`, `JEERank`, `Candidate_Type`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ", ("1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"),(err,obj)=>{
                //       if (err2) {
                //         console.log(err2);
                //         let mes = `| Request -> /admin/uploadMerit | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
                //         logger.customLogger.log("error", mes);
                        
                //         // console.log (data[0]['xf'])
                        
                //         // res.redirect('/admin/filesSection?up="1"');
                //     }
  
                //     // console.log (item['SNo.'])
                //   }
                // );
              });

              pool.query ('INSERT INTO `merit_list` (`SNo`, `Rollno`, `Name`, `DOB`, `Gender`, `Father`, `Category`, `Domicile`, `Marks_per`, `Maths_per`, `Physics_per`,`Chemistry_Bio_BioTech_Tech_Voc_per`,`Phy_Obt_Outof`, `Chem_Obt_Outof`, `Maths_Obt_Outof`,`PCM`, `Perc_per`, `JEERank`, `Candidate_Type`,`year`) VALUES ?',[values1],(err,obj)=>{
                if (err){
                  console.log (err);
                  let mes = `| Request -> /admin/uploadMerit | IP -> ${req.ip} | Server Error | Admin -> ${req.session.username} |`;
                logger.customLogger.log("warn", mes);
                res.redirect('/admin/filesSection?up=3');
                }

                else{
                  let mes = `| Request -> /admin/uploadMerit | IP -> ${req.ip} | Merit List Uploaded | Admin -> ${req.session.username} |`;
                  logger.customLogger.log("info", mes);
                  res.redirect('/admin/filesSection?up=1');
                }
              })

              
            }
          }
        );

      }

      else{
        // console.log ('adf');

        let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Vacacy Uploaded | Admin -> ${req.session.username} |`;
        logger.customLogger.log("info", mes);
        res.redirect('/admin/filesSection?up=2');
      }

    } else {
      let mes = `| Request -> /admin/uploadMerit | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);
      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    let mes = `| Request -> /admin/uploadMerit | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Uploading the Vacancy List */

router.post(
  "/uploadVacancy",
  uploadExcel.single("VACANCY_LIST"),
  (req, res) => {
    if (req.session.username) {
      if (req.session.type == "Super Admin") {
        let data = ExcelToCSV.converter(
          "./public/assets/files/VACANCY_LIST.xlsx"
        );
        
        let year = new Date();
        year = year.getFullYear();

        if (typeof( data[0]['Name'] ) == "undefined"){
          // console.log ('xx');

          pool.query(
            "Delete from `total_seats` where year = ?",
            [year],
            (err, obj) => {
              if (err) {
                console.log(err);
                let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (DELETING SEATS) | Admin -> ${req.session.username} |`;
                logger.customLogger.log("error", mes);
              }
            }
          );
  
          pool.query ('Delete from clc_councelling2 where year = ?',[year], (err3,obj3)=>{
            if (err3){
   
                console.log(err3);
                let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (deleting clc2) | Admin -> ${req.session.username} |`;
                logger.customLogger.log("error", mes);
              
            }
          })
  
          pool.query(
            "DELETE From `clc_councelling` where year = ?",
            [year],
            (err2, obj) => {
              if (err2) {
                console.log(err2);
                let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database  (DELETING CLC COUNCELLING) | Admin -> ${req.session.username} |`;
                logger.customLogger.log("error", mes);
              } else {

                let total1 = [];

                let ur1 = [];

                let obc1 = [];

                let sc1 = [];

                let st1 = [];

                let ai1 = [];
                let ews1 = [];


                data.forEach((item) => {
                  /* For uploading the total seats branch wise  */

                  let d1 = [...Array(3)];

                  d1[0] = item["Branch/Course"];

                  d1[1] = item["Total Seats"];

                  d1[2] = year;

                  total1.push (d1);
  
                  // pool.query(
                  //   "INSERT INTO `total_seats` ( `branch`, `seats` ,`year` ) values (?,?,?)",
                  //   [item["Branch/Course"], item["Total Seats"], year],
                  //   (err4, obj) => {
                  //     if (err4) {
                  //       console.log(err4);
                  //       let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (TOTAL SEATS) | Admin -> ${req.session.username} |`;
                  //       logger.customLogger.log("error", mes);
                  //     }
                  //   }
                  // );

                  let d2 = [...Array(15)];

                      d2[0] = item["Branch/Course"]
                      d2[1] = "UR"
                      d2[2] = item["URXF"]
                      d2[3] = item["URXOP"]
                      d2[4] = item["URSF"]
                      d2[5] = item["URSOP"]
                      d2[6] = item["URFFF"]
                      d2[7] = item["URFFOP"]
                      d2[8] = item["URHCF"]
                      d2[9] = item["URHCOP"]
                      d2[10] = item["URNCCF"]
                      d2[11] = item["URNCCOP"]
                      d2[12] = item["URTSF"]
                      d2[13] = item["URTSOP"]
                      d2[14] = year

                      ur1.push (d2);
  
                  /* For UR category */
                  // pool.query(
                  //   "INSERT INTO `clc_councelling`(`branch`, `category`, `xf`, `xop`, `sf`, `sop`, `fff`, `ffop`, `hcf`, `hcop`, `nccf`, `nccop`, `tsf`, `tsop` ,`year`) VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?,?,? )",
                  //   [
                  //     item["Branch/Course"],
                  //     "UR",
                  //     item["URXF"],
                  //     item["URXOP"],
                  //     item["URSF"],
                  //     item["URSOP"],
                  //     item["URFFF"],
                  //     item["URFFOP"],
                  //     item["URHCF"],
                  //     item["URHCOP"],
                  //     item["URNCCF"],
                  //     item["URNCCOP"],
                  //     item["URTSF"],
                  //     item["URTSOP"],
                  //     year,
                  //   ],
                  //   (err5, obj) => {
                  //     if (err5) {
                  //       console.log(err5);
                  //       let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (UR) | Admin -> ${req.session.username} |`;
                  //       logger.customLogger.log("error", mes);
                  //     }
                  //   }
                  // );
  
                  /* For OBC category */

                  let d3 = [...Array(15)];

                      d3[0] = item["Branch/Course"]
                      d3[1] = "OBC"
                      d3[2] = item["OBCXF"]
                      d3[3] = item["OBCXOP"]
                      d3[4] = item["OBCSF"]
                      d3[5] = item["OBCSOP"]
                      d3[6] = item["OBCFFF"]
                      d3[7] = item["OBCFFOP"]
                      d3[8] = item["OBCHCF"]
                      d3[9] = item["OBCHCOP"]
                      d3[10] = item["OBCNCCF"]
                      d3[11] = item["OBCNCCOP"]
                      d3[12] = item["OBCTSF"]
                      d3[13] = item["OBCTSOP"]
                      d3[14] = year

                      obc1.push (d3);


                  // pool.query(
                  //   "INSERT INTO `clc_councelling`(`branch`, `category`, `xf`, `xop`, `sf`, `sop`, `fff`, `ffop`, `hcf`, `hcop`, `nccf`, `nccop`, `tsf`, `tsop`,`year`) VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?,?,? )",
                  //   [
                  //     item["Branch/Course"],
                  //     "OBC",
                  //     item["OBCXF"],
                  //     item["OBCXOP"],
                  //     item["OBCSF"],
                  //     item["OBCSOP"],
                  //     item["OBCFFF"],
                  //     item["OBCFFOP"],
                  //     item["OBCHCF"],
                  //     item["OBCHCOP"],
                  //     item["OBCNCCF"],
                  //     item["OBCNCCOP"],
                  //     item["OBCTSF"],
                  //     item["OBCTSOP"],
                  //     year,
                  //   ],
                  //   (err6, obj) => {
                  //     if (err6) {
                  //       console.log(err6);
                  //       let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (OBC) | Admin -> ${req.session.username} |`;
                  //       logger.customLogger.log("error", mes);
                  //     }
                  //   }
                  // );
  
                  /* For SC category */

                  let d4 = [...Array(15)];

                      d4[0] = item["Branch/Course"]
                      d4[1] = "SC"
                      d4[2] = item["SCXF"]
                      d4[3] = item["SCXOP"]
                      d4[4] = item["SCSF"]
                      d4[5] = item["SCSOP"]
                      d4[6] = item["SCFFF"]
                      d4[7] = item["SCFFOP"]
                      d4[8] = item["SCHCF"]
                      d4[9] = item["SCHCOP"]
                      d4[10] = item["SCNCCF"]
                      d4[11] = item["SCNCCOP"]
                      d4[12] = item["SCTSF"]
                      d4[13] = item["SCTSOP"]
                      d4[14] = year

                      sc1.push (d4);

                  // pool.query(
                  //   "INSERT INTO `clc_councelling`(`branch`, `category`, `xf`, `xop`, `sf`, `sop`, `fff`, `ffop`, `hcf`, `hcop`, `nccf`, `nccop`, `tsf`, `tsop`,`year`) VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?,?,? )",
                  //   [
                  //     item["Branch/Course"],
                  //     "SC",
                  //     item["SCXF"],
                  //     item["SCXOP"],
                  //     item["SCSF"],
                  //     item["SCSOP"],
                  //     item["SCFFF"],
                  //     item["SCFFOP"],
                  //     item["SCHCF"],
                  //     item["SCHCOP"],
                  //     item["SCNCCF"],
                  //     item["SCNCCOP"],
                  //     item["SCTSF"],
                  //     item["SCTSOP"],
                  //     year,
                  //   ],
                  //   (err7, obj) => {
                  //     if (err7) {
                  //       console.log(err7);
                  //       let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (SC) | Admin -> ${req.session.username} |`;
                  //       logger.customLogger.log("error", mes);
                  //     }
                  //   }
                  // );
  
                  /* For ST category */

                  let d5 = [...Array(15)];

                      d5[0] = item["Branch/Course"]
                      d5[1] = "ST"
                      d5[2] = item["STXF"]
                      d5[3] = item["STXOP"]
                      d5[4] = item["STSF"]
                      d5[5] = item["STSOP"]
                      d5[6] = item["STFFF"]
                      d5[7] = item["STFFOP"]
                      d5[8] = item["STHCF"]
                      d5[9] = item["STHCOP"]
                      d5[10] = item["STNCCF"]
                      d5[11] = item["STNCCOP"]
                      d5[12] = item["STTSF"]
                      d5[13] = item["STTSOP"]
                      d5[14] = year

                      st1.push (d5);

                  // pool.query(
                  //   "INSERT INTO `clc_councelling`(`branch`, `category`, `xf`, `xop`, `sf`, `sop`, `fff`, `ffop`, `hcf`, `hcop`, `nccf`, `nccop`, `tsf`, `tsop`,`year`) VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?,?,? )",
                  //   [
                  //     item["Branch/Course"],
                  //     "ST",
                  //     item["STXF"],
                  //     item["STXOP"],
                  //     item["STSF"],
                  //     item["STSOP"],
                  //     item["STFFF"],
                  //     item["STFFOP"],
                  //     item["STHCF"],
                  //     item["STHCOP"],
                  //     item["STNCCF"],
                  //     item["STNCCOP"],
                  //     item["STTSF"],
                  //     item["STTSOP"],
                  //     year,
                  //   ],
                  //   (err, obj) => {
                  //     if (err) {
                  //       console.log(err);
                  //       let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (ST) | Admin -> ${req.session.username} |`;
                  //       logger.customLogger.log("error", mes);
                  //     }
                  //   }
                  // );
  
                  /* For Adding the AIUR Seats */

                  let d6 = [...Array(4)];

                  d6[0] = item["Branch/Course"];
                  d6[1] = "AIUR";
                  d6[2] = item["ai_ur_seats"];
                  d6[3] = year;

                  ai1.push (d6);
                  
                  // pool.query(
                  //   "INSERT INTO `clc_councelling2` ( branch, category, seats, year ) values (?,?,?,?)",
                  //   [item["Branch/Course"], "AIUR", item["ai_ur_seats"], year],
                  //   (err, obj) => {
                  //     if (err) {
                  //       console.log(err);
                  //       let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (AI) | Admin -> ${req.session.username} |`;
                  //       logger.customLogger.log("error", mes);
                  //     }
                  //   }
                  // );
  
                  /* For Adding the EWS Seats */

                  let d7 = [...Array(4)];

                  d7[0] = item["Branch/Course"];
                  d7[1] = "EWS";
                  d7[2] = item["ews_seats"];
                  d7[3] = year;

                  ews1.push (d7);
  
                  // pool.query(
                  //   "INSERT INTO `clc_councelling2` ( branch, category, seats , year) values (?,?,?,?)",
                  //   [item["Branch/Course"], "EWS", item["ews_seats"], year],
                  //   (err, obj) => {
                  //     if (err) {
                  //       console.log(err);
                  //       let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (EWS) | Admin -> ${req.session.username} |`;
                  //       logger.customLogger.log("error", mes);
                  //     }
                  //   }
                  // );
  
                  
  
                });


                pool.query ('INSERT INTO `total_seats` ( `branch`, `seats` ,`year` ) values ?',[total1] ,(err,obj)=>{
                  if (err){
                  console.log (err);
                 
                  let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (Total) | Admin -> ${req.session.username} |`;
                  logger.customLogger.log("error", mes);

                  }
                })

                
                pool.query ('INSERT INTO `clc_councelling`(`branch`, `category`, `xf`, `xop`, `sf`, `sop`, `fff`, `ffop`, `hcf`, `hcop`, `nccf`, `nccop`, `tsf`, `tsop` ,`year`) VALUES ? ',[ur1],(err,obj)=>{
                  if (err){
                    console.log (err);
                    let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (UR) | Admin -> ${req.session.username} |`;
                  logger.customLogger.log("error", mes);
                  }
                })

                
                pool.query ('INSERT INTO `clc_councelling`(`branch`, `category`, `xf`, `xop`, `sf`, `sop`, `fff`, `ffop`, `hcf`, `hcop`, `nccf`, `nccop`, `tsf`, `tsop` ,`year`) VALUES ? ',[obc1],(err,obj)=>{
                  if (err){
                    console.log (err);
                    let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (OBC) | Admin -> ${req.session.username} |`;
                  logger.customLogger.log("error", mes);
                  }
                })

                
                pool.query ('INSERT INTO `clc_councelling`(`branch`, `category`, `xf`, `xop`, `sf`, `sop`, `fff`, `ffop`, `hcf`, `hcop`, `nccf`, `nccop`, `tsf`, `tsop` ,`year`) VALUES ? ',[sc1],(err,obj)=>{
                  if (err){
                    console.log (err);
                    let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (SC) | Admin -> ${req.session.username} |`;
                  logger.customLogger.log("error", mes);
                  }
                })

                
                pool.query ('INSERT INTO `clc_councelling`(`branch`, `category`, `xf`, `xop`, `sf`, `sop`, `fff`, `ffop`, `hcf`, `hcop`, `nccf`, `nccop`, `tsf`, `tsop` ,`year`) VALUES ? ',[st1],(err,obj)=>{
                  if (err){
                    console.log (err);
                    let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (ST) | Admin -> ${req.session.username} |`;
                  logger.customLogger.log("error", mes);
                  }
                })

                
                pool.query ('INSERT INTO `clc_councelling2` ( branch, category, seats, year ) values ?',[ai1], (err,obj)=>{
                  if (err){
                    console.log (err);

                 
                    let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (AI) | Admin -> ${req.session.username} |`;
                    logger.customLogger.log("error", mes);
                    
                  }

                  else{
                    pool.query ('INSERT INTO `clc_councelling2` ( branch, category, seats, year ) values ?',[ews1], (err3,obj2)=>{
                      if (err3){
                        console.log (err3);
    
                       
                        let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Database Error (EWS) | Admin -> ${req.session.username} |`;
                        logger.customLogger.log("error", mes);
                        res.redirect('/admin/filesSection?up=3');
                        
                      }

                      else{
                        let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Vacacy Uploaded | Admin -> ${req.session.username} |`;
                        logger.customLogger.log("info", mes);
                        res.redirect('/admin/filesSection?up=1');
                      }
                      
                    })
                  }
                  
                })




  
                
              }
            }
          );

        }

        else{
          // console.log ('zxfoi');

          let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | Vacacy Uploaded | Admin -> ${req.session.username} |`;
          logger.customLogger.log("info", mes);
          res.redirect('/admin/filesSection?up=2');
        }

      } else {
        let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} |`;
        logger.customLogger.log("warn", mes);
        res.render("error", {
          message: "You are Not Authorized",
          error: { status: 500 },
        });
      }
    } else {
      let mes = `| Request -> /admin/uploadVacancy | IP -> ${req.ip} | No Login | `;
      logger.customLogger.log("warn", mes);
      res.render("login", { errorBox: "Please Login First !" });
    }
  }
);

// Category Wise Seats Avalilable

router.get("/categorySeats", (req, res) => {
  if (req.session.username) {
    let mes = `| Request -> /admin/categorySeats | IP -> ${req.ip} | Rendered Seat Status | Admin -> ${req.session.username} | `;
    logger.customLogger.log("info", mes);
    res.render("categorySeats", {
      adminImg: req.session.profile,
      adminName: req.session.name,
      adminType: req.session.type,
    });
  } else {
    let mes = `| Request -> /admin/categorySeats | IP -> ${req.ip} | No Login | `;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Getting the category seats data */

router.get("/categorySeatsData", (req, res) => {

  

    if (req.query.category != "AIUR" && req.query.category != "EWS") {
      pool.query(
        "SELECT row_number() over (order by `branch`) as sno, `branch`, `category`, `xf`, `xop`, `sf`, `sop`, `fff`, `ffop`, `hcf`, `hcop`, `nccf`, `nccop`, `tsf`, `tsop` from clc_councelling where `category` = ? and year = ?",
        [req.query.category, req.query.year],
        (err, obj) => {
          if (err) {
            console.log(err);
            let mes = `| Request -> /admin/categorySeatsData | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} | `;
            logger.customLogger.log("error", mes);
            res.send("");
          } else {
            let mes = `| Request -> /admin/categorySeatsData | IP -> ${req.ip} | ${req.query.category} Seats Data Fetched | Admin -> ${req.session.username} | `;
            logger.customLogger.log("info", mes);
            res.send(obj);
          }
        }
      );
    } 
    else {
      // console.log (req.query.category);
      pool.query(
        "SELECT row_number() over (order by `branch`) as sno, branch, category, seats from clc_councelling2 where `category` = ? and year = ?",
        [req.query.category, req.query.year],
        (err, obj) => {
          if (err) {
            console.log(err);
            let mes = `| Request -> /admin/categorySeatsData | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} | `;
            logger.customLogger.log("error", mes);
            res.send("");
          } else {
            let mes = `| Request -> /admin/categorySeatsData | IP -> ${req.ip} | ${req.query.category} Seats Data Fetched | Admin -> ${req.session.username} | `;
            logger.customLogger.log("info", mes);
            res.send(obj);
          }
        }
      );
    }

});

// Seat Conversion Seats

router.get("/seatConversion", (req, res) => {
  if (req.session.username) {
    if (req.session.type == "Super Admin") {
      let mes = `| Request -> /admin/seatConversion | IP -> ${req.ip} | Rendered Seats Conversion Page | Admin -> ${req.session.username} | `;
      logger.customLogger.log("info", mes);

      res.render("seatConversion", {
        adminImg: req.session.profile,
        adminName: req.session.name,
        adminType: req.session.type,
      });
    } else {
      let mes = `| Request -> /admin/seatConversion | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} | `;
      logger.customLogger.log("warn", mes);
      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    let mes = `| Request -> /admin/seatConversion | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Check Vancant Branches for the conversion used in { admitNewStudent } D*/

router.get("/checkVacantBranches", (req, res) => {
  if (req.session.username) {
    let year = new Date();
    year = year.getFullYear();

    if (req.query.category == "AIUR" || req.query.category == "EWS") {
      pool.query(
        "select branch from clc_councelling2 where category = ? and seats <> 0 and year = ?",
        [req.query.category, year],
        (err, obj) => {
          if (err) {
            console.log(err);

            let mes = `| Request -> /admin/checkVacantBranches | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} | `;
            logger.customLogger.log("error", mes);

            res.render("error", {
              message: "Server Error",
              error: { status: 500 },
            });
          } else {
            let mes = `| Request -> /admin/checkVacantBranches | IP -> ${req.ip} | Fetched Vacant Branches | Admin -> ${req.session.username} | `;
            logger.customLogger.log("info", mes);

            res.send(obj);
          }
        }
      );
    } else {
      pool.query(
        `select branch from clc_councelling where category = ? and ${req.query.quota} <> ? and year = ?`,
        [req.query.category, 0, year],
        (err, obj) => {
          if (err) {
            console.log(err);

            let mes = `| Request -> /admin/checkVacantBranches | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} | `;
            logger.customLogger.log("error", mes);

            res.render("error", {
              message: "Server Error",
              error: { status: 500 },
            });
          } else {
            let mes = `| Request -> /admin/checkVacantBranches | IP -> ${req.ip} | Fetched Vacant Branches | Admin -> ${req.session.username} | `;
            logger.customLogger.log("info", mes);

            res.send(obj);
          }
        }
      );
    }
  } else {
    let mes = `| Request -> /admin/checkVacantBranches | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Checking vacant category for the conversion  */

// router.get("/checkVacantCategory", (req, res) => {
//   if (req.session.username) {
//     let branch = req.query.branch.replaceAll("_", " ");

//     pool.query(
//       "select category from clc_councelling where branch = ? and 0 not in (`xf` OR `xop` OR `sf` OR `sop` OR `fff` OR `ffop` OR `hcf` OR `hcop` OR `nccf` OR `nccop` OR `tsf` OR `tsop`)",
//       [branch],
//       (err, obj) => {
//         if (err) {
//           console.log(err);

//           let mes = `| Request -> /admin/checkVacantCategory | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} | `;
//           logger.customLogger.log("error", mes);
//           res.render("error", {
//             message: "Server Error",
//             error: { status: 500 },
//           });
//         } else {
//           // console.log (obj);
//           let mes = `| Request -> /admin/checkVacantCategory | IP -> ${req.ip} | Fetched Vacant Category Data | Admin -> ${req.session.username} | `;
//           logger.customLogger.log("info", mes);
//           res.send(obj);
//         }
//       }
//     );
//   } else {
//     let mes = `| Request -> /admin/checkVacantCategory | IP -> ${req.ip} | No Login |`;
//     logger.customLogger.log("warn", mes);
//     res.render("login", { errorBox: "Please Login First !" });
//   }
// });

/* getting the sub category for the conversion  D*/

router.get("/checkVacantSubCategory", (req, res) => {
  if (req.session.username) {
    let year = new Date();
    year = year.getFullYear();
    // let branch = req.query.branch.replaceAll ('_', ' ');

    if (req.query.category == "AIUR" || req.query.category == "EWS") {
      pool.query(
        "select * from `clc_councelling2` where category = ? and year = ? and seats > 0",
        [req.query.category, year],
        (err, obj) => {
          if (err) {
            console.log(err);

            let mes = `| Request -> /admin/checkVacantSubCategory | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} | `;
            logger.customLogger.log("error", mes);
            res.render("error", {
              message: "Server Error",
              error: { status: 500 },
            });
          } else {
            // console.log ('kake');
            // console.log (obj);
            let mes = `| Request -> /admin/checkVacantSubCategory | IP -> ${req.ip} | Vacant Sub Category Data Fetched | Admin -> ${req.session.username} |`;
            logger.customLogger.log("info", mes);
            res.send(obj);
          }
        }
      );
    } else {
      pool.query(
        "select * from `clc_councelling` where category = ? and year = ?",
        [req.query.category, year],
        (err, obj) => {
          if (err) {
            console.log(err);

            let mes = `| Request -> /admin/checkVacantSubCategory | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} | `;
            logger.customLogger.log("error", mes);
            res.render("error", {
              message: "Server Error",
              error: { status: 500 },
            });
          } else {
            // console.log ('kake');
            // console.log (obj);
            let mes = `| Request -> /admin/checkVacantSubCategory | IP -> ${req.ip} | Vacant Sub Category Data Fetched | Admin -> ${req.session.username} |`;
            logger.customLogger.log("info", mes);
            res.send(obj);
          }
        }
      );
    }
  } else {
    let mes = `| Request -> /admin/checkVacantSubCategory | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);

    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Checking Vacant Category for the seat conversion NEW */

router.get("/findVacantCategory", (req, res) => {
  if (req.session.username) {
    pool.query(
      "select distinct category from clc_councelling where 0 not in (`xf` OR `xop` OR `sf` OR `sop` OR `fff` OR `ffop` OR `hcf` OR `hcop` OR `nccf` OR `nccop` OR `tsf` OR `tsop`) and year = ? union select distinct category from clc_councelling2 where year = ? and seats <> 0",
      [req.query.year, req.query.year],
      (err, obj) => {
        if (err) {
          console.log(err);

          let mes = `| Request -> /admin/findVacantCategory | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} | `;
          logger.customLogger.log("error", mes);
          res.render("error", {
            message: "Server Error",
            error: { status: 500 },
          });
        } else {
          // console.log (obj);
          let mes = `| Request -> /admin/findVacantCategory | IP -> ${req.ip} | Fetched Vacant Category Data | Admin -> ${req.session.username} | `;
          logger.customLogger.log("info", mes);
          res.send(obj);
        }
      }
    );
  } else {
    let mes = `| Request -> /admin/findVacantCategory | IP -> ${req.ip} | No Login |`;
    logger.customLogger.log("warn", mes);

    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Final Conversion of seats  */

router.get("/SeatConversionConvert", (req, res) => {
  if (req.session.username) {
    if (req.session.type == "Super Admin") {
      if (req.query.fcategory == "AIUR" || req.query.fcategory == "EWS") {
        // console.log (x);

        let fDate = getFormattedDateTime();

      pool.query (`update activity set time = ? where act = "seats"`,[fDate],(a,b)=>{});
      

        pool.query(
          `update clc_councelling c, clc_councelling2 c2 set c.XOP = c.XOP + c2.seats where c2.category = ? and c.year = ? and c2.year = ? and c.branch = c2.branch `,
          [req.query.fcategory, req.query.year, req.query.year],
          (err, obj) => {
            if (err) {
              console.log(err);
              let mes = `| Request -> /admin/SeatConversionConvert | IP -> ${req.ip} | Database Error (SET To Data) | Admin -> ${req.session.username} | `;
              logger.customLogger.log("error", mes);

              res.send("0");
              // res.render ('error',{message : "Server Error" , error : {status : 500}});
            } else {
              // console.log (x);
              pool.query(
                `update clc_councelling2 set seats = 0 where year = ? and category = ?`,
                [req.query.year, req.query.fcategory],
                (err2, obj2) => {
                  if (err2) {
                    console.log(err2);
                    let mes = `| Request -> /admin/SeatConversionConvert | IP -> ${req.ip} | Database Error (Set from Data) | Admin -> ${req.session.username} | `;
                    logger.customLogger.log("error", mes);
                    res.send("0");
                    // res.render ('error',{message : "Server Error" , error : {status : 500}});
                  } else {
                    let mes = `| Request -> /admin/SeatConversionConvert | IP -> ${req.ip} | Seats Converted ${req.query.fcategory}~${req.query.fsubcategory} -> ${req.query.tcategory}~${req.query.tsubcategory} | Admin -> ${req.session.username} | `;
                    logger.customLogger.log("info", mes);

                    const io = req.app.get('socketio');
                    io.emit ('refresh_page','refresing');
                    
                    res.send("1");
                  }
                }
              );
            }
          }
        );
      } else {

        let fDate = getFormattedDateTime();

        pool.query (`update activity set time = ? where act = "seats"`,[fDate],(a,b)=>{});
         // console.log (x);

        pool.query(`update clc_councelling c, clc_councelling d set c.${req.query.tsubcategory.toLowerCase()} = c.${req.query.tsubcategory.toLowerCase()} + d.${req.query.fsubcategory.toLowerCase()} where c.category = ? and c.year = ? and d.category = ? and d.year = ? and c.branch = d.branch`,[req.query.tcategory,req.query.year, req.query.fcategory, req.query.year], (err, obj) => {
          if (err) {
            console.log(err);
            let mes = `| Request -> /admin/SeatConversionConvert | IP -> ${req.ip} | Database Error (SET To Data) | Admin -> ${req.session.username} | `;
            logger.customLogger.log("error", mes);

            res.send("0");
            // res.render ('error',{message : "Server Error" , error : {status : 500}});
          } else {
            let x =
              "update clc_councelling set " +
              req.query.fsubcategory.toLowerCase() +
              ' = 0 where category = "' +
              req.query.fcategory +
              '" and year = "' +
              req.query.year +
              '";';
            // console.log (x);
            pool.query(x, (err2, obj2) => {
              if (err2) {
                console.log(err2);
                let mes = `| Request -> /admin/SeatConversionConvert | IP -> ${req.ip} | Database Error (Set from Data) | Admin -> ${req.session.username} | `;
                logger.customLogger.log("error", mes);
                res.send("0");
                // res.render ('error',{message : "Server Error" , error : {status : 500}});
              } else {
                let mes = `| Request -> /admin/SeatConversionConvert | IP -> ${req.ip} | Seats Converted ${req.query.fcategory}~${req.query.fsubcategory} -> ${req.query.tcategory}~${req.query.tsubcategory} | Admin -> ${req.session.username} | `;
                logger.customLogger.log("info", mes);

                const io = req.app.get('socketio');
                io.emit ('refresh_page','refresing');
                res.send("1");
              }
            });
          }
        });
      }
    } else {
      let mes = `| Request -> /admin/SeatConversionConvert | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} | `;
      logger.customLogger.log("warn", mes);
      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    let mes = `| Request -> /admin/SeatConversionConvert | IP -> ${req.ip} | No Login |  `;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});

// Login Page

router.get("/login", (req, res) => {
  let mes = `| Request -> /admin/login | IP -> ${req.ip} | Rendered Login Page |`;
  logger.customLogger.log("info", mes);


  res.render("login", { errorBox: "0" });
});

// Admin Login Form

router.post("/loginForm", (req, res) => {
  const text = req.body;
  let year = new Date ();
  year = year.getFullYear ();

  pool.query(
    "SELECT * FROM `adminlogin` where `username` = ? and year = ?",
    [text.username , year],
    (err, obj) => {
      if (err) {
        console.log(err);
        let mes = `| Request -> /admin/loginform | IP -> ${req.ip} | Database Error |`;
        logger.customLogger.log("error", mes);

        res.render("login", { errorBox: "Server Error !" });
      } else {
        if (obj.length == 0) {
          let mes = `| Request -> /admin/loginform | IP -> ${req.ip} | Invalid Credentials |`;
          logger.customLogger.log("info", mes);

          res.render("login", { errorBox: "Invalid Credentials !" });
        } else {
          let pswd = aes256.decrypt(passkey, obj[0].password);

          if (pswd == text.password) {
            if (obj[0].active == "Y") {
              req.session.username = text.username;
              req.session.name = obj[0].name;
              req.session.type = obj[0].type;
              req.session.profile = obj[0].profile;

              let mes = `| Request -> /admin/loginform | IP -> ${req.ip} | SuccessFul Login | Admin -> ${req.session.username} |`;
              logger.customLogger.log("info", mes);
              res.redirect("/admin/dashboard");
            } else {
              let mes = `| Request -> /admin/loginform | IP -> ${req.ip} | Account Not Active | Admin -> ${text.username} |`;
              logger.customLogger.log("info", mes);
              res.render("login", {
                errorBox:
                  "This account is not Active. Please Contact Administrator !",
              });
            }
          } else {
            let mes = `| Request -> /admin/loginform | IP -> ${req.ip} | Invalid Credentials |`;
            logger.customLogger.log("info", mes);
            res.render("login", { errorBox: "Invalid Credentials !" });
          }
        }
      }
    }
  );
});

// Error Page

router.get("/404", (req, res) => {
  let mes = `| Request -> /admin/404 | IP -> ${req.ip} | Rendered 404 Page |`;
  logger.customLogger.log("info", mes);
  res.render("404Page");

});

// Logout Session

router.get("/logout", (req, res) => {
  let mes = `| Request -> /admin/logout | IP -> ${req.ip} | Admin Logout | Admin -> ${req.session.username} |`;
  logger.customLogger.log("info", mes);

  req.session.destroy();
  

  res.redirect("/admin/login");
});

/* Fee Page */

router.get("/feeSubmissionPage", (req, res) => {
  if (req.session.username) {
    if (req.session.type != "Admission" && req.session.type != "Normal") {
      let mes = `| Request -> /admin/feeSubmissionPage | IP -> ${req.ip} | Rendered Fee Submission Page | Admin -> ${req.session.username} |`;
      logger.customLogger.log("info", mes);

      res.render("feeSubmission", {
        adminImg: req.session.profile,
        adminName: req.session.name,
        adminType: req.session.type,
      });
    } else {
      let mes = `| Request -> /admin/feeSubmissionPage | IP -> ${req.ip} | No Authorization | Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);

      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    let mes = `| Request -> /admin/feeSubmissionPage | IP -> ${req.ip} | No Login | `;
    logger.customLogger.log("warn", mes);

    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Admitted Student Data API for FEE*/

router.get("/admittedStudentDataFEE", (req, res) => {
  if (req.session.username) {
    pool.query(
      "select row_number() over (order by `feereceiptno` ASC) as sno, `jeerollno`, `Candidate_Type`, `name`, `fathersname`, `Phonenumber`, `branch`, `category`, `subcategory`, `feestatus`, `feereceiptno`, `admissiontime`, `gender`, `dob`, `domicile`, `remarks` from `admittedstudents` where year = ?",
      [req.query.year],
      (err, obj) => {
        if (err) {
          console.log(err);

          let mes = `| Request -> /admin/admittedStudentDataFEE | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
          logger.customLogger.log("error", mes);

          res.render("login", { errorBox: " Server Error !" });
        } else {
          for (i = 0; i < obj.length; i++) {
            let cat = obj[i].subcategory;
            cat = cat.replaceAll(" ", "~");
            obj[i]["branch"] = obj[i]["branch"].replaceAll("_", " ");
            // console.log (cat);
            if (obj[i].feereceiptno == 0) {
              obj[i]["delete"] =
                '<button type="button" class="btn btn-gradient-danger btn-fw" onclick="FeePop(' +
                obj[i].jeerollno +
                ')">Submit Now</button>';
            } else {
              obj[i]["delete"] =
                '<button type="button" class="btn btn-gradient-success btn-fw" disabled>Submitted</button>';
            }

            // console.log (obj[i])
          }

          let mes = `| Request -> /admin/admittedStudentDataFEE | IP -> ${req.ip} | Fee Data Fetched | Admin -> ${req.session.username} |`;
          logger.customLogger.log("info", mes);
          res.send(obj);
        }
      }
    );
  } else {
    let mes = `| Request -> /admin/admittedStudentDataFEE | IP -> ${req.ip} | No Login | `;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Adding the fee recipt number */

router.get("/addReceiptNum", (req, res) => {
  if (req.session.username) {
    if (req.session.type != "Admission" && req.session.type != "Normal") {
      let fDate = getFormattedDateTime();

      pool.query (`update activity set time = ? where act = "seats"`,[fDate],(a,b)=>{});

      pool.query(
        "update `admittedstudents` set `feestatus` = 'Submitted' , `feereceiptno` = ? where `jeerollno` = ? and year = ?",
        [req.query.num, req.query.roll, req.query.year],
        (err, obj) => {
          if (err) {
            console.log(err);

            let mes = `| Request -> /admin/addReceiptNum | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} |`;
            logger.customLogger.log("error", mes);

            res.send({ error: "Server Error" });
          } else {
            let mes = `| Request -> /admin/addReceiptNum | IP -> ${req.ip} | Fee Receipt Added ${req.query.roll} | Admin -> ${req.session.username} |`;
            logger.customLogger.log("info", mes);

            const io = req.app.get('socketio');
            io.emit ('refresh_page','refresing');
            res.send({ error: 0 });

          }
        }
      );
    } else {
      let mes = `| Request -> /admin/addReceiptNum | IP -> ${req.ip} | No Authorization| Admin -> ${req.session.username} |`;
      logger.customLogger.log("warn", mes);
      res.render("error", {
        message: "You are Not Authorized",
        error: { status: 500 },
      });
    }
  } else {
    let mes = `| Request -> /admin/addReceiptNum | IP -> ${req.ip} | No Login| `;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* for getting year for which data is available   D*/

router.get("/getYearData", (req, res) => {
  if (req.session.username) {
    let table = "";
    let x = "";
    if (req.query.table == "admit") {
      table = "admittedstudents";
      x = `select distinct year from ${table} `;
    } else if (req.query.table == "seats") {
      table = "clc_councelling";
      x =
        "select distinct year from clc_councelling2 UNION select DISTINCT year from clc_councelling";
    }

    pool.query(x, (err, obj) => {
      if (err) {
        console.log(err);

        let mes = `| Request -> /admin/getYearData | IP -> ${req.ip} | Database Error| Admin -> ${req.session.username} `;
        logger.customLogger.log("error", mes);

        res.send("");
      } else {
        let mes = `| Request -> /admin/getYearData | IP -> ${req.ip} | Years List Fetched | Admin -> ${req.session.username} `;
        logger.customLogger.log("info", mes);

        res.send(obj);
      }
    });
  } else {
    let mes = `| Request -> /admin/getYearData | IP -> ${req.ip} | No Login| `;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});

/* Fetching the conversion Tabless  D*/

router.get("/fetchTableConversion", (req, res) => {
  if (req.session.username) {
    if (req.query.category == "AIUR" || req.query.category == "EWS") {
      pool.query(
        `select * from clc_councelling2 where category = ? and year = ? order by branch`,
        [req.query.category, req.query.year],
        (err, obj) => {
          if (err) {
            console.log(err);

            let mes = `| Request -> /admin/fetchTableConversion | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} `;
            logger.customLogger.log("error", mes);

            res.send("");
          } else {
            let tcat = req.query.tcategory.split("~");

            pool.query(
              `select xop,branch from clc_councelling where year = ? and category = "UR" order by branch`,
              [req.query.year],

              (err2, obj2) => {
                if (err2) {
                  console.log(err);

                  let mes = `| Request -> /admin/fetchTableConversion | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} `;
                  logger.customLogger.log("error", mes);

                  res.send("");
                } else {
                  
                  for (i = 0; i < obj2.length; i++) {
                    if (obj[i].branch == obj2[i].branch) {
                      // console.log ('chala');
                      obj[i]["Cat"] = obj2[i]["xop"];
                    }
                  }

                  // console.log (obj[0]);

                  let mes = `| Request -> /admin/fetchTableConversion | IP -> ${req.ip} | Fetched Table Data Conversion | Admin -> ${req.session.username} `;
                  logger.customLogger.log("info", mes);
                  // console.log (obj)
                  res.send(obj);
                }
              }
            );
          }
        }
      );
    } else {
      pool.query(
        `select * from clc_councelling where category = ? and year = ? order by branch`,
        [req.query.category, req.query.year],
        (err, obj) => {
          if (err) {
            console.log(err);

            let mes = `| Request -> /admin/fetchTableConversion | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} `;
            logger.customLogger.log("error", mes);

            res.send("");
          } else {
            let tcat = req.query.tcategory.split("~");

            pool.query(
              `select ${
                tcat[1].toLowerCase() + tcat[2].toLowerCase()
              } as Cat, branch from clc_councelling where category = ? and year = ? order by branch`,
              [tcat[0], req.query.year],
              (err2, obj2) => {
                if (err2) {
                  console.log(err);

                  let mes = `| Request -> /admin/fetchTableConversion | IP -> ${req.ip} | Database Error | Admin -> ${req.session.username} `;
                  logger.customLogger.log("error", mes);

                  res.send("");
                } else {
                  for (i = 0; i < obj2.length; i++) {
                    if (obj[i].branch == obj2[i].branch) {
                      obj[i]["Cat"] = obj2[i].Cat;
                    }
                  }

                  let mes = `| Request -> /admin/fetchTableConversion | IP -> ${req.ip} | Fetched Table Data Conversion | Admin -> ${req.session.username} `;
                  logger.customLogger.log("info", mes);

                  res.send(obj);
                }
              }
            );
          }
        }
      );
    }
  } else {
    let mes = `| Request -> /admin/fetchTableConversion | IP -> ${req.ip} | No Login | `;
    logger.customLogger.log("warn", mes);
    res.render("login", { errorBox: "Please Login First !" });
  }
});




/* Google Login Work */

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: '213811010076-buiqkg6cbtirvpfa23c34aii4987eldk.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:4242/admin/auth/callback',
      passReqToCallback: true
    },
    (request, accessToken, refreshToken, profile, done) => {
        const allowedDomain = 'mitsgwl.ac.in'; // Replace with your allowed domain
      const userEmail = profile.emails[0].value;
      const userDomain = userEmail.substring(userEmail.lastIndexOf('@') + 1);
      
      if (userDomain !== allowedDomain) {
        return done(null, false, { message: 'Invalid domain' });
      }

      profile.imageUrl = profile.photos[0].value; // Add profile image URL to the profile object
      return done(null, profile);
    }
    )
);

router.get('/auth', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get('/auth/callback', passport.authenticate('google', {
  successRedirect: '/admin/auth/callback/success',
  failureRedirect: '/admin/auth/callback/failure'
}));

router.get('/auth/callback/success', (req, res) => {
  if (!req.user) {

    res.redirect('/admin/auth/callback/failure');
  } else {
    const { email, imageUrl, displayName } = req.user;
    let year = new Date ();
    year = year.getFullYear();
    
    pool.query (`select * from adminlogin where username = ? and year = ?`,[email , year],(err,obj)=>{
      if (err){

        console.log (err);
        let mes = `| Request -> /admin/auth/callback/success | IP -> ${req.ip} | Server Error DB | `;
        logger.customLogger.log("warn", mes);
        res.render("login", { errorBox: " Server Error !" });
        
      }
      
      else{ 
        if (obj.length != 0 ){

          if (obj[0].active == "Y"){
            req.session.username = email;
            req.session.name = displayName;
            req.session.type = obj[0].type;
            req.session.profile = obj[0].profile;
            
            let mes = `| Request -> /admin/auth/callback/success | IP -> ${req.ip} | SuccessFul Login With Google | Admin -> ${req.session.username} |`;
            logger.customLogger.log("info", mes);
            res.redirect("/admin/dashboard");
            
          }
          
          else{
            
            let mes = `| Request -> /admin/auth/callback/success | IP -> ${req.ip} | SuccessFul Login With Google | Admin -> ${req.session.username} |`;
            logger.customLogger.log("info", mes);
            res.render ('login',{errorBox : "You are not Authorized ! Contact Admin"});
          }
   
        }
        
          else{

            let p = uuid () + `.png`;

            saveImageUrl (imageUrl , p);

            res.render ('setPswd', {errorBox : "0" , name : displayName , email : email , photo : p});
          }
        }
      })
    }
  });

  router.get('/auth/callback/failure', (req, res) => {
    res.render("login", { errorBox: " Authorization Failed !" });
});


router.get('/auth/callback/incorrect-domain', (req, res) => {
  res.render("login", { errorBox: " You are not Authorized !" });
});





/* Set the password after the google login  */


router.post ('/setPassword',(req,res)=>{
  const text = req.body;
  let year = new Date ();
  year = year.getFullYear ();

  let p = aes256.encrypt (passkey , text.password);
  pool.query (`insert into adminlogin (name , username , password , profile , type , active, year) values (?,?,?,?,"Normal" , "Y" , ?)`,[text.name , text.email, p , text.photo , year], (err,obj)=>{
    if (err){
      console.log (err);
      
      let mes = `| Request -> /admin/setPassword | IP -> ${req.ip} | Server Error DB  | `;
      logger.customLogger.log("warn", mes);
      res.render("login", { errorBox: " Server Error !" });
    }

    else{
      req.session.username = text.email;
      req.session.name = text.name;
      req.session.type = "Normal";
      req.session.profile = text.photo;

      res.redirect('/admin/dashboard');
    }
    })
  })
  


  /* Change the admin position */

  router.post ('/changePositionAdmin', (req,res)=>{
    if (req.session.username){
      if (req.session.type == "Super Admin"){
        let year = new Date ();
        year = year.getFullYear ();

        pool.query ('update adminlogin set type = ? where username = ? and year = ?' , [req.body.type , req.body.username , year] , (err,obj)=>{
          if (err){
            console.log (err);
            let mes = `| Request -> /admin/changePositionAdmin | IP -> ${req.ip} | Server Error | Admin -> ${req.session.username} `;
            logger.customLogger.log("warn", mes);
            res.send ([]);
          }
          
          else{
            let mes = `| Request -> /admin/changePositionAdmin | IP -> ${req.ip} | ${req.body.username} Position Changed | Admin -> ${req.session.username} `;
            logger.customLogger.log("info", mes);
            res.send ([]);
          }
        })

      }
    }

    else {
      let mes = `| Request -> /admin/getYearData | IP -> ${req.ip} | No Login| `;
      logger.customLogger.log("warn", mes);
      res.send ([]);
    }
  })
  
  module.exports = router;
  