
const db = require('../database');
// listens to the authentication state and handles changes
// db.AuthStateListener();

let activeJobs = [];


const clearDisplay = () => {
    let salaryDiv = document.getElementsByClassName('salaried-div');
    const ownerOp = document.getElementsByClassName('ownerOp-div');
    salaryDiv[0].style.display = "none";
    ownerOp[0].style.display = "none";
}

const showTables = (job) => {
    if(job.isSalary === true){
        let salaryDiv = document.getElementsByClassName('salaried-div');
        salaryDiv[0].style.display = "block";
    }
    else if (job.isSalary === false){
        const ownerOp = document.getElementsByClassName('ownerOp-div');
        ownerOp[0].style.display = "block";
    }
}

// Figure out a different counter approach. (one that isn't global)

let count = 0;
const activeJob = (driver, client, origin, destination, routeLength, deadline, isSalary) =>{

    const counter = () =>{
        count++;
        return count;
    }
    
    const id = counter();

    return{id, driver, client, origin, destination, routeLength, deadline, isSalary}
};


// Some test values
let existingJob = activeJob(
    "Zack Lastname", "Crown Windows", "17371 N Outer 40 Rd, Chesterfield, MO 63005",
    "400 S State St", 1432, "10/16/2020", true);
// createRow(existingJob);
activeJobs.push(existingJob);

existingJob = activeJob(
    "Scotty Upshall", "St. Louis Blues", "700 Clark Ave",
    "400 S State St", 210, "10/16/2020", true);

activeJobs.push(existingJob);

existingJob = activeJob(
    "Alex Clark", "Private Homeowner", "1662 Park Place",
    "1543 South Place Dr", 1303, "10/17/2020", false);

activeJobs.push(existingJob);

existingJob = activeJob(
    "Trey Canard", "Sample Business", "700 Clark Ave",
    "1234 Numbers Ct.", 1303, "10/17/2020", false);

activeJobs.push(existingJob);

existingJob = activeJob(
    "Ryan Villopoto", "Sample Business", "125 Central Ave",
    "16335 Sheffield Pt Ct", 1303, "10/17/2020", true);

activeJobs.push(existingJob);



// db.read.jobsByStatus(console.log(doc.data()), 1)

// Change this
// Populate the dropdown and give each dropdown an ID that will correspond to their empID
const populateDropdown = (activeJobs) =>{
    //Sorts active jobs array by driver name
    activeJobs.sort((a, b) => (a.driver > b.driver) ? 1 : -1)
    const dropdown = document.getElementById('driver');
    activeJobs.forEach(job => {
        let nameOption = document.createElement("option")
        nameOption.innerHTML = job.driver;
        nameOption.addEventListener('dblclick', () => {
            clearDisplay();
            clearDriverInfo();
            showTables(job);
            updateDriverInfo(job);

        })
        dropdown.appendChild(nameOption);
    })
}

populateDropdown(activeJobs);

const updateDriverInfo = (job) => {
    const driverInfo = document.querySelectorAll('.driverInfo li');
    driverInfo.forEach(item => {
        if(item.textContent == "Name:"){
            item.textContent += ` ${job.driver}`;
        }
    })
}

const clearDriverInfo = () => {
    const driverInfo = document.querySelectorAll('.driverInfo li');
    driverInfo.forEach((item, index) => {
        if(index == 0 || index == 3){
            item.textContent = "Name:";
        }
    })
}


// load in dropdown data and give each one a data-id of the job id
// use job id to process requests for each driver
// render function should check driverType field
// then display the data