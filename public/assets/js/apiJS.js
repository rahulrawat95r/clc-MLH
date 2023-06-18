/* Function for checking about the username used in { addAdmin }  D*/

// const { response } = require("express");

function checkUsername(e) {
  if (e.value == "") {
    hideSuccess();
    showError("Username Cannot be Empty !");

    SubmitBtnFeature(0);
  } else {
    let x = "/admin/checkUsernameApi?username=" + e.value;
    fetch(x)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          // DATABASE ERROR
          showError(data.error);
          document.getElementById("submitBtn").disabled = true;
        } else {
          // Username already present
          if (data.status) {
            hideSuccess();
            showError("Username Already Exists !");
            SubmitBtnFeature(0);
          } else {
            // USERNAME AVAILABLE
            hideError();
            showSuccess("Username is Available !");
            SubmitBtnFeature(1);
          }
        }
      });
  }
}

/* Function to search the details of the student for admission   D*/

function searchStudent() {
  let roll = document.getElementById("stuRollNo").value;
  document.getElementById("SubmitFormBtn").disabled = true;

  let x = "/admin/searchStudent?roll=" + roll;
  fetch(x)
    .then((response) => response.json())
    .then((data) => {
      if (data.status == 0) {
        hideSuccess();
        showError(data.msg);
        document.getElementById("rbtn").click();
      } else {
        hideError();
        showSuccess(data.msg);
        document.getElementById("rbtn").click();

        addStudentAdmissionData(data.data);
      }
    });
}

/* Funciton for fetching the category seats data   used in { categorySeats } */

function categorySeats() {
  let cat = document.getElementById("catSelect").value;
  document.getElementById("catName").innerText = cat;
  let year = document.getElementById("yearOption").value;

  let dating = new Date ();
  // console.log ('chala' + cat)

  let x = "/admin/categorySeatsData?category=" + cat + "&year=" + year;
  fetch(x)
    .then((response) => response.json())
    .then((data) => {
      // console.log ('data');

      if (data != "") {
        if (cat == "AIUR" || cat == "EWS") {
          $(document).ready(function () {
            var table = $("#myTable").DataTable();

            table.destroy();

            table = document.getElementById("myTable");
            table.innerHTML = "";
            table = document.getElementById("myTable");
            //   console.log (table.innerHTML);

            table.innerHTML = `<thead>
                    <tr>
                      <th> S No </th>
                      <th> Branch </th>
                      <th> Category </th>
                      <th> Seats </th>
                    </tr>
                  </thead>
                  <tbody id ="tableWork">
                 
                  </tbody>  `;

            $("#myTable").DataTable({
              dom: "Bfrtip",
              buttons: [
                {
                  extend: "pdfHtml5",
                  title: `${year} Seat Status ${dating}`,
                  orientation: "landscape",
                  pageSize: "A4", // You can also use "A1","A2" or "A3", most of the time "A3" works the best.
                  text: "PDF",
                  titleAttr: "PDF",
                },
                "excel",
                "copy",
              ],
              responsive: true,
              data: data,
              columns: [
                { data: "sno" },
                { data: "branch" },
                { data: "category" },
                { data: "seats" },
              ],
            });

            // console.log ('kake');
            Swal.fire("Success!", "Seats Loaded Successfully !", "success");
            // console.log ('kake');
            hideError();
            showSuccess("Seats Data Loaded Successfully !");
          });
        } else {
          $(document).ready(function () {
            var table = $("#myTable").DataTable();

            table.destroy();

            table = document.getElementById("myTable");
            table.innerHTML = "";
            table = document.getElementById("myTable");
            //   console.log (table.innerHTML);

            table.innerHTML = `<thead>
                  <tr>
                    <th> S No </th>
                    <th> Branch </th>
                    <th> Category </th>
                    <th> X F </th>
                    <th> X OP </th>
                    <th> S F </th>
                    <th> S OP </th>
                    <th> FF F </th>
                    <th> FF OP </th>
                    <th> HC F </th>
                    <th> HC OP </th>
                    <th> NCC F </th>
                    <th> NCC OP </th>
                    <th> TS F </th>
                    <th> TS OP </th>
                  </tr>
                </thead>
                <tbody id ="tableWork">
               
                </tbody>  `;

            $("#myTable").DataTable({
              dom: "Bfrtip",
              buttons: [
                {
                  extend: "pdfHtml5",
                  title: `${year} Seat Status ${dating}`,
                  orientation: "landscape",
                  pageSize: "A4", // You can also use "A1","A2" or "A3", most of the time "A3" works the best.
                  text: "PDF",
                  titleAttr: "PDF",
                },
                "excel",
                "copy",
              ],
              responsive: true,
              data: data,
              columns: [
                { data: "sno" },
                { data: "branch" },
                { data: "category" },
                { data: "xf" },
                { data: "xop" },
                { data: "sf" },
                { data: "sop" },
                { data: "fff" },
                { data: "ffop" },
                { data: "hcf" },
                { data: "hcop" },
                { data: "nccf" },
                { data: "nccop" },
                { data: "tsf" },
                { data: "tsop" },
              ],
            });

            // console.log ('kake');
            Swal.fire("Success!", "Seats Loaded Successfully !", "success");
            // console.log ('kake');
            hideError();
            showSuccess("Seats Data Loaded Successfully !");
          });
        }

        // let table = document.getElementById("myTable");

        // document.getElementById('tableWork').innerHTML = cod;
      } else {
        Swal.fire("Error!", "Server Error!", "error");
      }
    });
}

