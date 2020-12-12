const database = require('../database');
const hiddenNav = document.getElementsByClassName('hide');


const logoutBtn = document.querySelector('#logout');
logoutBtn.addEventListener('click', () => {
  console.log("clicked")
    database.logout();
})



const handleUser = (doc) => {
  console.log(doc.data().role)
  if (doc.data().role == "admin"){
      console.log("is admin")
      // unhides nav links, use for each for nodelist
      for (i = 0; i < hiddenNav.length; ++i){
          hiddenNav[i].style.visibility = "visible"
          // hiddenNav[i].style.display = "revert";
      }
  }
  else if (doc.data().role == "dispatcher"){
      const dispatchLink = document.getElementById('dispatch-link');
      dispatchLink.style.visibility = "visible";
  }
}


auth.onAuthStateChanged(function(user) {
  if (user) {
    console.log(user.uid)
    database.read.getUserDoc(handleUser, user.uid)
  } else {
      window.location.href = 'index.html';
  }
});