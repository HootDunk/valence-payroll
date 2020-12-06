
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
let grossPay = 0;
let totalAmount = 0;
let collapseID;
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
  const dataFieldSalary = document.querySelectorAll(`.datafield.salary.${collapseID}`)
  if(data.length){
      let totalMiles = 0;
      const driverRate = data[0].data().driverRate; // get driver pay rate (using first rate for no particular reason)
      const salaryLoadSummary = document.getElementById(`salary-load-summary ${collapseID}`);
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
  // need to add data-id to table element!!
  
  if(doc.data()){
      const salaryDriverAdjTB = document.getElementById(`salaryAdjustmentsTB ${collapseID}`);
      salaryDriverAdjTB.setAttribute('data-id', doc.id)
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

      const dataFieldSalary = document.querySelectorAll(`.datafield.salary.${collapseID}`)
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




const showOwnerOpLoadInfo = ((data) => {
  if(data.length){
      const percentElement = document.querySelector(`.datafield.ownerOp.percent.${collapseID}`);
      const grossPayElement = document.querySelector(`.datafield.ownerOp.grossPay.${collapseID}`);
      const totalDriverElement = document.querySelector(`.datafield.ownerOp.totalPercent.${collapseID}`);
      const totalRateElement = document.querySelector(`.datafield.ownerOp.totalRate.${collapseID}`);
      const valanceTotalElement= document.querySelector(`.datafield.ownerOp.valenceTotal.${collapseID}`);
      percentElement.innerText = `${100 * (data[0].data().driverRate)}%`;
      const ownerOpLoadSummary = document.getElementById(`ownerOpLoadSummary-${collapseID}`);
      let totalRate = 0;
      let valenceTotal = 0;
      let html = "";
      data.forEach((doc) =>{
          const job = doc.data();
          
          const tr = `
              <tr data-id=${doc.id}>
                  <td> <b>Origin</b>: ${job.origin} </br> <b>Destination:</b> ${job.destination}</td>
                  <td>$${(job.loadRate).toFixed(2)}</td>
                  <td>$${(job.loadRate * job.driverRate).toFixed(2)}</td>
                  <td>$${((job.loadRate) * (1 - job.driverRate)).toFixed(2)}</td>
              </tr>
          `;
          html += tr;
          grossPay += (job.loadRate * job.driverRate);
          totalRate += job.loadRate;
          valenceTotal += (job.loadRate * (1 - job.driverRate));
      })
      grossPayElement.innerText = `$${grossPay.toFixed(2)}`;
      ownerOpLoadSummary.innerHTML = html;
      totalRateElement.innerText = `$${totalRate.toFixed(2)}`;
      totalDriverElement.innerText = `$${grossPay.toFixed(2)}`;
      valanceTotalElement.innerText = `$${valenceTotal.toFixed(2)}`;
  }
  else{
      ownerOpLoadSummary.innerHTML = ""; // should make sure past load info gets deleted.  not tested.
      console.log("No load information for this driver")
  }
})

const showFuelInfo = ((data) => {
  if(data.length){
     const fuelTableBody = document.getElementById(`fuel-table-body-${collapseID}`);
      let totalGallons = 0;
      let html = "";
      data.forEach((doc) =>{
          const fuelInfo = doc.data();
          const tr = `
              <tr data-id=${doc.id}>
                  <td>${fuelInfo.city}, ${fuelInfo.state}</td>
                  <td>${(fuelInfo.gallons).toFixed(2)}</td>
                  <td>$${(fuelInfo.amount).toFixed(2)}</td>
              </tr>
          `;
          html += tr;
          totalGallons += fuelInfo.gallons;
          totalAmount += fuelInfo.amount;
      })
      fuelTableBody.innerHTML = html;
      
      $(`.datafield.ownerOp.totalGallons.${collapseID}`).text( totalGallons.toFixed(2));
      $(`.datafield.ownerOp.totalAmount.${collapseID}`).text(`$${totalAmount.toFixed(2)}`);
      $(`.datafield.ownerOp.fuel.${collapseID}`).text(`$${totalAmount.toFixed(2)}`);
  }
  else{
      fuelTableBody.innerHTML = ""; // makes sure not table data is displayed from last driver
      console.log("No fuel records found")
  }
})

const showOwnerOpAdjustmentInfo = ((doc) => {
  if(doc.data()){
    
      const ownerOpAdjTB = document.getElementById(`ownerOpAdjustmentsTB-${collapseID}`)
      ownerOpAdjTB.setAttribute('data-id', doc.id)
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
      $(`.datafield.ownerOp.detention.${collapseID}`).text(`$${(reimbursements.detention).toFixed(2)}`);
      $(`.datafield.ownerOp.extras.${collapseID}`).text(`$${(reimbursements.extras).toFixed(2)}`);
      $(`.datafield.ownerOp.insurance.${collapseID}`).text(`$${(deductions.insurance).toFixed(2)}`);
      $(`.datafield.ownerOp.reserve.${collapseID}`).text(`$${(deductions.reserve).toFixed(2)}`);
      $(`.datafield.ownerOp.insurance.${collapseID}`).text(`$${(deductions.insurance).toFixed(2)}`);
      $(`.datafield.ownerOp.reimbursements.${collapseID}`).text(`$${(totalDeduct).toFixed(2)}`);
      $(`.datafield.ownerOp.deductions.${collapseID}`).text(`$${(totalReimburse + totalAmount).toFixed(2)}`);
      $(`.datafield.ownerOp.total.${collapseID}`).text(`$${(grossPay + totalReimburse - totalDeduct - totalAmount).toFixed(2)}`);
  }
  else{
      console.log("No adjustment data found")
  }
})



// need to add event.target.dataset.target in the class of each table


// show/hide accordian on click
accordion.addEventListener("click", (event) => {
  console.log(event.target.dataset.target)
  if(event.target.className == "btn btn-link collapsed p-0"){

    const currentDiv = document.querySelector(event.target.dataset.target);

    const payrollID = event.target.dataset.id;
    // prevents  repeated database calls

    if (currentDiv.innerHTML.length < 30){
      grossPay = 0;
      collapseID = (event.target.dataset.target).slice(1);
      console.log(collapseID)
      if(event.target.dataset.type == "salary"){
        currentDiv.innerHTML = `
        <div id="salaried-driver-container ${collapseID}" class="container">
        <div class="row">
          <div class="col-lg-3">
            <h4 class="text-info">Weekly Cash Flow</h4>
            <table id="salaryAdjustmentsTB ${collapseID}" class="table table-bordered table-sm">
  
              <thead class="thead-light">
                <tr>
                  <th class="text-info" scope="col" colspan="2">Reimbursements</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="2">Toll</td>
                  <td class = "datafield salary toll ${collapseID}"></td>
                </tr>
                <tr>
                  <td colspan="2">Scale</td>
                  <td class = "datafield salary scale ${collapseID}"></td>
                </tr>
                <tr>
                  <td colspan="2">Extras</td>
                  <td class= "datafield salary extras ${collapseID}"></td>
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
                  <td class = "datafield salary insurance ${collapseID}"></td>
                </tr>
                <tr>
                  <td colspan="2">Accidental</td>
                  <td  class = "datafield salary accidental ${collapseID}"></td>
                </tr>
                <tr>
                  <td  colspan="2">Cash Advance</td>
                  <td class = "datafield salary cashAdvance ${collapseID}"></td>
                </tr>
                <tr>
                  <td colspan="2">Escrow</td>
                  <td class = "datafield salary escrow ${collapseID}"></td>
                </tr>
                <tr>
                  <td colspan="2">Reserve</td>
                  <td class = "datafield salary reserve ${collapseID}"></td>
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
                    <td class = "datafield salary grossPay ${collapseID}"></td>
                  </tr>
                  <tr>
                    <td colspan="2">Reimbursements</td>
                    <td class = "datafield salary reimbursements ${collapseID}"></td>
                  </tr>
                  <tr>
                    <tr>
                      <td colspan="2">Deductions</td>
                      <td class = "datafield salary deductions ${collapseID}"></td>
                    </tr>
                    <td class="text-info" colspan="2"><b>Total</b></td>
                    <td class = "datafield salary total ${collapseID}"></td>
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
              <tbody id="salary-load-summary ${collapseID}">
  
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
                    <td class = "datafield salary totalMiles ${collapseID}"></td>
                    <td class="datafield salary payRate ${collapseID}"></td>
                    <td class="datafield salary totalPay ${collapseID}"></td>
                  </tr>
                </tbody>
              </table>
            </table>
          </div>
        </div>
      </div>
    </div>
      `;
      
      
      database.read.getSalaryCompletedPayrollInfo(showSalaryJobInfo, showSalaryAdjustmentsInfo, payrollID)
      }
      else if (event.target.dataset.type == "owner-operator"){
        currentDiv.innerHTML = `
        <div class="container">
        <div class="row">
          <div class="col-md-3">
            <h4 class="text-info">Weekly Cash Flow</h4>
  
            <table id="ownerOpAdjustmentsTB-${collapseID}" class="table table-bordered table-sm">
              <thead class="thead-light">
                <tr>
                  <th class="text-info" scope="col" colspan="2">Reimbursements</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="2">Detention/Layover</td>
                  <td class="datafield ownerOp detention ${collapseID}"></td>
                </tr>
                <tr>
                  <td colspan="2">Extras</td>
                  <td class="datafield ownerOp extras ${collapseID}"></td>
                </tr>
                <thead class="thead-light">
                  <tr>
                    <th class="text-info" scope="col" colspan="2">Deductions</th>
                    <th scope="col">Amount</th>
                  </tr>
                </thead>
                  <tr>
                    <td colspan="2">Fuel</td>
                    <td class="datafield ownerOp fuel ${collapseID}"></td>
                  </tr>
                  <tr>
                    <td colspan="2">Insurance</td>
                    <td class="datafield ownerOp insurance ${collapseID}"></td>
                  </tr>
                  <tr>
                    <td  colspan="2">Reserve</td>
                    <td class="datafield ownerOp reserve ${collapseID}"></td>
                  </tr>
                  <thead class="thead-light">
                    <tr>
                      <th class="text-info" scope="col" colspan="2">Net Pay</th>
                      <th scope="col">Amount</th>
                    </tr>
                  </thead>

                    <tr>
                      <td colspan="2">Gross Pay</td>
                      <td class="datafield ownerOp grossPay ${collapseID}"></td>
                    </tr>
                    <tr>
                      <td colspan="2">Reimbursements</td>
                      <td class="datafield ownerOp reimbursements ${collapseID}"></td>
                    </tr>
                    <tr>
                      <td colspan="2">Deductions</td>
                      <td class="datafield ownerOp deductions ${collapseID}"></td>
                    </tr>
                    <tr>
                      <td class="text-info" colspan="2"><b>Total</b></td>
                      <td class="datafield ownerOp total ${collapseID}"></td>
                    </tr>
              </tbody>
            </table>
          </div>
  
        <div class="col-md-9">
          <h4 class="text-info">Load Summary</h4>
          <table class="table table-hover table-bordered table-sm">
            <thead class="thead-light">
              <tr>
                <th>Load</th>
                <th>Rate</th>
                <th class="datafield ownerOp percent ${collapseID}" scope="col">90%</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody id="ownerOpLoadSummary-${collapseID}">


            </tbody>
            <tfoot>
              <tr>
                <td class="text-info"><b>Total</b></td>
                <td class="datafield ownerOp totalRate ${collapseID}" >$0.00</td>
                <td class="datafield ownerOp totalPercent ${collapseID}">$0.00</td>
                <td class="datafield ownerOp valenceTotal ${collapseID}">$0.00</td>
              </tr>
            </tfoot>
          </table>

            <h4 class="text-info">Fuel Summary</h4>
            <table class="table table-hover table-bordered table-sm">
              <thead class="thead-light">
                <tr>
                  <th>City + State</th>
                  <th>Gallons</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody id="fuel-table-body-${collapseID}">

              </tbody>
              <tfoot>
                <tr>
                  <td class="text-info"><b>Total</b></td>
                  <td class="datafield ownerOp totalGallons ${collapseID}">$0.00</td>
                  <td class="datafield ownerOp totalAmount ${collapseID}">$0.00</td>
                </tr>
              </tfoot>
            </table>
              

          <!-- End of row div -->
        </div>
      </div>
        `;
        
        totalAmount = 0;
        // adjustment records are being registered, it's just that the logger function doesn't work for it
        database.read.getOwnerOpCompletedPayroll(logger, logger, logger, payrollID)
        database.read.getOwnerOpCompletedPayroll(showOwnerOpLoadInfo, showFuelInfo, showOwnerOpAdjustmentInfo, payrollID)

      }
      

    // call database function
    }
    
      // call this after database function
      if(currentDiv.className == "collapse"){
        currentDiv.className = "collapse show";
      }
      else if (currentDiv.className == "collapse show"){
        currentDiv.className = "collapse";
      }
  }
  // 
 
})


const createDateArray = (dateString) => {
  let parts = dateString.split('-');
  return parts;
}


const populateAccordian = (collection) => {
  if(collection.length){
    let html = "";
    collection.forEach((doc, index) => {
      let accordianCard = `
      <div class="card">
        <div class="card-header" id="header${index}">
          <ul id="underline-list" class="collapsed list-group list-group-horizontal d-flex justify-content-left" data-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
            <li class="list-group-item p-3 bg-transparent">
              <button data-id="${doc.id}" data-type="${doc.data().driverType}" class="btn btn-link collapsed p-0" type="button" data-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                View More
              </button>
            </li>
            <li class="list-group-item p-3 bg-transparent">${doc.data().driverName}</li>
            <li class="list-group-item p-3 bg-transparent"><b>Week</b>: ${doc.data().week}</li>
            <li class="list-group-item p-3 bg-transparent"><b>Gross Pay</b>: $${doc.data().grossPay}</li>
            <li class="list-group-item p-3 bg-transparent"><b>Deductions</b>: $${doc.data().totalDeduct}</li>
            <li class="list-group-item p-3 bg-transparent"><b>Reimbursements</b>: $${doc.data().totalReimburse}</li>
            <li class="list-group-item p-3 bg-transparent"><b>Net Pay</b>: $${doc.data().netPay}</li>
            `;
            if(doc.data().driverType == "salary"){
              accordianCard +=  `<li class="list-group-item p-3 bg-transparent"><b>Total Miles</b>: ${doc.data().totalMiles}mi</li>`
            }
            else if (doc.data().driverType == "owner-operator"){
              accordianCard += `<li class="list-group-item p-3 bg-transparent"><b>Fuel Costs</b>: $${doc.data().totalFuelCost}</li>`
            }
            accordianCard += `
            <li class="list-group-item p-3 bg-transparent"><b>Driver Type</b>: ${doc.data().driverType}</li>
          </ul>
        </div>
        <div id="collapse${index}" class="collapse" aria-labelledby="heading${index}" data-parent="#accordionExample">

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
    // database.read.getRecordsByDate(logger, startDate, endDate);
    database.read.getRecordsByDate(populateAccordian, startDate, endDate);
  }
  // could easily add search all salary drivers and all owner operator drivers as well
  else{
    const currentDriverId = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-id');
    const currentDriverType = driverSelect.options[driverSelect.selectedIndex].getAttribute('data-type');
    console.log("search by driver and date")
    database.read.getDriverRecordsByDate(populateAccordian, currentDriverId, startDate, endDate);
  }
  
})





// const collapseGroup = document.querySelectorAll(".collapse");

// collapseGroup.forEach(element => {
//   element.addEventListener('click', (event)=> {
//     console.log(event.target)
//     console.log("clicked")
//   })
// })