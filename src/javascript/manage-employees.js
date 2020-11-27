const db = require('../database');
// listens to the authentication state and handles changes
db.AuthStateListener();

const driverCardDiv = document.querySelector("#driver-card-div");
const userCardDiv = document.querySelector("#user-card-div");
const modalDriverForm = document.querySelector("#editDriverForm");
const updateDriverBtn = document.querySelector("#modalUpdateDriver");
// const deleteDriverBtn = document.querySelector("#modalDeleteDriver");
const addUserCard = document.querySelector("#add-user-card");
const addDriverCard = document.querySelector("#add-driver-card");
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




// need to alphabetize the display
const displayDrivers = ((data) => {
  if (data.length){
    
    const drivers = [];
    data.forEach((doc) => {
      drivers.push(doc);
    })

    drivers.sort((a, b) => a.data().lname.localeCompare(b.data().lname))
    let html = "";

    drivers.forEach(driver => {
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

    users.forEach(user => {
      // could break up this text to add the conditional and add the html after instead of having two whole separate ones
      const card = `
      <div class="card card-custom mx-2 mb-3" style="width: 15rem;">
      <div class="card-header text-white bg-dark h5">
        ${user.data().fname} ${user.data().lname}
      </div>
      <ul class="list-group list-group-flush">
        <li class="list-group-item">Type: ${user.data().role}</li>
        <li class="list-group-item">Status: ${user.data().email}</li>
      </ul>
      <button data-id="${user.id}" type="button" class="btn btn-light">Edit</button>
      </div>
      `;
      html += card;
    })
    userCardDiv = html;
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
addUserCard.addEventListener("click", () => {
  
})
addDriverCard.addEventListener("click", () => {
  $('#newDriverModal').modal()
})

newDriverForm.addEventListener("submit", (event) => {
  event.preventDefault();
  db.create.newDriver(newDriverForm);
  $('#newDriverModal').modal("hide");
})


db.read.getAllDrivers(displayDrivers)