/* Branch Available for the Admit new student page used in {admitNewStudent} */

function branchAvailableAdmission() {
  document.getElementById("selBranch").innerText = "Branch";
  document.getElementById("selBranchOptions").innerHTML = "";
  document.getElementById("ssBranch").value = "";
  document.getElementById("SubmitFormBtn").disabled = true;
  

  let sub = document.getElementById("ssubCat").innerText;
  sub = sub.split(" ");

  if (sub[0] == "AIUR" || sub[0] == "EWS"){

      let x = `/admin/checkVacantBranches?category=${sub[0]}&quota=${sub[0]}`;
    
      fetch(x)
        .then((response) => response.json())
        .then((data) => {
          if (data.length != 0) {
            let branch = document.getElementById("selBranchOptions");
            branch.innerHTML = "";
    
            data.forEach((item) => {
    
              let x =
                `<span class="dropdown-item" onclick="updateCat('` +
                item.branch +
                `','selBranch');document.getElementById('ssBranch').value = '` +
               item.branch +
                `';  checkSeatAvailable()   ;" style="cursor: pointer;">` +
                item.branch +
                `</span>`;
    
              branch.innerHTML += x;
            });
          } else {
            updateCat("No Vacant Branch Available !", "selBranch");
            document.getElementById("ssBranch").value = "";
          }
        });
  }

  else{

      let x = `/admin/checkVacantBranches?category=${sub[0]}&quota=${
        sub[1].toLowerCase() + sub[2].toLowerCase()
      }`;
    
      fetch(x)
        .then((response) => response.json())
        .then((data) => {
          if (data.length != 0) {
            let branch = document.getElementById("selBranchOptions");
            branch.innerHTML = "";
    
            data.forEach((item) => {
              let branchDivided = item.branch.replaceAll(" ", "_");
    
              let x =
                `<span class="dropdown-item" onclick="updateCat('` +
                item.branch +
                `','selBranch');document.getElementById('ssBranch').value = '` +
                branchDivided +
                `';  checkSeatAvailable()   ;" style="cursor: pointer;">` +
                item.branch +
                `</span>`;
    
              branch.innerHTML += x;
            });
          } else {
            updateCat("No Vacant Branch Available !", "selBranch");
            document.getElementById("ssBranch").value = "";
          }
        });
  }

}

/* checking for the available seats in the admit student page  */

