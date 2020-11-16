// const { app, BrowserWindow } = require('electron');
// const path = require('path');

const { remote } = require('electron');
const path = require('path');


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
    // reference to our modal used for displaying errors to the user
    // const modalTitle = document.querySelector('.modal-header');
    // const modalBody = document.querySelector('.modal-body');
    // var errorCode = error.code;
    // var errorMessage = error.message;
    // Handle Errors here.
    // if(errorCode == 'auth/user-not-found'){
    //   modalTitle.textContent = "Email address not recognized";
    //   modalBody.textContent = "Re-type your email address and try again"
    // }
    // else if (errorCode == 'auth/wrong-password'){
    //   modalTitle.textContent = "Password is incorrect";
    //   modalBody.textContent = "Re-type your password and try again"
    // }
    // else {
    //   modalTitle.textContent = errorCode;
    //   modalBody.textContent = errorMessage;
    // }
    // $('#signInModal').modal()
    displayError(error);
  });
});

