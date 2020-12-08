const database = require('../database');
const db = require('../database');
// listens to the authentication state and handles changes
db.AuthStateListener();

const driverCardDiv = document.querySelector("#driver-card-div");
const userCardDiv = document.querySelector("#user-card-div");
const modalDriverForm = document.querySelector("#editDriverForm");
const modalUserForm = document.querySelector("#editUserForm");
const updateDriverBtn = document.querySelector("#modalUpdateDriver");
const updateUserBtn = document.querySelector("#editUserConfirm")
// const deleteDriverBtn = document.querySelector("#modalDeleteDriver");
const addUserCard = document.querySelector("#add-user-card");
const newDriverForm = document.querySelector("#newDriverForm");
const dispatcherCodeForm = document.getElementById('dispatcherCodeForm');
const adminCodeForm = document.getElementById('adminCodeForm');
// set modal values to corresponding driver
const setDriverFormValues = (doc) => {
    // give buttons a data-id that matches the job
    let rateLabel = document.getElementById("rate-label");
    updateDriverBtn.dataset.id = doc.id;

    if (doc.data().type == "salary"){
      modalDriverForm['salaryRadio'].checked = true;
      rateLabel.innerHTML = "Pay Per Mile: ";
    }
    else if (doc.data().type == "owner-operator"){
      modalDriverForm['ownerOpRadio'].checked = true;
      rateLabel.innerHTML = "Load Rate: ";
    }
    if (doc.data().status == "active"){
      modalDriverForm["statusRadio1"].checked = true;
    }
    else if (doc.data().status == "inactive"){
      modalDriverForm["statusRadio2"].checked = true;
    }
    modalDriverForm['rate'].value = doc.data().rate;
    modalDriverForm['address'].value = doc.data().address;
    modalDriverForm['email'].value = doc.data().email;
    $('#editDriverModal').modal()
}

const setUserFormValues = (doc) => {
  // set the data-id of the update button (in the modal) the selected users id 
  updateUserBtn.dataset.id = doc.id;

  if(doc.data().role == "admin") modalUserForm['adminRadio'].checked = true;
  else if (doc.data().role == "dispatcher") modalUserForm['dispatcherRadio'].checked = true;

  if(doc.data().status == "active") modalUserForm['userActive'].checked = true;
  else if (doc.data().status == "inactive") modalUserForm['userInactive'].checked = true;
  
  $('#editUserModal').modal()
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
    drivers.sort((a, b) => a.data().status.localeCompare(b.data().status))
    let html = "";

    drivers.forEach((driver, index) => {
      
      if(index == 0){
        const card = `
        <div id="add-driver-card" class="card bg-primary mx-2 mb-3 input-card" style="width: 15rem;">
        <div class="card-header text-white bg-dark h5">
        Add New Drivers
        </div>
        <svg width="8em" height="8em" viewBox="0 0 16 16" class="bi bi-person-plus-fill align-self-center mt-3" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.5-3a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
        </svg>
        <div class="card-body">
          <h4 class="card-text text-white text-center">Click here to add new drivers</h4>
        </div>
      </div>
        `;
        html += card;
      }

      let title = "";
      if (driver.data().type == "salary"){
        title = "Pay Rate Per Mile";
        console.log(title)
      }
      else if (driver.data().type == "owner-operator"){
        title = "Pay Rate Per Load";
      }

      let background = "";
      if (driver.data().status == "active"){
        background = "bg-dark";
      }
      else if (driver.data().status == "inactive"){
        background = "bg-secondary";
      }


        // break up this text to add the conditional and add the html after instead of having two whole separate ones
        const card = `
        <div class="card card-custom mx-2 mb-3" style="width: 15rem;">
        <div class="card-header text-white ${background} h5 ">
          ${driver.data().fname} ${driver.data().lname}
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><b>Type</b>: ${driver.data().type}</li>
          <li class="list-group-item"><b>Status</b>: ${driver.data().status}</li>
          <li class="list-group-item"><b>${title}</b>: ${driver.data().rate}</li>
          <li class="list-group-item overflow-auto"><b>Address</b>:</br> ${driver.data().address}</li>
          <li class="list-group-item overflow-auto"><b>Email</b>:</br> ${driver.data().email}</li>
        </ul>
        <button data-id="${driver.id}" type="button" class="btn btn-light editDriver"><b>Edit</b></button>
        </div>
        `;
        html += card;
    })
    driverCardDiv.innerHTML = html;

    // Pull up modal and set data
    document.querySelectorAll(".btn.btn-light.editDriver").forEach(btn => {
      btn.addEventListener("click", event => {
        // call modal
        const driverID = event.currentTarget.dataset.id;
        console.log(driverID)
        db.read.getDriverDoc(setDriverFormValues, driverID)
      })
    })
  }
  else{
    console.log("No drivers found")
  }
  // at bottom as we want the event listener to work if there are drivers or not
  const addDriverCard = document.querySelector("#add-driver-card");
  addDriverCard.addEventListener("click", () => {
    $('#newDriverModal').modal()
  })
})