function checkSeatAvailable() {
  let branch = document.getElementById("ssBranch").value;
  let category = document.getElementById("selsubCategory").value;
  // console.log (category)
  // console.log (branch);
  category = category.split(" ");
  
  if (branch != "") {
      if (category[0] == "AIUR" || category[0] == "EWS"){
          
          let x =
            "/admin/checkAvailability?category=" +
            category[0] +
            "&quota=" +
            category[0] +
            "&branch=" +
            branch +
            "";
          // console.log (x);
          fetch(x)
            .then((response) => response.json())
            .then((data) => {

              document.getElementById("ssAvailable").value = data[0]['seats'];
        
              if (data[0]['seats'] > 0) {
                document.getElementById("SubmitFormBtn").disabled = false;
              }
            });
    }

    else{

        let x =
          "/admin/checkAvailability?category=" +
          category[0] +
          "&quota=" +
          category[1] +
          category[2] +
          "&branch=" +
          branch +
          "";
        // console.log (x);
        fetch(x)
          .then((response) => response.json())
          .then((data) => {
            let finCat = category[1] + category[2];
            finCat = finCat.toLowerCase();
            document.getElementById("ssAvailable").value = data[0][finCat];
    
            if (data[0][finCat] > 0) {
              document.getElementById("SubmitFormBtn").disabled = false;
            }
          });
    }

  }
}

/* Function to add the admitted student data in the table of admit students used in { admittedStudent }*/

function dataAdmitStudentTable() {
  let year = document.getElementById("yearOption").value;

  let x = "/admin/admittedStudentData?year=" + year;
  fetch(x)
    .then((response) => response.json())
    .then((data) => {
      if (data != "") {
        let table = document.getElementById("myTable");
        $(document).ready(function () {
          table = $("#myTable").DataTable({
            destroy: true,
            searching: false,
          });

          table.destroy();

          $("#myTable").DataTable({
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdfHtml5",
                title: `${year} Admitted Students`,
                orientation: "landscape",
                pageSize: "A3", // You can also use "A1","A2" or "A3", most of the time "A3" works the best.
                text: "PDF",
                titleAttr: "PDF",
              },
              "excel",
              "copy",
            ],
            responsive: true,
            data: data,
            columns: [
              { data: "sno" },
              { data: "delete" },
              { data: "jeerollno" },
              { data: "Candidate_Type" },
              { data: "name" },
              { data: "fathersname" },
              { data: "Phonenumber" },
              { data: "branch" },
              { data: "category" },
              { data: "subcategory" },
              { data: "admissiontime" },
              { data: "feestatus" },
              { data: "feereceiptno" },
              { data: "gender" },
              { data: "dob" },
              { data: "domicile" },
              { data: "remarks" },
            ],
          });
        });
      }
    });
}

/* Branch Addition on the seat conversion Page */

// function branchAvailable(){

//     let x = '/admin/checkVacantBranches';

//     fetch(x)
//         .then(response => response.json())
//         .then((data) => {

//             if (data.length != 0){
//                 let branch = document.getElementById('selBranchOptions');
//                 branch.innerHTML = "";

//                 data.forEach ((item)=>{
//                     let x = `<span class="dropdown-item" onclick="updateCat('`+ item.branch + `','selBranch') ; categoryAvailableConversion();" style="cursor: pointer;">` + item.branch +`</span>`;

//                     branch.innerHTML += x;
//                 })
//             }

//             else {
//                 updateCat('No Vacant Branch Available !', 'selBranch');
//             }

//         })

// }

/* Category Addition on the seat conversion page */

// function categoryAvailableConversion (){

//     updateCat('Select Category !', 'selCategory')
//     updateCat('Select Sub Category !', 'selSubCategory');
//     updateCat ('To Category' , 'selToCategory');
//     document.getElementById('selSubCategoryOptions').innerHTML = "";

//     let branch = document.getElementById('selBranch').innerText;
//     // console.log (branch);
//     branch = branch.replaceAll (' ','_');

//     let x = '/admin/checkVacantCategory?branch=' + branch;

//     fetch(x)
//         .then(response => response.json())
//         .then((data) => {

