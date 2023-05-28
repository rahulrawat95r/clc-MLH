/* Function to make full screen constant throughout */

function fullScreenWala() {
  // console.log ('chala');
  if (localStorage.getItem("fullscreen") == "true") {
    // console.log ('jai')
    document.getElementById("fullscreen-button").click();
  }

  isFirstClick = false;
  document.removeEventListener("click", fullScreenWala);
}

// Flag variable to track the first click
var isFirstClick = true;

// Add click event listener to the document
document.addEventListener("click", function (event) {
  // Check if it is the first click
  if (isFirstClick) {
    fullScreenWala();
  }
});

/* Function for updating the selection in the main box after selecting from the dropdown used in { addAdmin } */

function updateCat(a, b) {
  document.getElementById(b).innerText = a;
}

// Alerting before converting the seats

function alertSeatConversion() {
  // confirm("Are you sure you want to convert? This process is Irreversible !");

  let year = document.getElementById("yearOption").value;
  let fcategory = document.getElementById("selCategory").innerText;
  let fscategory = document.getElementById("selSubCategory").innerText;
  let tcategory = document.getElementById("selToCategory").innerText;

  if (
    year != "Select Year" &&
    fcategory != "Select Category !" &&
    fscategory != "selSubCategory" &&
    tcategory != "To Category"
  ) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, convert it!",
    }).then((result) => {
      if (result.isConfirmed) {
        SeatConversionData();
      }
    });
  } else {
    Swal.fire("Error", "Empty Fields Detected !", "error");
  }
}

// Showing the error

function showError(a) {
  document.getElementById("alertwale").style.display = "block";
  document.getElementById("alertMsg").innerText = a;
}

function hideError() {
  document.getElementById("alertwale").style.display = "none";
}

function showSuccess(a) {
  document.getElementById("successAlert").style.display = "block";
  document.getElementById("successAlert").innerText = a;
}

function hideSuccess() {
  document.getElementById("successAlert").style.display = "none";
}

/* Function for enabling and disabling submit button  D */

function SubmitBtnFeature(a) {
  // 1 For Enabling the button
  if (a) {
    document.getElementById("submitBtn").disabled = false;
  } else {
    document.getElementById("submitBtn").disabled = true;
  }
}

// Function for the error Box in Login Page

function errorBoxLogin() {
  let a = document.getElementById("error_box_server").value;

  if (a != "0") {
    showError(a);
  }
}

/* Function for updating the input value on the click from the option in the dropdown used in { addAdmin } */

function input_update(a, b) {
  document.getElementById(a).value = b;
}

/* Function for checking the error input used in {dataInput} */

function upload_page_check() {
  if (document.getElementById("error_checker").value != "0") {
    showSuccess(document.getElementById("error_checker").value);

    let e = document.getElementById('error_checker').value;

    if (e != "Files Have Been Uploaded Successfully !"){
      Swal.fire(
        "Warning!",
          e,
        "warning"
      );
      
    }

    else{
      Swal.fire(
        "Success!",
          e,
        "success"
      );

    }

  }
}

/* Function to add the data in the student admission  */

// let x = new Date();
// x.getFullYear

function addStudentAdmissionData(data) {
  document.getElementById("rno").value = data["Rollno"];
  document.getElementById("sname").value = data["Name"];
  document.getElementById("sfather").value = data["Father"];

  let x = new Date(data["DOB"]);
  const day = x.toLocaleDateString("en-US", { day: "2-digit" });
  const month = x.toLocaleDateString("en-US", { month: "2-digit" });

  document.getElementById("sdob").value =
    x.getFullYear() + "-" + month + "-" + day;
  document.getElementById("scategory").value = data["Category"];

  if (data["Domicile"] == "YES") {
    document.getElementById("sdomicileYes").checked = true;
  } else {
    document.getElementById("sdomicileNo").checked = true;
  }

  document.getElementById("sgender").value = data["Gender"];
  document.getElementById("stype").value = data["Candidate_Type"];

  addStudentAdmitCategory();

  // console.log(x.getFullYear() + "-" +   x.getMonth() + "-" + x.getDate());
}

