// const { app, BrowserWindow } = require('electron');
// const path = require('path');

const { remote } = require('electron');
const path = require('path');



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
    // console.log(cred.user.uid)
    window.location.href = 'dispatch.html';
  }).catch(function(error) {

    // Handle Errors here.
    const modalTitle = document.querySelector('.modal-header');
    const modalBody = document.querySelector('.modal-body');
    var errorCode = error.code;
    var errorMessage = error.message;
    // console.log(errorCode)
    // console.log(errorMessage)
    
    if(errorCode == 'auth/user-not-found'){
      modalTitle.textContent = "Email address not recognized";
      modalBody.textContent = "Re-type your email address and try again"
    }
    else if (errorCode == 'auth/wrong-password'){
      modalTitle.textContent = "Password is incorrect";
      modalBody.textContent = "Re-type your password and try again"
    }
    else {
      modalTitle.textContent = errorCode;
      modalBody.textContent = errorMessage;
    }
    $('#signInModal').modal()
  });
});