//             if (data.length != 0){
//                 let category = document.getElementById('selCategoryOptions');
//                 category.innerHTML = "";

//                 data.forEach ((item)=>{
//                     let x = `<span class="dropdown-item" onclick="updateCat('` + item.category + `','selCategory') ; subCategoryAvailableConversion () ;" style="cursor: pointer;">` + item.category +`</span> `;

//                     category.innerHTML += x;
//                 })
//             }

//             else {
//                 updateCat('No Vacant Branch Available !', 'selCategory' );
//             }

//     })
// }

/* Category Addition on the seat conversion page */

function subCategoryAvailableConversion() {
  updateCat("Select Sub Category !", "selSubCategory");
  updateCat("To Category", "selToCategory");

  let category = document.getElementById("selCategory").innerText;
  let branch = document.getElementById("selBranch").innerText;
  branch = branch.replaceAll(" ", "_");
  // console.log (branch);

  let x =
    "/admin/checkVacantSubCategory?branch=" + branch + "&category=" + category;

  fetch(x)
    .then((response) => response.json())
    .then((data) => {
      if (data.length != 0) {
        let subcategory = document.getElementById("selSubCategoryOptions");
        let keys = Object.keys(data[0]);

        subcategory.innerHTML = "";

        keys.forEach((item) => {
          if (item != "branch" && item != "category") {
            if (data[0][item] > 0) {
              let y = item.toUpperCase();

              let x =
                `<span class="dropdown-item" onclick="updateCat('` +
                category +
                " | " +
                y +
                `','selSubCategory'); addConvertToCategories('` +
                category +
                " | " +
                y +
                `') " style="cursor: pointer;">` +
                category +
                " | " +
                y +
                `</span> `;

              subcategory.innerHTML += x;
            }
          }
        });
      } else {
        updateCat("No Vacant Branch Available !", "selSubCategory");
      }
    });
}

/* Seat Conversion API */

function SeatConversionData() {
  // let branch = document.getElementById('selBranch').innerText;
  let category = document.getElementById("selSubCategory").innerText;
  let toCategory = document.getElementById("selToCategory").innerText;
  let year = document.getElementById("yearOption").value;

  if (category == "Select Sub Category !" || toCategory == "To Category") {
    hideSuccess();
    showError("Invalid Information For Conversion !");
    Swal.fire("Attention !", "Please provide All Information !", "error");
  } else {
    category = category.split(" ");

    if (category[0] == "AIUR" || category[0] == "EWS"){
  
      let x =
        "/admin/SeatConversionConvert?fcategory=" +
        category[0] +
        "&fsubcategory=" +
        category[0] +
        "&tcategory=" +
        toCategory+
        "&tsubcategory=" +
        toCategory +
        "&year=" +
        year;
      // console.log (x);
  
      fetch(x)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            hideError();
            showSuccess("Seats Converted Successfully !");
            Swal.fire(
              "Success!",
              "Seats have been Converted Successfully !",
              "success"
            );
  
            fetchtableConversion("After");
          } else {
            hideSuccess();
            showError("Server Error !");
            Swal.fire("Sorry!", "A Server Error Has Occured !", "error");
          }
        });
    }

    else{

      toCategory = toCategory.split(" | ");
  
      let x =
        "/admin/SeatConversionConvert?fcategory=" +
        category[0] +
        "&fsubcategory=" +
        category[1] +
        category[2] +
        "&tcategory=" +
        toCategory[0] +
        "&tsubcategory=" +
        toCategory[1] +
        toCategory[2] +
        "&year=" +
        year;
      // console.log (x);
  
      fetch(x)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            hideError();
            showSuccess("Seats Converted Successfully !");
            Swal.fire(
              "Success!",
              "Seats have been Converted Successfully !",
              "success"
            );
  
            fetchtableConversion("After");
          } else {
            hideSuccess();
            showError("Server Error !");
            Swal.fire("Sorry!", "A Server Error Has Occured !", "error");
          }
        });
    }

  }
}

