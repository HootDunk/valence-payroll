
// database
const db = require('../database');

// listens to the authentication state and handles changes
db.AuthStateListener();



const logger = (data) => {
  data.forEach(doc => {
    console.log(doc.data())

  })
}




// creates driver object from the job document
class Driver {
  constructor(doc){
      this.id = doc.data().driverID;
      this.fname = doc.data().driverFname;
      this.lname  = doc.data().driverLname;
      this.driverType = doc.data().type;
  }
}

// const logger1 = () => {
//   data.forEach((doc) => {
//     console.log(doc.data())
//   })
// }
// may want to break this function up
const drivers = [];
const populateDropdown = (data) => {
  const driverIDs = [];
  if(data.length){
      data.forEach((doc) => {
          // checks if the current driver has been included or not
          // can be multiple jobs per driver but we only need his info once
          if(!driverIDs.includes(doc.data().driverID)){
            // create driver object to re-use data
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
              <option class="driver-option" data-id=${driver.id}>${driver.lname}, ${driver.fname}</option>
          `;
          html += option;
      })
      dropdown.innerHTML = html;
    
      
      document.querySelectorAll('.driver-option').forEach(option => {
        option.addEventListener('click', event => {
          // console.log(event.target.dataset.id)
          let driverID = event.target.dataset.id;
          db.read.getDriverJobs(renderRows, 1, driverID)
          
          // call the function to get jobs based on driver ID and job
          // status, display those jobs in a table
          // then render the other forms
        })
      })

  }else {
      console.log('no drivers found')
  }
}

const tableBody = document.querySelector('#tableBody')
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
    }else {
        console.log('no data')
        // deletes the last remaining row without need to refresh the page
        if (tableBody.rows.length == 1){
            tableBody.deleteRow(0);
        }
    }
}


const jobForm = document.getElementById('editJobForm');

const setJobFormValues = (doc) => {
  jobForm['client'].value = doc.data().client;
  jobForm['rate'].value = doc.data().loadRate;
  jobForm['origin'].value = doc.data().origin;
  jobForm['destination'].value = doc.data().destination;
  jobForm['routeLength'].value = doc.data().miles;
  jobForm['deadline'].value = doc.data().deadline;
  // console.log(doc.data().client)
  $('#editJobModal').modal()
}



// Event listeners for edit buttons call a modal with a form to edit the job
document.querySelector('table tbody').addEventListener('click', (event) => {
  // get ID from button, call update.method(id)/delete.method(id) 
  if(event.target.className === "btn btn-outline-warning btn-md"){
      console.log(event.target.dataset.id)
      let jobID = event.target.dataset.id;
      // setJobFormValues()
      // call function to get job info and function to set modal form values
      db.read.getJobByID(setJobFormValues, jobID)
      // confirming creates an object and sends to db


      // closing does nothing
      // deleting deletes the job

      
      //db.update.editJob(obj, id)
      // db.deleteData.deleteJob(event.target.dataset.id)

  }

});


// on this page we populate the dropdown based on jobs with a status of 1
// these are jobs that have been confirmed by dispatchers but they haven't
// been confirmed by moe

// render dropdown. create list of driver names and driver ids
// give each dropdown the data-id of driverID
// set to false so it isn't a snapshot listener
db.read.jobsByStatus(populateDropdown, 1, false)



// clicking a driver retrieves all of the jobs with a status of a one and a matching driverID
// these jobs and the fuel and adjustments forms are displayed


// moe can edit the jobs and input the fields
// doing so creates the week collection and sets the jobStatus to 2
// meaning the driver wont have jobs with this status anymore


// this collection will have a field like 'processed: false'
// unprocessed jobs will show up in the process payroll tab
// submitting them will set processed to true



// need to add event listener for the submit button and delete button on the modal
// then continue to fuel and 