

const { remote } = require('electron');
const path = require('path');

var database = require('../database');

let activeJobs = [];

// Figure out a different counter approach. (one that isn't global)
let count = 0;
const activeJob = (driver, client, origin, destination, routeLength, deadline) =>{

    const counter = () =>{
        count++;
        return count;
    }
    
    const id = counter();

    return{id, driver, client, origin, destination, routeLength, deadline}
};


const addJob = (ev) =>{
    ev.preventDefault(); // to stop the form submitting
    // Convert to use the active job factory function
    // let job = {
    //     id: Date.now(),
    //     driver: document.getElementById('driver').value,
    //     client: document.getElementById('client').value,
    //     origin: document.getElementById('origin').value,
    //     destination: document.getElementById('destination').value,
    //     routeLength: document.getElementById('routeLength').value,
    //     deadline: document.getElementById('deadline').value,
    // }
    let driver = document.getElementById('driver').value;
    let client = document.getElementById('client').value;
    let origin = document.getElementById('origin').value;
    let destination = document.getElementById('destination').value;
    let routeLength = document.getElementById('routeLength').value;
    let deadline = document.getElementById('deadline').value;

    let job = activeJob(driver, client, origin, destination,
        routeLength, deadline);

    
    activeJobs.push(job);
    document.querySelector('form').reset();
    createRow(job);
}

const createRow = (job) => {
    let table = document.getElementById('tableBody');
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
    successButton.addEventListener('click', () => {
        // this will be where we submit the data to the database
        console.log(job.id)
        retrieveObject(job.id)
        
    })
    // Create another cell and add delete button to it
    let cell8 = document.createElement("td");
    let deleteButton = document.createElement("BUTTON");
    deleteButton.className = "btn btn-outline-danger";
    deleteButton.innerHTML = "Delete";
    cell8.appendChild(deleteButton);
    row.append(cell8);
    deleteButton.addEventListener('click', () => {
        row.remove();
        // Need to add logic to remove the job from the database and 
        // the client side javascript object
    })
}

// Event listener for submit button is only loaded when DOMcontent is
document.addEventListener('DOMContentLoaded', ()=>{
    document.getElementById('submitBtn').addEventListener('click', addJob);
});



// Some test values

let existingJob = activeJob(
    "Clint Eastwood", "Crown Windows", "17371 N Outer 40 Rd, Chesterfield, MO 63005",
    "400 S State St", 1432, "10/16/2020");
createRow(existingJob);
activeJobs.push(existingJob);

existingJob = activeJob(
    "Scotty Upshall", "St. Louis Blues", "700 Clark Ave",
    "400 S State St", 210, "10/16/2020");
createRow(existingJob);
activeJobs.push(existingJob);

existingJob = activeJob(
    "Alex Clark", "Private Homeowner", "1662 Park Place",
    "1543 South Place Dr", 1303, "10/17/2020");
createRow(existingJob);
activeJobs.push(existingJob);

existingJob = activeJob(
    "Trey Canard", "Sample Business", "700 Clark Ave",
    "1234 Numbers Ct.", 1303, "10/17/2020");
createRow(existingJob);
activeJobs.push(existingJob);

existingJob = activeJob(
    "Ryan Villopoto", "Sample Business", "125 Central Ave",
    "16335 Sheffield Pt Ct", 1303, "10/17/2020");
createRow(existingJob);
activeJobs.push(existingJob);

// existingJob = activeJob(
//     "James Stewart", "Sample Business", "700 Clark Ave",
//     "1200 Ridge Road", 1303, "10/17/2020");
// createRow(existingJob);
// activeJobs.push(existingJob);



//The function to sort the names alphabetically and store them in a list
const sortNames = (activeJobs) => {
    let names = [];
    activeJobs.forEach(job => {
        names.push(job.driver);
    })
    names.sort()
    return names;
}

let names = sortNames(activeJobs);

//The function to add the names to the drop down
const populateDropdown = (names) =>{
    const dropdown = document.getElementById('driver');
    names.forEach(name => {
        let nameOption = document.createElement("option")
        nameOption.innerHTML = name;
        dropdown.appendChild(nameOption);
    })
}

populateDropdown(names);


//Function to return matching object (to demonstrate submit)
const retrieveObject = (id) => {
    activeJobs.forEach(job => {
        if(job.id === id){
            let pre = document.querySelector('#msg pre');
            pre.textContent = '\n' + JSON.stringify(job, '\t', 2);

        }
    })
}


// function Job(driver, client, origin, destination, routeLength, deadline){
//     this.id = Date.now(),
//     this.driver = driver;
//     this.client = client;
//     this.origin = origin;
//     this.destination = destination;
//     this.routLength = routeLength;
//     this.deadline = deadline;
// }


// class Job {
//     contructor(driver, client, origin, destination, routeLength, deadline){
//         this.id = Date.now(),
//         this.driver = driver;
//         this.client = client;
//         this.origin = origin;
//         this.destination = destination;
//         this.routLength = routeLength;
//         this.deadline = deadline;
//     }
// }


// Prints entire json object, kinda handy, saving for later
// let pre = document.querySelector('#msg pre');
//     pre.textContent = '\n' + JSON.stringify(activeJobs, '\t', 2);



database.logDriver();

// function logDriver() {
//     db.collection('Driver').get().then((snapshot) => {
//         snapshot.docs.forEach(doc => {
//             console.log(doc.data())
//         })
//     })
// }

// logDriver();