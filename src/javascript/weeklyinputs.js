// database
const db = require('../database');
// listens to the authentication state and handles changes
db.AuthStateListener();
// need to add the logout function

const modalSubmitBtn = document.getElementById('submitJobEdit');
const modalDeleteBtn = document.getElementById('deleteJob');
const jobForm = document.getElementById('editJobForm');
const tableBody = document.querySelector('#tableBody');
const fuelForm = document.getElementById('fuelForm');
const fuelTB = document.getElementById('fuelTable');
const toggleHide = document.querySelectorAll('.toggle-hide');
const toggleHideOwnerOp = document.querySelectorAll('.toggle-hide.owner-operator');
const toggleHideSalary = document.querySelectorAll('.toggle-hide.salary');

// development function for testing/validating the data being recieved is the data that I want
const logger = (data) => {
  data.forEach(doc => {
    console.log(doc.data())

  })
}

const getWeek = () => {
  let now = new Date();
  let onejan = new Date(now.getFullYear(), 0, 1);
  return Math.ceil( (((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7 );
}

// creates driver object from the job document, used to populate and sort array for the dropdown
class Driver {
  constructor(doc){
      this.id = doc.data().driverID;
      this.fname = doc.data().driverFname;
      this.lname  = doc.data().driverLname;
      this.type = doc.data().driverType;
  }
}


// JobAttributes class to create objects to pass to the UpdateJobsByID database function
class JobAttributes {
  constructor(jobForm){
    this.client = jobForm['client'].value;
    this.loadRate = jobForm['rate'].value;
    this.origin = jobForm['origin'].value;
    this.destination = jobForm['destination'].value;
    this.miles = jobForm['routeLength'].value;
    this.deadline = jobForm['deadline'].value;
  }
}

// may want to break this function up

const populateDropdown = (data) => {
  const drivers = [];
  const driverIDs = [];
  if(data.length){
      data.forEach((doc) => {
          // checks if the current driver is in the driverIDs list (to make sure we don't have duplicates)
          // can be multiple jobs per driver but we only need his info once
          if(!driverIDs.includes(doc.data().driverID)){
            // create driver object
            const driver = new Driver(doc)
            // add object to list
            drivers.push(driver)
            //add driverID to the list so it isn't duplicated
            driverIDs.push(doc.data().driverID)
          }
      })
      drivers.sort((a, b) => a.lname.localeCompare(b.lname))

      let html = "";
      const dropdown = document.getElementById('driver');
      drivers.forEach((driver) => {
          const option = `
              <option class="driver-option" data-type="${driver.type}" data-id=${driver.id}>${driver.lname}, ${driver.fname} (${driver.type})</option>
          `;
          html += option;
      })
      dropdown.innerHTML = html;
      
      //here is where the function for handling the display will go
      document.querySelectorAll('.driver-option').forEach(option => {
        option.addEventListener('click', event => {
          // Hide display elements
          toggleHide.forEach(element => {
            element.style.display = "none";
          })
          // show elements of .toggle-display.owner-operator.salary
          // showUniversal()
          // get variables to conditionally display data
          let driverID = event.target.dataset.id;
          let driverType = event.target.dataset.type;
          db.read.getDriverJobs(renderRows, 1, driverID)
          if (driverType == "owner-operator"){
            toggleHideOwnerOp.forEach(element => {
              element.style.display = "revert";
            })
            db.read.getDriverFuelbyStatus(renderFuelRows, driverID, 1);
          }
          else if (driverType == "salary"){
            toggleHideSalary.forEach(element => {
              element.style.display = "revert";
            })
          }
        })
      })
  }
  else {
    
      console.log('no drivers found')
      let driverOption = document.querySelector('.driver-option');
      if(driverOption){
        // deletes last remaining driver option
        driverOption.remove();
      }
  }
}



const renderRows = (data) => {
    if(data.length){
        let html = "";
        data.forEach((doc) => {
            const job = doc.data(); // maybe create an id var to make it slightly more intuitive
            // submit and delete will have the job id
            // click event will lead to firebase handling
            const tr = `
                <tr>
                    <td>${job.client}</td>
                    <td>$${job.loadRate}</td>
                    <td>${job.origin}</td>
                    <td>${job.destination}</td>
                    <td>${job.miles}</td>
                    <td>${job.deadline}</td>

                    <td><button data-id=${doc.id} class="btn btn-outline-warning btn-md">Edit</button></td>
                </tr>
            `;
            html += tr;
        })
        tableBody.innerHTML = html;
    }
    else {
        console.log('no data')
        // deletes the last remaining row without need to refresh the page
        if (tableBody.rows.length == 1){
            tableBody.deleteRow(0);
        }

    }
}

const renderFuelRows = (data) => {
  if(data.length){
    let html = "";
    data.forEach((doc) => {
        const obj = doc.data(); // maybe create an id var to make it slightly more intuitive
        // submit and delete will have the job id
        // click event will lead to firebase handling
        const tr = `
            <tr>
              <td>${obj.city}</td>
              <td>${obj.state}</td>
              <td>${obj.gallons}</td>
              <td>$${obj.amount}</td>

              <td><button data-id=${doc.id} class="btn btn-outline-danger btn-md">Delete</button></td>
            </tr>
        `;
        
        html += tr;
    })
    fuelTB.innerHTML = html;
}
else {
    console.log('no fuel entries')
    // deletes the last remaining row without need to refresh the page
    if (fuelTB.rows.length == 1){
      fuelTB.deleteRow(0);
    }

}
}



// everytime edit button is pressed, we set the form values to the corresponding job

const setJobFormValues = (doc) => {
  // give buttons a data-id that matches the job
  modalSubmitBtn.dataset.id = doc.id;
  modalDeleteBtn.dataset.id = doc.id;

  jobForm['client'].value = doc.data().client;
  jobForm['rate'].value = doc.data().loadRate;
  jobForm['origin'].value = doc.data().origin;
  jobForm['destination'].value = doc.data().destination;
  jobForm['routeLength'].value = doc.data().miles;
  jobForm['deadline'].value = doc.data().deadline;

  $('#editJobModal').modal()
}


/** Table button event listeners **/
// Event listeners for edit buttons call a modal with a form to edit the job
document.querySelector('table tbody').addEventListener('click', (event) => {
  // get ID from button, call update.method(id)/delete.method(id) 
  if(event.target.className === "btn btn-outline-warning btn-md"){
      
      const jobID = event.target.dataset.id;
      // call function to get job info and function to set modal form values
      db.read.getJobByID(setJobFormValues, jobID)
  }

  //add button to toggle jobstatus here (add button on html as well)
  
});

// Event listener for delete button on the fuel table
fuelTB.addEventListener('click', (event) => {
  // console.log(event.target.dataset.id)
  db.deleteData.deleteFuelEntry(event.target.dataset.id)
  // Uncomment once page is finished
  // fuelForm.reset();
})

/** Modal button event listeners **/
// Clicking submit, calls the db update function and updates the job
modalSubmitBtn.addEventListener('click', (event) => {
  const jobID = event.target.dataset.id;
  const jobInstance = new JobAttributes(jobForm);

  db.update.editJobByID(jobInstance, jobID);
});

// Clicking delete removes the job entirely
modalDeleteBtn.addEventListener('click', (event) => {
  db.deleteData.deleteJob(event.target.dataset.id)
});

//create a new fuel record on from submit. pass in 4 data fields + driverID and year and date
fuelForm.addEventListener('submit', (event) => {
  event.preventDefault();
  // gets reference to entire dropdown element
  const driverSelect = document.getElementById('driver');
  // get selected drivers id
  const currentDriverId = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-id');
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekNum = getWeek();
  db.create.fuelEntry(fuelForm, currentDriverId, year, month, day, weekNum);


})







// Create the change listener for the Adjustment tables


// on this page we populate the dropdown based on jobs with a status of 1
// these are jobs that have been confirmed by dispatchers but they haven't
// been confirmed by moe

// render dropdown. create list of driver names and driver ids
// give each dropdown the data-id of driverID
// set to true so so it is a snapshot listener(changes will show)
db.read.jobsByStatus(populateDropdown, 1, true)



// clicking a driver retrieves all of the jobs with a status of a one and a matching driverID
    // completed, in evenet listener above

// these jobs and the fuel and adjustments forms are displayed
    // 


// doing so creates the week collection and sets the jobStatus to 2 or 3 (depending on front-end idea, though changes would need to be made for this)
// meaning the driver wont have jobs with this status anymore


// this collection will have a field like 'processed: false'
// unprocessed jobs will show up in the process payroll tab
// submitting them will set processed to true


// need to add event listener for the submit button and delete button on the modal
// then continue to fuel and 