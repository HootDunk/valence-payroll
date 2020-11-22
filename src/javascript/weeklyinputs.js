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
// const updateAdjOwnerOp = document.getElementById('updateAdjOwnerOp');
// const updateAdjSalary = document.getElementById('salary');

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
          // Hide display elements
          toggleHide.forEach(element => {
            element.style.display = "none";
          })
          const driverID = event.target.dataset.id;
          const driverType = event.target.dataset.type;

          setRequiredStatus('reset')
          clearAdjustmentsSection()
          adjustmentsForm['submitAdjustments'].style.display = "revert";
          

          db.read.getDriverJobs(renderRows, 1, driverID)
          db.read.getAdjustmentByID(setAdjustmentValues, 1, driverID)
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
// edit completed jobs eventlistener (edit button)
document.querySelector('table tbody').addEventListener('click', (event) => {
  // get ID from button, call update.method(id)/delete.method(id) 
  if(event.target.className === "btn btn-outline-warning btn-md"){
      
      const jobID = event.target.dataset.id;
      // call function to get job info and function to set modal form values
      db.read.getJobByID(setJobFormValues, jobID)
  }
  
});


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

  // REFACTOR
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekNum = getWeek();
  db.create.fuelEntry(fuelForm, currentDriverId, year, month, day, weekNum);
})

// Event listener for delete button on the fuel table
fuelTB.addEventListener('click', (event) => {
  db.deleteData.deleteFuelEntry(event.target.dataset.id)
  // Uncomment once page is finished
  fuelForm.reset();
})

//submit button event listener
adjustmentsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const driverSelect = document.getElementById('driver');
  const currentDriverType = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-type');
  const currentDriverID = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-id');
  db.create.newAdjustments(setAdjustmentValues, adjustmentsForm, currentDriverType, currentDriverID)
})

// need to give the edit button the data-id of the document and hide the submit adjustments button
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
  adjustmentsForm['editAdjustments'].dataset.id = doc.id; // give edit button the document id
  adjustmentsForm['editAdjustments'].dataset.type = doc.data().driverType;
}

//edit adjustments event listener
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

// proper use of modal and form for error catching
adjModalFormOwnerOp.addEventListener('submit', (event) => {
  event.preventDefault();
  const adjID = adjustmentsForm['editAdjustments'].dataset.id;
  db.update.editAdjustmentsOwnerOp(adjModalFormOwnerOp, adjID)
  $("#adjModalOwnerOp").modal("hide");
})

adjModalFormSalary.addEventListener('submit', (event) => {
  event.preventDefault();
  const adjID = adjustmentsForm['editAdjustments'].dataset.id
  db.update.editAdjustmentsSalary(adjModalFormSalary, adjID)
  $("#adjModalSalary").modal("hide");
})


// removes text in the adjustments table
const clearAdjustmentsSection = () => {
  adjustmentsTB.forEach((element) => {
    element.innerHTML = "";
  })
}

// removes required status of the hidden elements or re-sets status to true for all inputs
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

//function to display the payrollbtn  (maybe have it display a modal saying it was successful and then right after 
// the modal gets close the page gets reloaded)




db.read.jobsByStatus(populateDropdown, 1, true)




// fix the fuel records event listener so that it gets called from the delete button and not the table itself
// fix the jobs modal so that the buttons are in the form and the update button is type="submit" with a form event listener



// last thing will be to add the complete/total submit button which will update the status of each document. not sure
// if I've totally figured that part out yet or not. yeah I have, each unique document has it's id stored on some part of the page already.
// just need to grab those references. first start by just printing each one to the console and make sure they are what you think they are.
