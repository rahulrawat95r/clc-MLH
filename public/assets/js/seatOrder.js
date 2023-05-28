var category = ["ST", "SC", "OBC", "UR"];
var quota = ["TS", "NCC", "HC", "FF", "S", "X"];
var gender = ["F", "OP"];

function addingCattoOption(a) {
  // console.log (a);
  document.getElementById("convertToCatOptions").innerHTML = "";

  let fetchingTable = "";

  if (document.getElementsByClassName('fetchBtn')[0]){
    fetchingTable = `document.getElementsByClassName('fetchBtn')[0].click();`;
  }

    if (a == "EWS" || a == "AIUR"){
      document.getElementById("convertToCatOptions").innerHTML =
        `<span class='dropdown-item' onclick="updateCat('UR | X | OP','selToCategory') ; ${fetchingTable}" style='cursor: pointer;'>UR | X | OP</span>`;
    }

    else{

      let from_option = a.split(" ");
    
      // Index of OBC
      let category_index_first_option = category.indexOf(from_option[0]);
    
      // Index of X
      let quota_index_first_option = quota.indexOf(from_option[1]);
    
      // Index of OP
      let gender_index_first_option = gender.indexOf(from_option[2]);
    
      // Checking for the female
    
      if (from_option[2] == "F") {
        document.getElementById("convertToCatOptions").innerHTML =
          `<span class='dropdown-item' onclick="updateCat('` +
          from_option[0] +
          ` | ` +
          from_option[1] +
          ` | ` +
          "OP" +
          `','selToCategory') ; ${fetchingTable}" style='cursor: pointer;'>` +
          from_option[0] +
          ` | ` +
          from_option[1] +
          ` | ` +
          "OP" +
          `</span>`;
      }
    
      // Add same category XOP
      let subcat = from_option[1] + from_option[2];
    
      if (subcat != "XF" && subcat != "XOP") {
        let x =
          `<span class='dropdown-item' onclick="updateCat('` +
          from_option[0] +
          ` | X | OP` +
          `','selToCategory'); ${fetchingTable}" style='cursor: pointer;'>` +
          from_option[0] +
          ` | X | OP` +
          `</span>`;
    
        document.getElementById("convertToCatOptions").innerHTML += x;
    }

    for (i = category_index_first_option + 1; i <= 3; i++) {
      let x =
        `<span class='dropdown-item' onclick="updateCat('` +
        category[i] +
        ` | X | OP` +
        `','selToCategory') ; ${fetchingTable}" style='cursor: pointer;'>` +
        category[i] +
        ` | X | OP` +
        `</span>`;
  
      document.getElementById("convertToCatOptions").innerHTML += x;
    }
  // OBC  X  OP

  }

  // Add remaing category X OP

}

/* Seating options to be added at the admit student page */

// function addStudentAdmitCategory (){
//     let cat = document.getElementById('scategory').value;
//     let gender = document.getElementById('sgender').value;
//     let subCat = document.getElementById('ssubCat').value;
//     document.getElementById('scatSelect').innerHTML = "";

//     if (gender == "F"){
//         for (i = category.indexOf(cat); i < category.length ;i++){
//             if (subCat != "X"){
//                 let x = `<option>` + category[i] + ` | `+ subCat + ` | F` + `</option>`
//                 document.getElementById('scatSelect').innerHTML += x;
//             }

//             x = `<option>` + category[i] + ` | X | F` + `</option>`
//             document.getElementById('scatSelect').innerHTML += x;
//         }

//     }

//     for (i = category.indexOf(cat); i < category.length ;i++){
//         if (subCat != "X"){
//             let x = `<option>` + category[i] + ` | `+ subCat + ` | OP` + `</option>`
//             document.getElementById('scatSelect').innerHTML += x;
//         }

//         x = `<option>` + category[i] + ` | X | OP` + `</option>`
//         document.getElementById('scatSelect').innerHTML += x;
//     }

// }

/* Upadate Seating Selection for the admit student page  D*/

function addStudentAdmitCategory() {
  let cat = document.getElementById("scategory").value;

  // Disabling the submit button
  document.getElementById("SubmitFormBtn").disabled = "true";

  let category = document.getElementById("CategoryOptionToAdd");
  category.innerHTML = "";

  if (cat != "UR") {
    category.innerHTML =
      `<span class="dropdown-item" onclick="updateCat('` +
      cat +
      `','selCat'); updateCat('` +
      "Sub Category" +
      `','ssubCat'); subCategoryAvailableConversionAdmissionPage ();document.getElementById('SubmitFormBtn').disabled = true; document.getElementById('selsubCategory').value = '' ; document.getElementById('selCategory').value = '` +
      cat +
      `'" style="cursor: pointer;">` +
      cat +
      `</span>`;
  }


  // For UR
  category.innerHTML +=
    `<span class="dropdown-item" onclick="updateCat('UR','selCat'); updateCat('` +
    "Sub Category" +
    `','ssubCat'); subCategoryAvailableConversionAdmissionPage ();document.getElementById('SubmitFormBtn').disabled = true ; document.getElementById('selsubCategory').value = '' ;  document.getElementById('selCategory').value = 'UR'" style="cursor: pointer;">UR</span>`;
  
  // FOR AIUR
    category.innerHTML +=
    `<span class="dropdown-item" onclick="updateCat('AIUR','selCat'); updateCat('` +
    "Sub Category" +
    `','ssubCat'); subCategoryAvailableConversionAdmissionPage ();document.getElementById('SubmitFormBtn').disabled = true ; document.getElementById('selsubCategory').value = '' ;  document.getElementById('selCategory').value = 'AIUR'" style="cursor: pointer;">AIUR</span>`;
  
  // FOR EWS
    category.innerHTML +=
    `<span class="dropdown-item" onclick="updateCat('EWS','selCat'); updateCat('` +
    "Sub Category" +
    `','ssubCat'); subCategoryAvailableConversionAdmissionPage ();document.getElementById('SubmitFormBtn').disabled = true ; document.getElementById('selsubCategory').value = '' ;  document.getElementById('selCategory').value = 'EWS'" style="cursor: pointer;">EWS</span>`;
}

