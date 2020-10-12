// const { app, BrowserWindow } = require('electron');
// const path = require('path');

const { remote } = require('electron');
const path = require('path');
// const remote = require('electron').remote; // the remote module
// const { BrowserWindow } = remote;

const submitBtn = document.getElementById("submit");

submitBtn.addEventListener('click', () => {
    console.log("You clicked me")
    // add conditional logic to load different windows for if it's an admin or moe (admin page could be idential to the
    // the page that allows moe to see active jobs except admin page wont have a button to access the dashboard)
    const mainWindow = remote.getCurrentWindow(); //remote module
    mainWindow.loadFile(path.join(__dirname, 'dashboard.html'));
})



//Currently not being used or needed