/* Function for hiding the functionality used in {admitNewStudent , admittedStudent} */

function hideFeature() {
  let type = document.getElementById("adminType").innerText;

  // Default Show
  document.getElementById("dashboardHide").style.display = "block";
  document.getElementById("admittedHide").style.display = "block";
  document.getElementById("seatStatusHide").style.display = "block";

  if (type == "Admission") {
    document.getElementById("admissionHide").style.display = "block";
  } else if (type == "Accountant") {
    document.getElementById("feeSubmissionHide").style.display = "block";
  } else {
    document.getElementById("uploadHide").style.display = "block";
    document.getElementById("admissionHide").style.display = "block";
    document.getElementById("seatConversionHide").style.display = "block";
    document.getElementById("addAdminHide").style.display = "block";
    document.getElementById("feeSubmissionHide").style.display = "block";
  }
}

/* Function for submitting the form after enabling the input fields in the admit student page used in { admitNewStudent }   D*/

function submitAdmittedStudent() {
  const form = document.querySelector("#admitForm");

  form.addEventListener("submit", function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    if (document.getElementById("stype").value == "") {
      Swal.fire("Error", "Please Fill All Details", "error");
    } else {
      const disabledInputs = form.querySelectorAll("input:disabled");
      disabledInputs.forEach(function (input) {
        input.disabled = false;
      });
      // Submit the form

      form.submit();
    }
    // Enable disabled input fields
  });
}

/* Alert function before admitting (submitting) a student used in { admitNew Student }  D*/

function alertAdmittingStudent() {
  let branch = document.getElementById("selBranch").innerText;
  let category = document.getElementById("selCat").innerText;
  let subcategory = document.getElementById("ssubCat").innerText;

  let roll = document.getElementById('rno').value;
  let name = document.getElementById('sname').value;
  let fname = document.getElementById('sfather').value;

  if (
    branch != "Branch" &&
    category != "Category" &&
    subcategory != "Sub Category"
  ) {
    Swal.fire({
      title: 'Confirm Student Details !',
      html : `
      <label class="col-sm-3 col-form-label">Roll Number</label> <input class="form-control" type = "text" disabled value = "${roll}"/>
      <label class="col-sm-3 col-form-label">Name</label> <input class="form-control" type = "text" disabled value = "${name}"/>
      <label class="col-sm-3 col-form-label">Father Name</label> <input class="form-control" type = "text" disabled value = "${fname}"/>
      <label class="col-sm-3 col-form-label">Branch</label> <input class="form-control" type = "text" disabled value = "${branch}"/>
      <label class="col-sm-3 col-form-label">Category</label> <input class="form-control" type = "text" disabled value = "${category}"/>
      <label class="col-sm-3 col-form-label">Sub Category</label> <input class="form-control" type = "text" disabled value = "${subcategory}"/>
      `,
      buttons: true,
      showCancelButton: true,
      confirmButtonText: "Admit Student",
      cancelButtonText: "Cancel",
    }).then ((result)=>{

      if (result.isConfirmed) {

        document.getElementById("mainSubBtn").click();
      }

    })
  } else {
    Swal.fire("Empty Fields", "Please Select All Information", "error");
  }
}

/* Function for fixing the copyright year  */

function copyrightYear() {
  let date = new Date();
  document.getElementById("copyYear").innerText = date.getFullYear();
}

/* Function to default the category and sub category after changing branch in admit student */

function defaultCategorySubCat() {
  // Defaulting the category

  document.getElementById("selCat").innerText = "Category";
  document.getElementById("selCategory").value = "";
  document.getElementById('CategoryOptionToAdd').innerHTML = "";

  // Defaulting the sub category

  document.getElementById("ssubCat").innerText = "Sub Category";
  document.getElementById("SubmitFormBtn").disabled = true;
  document.getElementById("subCategoryOptionToAdd").innerHTML = "";
  document.getElementById("selsubCategory").value = "";
}

/* Delete Alert  */

function DeleteAlert(a) {
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

      window.location.href = a;
    } else {
      Swal.fire("Cancelled!", "Your Data is SAFE!", "warning");
    }
  });
}
