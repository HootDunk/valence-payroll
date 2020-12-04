
// Okay now bring in the owner operator functions and work those out.
// then it's time to write out what the database documents will look like and how to bind the proper records to the click events
// accordion elements need data-type of driverType to handle those conditionals with data-id of the payrollID.  query for all matching documents with same id
// how will query by date look? make sure you think of that as well.  should just be tied to accordion render function

const salaryDiv = document.querySelector('.salaried-div');
const accordion = document.getElementById("accordionExample");
const form = document.getElementById("search-form");
const driverSelect = document.getElementById('driver');
const accordianDiv = document.getElementById("accordionExample")
const database = require('../database');


// creates dropdown with all active drivers
const createDropdownHTML = (data) => {
  const drivers = [];
  data.forEach((doc) => {
    drivers.push(doc)
  })
  drivers.sort((a, b) => a.data().fname.localeCompare(b.data().lname))
  let html = "";
  const dropdown = document.getElementById('driver');
  drivers.forEach((driver) => {
    const option = `
        <option class="driver-option" data-type="${driver.data().type}" data-id=${driver.id}>${driver.data().lname}, ${driver.data().fname} (${driver.data().type})</option>
    `;
    html += option;
  })
  dropdown.innerHTML += html;
}
database.read.getAllDrivers(createDropdownHTML)



const showSalaryJobInfo = (data) => {
  const dataFieldSalary = document.querySelectorAll(".datafield.salary")
  if(data.length){
      let totalMiles = 0;
      const driverRate = data[0].data().driverRate; // get driver pay rate (using first rate for no particular reason)
      const salaryLoadSummary = document.getElementById('salary-load-summary');
      let html = "";
      data.forEach((doc) =>{
          const job = doc.data();
          const tr = `
              <tr data-id=${doc.id}>
                  <td>${job.origin}</td>
                  <td>${job.destination}</td>
                  <td>${job.miles}</td>
              </tr>
          `;
          html += tr;
          totalMiles += job.miles;
      })
      salaryLoadSummary.innerHTML = html;
      grossPay = totalMiles * driverRate;
      dataFieldSalary[12].innerHTML = totalMiles;
      dataFieldSalary[13].innerHTML = `$${driverRate}`;
      dataFieldSalary[14].innerHTML = `$${(totalMiles * driverRate).toFixed(2)}`;
      dataFieldSalary[8].innerHTML = `$${grossPay.toFixed(2)}`;
  }
  else {
      console.log('no load data for this driver')
  }
}

const showSalaryAdjustmentsInfo = (doc) => {
  const dataFieldSalary = document.querySelectorAll(".datafield.salary")
  // need to add data-id to table element!!
  if(doc.data()){
      let totalReimburse = 0;
      let totalDeduct = 0;

      const adjustments = doc.data();
      const deductions = adjustments.deductions;
      const reimbursements = adjustments.reimbursements;

      // iterate object and sum values
      for(let key of Object.keys(deductions)){
          totalDeduct += deductions[key]

      }
      for(let key of Object.keys(reimbursements)){
          totalReimburse += reimbursements[key]
      }

      // Set the Reimbursement values
      dataFieldSalary[0].innerHTML = `$${(reimbursements.toll).toFixed(2)}`;
      dataFieldSalary[1].innerHTML = `$${(reimbursements.scale).toFixed(2)}`;
      dataFieldSalary[2].innerHTML = `$${(reimbursements.extras).toFixed(2)}`;
      // Set the Deductions values
      dataFieldSalary[3].innerHTML = `$${(deductions.insurance).toFixed(2)}`;
      dataFieldSalary[4].innerHTML = `$${(deductions.accidental).toFixed(2)}`;
      dataFieldSalary[5].innerHTML = `$${(deductions.cashAdvance).toFixed(2)}`;
      dataFieldSalary[6].innerHTML = `$${(deductions.escrow).toFixed(2)}`;
      dataFieldSalary[7].innerHTML = `$${(deductions.reserve).toFixed(2)}`;
      // Net Pay Values
      dataFieldSalary[9].innerHTML = `$${(totalReimburse).toFixed(2)}`;
      dataFieldSalary[10].innerHTML = `$${(totalDeduct).toFixed(2)}`;
      dataFieldSalary[11].innerHTML = `$${(grossPay + totalReimburse - totalDeduct).toFixed(2)}`;
  }
  else {
      console.log('No Adjustments Data')
  }
}

