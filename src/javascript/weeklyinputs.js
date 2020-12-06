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
const adjustmentsForm = document.getElementById('adjustmentsForm');
const adjustmentsTB = document.querySelectorAll('#adjustmentsTB tbody .datafield')
const formControlSalary = document.querySelectorAll('.form-control.salary');
const formControlOwnerOperator = document.querySelectorAll('.form-control.owner-operator');
const adjModalFormSalary = document.getElementById('adjModalFormSalary');
const adjModalFormOwnerOp = document.getElementById('adjModalFormOP');
const toPayrollBtn = document.getElementById('toPayrollBtn');


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

// may want to break this function up, could definitely break it up
const populateDropdown = (data) => {
  const drivers = [];
  const driverIDs = [];
  if(data.length){
      data.forEach((doc) => {
          // checks if the current driver is in the driverIDs list (to make sure we don't have duplicates)
          // can be multiple jobs per driver but we only need his info once
          if(!driverIDs.includes(doc.data().driverID)){
            const driver = new Driver(doc)
            drivers.push(driver)  
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
          // Hide all elements
          toggleHide.forEach(element => {
            element.style.display = "none";
          })
          const driverID = event.target.dataset.id;
          const driverType = event.target.dataset.type;

          setRequiredStatus('reset') // sets all form inputs to required
          clearAdjustmentsSection() // text in adjustments table is removed
          adjustmentsForm['submitAdjustments'].style.display = "revert"; // Unhides the submit button
          

          db.read.getDriverJobs(renderRows, 1, driverID)
          db.read.getAdjustmentByID(setAdjustmentValues, 1, driverID)
          
          // display elements that match the driver type
          if (driverType == "owner-operator"){
            // show the owner op from fields
            toggleHideOwnerOp.forEach(element => {
              element.style.display = "revert";
            });
            setRequiredStatus("owner-operator");
            db.read.getDriverFuelbyStatus(renderFuelRows, driverID, 1);
          }
          else if (driverType == "salary"){
            // show the salary from fields
            toggleHideSalary.forEach(element => {
              element.style.display = "revert";
            })
            setRequiredStatus("salary");
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
                    <td>${job.deadline.toDate().toLocaleDateString('en-US')}</td>

                    <td><button id="jobEdit" data-id=${doc.id} class="btn btn-outline-warning btn-md">Edit</button></td>
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

              <td><button id="FuelDeleteBtn" data-id=${doc.id} class="btn btn-outline-danger btn-md">Delete</button></td>
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



/** EDIT Completed Jobs  **/

//listen for edit button click
document.querySelector('table tbody').addEventListener('click', (event) => {
  // get ID from button, call update.method(id)/delete.method(id)
  if(event.target.className === "btn btn-outline-warning btn-md"){
      const jobID = event.target.dataset.id;
      // get job data and set corresponding form values
      db.read.getJobByID(setJobFormValues, jobID)
  }
  
});

// Sets Job Form values and opens the modal
const setJobFormValues = (doc) => {
  // give buttons a data-id that matches the job
  modalSubmitBtn.dataset.id = doc.id;
  modalDeleteBtn.dataset.id = doc.id;

  jobForm['client'].value = doc.data().client;
  jobForm['rate'].value = doc.data().loadRate;
  jobForm['origin'].value = doc.data().origin;
  jobForm['destination'].value = doc.data().destination;
  jobForm['routeLength'].value = doc.data().miles;
  // sets values to yyyy-mm-dd so they can be represented in the form
  jobForm['deadline'].value = doc.data().deadline.toDate().toISOString().slice(0,10);

  $('#editJobModal').modal()
}


/** Edit Jobs Modal buttons **/

jobForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const jobID = jobForm['submitJobEdit'].dataset.id;
  const jobInstance = new JobAttributes(jobForm);
  db.update.editJobByID(jobInstance, jobID);
  $("#editJobModal").modal("hide");
});

// Clicking delete removes the job entirely
modalDeleteBtn.addEventListener('click', (event) => {
  db.deleteData.deleteJob(event.target.dataset.id)
});


/** Fuel Records **/

// Create a new fuel record on from submit. pass in 4 data fields + driverID and year and date
fuelForm.addEventListener('submit', (event) => {
  event.preventDefault();
  // gets reference to entire dropdown element
  const driverSelect = document.getElementById('driver');
  const currentDriverId = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-id');
  db.create.fuelEntry(fuelForm, currentDriverId);
  fuelForm.reset();
})

// Delete Fuel button
fuelTB.addEventListener('click', (event) => {
  if(event.target.className === "btn btn-outline-danger btn-md")
    db.deleteData.deleteFuelEntry(event.target.dataset.id)
    
})


/** Adjustments Section **/

// Creating adjustments document on submit
adjustmentsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const driverSelect = document.getElementById('driver');
  const currentDriverType = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-type');
  const currentDriverID = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-id');
  db.create.newAdjustments(setAdjustmentValues, adjustmentsForm, currentDriverType, currentDriverID)
})

// Setting adjustment table values to match the record
// change the display of the adjustments buttons and the send to payroll button
const setAdjustmentValues = (doc) => {
  if (doc.data().driverType == 'owner-operator'){
    adjustmentsTB[2].innerHTML = doc.data().reimbursements.detention;
    adjustmentsTB[3].innerHTML = doc.data().reimbursements.extras;
    adjustmentsTB[4].innerHTML = doc.data().deductions.insurance;
    adjustmentsTB[8].innerHTML = doc.data().deductions.reserve;
  }
  else if (doc.data().driverType == "salary"){
    adjustmentsTB[0].innerHTML = doc.data().reimbursements.toll;
    adjustmentsTB[1].innerHTML = doc.data().reimbursements.scale;
    adjustmentsTB[3].innerHTML = doc.data().reimbursements.extras;
    adjustmentsTB[4].innerHTML = doc.data().deductions.insurance;
    adjustmentsTB[5].innerHTML = doc.data().deductions.accidental;
    adjustmentsTB[6].innerHTML = doc.data().deductions.cashAdvance;
    adjustmentsTB[7].innerHTML = doc.data().deductions.escrow;
    adjustmentsTB[8].innerHTML = doc.data().deductions.reserve;
  }
  adjustmentsForm['submitAdjustments'].style.display = "none";  //hide submit button
  adjustmentsForm['editAdjustments'].style.display = "revert";  // unhide the edit button
  toPayrollBtn.style.display = "revert"; // unhide the send to payroll button

  adjustmentsForm['editAdjustments'].dataset.id = doc.id; // give edit button the document id
  adjustmentsForm['editAdjustments'].dataset.type = doc.data().driverType;

  
}

// Opens the adjustments Model with corresponding table values
adjustmentsForm['editAdjustments'].addEventListener('click', (event) => {
  if(event.target.dataset.type == "salary"){
    adjModalFormSalary['toll'].value = adjustmentsTB[0].innerHTML;
    adjModalFormSalary['scale'].value = adjustmentsTB[1].innerHTML;
    adjModalFormSalary['extras'].value = adjustmentsTB[3].innerHTML;
    adjModalFormSalary['insurance'].value = adjustmentsTB[4].innerHTML;
    adjModalFormSalary['accidental'].value = adjustmentsTB[5].innerHTML;
    adjModalFormSalary['cashAdvance'].value = adjustmentsTB[6].innerHTML;
    adjModalFormSalary['escrow'].value = adjustmentsTB[7].innerHTML;
    adjModalFormSalary['reserve'].value = adjustmentsTB[8].innerHTML;
    $("#adjModalSalary").modal()
  }
  else if (event.target.dataset.type == "owner-operator"){
    adjModalFormOwnerOp['detention'].value = adjustmentsTB[2].innerHTML;
    adjModalFormOwnerOp['extras'].value = adjustmentsTB[3].innerHTML;
    adjModalFormOwnerOp['insurance'].value = adjustmentsTB[4].innerHTML;
    adjModalFormOwnerOp['reserve'].value = adjustmentsTB[8].innerHTML;
    $("#adjModalOwnerOp").modal()
  }
})

// Udate and close Adjustments modal (Owner Op)when update button is pressed
adjModalFormOwnerOp.addEventListener('submit', (event) => {
  event.preventDefault();
  const adjID = adjustmentsForm['editAdjustments'].dataset.id;
  db.update.editAdjustmentsOwnerOp(adjModalFormOwnerOp, adjID)
  $("#adjModalOwnerOp").modal("hide");
})
// Udate and close Adjustments modal (Salary)when update button is pressed
adjModalFormSalary.addEventListener('submit', (event) => {
  event.preventDefault();
  const adjID = adjustmentsForm['editAdjustments'].dataset.id
  db.update.editAdjustmentsSalary(adjModalFormSalary, adjID)
  $("#adjModalSalary").modal("hide");
})



/** Display Helper functions **/
// removes text in the adjustments table
const clearAdjustmentsSection = () => {
  adjustmentsTB.forEach((element) => {
    element.innerHTML = "";
  })
}

// Removes required status of the hidden elements or re-sets status to true for all inputs
// prevents error on form submit by 'turning off' the required attribute for the form inputs that are hidden
const setRequiredStatus = (type) => {
  if(type == "salary"){
    formControlOwnerOperator.forEach((input) => {
      input.required = false;
    })
  }
  else if(type == "owner-operator"){
    formControlSalary.forEach((input) => {
      input.required = false;
    })
  }
  else if (type == "reset"){
    formControlOwnerOperator.forEach((input) => {
      input.required = true;
    })
    formControlSalary.forEach((input) => {
      input.required = true;
    })
  }
}

/** Send to Payroll functions **/

const updateJobsStatus = () => {
  const jobRowBtns = document.querySelectorAll("#jobEdit") // collection of edit job buttons
  jobRowBtns.forEach(button => {
    // update each job entry passing its data id and a status of 2
    db.update.setJobStatus(button.dataset.id, 2)
  })

}

const updateAllFuelStatus = () => {
    const fuelRowBtns = document.querySelectorAll("#FuelDeleteBtn");
    fuelRowBtns.forEach(button => {
      db.update.setFuelStatus(button.dataset.id, 2)
    })
}



// 
toPayrollBtn.addEventListener("click", () => {
  const driverSelect = document.getElementById('driver');
  const currentDriverType = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-type');
  // const currentDriverID = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-id');
  const adjustmentsID = adjustmentsForm['editAdjustments'].dataset.id;

  updateJobsStatus()
  if(currentDriverType == "owner-operator"){
    updateAllFuelStatus()
  }
  db.update.setAdjustmentsStatus(adjustmentsID, 2)
  clearAdjustmentsSection();
  toggleHide.forEach(element => {
    element.style.display = "none";
  })
})


db.read.jobsByStatus(populateDropdown, 1, true)



// consider adding a display function that pops up and shows which entries have successfully been changed in real time ( kind of like the console output but in a modal)
// then when you click to close the modal, the functions to reset the UI are called.

// could also come up with a way to revert all changes is theres an error in any of the database calls. might be tricky. look into later if you have time.