/* Function to change the sub category after a category is selected in admission page */

// function addSubCategoryOptions (a){
//     let cat = a;
//     let gen = document.getElementById('sgender').value;

//     let selectElement = document.getElementById('subCategoryOptionToAdd');
//     selectElement.innerHTML = "";

//     for (i = 0 ; i < quota.length ; i++){

//         if (gen == "F"){
//             let x = `<span class="dropdown-item" onclick="updateCat('` +  cat + ` ` + quota[i]  + ` F','ssubCat');document.getElementById('selsubCategory').value = '` +  cat + ` ` + quota[i]  + ` F'; checkSeatAvailable() ;" style="cursor: pointer; ">` +  cat + ` ` + quota[i]  + ` F</span>`;

//             document.getElementById('subCategoryOptionToAdd').innerHTML += x;
//             // selectElement.innerHTML += '<option value="' + cat + ' ' + quota[i] + ' F">' + cat + ' ' + quota[i] +' F</option>';
//         }

//         let x = `<span class="dropdown-item" onclick="updateCat('` +  cat + ` ` + quota[i]  + ` OP','ssubCat'); document.getElementById('selsubCategory').value = '` +  cat + ` ` + quota[i]  + ` OP'; checkSeatAvailable() ;" style="cursor: pointer;">` +  cat + ` ` + quota[i]  + ` OP</span>`;

//         document.getElementById('subCategoryOptionToAdd').innerHTML += x;
//     }

// }

/* Function to add the convert to category for the conversion  */

function addConvertToCategories(a) {
  updateCat("To Category", "selToCategory");
  document.getElementById("convertToCatOptions").innerHTML = "";
  // console.log ('kake')
  // OBC | XOP
  a = a.split(" | ");

  // Index of OBC
  let categoryM = a[0];

  // Index of X
  let quotaM = "";
  let genderM = "";

  if (a[1][a[1].length - 1] == "F") {
    genderM = "F";
    // console.log ('chala')
    // XF
    quotaM = a[1].slice(0, a[1].length - 1);
  } else {
    // XOP
    genderM = "OP";
    quotaM = a[1].slice(0, a[1].length - 2);
  }

  // console.log (categoryM , quotaM, genderM);

  // Checking for the female

  if (genderM == "F") {
    // console.log("f wala");
    document.getElementById("convertToCatOptions").innerHTML =
      `<span class='dropdown-item' onclick="updateCat('` +
      categoryM +
      ` | ` +
      quotaM +
      ` | ` +
      `OP` +
      `','selToCategory')" style='cursor: pointer;'>` +
      categoryM +
      ` | ` +
      quotaM +
      ` | ` +
      `OP` +
      `</span>`;
  }

  if (quotaM != "X") {
    console.log("x wala");
    document.getElementById("convertToCatOptions").innerHTML +=
      `<span class='dropdown-item' onclick="updateCat('` +
      categoryM +
      ` | X | ` +
      `OP` +
      `','selToCategory')" style='cursor: pointer;'>` +
      categoryM +
      ` | X | ` +
      "OP" +
      `</span>`;
  }
  // Add remaing category X OP

  for (i = category.indexOf(categoryM) + 1; i <= 3; i++) {
    console.log("ok2");
    let x =
      `<span class='dropdown-item' onclick="updateCat('` +
      category[i] +
      ` | X | OP` +
      `','selToCategory')" style='cursor: pointer;'>` +
      category[i] +
      ` | X | OP` +
      `</span>`;

    document.getElementById("convertToCatOptions").innerHTML += x;
  }

  // if (category.indexOf(categoryM) == 3 && (quota.indexOf(quotaM) != 5)){
  //     console.log ('chala');
  //     console.log (quota.indexOf(quotaM))
  //     document.getElementById('convertToCat').innerHTML += `<span class='dropdown-item' onclick="updateCat('UR | X | OP','selToCategory')" style='cursor: pointer;'>UR | X | OP</span>`;
  // }

  // if (categoryM = "UR" && quota == "X" && gender == "OP"){
  //     updateCat ('To Category' , 'selToCategory');
  //     document.getElementById('convertToCat').innerHTML = "";
  // }
}