// show/hide accordian on click
accordion.addEventListener("click", (event) => {
  console.log(event)
  if(event.target.className == "btn btn-link collapsed" ||event.target.className == "btn btn-link collapsed p-0"){
    const currentDiv = document.querySelector(event.target.dataset.target);
    // prevents  repeated database calls
    if (currentDiv.innerHTML.length < 30){
      currentDiv.innerHTML = `
      <div id="salaried-driver-container" class="container">
      <div class="row">
        <div class="col-lg-3">
          <h4 class="text-info">Weekly Cash Flow</h4>
          <table class="table table-bordered table-sm">

            <thead class="thead-light">
              <tr>
                <th class="text-info" scope="col" colspan="2">Reimbursements</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="2">Toll</td>
                <td class = "datafield salary toll"></td>
              </tr>
              <tr>
                <td colspan="2">Scale</td>
                <td class = "datafield salary scale"></td>
              </tr>
              <tr>
                <td colspan="2">Extras</td>
                <td class= "datafield salary extras"></td>
              </tr>
            </tbody>
            
            <thead class="thead-light">
              <tr>
                <th class="text-info" scope="col" colspan="2">Deductions</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="2">Insurance</td>
                <td class = "datafield salary insurance"></td>
              </tr>
              <tr>
                <td colspan="2">Accidental</td>
                <td  class = "datafield salary accidental"></td>
              </tr>
              <tr>
                <td  colspan="2">Cash Advance</td>
                <td class = "datafield salary cashAdvance"></td>
              </tr>
              <tr>
                <td colspan="2">Escrow</td>
                <td class = "datafield salary escrow"></td>
              </tr>
              <tr>
                <td colspan="2">Reserve</td>
                <td class = "datafield salary reserve"></td>
              </tr>
            </tbody>
            
            <thead class="thead-light">
              <tr>
                <th class="text-info" scope="col" colspan="2">Net Pay</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
                <tr>
                  <td colspan="2">Gross Pay</td>
                  <td class = "datafield salary grossPay"></td>
                </tr>
                <tr>
                  <td colspan="2">Reimbursements</td>
                  <td class = "datafield salary reimbursements"></td>
                </tr>
                <tr>
                  <tr>
                    <td colspan="2">Deductions</td>
                    <td class = "datafield salary deductions"></td>
                  </tr>
                  <td class="text-info" colspan="2"><b>Total</b></td>
                  <td class = "datafield salary total"></td>
                </tr>
            </tbody>

          </table>
        </div>


        <div class="col col-lg-9">
          <h4 class="text-info">Load Summary</h4>
          <table class="table table-hover table-sm table-bordered">
            <thead class="thead-light">
              <tr>
                <th scope="col">Pickup</th>
                <th scope="col">Delivery</th>
                <th scope="col">Miles</th>
              </tr>
            </thead>
            <tbody id="salary-load-summary">

            </tbody>
          </table>
          <h4 class="text-info">Pay Summary</h4>
            <table class="table table-sm table-bordered">
              <thead class="thead-light">
                <tr>
                  <th scope="col">Total Miles</th>
                  <th scope="col">Pay Per Miles</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class = "datafield salary totalMiles"></td>
                  <td class="datafield salary payRate"></td>
                  <td class="datafield salary totalPay"></td>
                </tr>
              </tbody>
            </table>
          </table>
        </div>
      </div>
    </div>
  </div>
    `;

    // call database function
    }
    
      // call this after database function
      if(currentDiv.className == "collapse"){
        currentDiv.className = "collapse show";
      }
      else if (currentDiv.className == "collapse show"){
        currentDiv.className = "collapse";
      }

      // why isn't this getting called again? think it isn't specify which item to do! no to relate this to the particular accordion element
      // when it goes back to collapsed, you need to delete the inner html
      // database.read.getSalaryPayrollInfo(showSalaryJobInfo, showSalaryAdjustmentsInfo, 2, 'hePW490C6kZtWXkDtkE0')
  }
  // 
 
})


const createDateArray = (dateString) => {
  let parts = dateString.split('-');
  return parts;
}

const logger = (collection) => {
  if(collection.length){
    collection.forEach(doc => {
      console.log(doc.data())
    })
  }
  else{
    console.log("no payroll records found")
  }

}
const populateAccordian = (collection) => {
  if(collection.length){

    let html = "";
    collection.forEach((doc, index) => {
      let accordianCard = `
      <div class="card">
        <div class="card-header" id="headingTwo">
          <ul class="collapsed list-group list-group-horizontal d-flex justify-content-center" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
            <li class="list-group-item p-3 bg-transparent">
              <button class="btn btn-link collapsed p-0" type="button" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                View More
              </button>
            </li>
            <li class="list-group-item p-3 bg-transparent">Josh Hootman</li>
            <li class="list-group-item p-3 bg-transparent"><b>Week</b>: 11/11/2011 - 11/18/2011</li>
            <li class="list-group-item p-3 bg-transparent"><b>Gross Pay</b>: $5355.55</li>
            <li class="list-group-item p-3 bg-transparent"><b>Deductions</b>: 100</li>
            <li class="list-group-item p-3 bg-transparent"><b>Reimbursements</b>: 100</li>
            <li class="list-group-item p-3 bg-transparent"><b>Net Pay</b>: $5355.55</li>
            <li class="list-group-item p-3 bg-transparent"><b>Fuel Costs</b>: 12.50</li>
            <li class="list-group-item p-3 bg-transparent"><b>Salary Driver</b>: 12.50</li>
          </ul>
        </div>
        <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">

        </div>
      </div>
      `;
      html += accordianCard;
    })
    accordianDiv.innerHTML = html;

    
  }
  else{
    console.log("no payroll records found")
  }
}






form.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedDriver = driverSelect.options[driverSelect.selectedIndex].value;
  const startDateArr = createDateArray(form['start-date'].value);
  const endDateArr = createDateArray(form['end-date'].value);
  const startDate = new Date(startDateArr[0], startDateArr[1]-1, startDateArr[2]);
  const endDate = new Date(endDateArr[0], endDateArr[1]-1, endDateArr[2]);
  // evaluates to false.. will need to check equality when they are both strings
  // console.log(startDate == endDate)
  if(selectedDriver == "All Drivers"){
    console.log("search database by date only")
    database.read.getRecordsByDate(logger, startDate, endDate);
    database.read.getRecordsByDate(populateAccordian, startDate, endDate);
  }
  else{
    const currentDriverId = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-id');
    const currentDriverType = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-type');

    console.log("search by driver and date")
  }
  
  // console.log(startDate.toLocaleDateString())
  // console.log(endDate.toLocaleDateString())
  
})





// const collapseGroup = document.querySelectorAll(".collapse");

// collapseGroup.forEach(element => {
//   element.addEventListener('click', (event)=> {
//     console.log(event.target)
//     console.log("clicked")
//   })
// })