/* Category Available for the seat conversion  */

function CategoryAvailableForConversion() {
  // console.log ('jai');
  let year = document.getElementById("yearOption").value;

  let x = "/admin/findVacantCategory?year=" + year;
  let category = document.getElementById("selCategoryOptions");
  category.innerHTML = "";

  fetch(x)
    .then((response) => response.json())
    .then((data) => {
      data.map((items) => {
        let y = ` <span class="dropdown-item" onclick="updateCat('${items.category}','selCategory');AddSubCategoryConversion() ;" style="cursor: pointer;">${items.category}</span> `;

        category.innerHTML += y;
      });
    });
}

/* checking / Fetching Vacant Sub category for the student admission page  */

function subCategoryAvailableConversionAdmissionPage() {
  // Defaulting the sub category

  document.getElementById("ssubCat").innerText = "Sub Category";
  document.getElementById("subCategoryOptionToAdd").innerHTML = "";
  document.getElementById("selsubCategory").value = "";

  document.getElementById("selBranch").innerText = "Branch";
  document.getElementById("selBranchOptions").innerHTML = "";
  document.getElementById("ssBranch").value = "";
  document.getElementById("SubmitFormBtn").disabled = "true";

  let cat = document.getElementById("selCat").innerText;
  let gen = document.getElementById("sgender").value;

  // console.log (branch);

  let x = "/admin/checkVacantSubCategory?category=" + cat;

  fetch(x)
    .then((response) => response.json())
    .then((data) => {
      let subcategory = document.getElementById("subCategoryOptionToAdd");
      subcategory.innerHTML = "";

      if (data.length != 0) {
        if (cat == "AIUR" || cat == "EWS"){

            if (data[0].seats > 0){
                let x =
                    `<span class="dropdown-item" onclick="updateCat('` +
                    cat +
                    `','ssubCat');document.getElementById('selsubCategory').value = '` +
                    cat +
                    `'; branchAvailableAdmission () ; " style="cursor: pointer; ">` +
                    cat +
                    `</span>`;

                document.getElementById(
                    "subCategoryOptionToAdd"
                ).innerHTML += x;
            }
    
            
        }

        else{

            let keys = Object.keys(data[0]);
    
            keys.forEach((item) => {
              if (item != "year") {
                for (i = 0; i < data.length; i++) {
                  if (data[i][item] > 0) {
                    let y = item.toUpperCase();
                    // console.log (y);
    
                    let quotaM = "";
                    let genderM = "";
    
                    if (y[y.length - 1] == "F") {
                      genderM = "F";
                      // console.log ('chala')
                      // XF
                      quotaM = y.slice(0, y.length - 1);
                    } else {
                      // XOP
                      genderM = "OP";
                      quotaM = y.slice(0, y.length - 2);
                    }
                    // console.log (genderM, quotaM, "kakek");
    
                    if (genderM == "F") {
                      if (gen == "F") {
                        let x =
                          `<span class="dropdown-item" onclick="updateCat('` +
                          cat +
                          ` ` +
                          quotaM +
                          ` F','ssubCat');document.getElementById('selsubCategory').value = '` +
                          cat +
                          ` ` +
                          quotaM +
                          ` F'; branchAvailableAdmission () ; " style="cursor: pointer; ">` +
                          cat +
                          ` ` +
                          quotaM +
                          ` F</span>`;
    
                        document.getElementById(
                          "subCategoryOptionToAdd"
                        ).innerHTML += x;
                      }
                      // selectElement.innerHTML += '<option value="' + cat + ' ' + quota[i] + ' F">' + cat + ' ' + quota[i] +' F</option>';
                    } else {
                      let x =
                        `<span class="dropdown-item" onclick="updateCat('` +
                        cat +
                        ` ` +
                        quotaM +
                        ` OP','ssubCat'); document.getElementById('selsubCategory').value = '` +
                        cat +
                        ` ` +
                        quotaM +
                        ` OP'; branchAvailableAdmission () ; " style="cursor: pointer;">` +
                        cat +
                        ` ` +
                        quotaM +
                        ` OP</span>`;
    
                      document.getElementById("subCategoryOptionToAdd").innerHTML +=
                        x;
                    }
    
                    break;
                  }
                }
              }
            });
        }

      } else {
        updateCat("No Vacant Branch Available !", "ssubCat");
      }
    });
}

