// const { app, BrowserWindow } = require('electron');
// const path = require('path');
const database = require('../database');
const resetPasswordBtn = document.getElementById('forgot-PW-Btn');
const resetPasswordModal = document.getElementById('reset-password-modal');
const resetPasswordForm = document.getElementById("reset-password-form");

const registerUserBtn = document.getElementById('register-btn');
const registerUserForm = document.getElementById('register-user-form');
const userCreateBtn = document.getElementById("user-create-btn");
let dispatchCode;
let adminCode;
let passwordCheck = false;
let codeCheck = false;

const displayError = (error) => {
  const modalTitle = document.querySelector('.modal-header');
  const modalBody = document.querySelector('.modal-body');
  var errorCode = error.code;
  var errorMessage = error.message;
  if(errorCode == 'auth/user-not-found'){
    modalTitle.textContent = "Email address not recognized";
    modalBody.textContent = "Re-type your email address and try again"
  }
  else if (errorCode == 'auth/wrong-password'){
    modalTitle.textContent = "Password is incorrect";
    modalBody.textContent = "Re-type your password and try again"
  }
  else if (typeof error == "string"){
    modalBody.textContent = error;
  }
  else {
    modalTitle.textContent = errorCode;
    modalBody.textContent = errorMessage;
  }
  $('#signInModal').modal()
}


const submitBtn = document.getElementById("submit");
const loginForm = document.querySelector("#login-form");

// Sign in on submit, redirect if auth passes
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // get user info
  const email = loginForm["login-email"].value;
  const password = loginForm["login-password"].value;


  auth.signInWithEmailAndPassword(email, password)
  .then((cred) => {
    let docRef = db.collection("users").doc(cred.user.uid);
    docRef.get().then(doc => {

      let userRole = doc.data().role;
      // redirect user to the page that matches their role
      if(userRole == 'dispatcher'){
        window.location.href = 'dispatch.html';
      }
      else if (userRole == 'admin'){
        window.location.href = 'dashboard.html';
      }
    }).catch(error => {
      displayError(error);
    })
  }).catch(function(error) {
    displayError(error);
  });
});

// Open the reset password Modal On Click
resetPasswordBtn.addEventListener("click", () => {
  $('#reset-password-modal').modal()
})

// Send Email on Form Submit ('send')
resetPasswordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  let emailAddress = resetPasswordForm['email'].value;
  // firebase function to handle emails
  auth.sendPasswordResetEmail(emailAddress).then(function() {
    $('#reset-password-modal').modal('hide')
    displayError("Email Sent!")
  }).catch(function(error) {
    // An error happened.
    $('#reset-password-modal').modal('hide')
    displayError(error) // check these alerts. may have to close modal and open error modal
  });
})

// on key press, check user password and ensure fields match
const checkPassword = () => {
  if (document.getElementById('password').value ==
    document.getElementById('confirm-password').value) {
    document.getElementById('message').style.color = 'green';
    document.getElementById('message').innerHTML = 'matching';
    passwordCheck = true;
    
  } else {
    document.getElementById('message').style.color = 'red';
    document.getElementById('message').innerHTML = 'not matching';
    passwordCheck = false;
  }
  if(document.getElementById('password').value == ""){
    passwordCheck = false;
  }
}

registerUserForm.addEventListener("keyup", () => {
  if(passwordCheck && codeCheck){
    userCreateBtn.disabled = false;
  }
  else{
    userCreateBtn.disabled = true;
  }
})



async function getRegistrationCodes() {
  let adminRef = db.collection('admin').doc("dPOd2cPd0JLWhHo3ciSV")
  try {
    let adminDoc = await adminRef.get();
    return adminDoc.data();
  }
  catch (err){
    displayError(err)
  }
}


// Open the register modal on click
registerUserBtn.addEventListener("click", () => {
  getRegistrationCodes().then(result => {
    dispatchCode = result.DispatcherRegistrationID;
    adminCode = result.AdminRegistrationID;
    $("#register-user-modal").modal();
  })
})


// blur to initially check it
registerUserForm['registration-code'].addEventListener("blur", () => {
  if (adminCode == registerUserForm['registration-code'].value || dispatchCode == registerUserForm['registration-code'].value)  {
    document.getElementById('message1').style.color = 'green';
    document.getElementById('message1').innerHTML = 'Code Recognized';
    codeCheck = true;
  }
  else{
    document.getElementById('message1').style.color = 'Red';
    document.getElementById('message1').innerHTML = 'Code Not Recognized';
  }
})
// key up will set it to green if theres a match but wont do anything else
registerUserForm['registration-code'].addEventListener("keyup", () => {
  if (adminCode == registerUserForm['registration-code'].value || dispatchCode == registerUserForm['registration-code'].value)  {
    document.getElementById('message1').style.color = 'green';
    document.getElementById('message1').innerHTML = 'Code Recognized';
    codeCheck = true;
  }
  else{
    codeCheck = false;
  }

})

// Finish creating user document
registerUserForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = registerUserForm['email'].value;
  const password = registerUserForm['password'].value;

  // create user, then write user info to document
  auth.createUserWithEmailAndPassword(email, password)
  .then((user) => {
    let userID = auth.currentUser.uid;
    let role = "";
    if(adminCode == registerUserForm['registration-code'].value){
      role = "admin";
    }
    else if (dispatchCode == registerUserForm['registration-code'].value){
      role = "dispatcher";
    }
    // adds user information to the user document
    database.create.newUser(userID, role, registerUserForm)
    .then(()=>{
      if(role == "admin"){
        window.location.href = 'dashboard.html';
      }
      else if (role == "dispatcher"){
        window.location.href = 'dispatch.html';
      }
    }).catch(err =>{
      $("#register-user-modal").modal('hide');
      displayError(err)
    })
  })
  .catch((error) => {
    $("#register-user-modal").modal('hide');
    displayError(error);
  });

})