const displayUsers = ((data) => {
  if(data.length){
    const users = [];
    data.forEach((doc) => {
      users.push(doc);
    })
    users.sort((a, b) => a.data().lname.localeCompare(b.data().lname))
    users.sort((a, b) => a.data().status.localeCompare(b.data().status))
    let html = "";
    users.forEach(user => {
      let background = "";
      if (user.data().status == "active"){
        background = "bg-dark";
      }
      else if (user.data().status == "inactive"){
        background = "bg-secondary";
      }
      const card = `
      <div class="card card-custom mx-2 mb-3" style="width: 15rem;">
      <div class="card-header text-white ${background} h5">
        ${user.data().fname} ${user.data().lname}
      </div>
      <ul class="list-group list-group-flush">
        <li class="list-group-item"><b>Role</b>: ${user.data().role}</li>
        <li class="list-group-item"><b>Status</b>: ${user.data().status}</li>
        <li class="list-group-item overflow-auto"><b>Email</b>:<br> ${user.data().email}</li>
      </ul>
      <button data-id="${user.id}" type="button" class="btn btn-light editUser"><b>Edit</b></button>
      </div>
      `;
      html += card;
    })
    userCardDiv.innerHTML = html;

        // Pulls up modal and inputs form data
        document.querySelectorAll(".btn.btn-light.editUser").forEach(btn => {
          btn.addEventListener("click", event => {
            // call modal
            const userID = event.currentTarget.dataset.id;
            console.log(userID)
            db.read.getUserDoc(setUserFormValues, userID)

          })
        })
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

modalUserForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const userID = updateUserBtn.dataset.id;
  database.update.editUser(modalUserForm, userID)
  $("#editUserModal").modal("hide");
})



newDriverForm.addEventListener("submit", (event) => {
  event.preventDefault();
  db.create.newDriver(newDriverForm);
  $('#newDriverModal').modal("hide") // hmm, may need this to be in the db call? so
  // the event happens in the .then()
})

const logoutBtn = document.querySelector('#logout');
logoutBtn.addEventListener('click', () => {
    db.logout();
})


const displayCodes = (doc) => {
  dispatcherCodeForm['dispatcherCode'].value = doc.data().DispatcherRegistrationID;
  adminCodeForm['adminCode'].value = doc.data().AdminRegistrationID;

}

// could use blur event listener to allow update code buttons



const checkCodesAdmin = () => {

  const message = document.getElementById('message1');
  const submit = document.getElementById('adminSubmit');

  if (dispatcherCodeForm['dispatcherCode'].value !=
  adminCodeForm['adminCode'].value) {
    message.innerHTML = '';
    submit.disabled = false;
  } else {
    message.style.color = 'red';
    message.innerHTML = 'Codes cannot be the same';
    submit.disabled = true;

  }

}

const checkCodesDispatch = () => {
  const message = document.getElementById('message');
  const submit = document.getElementById('dispatchSubmit');

  if (dispatcherCodeForm['dispatcherCode'].value !=
  adminCodeForm['adminCode'].value) {
    message.innerHTML = '';


    submit.disabled = false;

  } else {
    message.style.color = 'red';
    message.innerHTML = 'Codes cannot be the same';
    submit.disabled = true;
  }

}

const revertButtonColor = (buttonType) => {

  if(buttonType == "dispatch"){
    console.log('hello?')
    document.getElementById('dispatchSubmit').className = "btn btn-primary m-2";
    document.getElementById('dispatchSubmit').innerText = "Update Code";
  }
  else if (buttonType == "admin"){
    document.getElementById('adminSubmit').className = "btn btn-primary m-2";
    document.getElementById('adminSubmit').innerText = "Update Code";
  }
}

dispatcherCodeForm['dispatcherCode'].addEventListener("keyup", checkCodesDispatch)
adminCodeForm['adminCode'].addEventListener("keyup", checkCodesAdmin)

dispatcherCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // update entry.
  console.log(dispatcherCodeForm['dispatcherCode'].value)


  db.update.dispatchCode(displayCodes)
  
  document.getElementById('dispatchSubmit').className = "btn btn-success m-2";
  document.getElementById('dispatchSubmit').innerText = "Success!";
  setTimeout(() => {
    revertButtonColor("dispatch")
  }, 2000);


})

adminCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // update entry.
  console.log(adminCodeForm['adminCode'].value)
  // in the .then call to update info


  db.update.adminCode(displayCodes)
  document.getElementById('adminSubmit').className = "btn btn-success m-2";
  document.getElementById('adminSubmit').innerText = "Success!";
  setTimeout(() => {
    revertButtonColor("admin")
  }, 2000);
})

db.read.getAllDrivers(displayDrivers);
db.read.getAllUsers(displayUsers);

db.read.getAdminDoc(displayCodes)