/* Function to add the admitted student data in the Fee table of Fee Table  students */

function dataAdmitStudentTableFEE() {
  let year = document.getElementById("yearOption").value;

  let x = "/admin/admittedStudentDataFEE?year=" + year;
  fetch(x)
    .then((response) => response.json())
    .then((data) => {
      // console.log ('data');

      if (data != "") {
        data.delete =
          '<button type="button" class="btn btn-gradient-danger btn-fw">Danger</button>';
        // console.log (data);
        // console.log (data[0]['delete']);
        let table = document.getElementById("myTable");
        $(document).ready(function () {
          table = $("#myTable").DataTable({
            destroy: true,
            searching: false,
          });

          table.destroy();

          $("#myTable").DataTable({
            dom: "Bfrtip",
            responsive: true,
            buttons: [
              {
                extend: "pdfHtml5",
                title: `${year} Admitted Students Fee`,
                orientation: "landscape",
                pageSize: "A3", // You can also use "A1","A2" or "A3", most of the time "A3" works the best.
                text: "PDF",
                titleAttr: "PDF",
              },
              "excel",
              "copy",
            ],
            responsive: true,
            data: data,
            columns: [
              { data: "sno" },
              { data: "delete" },
              { data: "jeerollno" },
              { data: "Candidate_Type" },
              { data: "name" },
              { data: "fathersname" },
              { data: "branch" },
              { data: "feestatus" },
              { data: "feereceiptno" },
              { data: "Phonenumber" },
              { data: "category" },
              { data: "subcategory" },
              { data: "admissiontime" },
              { data: "gender" },
              { data: "dob" },
              { data: "domicile" },
              { data: "remarks" },
            ],
          });
        });

        // document.getElementById('tableWork').innerHTML = cod;
      }
    });
}

/* Fee Submission POP with submission */

function FeePop(a) {
  let year = document.getElementById('yearOption').value;

  Swal.fire({
    title: "Enter the Fee Receipt Number",
    input: "text",
    inputLabel: "Receipt Number",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "You need to write something!";
      } else {
        let x = "/admin/addReceiptNum?roll=" + a + "&num=" + value + "&year=" + year;

        fetch(x)
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              Swal.fire(
                "Server Error !",
                "A Server Error Has Occured !",
                "error"
              );
            } else {
              window.location.href = "/admin/feeSubmissionPage";
            }
          });
      }
    },
  });
}

/* Adding FROM Sub Category in the seat conversion page */

