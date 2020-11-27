
const db = require('../database');
// listens to the authentication state and handles changes
db.AuthStateListener();

const salaryDiv = document.querySelector('.salaried-div');
const ownerOp = document.querySelector('.ownerOp-div');
const dataFieldSalary = document.querySelectorAll(".datafield.salary")
const driverInfoSalary = document.querySelectorAll(".driverInfo.salary li")
// const dataFieldOwnerOp = document.querySelectorAll(".datafield.ownerOp")
const driverInfoOwnerOp = document.querySelectorAll(".driverInfo.ownerOp li");
const fuelTableBody = document.getElementById("fuel-table-body");
let grossPay = 0;


const clearDisplay = () => {
    salaryDiv.style.display = "none";
    ownerOp.style.display = "none";
}

const showTables = (driverType) => {
    if(driverType === "salary"){
        salaryDiv.style.display = "revert";
    }
    else if (driverType === "owner-operator"){
        ownerOp.style.display = "revert";
    }
}

// Redo to make it specific to drive type like showtables
const clearDriverInfo = (driverType) => {
    if(driverType == "salary"){
        driverInfoSalary[0].innerText = "Name: ";
        driverInfoSalary[1].innerText = "Address: ";
    }
    else if (driverType == "owner-operator"){
        driverInfoOwnerOp[0].innerText = "Name: ";
        driverInfoOwnerOp[1].innerText = "Address: ";
    }

}

const createDropdownHTML = (data) => {
    const drivers = [];
    const driverIDs = [];
    data.forEach((doc) => {
        if(!driverIDs.includes(doc.data().driverID)){
            drivers.push(doc.data())
            driverIDs.push(doc.data().driverID)
        }
    })
    drivers.sort((a, b) => a.driverLname.localeCompare(b.driverLname))

    let html = "";
    const dropdown = document.getElementById('driver');
    drivers.forEach((driver) => {
      const option = `
          <option class="driver-option" data-type="${driver.driverType}" data-id=${driver.driverID}>${driver.driverLname}, ${driver.driverFname} (${driver.driverType})</option>
      `;
      html += option;
  })
  dropdown.innerHTML = html;
}

const showSalaryJobInfo = (data) => {
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


const showSalaryDriverInfo = ((doc) => {
    if(doc.data()){
        const driver = doc.data();
        driverInfoSalary[0].innerHTML += ` ${driver.fname} ${driver.lname}`;
        driverInfoSalary[1].innerHTML += ` ${driver.address}`;

    }
    else{
        console.log('No data for this driver')
    }
})

const showOwnerOpDriverInfo = ((doc) => {
    if(doc.data()){
        const driver = doc.data();
        driverInfoOwnerOp[0].innerHTML += ` ${driver.fname} ${driver.lname}`;
        driverInfoOwnerOp[1].innerHTML += ` ${driver.address}`;
    }
    else{
        console.log('No data for this driver')
    }
})

const showOwnerOpLoadInfo = ((data) => {
    if(data.length){
        const percentElement = document.querySelector(".datafield.ownerOp.percent");
        const grossPayElement = document.querySelector(".datafield.ownerOp.grossPay");
        const totalDriverElement = document.querySelector(".datafield.ownerOp.totalPercent");
        const totalRateElement = document.querySelector(".datafield.ownerOp.totalRate");
        const valanceTotalElement= document.querySelector(".datafield.ownerOp.valenceTotal");
        percentElement.innerText = `${100 * (data[0].data().driverRate)}%`;
        const ownerOpLoadSummary = document.getElementById("ownerOpLoadSummary");
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
        console.log("No load information for this driver")
    }
})

const showFuelInfo = ((data) => {
    if(data.length){
        let totalGallons = 0;
        let totalAmount = 0;
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
        
        $('.datafield.ownerOp.totalGallons').text( totalGallons.toFixed(2));
        $('.datafield.ownerOp.totalAmount').text(`$${totalAmount.toFixed(2)}`);
        $(".datafield.ownerOp.fuel").text(`$${totalAmount.toFixed(2)}`);
    }
    else{
        console.log("No fuel records found")
    }
})

const showOwnerOpAdjustmentInfo = ((doc) => {
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
        $(".datafield.ownerOp.detention").text(`$${(reimbursements.detention).toFixed(2)}`);
        $(".datafield.ownerOp.extras").text(`$${(reimbursements.extras).toFixed(2)}`);
        $(".datafield.ownerOp.insurance").text(`$${(deductions.insurance).toFixed(2)}`);
        $(".datafield.ownerOp.reserve").text(`$${(deductions.reserve).toFixed(2)}`);
        $(".datafield.ownerOp.insurance").text(`$${(deductions.insurance).toFixed(2)}`);
        $(".datafield.ownerOp.reimbursements").text(`$${(totalDeduct).toFixed(2)}`);
        $(".datafield.ownerOp.deductions").text(`$${(totalReimburse).toFixed(2)}`);
        $(".datafield.ownerOp.total").text(`$${(grossPay + totalReimburse - totalDeduct).toFixed(2)}`);
    }
    else{
        console.log("No adjustment data found")
    }
})


const populateDropdown = (data) => {
    if (data.length) {
        createDropdownHTML(data);
        document.querySelectorAll('.driver-option').forEach(option => {
            option.addEventListener('click', event => {
                const driverID = event.target.dataset.id;
                const driverType = event.target.dataset.type;
                grossPay = 0;
                clearDisplay();
                showTables(driverType);
                clearDriverInfo(driverType);
                if (driverType == "owner-operator"){
                    db.read.getDriverDoc(showOwnerOpDriverInfo, driverID)
                    db.read.getOwnerOpPayrollInfo(
                        showOwnerOpLoadInfo, showFuelInfo,
                        showOwnerOpAdjustmentInfo, 2, driverID
                    )
                }
                else if( driverType == "salary"){
                    db.read.getDriverDoc(showSalaryDriverInfo, driverID)
                    db.read.getSalaryPayrollInfo(showSalaryJobInfo, showSalaryAdjustmentsInfo, 2, driverID)
                }
            })
        })

    } else {
        console.log('no drivers found')
        // const driverOption = document.querySelector('.driver-option');
        // if(driverOption){
        //   // deletes last remaining driver option
        //   driverOption.remove();
        // }
    }
}



db.read.jobsByStatus(populateDropdown, 2, true)
