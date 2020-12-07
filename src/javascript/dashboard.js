
const database = require('../database');

database.AuthStateListener();

const logoutBtn = document.querySelector('#logout');
logoutBtn.addEventListener('click', () => {
  console.log("clicked")
    database.logout();
})