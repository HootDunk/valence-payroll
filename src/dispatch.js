// const { app, BrowserWindow } = require('electron');
// const path = require('path');

const { remote } = require('electron');
const path = require('path');
// const remote = require('electron').remote; // the remote module
// const { BrowserWindow } = remote;

let activeJobs = [];

const addJob = (ev) =>{
    ev.preventDefault(); // to stop the form submitting
    let job = {
        id: Date.now(),
        driver: document.getElementById('driver').value,
        client: document.getElementById('client').value,
        origin: document.getElementById('origin').value,
        destination: document.getElementById('destination').value,
        routeLength: document.getElementById('routeLength').value,
        deadline: document.getElementById('deadline').value,
    }
    activeJobs.push(job);
    document.querySelector('form').reset();
    console.log('added', {activeJobs});

    createRow(job);

}

const createRow = (job) => {
    let table = document.getElementById('activeJobsTable');
    let row = table.insertRow(-1); //Inserts row to last position in table
    // Give the row an ID that corresponds to the job id
    row.id = job.id;
    //Create the data rows
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    let cell5 = row.insertCell(4);
    let cell6 = row.insertCell(5);
    //Set text value to the corresponding object value
    cell1.innerHTML = job.driver;
    cell2.innerHTML = job.client;
    cell3.innerHTML = job.origin;
    cell4.innerHTML = job.destination;
    cell5.innerHTML = job.routeLength;
    cell6.innerHTML = job.deadline;

    // Create another cell and add submit button
    let cell7 = document.createElement("td");
    let successButton = document.createElement("BUTTON");
    successButton.className = "btn btn-outline-success";
    successButton.innerHTML = "Submit";
    cell7.appendChild(successButton);
    row.append(cell7);

    // Create another cell and add delete button to it
    let cell8 = document.createElement("td");
    let button = document.createElement("BUTTON");
    button.className = "btn btn-outline-danger";
    button.innerHTML = "Delete";
    cell8.appendChild(button);
    row.append(cell8);
    

    // tableButton.addEventListener('click', (row) => {
    //     row.remove();
    // });

}


document.addEventListener('DOMContentLoaded', ()=>{
    document.getElementById('submitBtn').addEventListener('click', addJob);
});