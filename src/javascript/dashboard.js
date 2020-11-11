// const { app, BrowserWindow } = require('electron');
// const path = require('path');

const { remote } = require('electron');
const path = require('path');
// const remote = require('electron').remote; // the remote module
// const { BrowserWindow } = remote;

let activeJobs = [];

const addJob = (ev) =>{
    ev.preventDefault(); // to stop the form submitting
    // let job = {
    //     id: Date.now(),
    //     driver: document.getElementById('driver').value,
    //     client: document.getElementById('client').value,
    //     origin: document.getElementById('origin').value,
    //     destination: document.getElementById('destination').value,
    //     routeLength: document.getElementById('routeLength').value,
    //     deadline: document.getElementById('deadline').value,
    // }
    activeJobs.push(job);
    document.querySelector('form').reset();
    console.log('added', {moives});
    let pre = document.querySelector("#msg pre");
    pre.textContent = '\n' + JSON.stringify(movies, '\t', 2);
}


document.addEventListener('DOMContentLoaded', ()=>{
    document.getElementById('submitBtn').addEventListener('click', addJob);
});


//Currently not being used or needed