function AddSubCategoryConversion() {
  let cat = document.getElementById("selCategory").innerText;
  let year = document.getElementById("yearOption").value;

  document.getElementById("selSubCategory").innerText = "Select Sub Category !";
  document.getElementById("selSubCategoryOptions").innerHTML = "";
  document.getElementById("selToCategory").innerText = "To Category";
  document.getElementById("convertToCatOptions").innerHTML = "";

  let x = "/admin/checkVacantSubCategory?category=" + cat + "&year=" + year;

  
  fetch(x)
    .then((response) => response.json())
    .then((data) => {
      let subcategory = document.getElementById("selSubCategoryOptions");
      subcategory.innerHTML = "";

      if (data.length != 0) {

        if (cat == "AIUR" || cat == "EWS"){

          if (data[0].seats > 0){
              let x =
                  `<span class="dropdown-item" onclick="updateCat('` +
                  cat +
                  `','selSubCategory'); addingCattoOption('${cat}') ; " style="cursor: pointer; ">` +
                  cat +
                  `</span>`;

              subcategory.innerHTML += x;
          }
  
          
      }

      else{

        let keys = Object.keys(data[0]);
  
        keys.forEach((item) => {
          if (item != "year") {
            for (i = 0; i < data.length; i++) {
              if (data[i][item] > 0) {
                let y = item.toUpperCase();
                // console.log (y);
  
                let quotaM = "";
                let genderM = "";
  
                if (y[y.length - 1] == "F") {
                  genderM = "F";
                  // console.log ('chala')
                  // XF
                  quotaM = y.slice(0, y.length - 1);
                } else {
                  // XOP
                  genderM = "OP";
                  quotaM = y.slice(0, y.length - 2);
                }
                // console.log (genderM, quotaM, "kakek");
  
                let x =
                  `<span class="dropdown-item" onclick="updateCat('` +
                  cat +
                  ` ` +
                  quotaM +
                  ` ${genderM} ','selSubCategory'); addingCattoOption('` +
                  cat +
                  ` ` +
                  quotaM +
                  ` ${genderM} ') ; " style="cursor: pointer;">` +
                  cat +
                  ` ` +
                  quotaM +
                  ` ${genderM}</span>`;
  
                subcategory.innerHTML += x;
  
                break;
              }
            }
          }
        });
      }


      } else {
        updateCat("No Vacant Branch Available !", "ssubCat");
      }
    });
}

/* Function for getting the years whose data is available  */

/* admittedStudent = admit */

function getYearList(a) {
  let val = document.getElementById("yearOption");
  document.getElementById("SubBtn").disabled = true;

  val.innerHTML =
    '<option selected disabled class="dropdown-item" value="Select Year">Select Year</option>';

  fetch(`/admin/getYearData?table=${a}`)
    .then((response) => response.json())
    .then((data) => {
      if (data != "") {
        data.map((item) => {
          val.innerHTML += `<option class="dropdown-item" value = "${item.year}">${item.year}</option>`;
        });
      }
    });
}

/* Fetching the tables data for the conversion */

