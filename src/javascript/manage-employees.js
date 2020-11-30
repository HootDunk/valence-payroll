const db = require('../database');
// listens to the authentication state and handles changes
db.AuthStateListener();

const driverCardDiv = document.querySelector("#driver-card-div");
const userCardDiv = document.querySelector("#user-card-div");
const modalDriverForm = document.querySelector("#editDriverForm");
const updateDriverBtn = document.querySelector("#modalUpdateDriver");
// const deleteDriverBtn = document.querySelector("#modalDeleteDriver");
const addUserCard = document.querySelector("#add-user-card");
// 
const newDriverForm = document.querySelector("#newDriverForm");

// set modal values to corresponding driver
const setDriverFormValues = (doc) => {
    // give buttons a data-id that matches the job
    let rateLabel = document.getElementById("rate-label");
    updateDriverBtn.dataset.id = doc.id;

    if (doc.data().type == "salary"){
      modalDriverForm['salaryRadio'].checked = true;
      rateLabel.innerHTML = "Pay Per Mile: ";
      modalDriverForm['rate'].value = doc.data().rate;
      modalDriverForm['address'].value = doc.data().address;
      modalDriverForm['email'].value = doc.data().email;

    }
    else if (doc.data().type == "owner-operator"){
      modalDriverForm['ownerOpRadio'].checked = true;
      rateLabel.innerHTML = "Load Rate: ";
      modalDriverForm['rate'].value = doc.data().rate;
      modalDriverForm['address'].value = doc.data().address;
      modalDriverForm['email'].value = doc.data().email;
    }
    $('#editDriverModal').modal()
}




// add conditionals to change pay rate text based on driver type (as well as displayed value (as percent or dollars))
// also give inactive drivers a header with bg-secondary
const displayDrivers = ((data) => {
  if (data.length){
    
    const drivers = [];
    data.forEach((doc) => {
      drivers.push(doc);
    })

    drivers.sort((a, b) => a.data().lname.localeCompare(b.data().lname))
    let html = "";

    drivers.forEach((driver, index) => {
      if(index == 0){
        const card = `
        <div id="add-driver-card" class="card bg-secondary mx-2 mb-3 input-card" style="width: 15rem;">
        <div class="card-header text-white bg-dark h5">
        Add New Drivers
        </div>
        <svg width="8em" height="8em" viewBox="0 0 16 16" class="bi bi-person-plus-fill align-self-center mt-3" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.5-3a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
        </svg>
        <div class="card-body">
          <h4 class="card-text text-center">Click here to add new drivers to the system</h4>
        </div>
      </div>
        `;
        html += card;
      }
      else {
        // could break up this text to add the conditional and add the html after instead of having two whole separate ones
        const card = `
        <div class="card card-custom mx-2 mb-3" style="width: 15rem;">
        <div class="card-header text-white bg-dark h5">
          ${driver.data().fname} ${driver.data().lname}
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">Type: ${driver.data().type}</li>
          <li class="list-group-item">Status: ${driver.data().status}</li>
          <li class="list-group-item">Pay Rate: ${driver.data().rate}</li>
          <li class="list-group-item overflow-auto">Address:</br> ${driver.data().address}</li>
          <li class="list-group-item overflow-auto">Email:</br> ${driver.data().email}</li>
        </ul>
        <button data-id="${driver.id}" type="button" class="btn btn-light">Edit</button>
        </div>
        `;
        html += card;
      }
    
      
    })
    driverCardDiv.innerHTML = html;

    // Pull up modal and set data
    document.querySelectorAll(".btn.btn-light").forEach(btn => {
      btn.addEventListener("click", event => {
        // call modal
        const driverID = event.target.dataset.id;
        db.read.getDriverDoc(setDriverFormValues, driverID)
      })
    })
    const addDriverCard = document.querySelector("#add-driver-card");
    addDriverCard.addEventListener("click", () => {
      $('#newDriverModal').modal()
    })
  }
  else{
    console.log("No drivers found")
  }
})

// NEED TO ADD FIREBASE FUNCTION AND TEST. THEN FIGURE OUT EDIT/DELETE/TOGGLE STATUS BTNS
const displayUsers = ((data) => {
  if(data.length){
    const users = [];
    data.forEach((doc) => {
      users.push(doc);
    })
    users.sort((a, b) => a.data().lname.localeCompare(b.data().lname))
    let html = "";
    users.forEach(user => {
      const card = `
      <div class="card card-custom mx-2 mb-3" style="width: 15rem;">
      <div class="card-header text-white bg-dark h5">
        ${user.data().fname} ${user.data().lname}
      </div>
      <ul class="list-group list-group-flush">
        <li class="list-group-item">Role: ${user.data().role}</li>
        <li class="list-group-item overflow-auto">Email:<br> ${user.data().email}</li>
      </ul>
      <button data-id="${user.id}" type="button" class="btn btn-light">Edit</button>
      </div>
      `;
      html += card;
    })
    userCardDiv.innerHTML = html;
  }
  else {
    console.log("No users found")
  }
})


// EDIT DRIVER ATTRIBUTES
modalDriverForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const driverID = updateDriverBtn.dataset.id;
  db.update.editDriver(modalDriverForm, driverID)
  $("#editDriverModal").modal("hide");
})


// 'delete driver' ie change status
// deleteDriverBtn.addEventListener("click", (event) => {
//   db.update.setDriverStatus("inactive", deleteDriverBtn.dataset.id)
// })
// addUserCard.addEventListener("click", () => {
  
// })


newDriverForm.addEventListener("submit", (event) => {
  event.preventDefault();
  db.create.newDriver(newDriverForm);
  
})


db.read.getAllDrivers(displayDrivers);
db.read.getAllUsers(displayUsers);