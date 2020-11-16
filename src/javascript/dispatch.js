

const { remote } = require('electron');
const path = require('path');
const db = require('../database');

// listens to the authentication state and handles changes
db.AuthStateListener();

// Make sure this page only does UI stuff based on objects from database.js
let dropdownFlag = false;

class Driver {
    constructor(doc){
        this.id = doc.id;
        this.fname = doc.data().fname;
        this.lname  = doc.data().lname;
        this.driverType = doc.data().type;
        this.driverRate = doc.data().rate;
    }
}

class Job {
    constructor(obj, formElement){
        this.driverID = obj.id;
        this.driverFname = obj.fname;
        this.driverLname = obj.lname;
        this.driverRate = obj.driverRate;
        this.driverType = obj.driverType;
        this.client = formElement['client'].value;
        this.deadline = formElement['deadline'].value;
        this.destination = formElement['destination'].value;
        this.loadRate = formElement['rate'].value;
        this.jobStatus = 0;
        this.origin = formElement['origin'].value;
        this.miles = formElement['routeLength'].value;
    }
}

const logoutBtn = document.querySelector('#logout');
logoutBtn.addEventListener('click', () => {
    db.logout(); // function from database.js
})

const tableBody = document.querySelector('#tableBody')
const renderRows = (data) => {
    if(data.length){
        let html = "";

        data.forEach((doc) => {
            const job = doc.data();
            // submit and delete will have the job id
            // click event will lead to firebase handling
            const tr = `
                <tr>
                    <td>${job.driverFname} ${job.driverLname}</td>
                    <td>${job.client}</td>
                    <td>$${job.loadRate}</td>
                    <td>${job.origin}</td>
                    <td>${job.destination}</td>
                    <td>${job.miles}</td>
                    <td>${job.deadline}</td>
                    <td><button data-id=${doc.id} class="btn btn-outline-success btn-sm">Submit</button></td>
                    <td><button data-id=${doc.id} class="btn btn-outline-danger btn-sm">Delete</button></td>
                </tr>
            `;
            html += tr;
        })
        tableBody.innerHTML = html;
    }else {
        console.log('no data')
        // deletes the last remaining row without need to refresh the page
        if (tableBody.rows.length == 1){
            tableBody.deleteRow(0);
        }
    }
}

// Event listeners for submit and delete buttons
document.querySelector('table tbody').addEventListener('click', (event) => {
    
    // get ID from button, call update.method(id)/delete.method(id) 
    if(event.target.className === "btn btn-outline-danger btn-sm"){
        // console.log(event.target.dataset.id)
        db.deleteData.deleteJob(event.target.dataset.id)

    }
    if (event.target.className === "btn btn-outline-success btn-sm") {
        // console.log(event.target.dataset.id)
        db.update.sendToPayroll(event.target.dataset.id)
    }
});




const drivers = [];
const populateDropdown = (data) => {
    if(data.length){
        data.forEach((doc) => {
            // create driver object to re-use data
            const driver = new Driver(doc)
            // add object to list
            drivers.push(driver)
        })
        // curiously drivers is sorted before calling it, but only if you call sort. if you dont it isn't...
        // sort this list by last name then first name
        drivers.sort((a, b) => a.lname.localeCompare(b.lname))

        let html = "";
        const dropdown = document.getElementById('driver');
        drivers.forEach((driver) => {
            const option = `
                <option data-id=${driver.id}>${driver.lname}, ${driver.fname}</option>
            `;
            html += option;
        })
        dropdown.innerHTML = html;
    }else {
        console.log('no drivers found')
    }
    // flag for submit button. makes sure no one presses submit before driver info is properly loaded
    dropdownFlag = true;
}



// if you dont want to figure out the prevent default shit then just use a modal
// but i think if you specify event.prevent default if all data is present then it will work as intended
document.querySelector('#formSubmit').addEventListener('click', (event) => {
    event.preventDefault() //add conditionals. only prevent defaul if everything has an input
    
    if(dropdownFlag == true){
         db.create.newJob(jobObject())
         document.getElementById('create-job-form').reset();
    }
});

//Create job object and send object to database.js to create new entry
const jobObject = () => {
    // gets reference to entire dropdown element
    const driverSelect = document.getElementById('driver');
    // get selected drivers id
    const currentDriverId = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-id');
    
    // get driver object
    let driverObj = "";
    drivers.forEach((driver) => {
        if(currentDriverId == driver.id){
            driverObj = driver;
        }
    })
    // console.log(driverObj)
    const form = document.getElementById('create-job-form');
    // create job object 
    const newJob = new Job(driverObj, form);
    console.log(newJob.deadline)
    return newJob;
}



// read data, get active job collection, render the rows.
db.read.getActiveJobs(renderRows)
db.read.getAllDrivers(populateDropdown)


// page is kinda sorta done
// a couple of things that still need work
// find some sort of logical order for rendering shit to the table
// also add client side error catching