function fetchtableConversion(a) {
  let category = document.getElementById("selSubCategory").innerText;
  let toCategory = document.getElementById("selToCategory").innerText;
  let year = document.getElementById("yearOption").value;

  if (toCategory == "To Category") {
    swal.fire("Error", "Please Provide All Information", "error");
  } else {
    category = category.split(" ");
    toCategory = toCategory.replaceAll(" | ", "~");

    let x = `/admin/fetchTableConversion?category=${category[0]}&tcategory=${toCategory}&year=${year}`;

    fetch(x)
      .then((response) => response.json())
      .then((data) => {
        if (data != "") {
          let table = document.getElementById("myTable");
          $(document).ready(function () {
            table = $("#myTable").DataTable({
              destroy: true,
              searching: false,
            });

            toCategory = toCategory.replaceAll("~", " | ");
            table.destroy();
            
            if (category[0] == "AIUR" || category[0] == "EWS"){
              
              document.getElementById("myTable").innerHTML = `<thead>
                  <tr id = "headingRow">
                    <th> Branch </th>
                    <th> ${category[0]} </th>
                    <th> UR | X | OP </th>

                    </tr>
                </thead>
                <tbody>
                  
                </tbody>`;

  
              $("#myTable").DataTable({
                dom: "Bfrtip",
                responsive: true,
                buttons: [
                  {
                    extend: "pdfHtml5",
                    title: `${a} Seat Conversion ${category[0]} -> ${toCategory}`,
                    orientation: "landscape",
                    pageSize: "A3", // You can also use "A1","A2" or "A3", most of the time "A3" works the best.
                    text: "PDF",
                    titleAttr: "PDF",
                  },
                  "excel",
                  "copy",
                ],
                responsive: true,
                data: data,
                columns: [
                  // {data : 'sno'},
                  { data: "branch" },
                  { data: "seats" },
                  { data: "Cat" },

                ],
              });


            }

            else {
              document.getElementById("myTable").innerHTML = `<thead>
                          <tr id = "headingRow">
                            <th> Branch </th>
                            <th><span class="tableHeading"></span> | X | F </th>
                            <th><span class="tableHeading"></span> | X | OP </th>
                            <th><span class="tableHeading"></span> | S | F </th>
                            <th><span class="tableHeading"></span> | S | OP </th>
                            <th><span class="tableHeading"></span> | FF | F </th>
                            <th><span class="tableHeading"></span> | FF | OP </th>
                            <th><span class="tableHeading"></span> | HC | F </th>
                            <th><span class="tableHeading"></span> | HC | OP </th>
                            <th><span class="tableHeading"></span> | NCC | F </th>
                            <th><span class="tableHeading"></span> | NCC | OP </th>
                            <th><span class="tableHeading"></span> | TS | F </th>
                            <th><span class="tableHeading"></span> | TS | OP </th>
                            <th>${toCategory}</th>
                            </tr>
                        </thead>
                        <tbody>
                          
                        </tbody>`;
  
              let th = document.querySelectorAll(".tableHeading");
  
              th.forEach((item) => {
                item.innerText = category[0];
              });
  
              $("#myTable").DataTable({
                dom: "Bfrtip",
                responsive: true,
                buttons: [
                  {
                    extend: "pdfHtml5",
                    title: `${a} Seat Conversion ${category} -> ${toCategory}`,
                    orientation: "landscape",
                    pageSize: "A3", // You can also use "A1","A2" or "A3", most of the time "A3" works the best.
                    text: "PDF",
                    titleAttr: "PDF",
                  },
                  "excel",
                  "copy",
                ],
                responsive: true,
                data: data,
                columns: [
                  // {data : 'sno'},
                  { data: "branch" },
                  { data: "xf" },
                  { data: "xop" },
                  { data: "sf" },
                  { data: "sop" },
                  { data: "fff" },
                  { data: "ffop" },
                  { data: "hcf" },
                  { data: "hcop" },
                  { data: "nccf" },
                  { data: "nccop" },
                  { data: "tsf" },
                  { data: "tsop" },
                  { data: "Cat" },
                ],
              });

            }

            swal.fire ('Success','Data Fetched Successfully !','success');

          });
        }

        else{

          swal.fire ('Warning','Data Not Available','warning')
        }
      });
  }
}




/* Activating / Deactivation Adminss */


function actiDeactiAdmin (email , state){


  Swal.fire({
    title: "Are you sure?",
    text: "You want to Perform this Action !",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Do It!",
  }).then((result) => {
    if (result.isConfirmed) {
      // console.log ('cnaa')
      fetch ('/admin/adminActivationFeature' , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username : email , action : state.toLowerCase()})
      })
    
      .then ((response => response.json ()))
      .then ((data) => {
        window.location.href = "/admin/addAdminPage";
      })

      
    } else {
      Swal.fire("Cancelled!", "Your Data is SAFE!", "warning");
    }
  });
    
}




/* Function to change the position of the admins */

function changePositionAdmin (email){
  let pos = document.getElementById (`${email}Position`).innerText;

  Swal.fire({
    title: "Are you sure?",
    text: "You want to Change the Position !",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Do It!",
  }).then((result) => {
    if (result.isConfirmed) {
      // console.log ('cnaa')
      fetch ('/admin/changePositionAdmin', {
        method : "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username : email , type: pos })
      })
    
      .then (response => response.json ())
      .then ((obj)=>{
        window.location.href = "/admin/addAdminPage";
      })

      
    } else {
      Swal.fire("Cancelled!", "Your Data is SAFE!", "warning");
    }
  });


  

}




/* Function for giving the alert before deleting */


function DeleteAlert (apiUrl){
  Swal.fire({
    title: "Are you sure?",
    text: "You want to Delete !",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Do It!",
  }).then((result) => {
    if (result.isConfirmed) {      
      // console.log ('cnaa')
      fetch (apiUrl)
    
      .then (response => response.json ())
      .then ((obj)=>{
        location.reload ();
      })

      
    } else {
      Swal.fire("Cancelled!", "Your Data is SAFE!", "warning");
    }
  });
}