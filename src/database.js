
// Listens for authentication state changes, if no longer logged in returns user to sign in page
  const AuthStateListener = () => {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'index.html';
        }
      });
  }
  
  // Module for writing client side dates
  const dateInfo = (() => {
    const getWeekNum = () => {
      let now = new Date();
      let onejan = new Date(now.getFullYear(), 0, 1);
      return Math.ceil( (((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7 );
    }
    const getYear = () => {
      const d = new Date();
      return d.getFullYear();
    }
    const getMonth = () => {
      const d = new Date();
      return d.getMonth() + 1;
    }
    const getDay = () => {
      const d = new Date();
      return d.getDate();
    }
    const getDate = () => {
      return `${getYear()}-${getMonth()}-${getDay()}`
    }

    return {
      getWeekNum,
      getYear,
      getMonth,
      getDate,
    }
  })();

  // Create
  const create = (() => {
    const newJob = (obj) => {
      db.collection('jobs').add({
        client: obj.client,
        deadline: obj.deadline,
        destination: obj.destination,
        driverFname: obj.driverFname,
        driverID: obj.driverID,
        driverLname: obj.driverLname,
        driverRate: Number(obj.driverRate),
        driverType: obj.driverType,
        jobStatus: obj.jobStatus,
        loadRate: Number(obj.loadRate),
        miles: Number(obj.miles),
        origin: obj.origin,
      })
      .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });
    }



    const fuelEntry = (fuelForm, driverID) => {
      db.collection('fuel').add({
        driverID: driverID,
        city: fuelForm['city'].value,
        state: fuelForm['state'].value,
        gallons: Number(fuelForm['gallons'].value),
        amount: Number(fuelForm['amount'].value),
        fuelStatus: 1,
        month: dateInfo.getMonth(),
        year: dateInfo.getYear(),
        weekNum: dateInfo.getWeekNum(),
        date: dateInfo.getDate(),
      })
      .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });
    }
    // function is kind of big because I did the conditionals here.. hindsight would have put them in the other js file to keep database functions as close to 
    // reading in data as possible.
    const newAdjustments = (setAdjustmentValues, adjustmentsForm, currentDriverType, currentDriverID) => { 
      console.log('testingtestingtesting')
      console.log(currentDriverType) 
      if(currentDriverType == "owner-operator"){
        db.collection('adjustments').add({
          driverID: currentDriverID,
          driverType: currentDriverType,
          reimbursements: {
            detention: Number(adjustmentsForm['detention'].value),
            extras: Number(adjustmentsForm['extras'].value),
          },
          deductions: {
            insurance: Number(adjustmentsForm['insurance'].value),
            reserve: Number(adjustmentsForm['reserve-ownerOp'].value),
          },
          month: dateInfo.getMonth(),
          year: dateInfo.getYear(),
          weekNum: dateInfo.getWeekNum(),
          date: dateInfo.getDate(),
          adjustmentStatus: 1,
        })
        .then(function(docRef) {
          // call function to show changes
          console.log("Document written with ID: ", docRef.id);
          docRef.get().then(function(doc) {
            if (doc.exists) {
                setAdjustmentValues(doc);
                adjustmentsForm.reset();
            } else {
                // doc.data() will be undefined in this case
                console.log("document does not exist");
            }
          }).catch(function(error) {
              console.log("Error getting document:", error);
          })
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        })
      }
      else if (currentDriverType == "salary"){
        db.collection('adjustments').add({
          driverID: currentDriverID,
          driverType: currentDriverType,
          reimbursements: {
            toll: Number(adjustmentsForm['toll'].value),
            scale: Number(adjustmentsForm['scale'].value),
            extras: Number(adjustmentsForm['extras'].value),
          },
          deductions: {
            insurance: Number(adjustmentsForm['insurance'].value),
            accidental: Number(adjustmentsForm['accidental'].value),
            cashAdvance: Number(adjustmentsForm['cashAdvance'].value),
            escrow: Number(adjustmentsForm['escrow'].value),
            reserve: Number(adjustmentsForm['reserve-salary'].value),
          },
          month: dateInfo.getMonth(),
          year: dateInfo.getYear(),
          weekNum: dateInfo.getWeekNum(),
          date: dateInfo.getDate(),
          adjustmentStatus: 1,
        })
        .then(function(docRef) {
          // call function to show changes
          console.log("Document written with ID: ", docRef.id);
          docRef.get().then(function(doc) {
            if (doc.exists) {
                setAdjustmentValues(doc);
                adjustmentsForm.reset();
            } else {
                // doc.data() will be undefined in this case
                console.log("document does not exist");
            }
          }).catch(function(error) {
              console.log("Error getting document:", error);
          })
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        })
      }
    }

    const newPayrollEntrySalary = (myFunction, jobsArray, adjustments, driverID, driverType) => {
      db.collection("payroll-entries").add({
        driverID: driverID,
        driverType: driverType,
        jobs: jobsArray,
        adjustment: adjustments,
      })
      .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
        myFunction();
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });
    }

    const newDriver = (form) => {
      db.collection("drivers").add({
        address: newDriverForm['address'].value,
        email: newDriverForm['email'].value,
        fname: newDriverForm['fname'].value,
        lname: newDriverForm['lname'].value,
        rate: newDriverForm['rate'].value,
        status: "active",
        type: $('input[name="driverTypeRadio"]:checked').val(),
      })
      .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });
    }
  
    return {
      newJob,
      fuelEntry,
      newAdjustments,
      newPayrollEntrySalary,
      newDriver,
    }
  })();
  
  // Read data
  const read = (() => {
    // gets active job documents as a snapshot(listens for changes)
    // 3rd param dictates whether its an onSnapshotListener or just a onetime call
    const jobsByStatus = ((myFunction, jobStatus, listener) => {
      if(listener){
        db.collection("jobs")
          .where("jobStatus", "==", jobStatus)
          .onSnapshot(Snapshot => {
            myFunction(Snapshot.docs);
          })
      }
      else {
        db.collection('jobs')
          .where("jobStatus", "==", jobStatus)
          .get()
          .then(Snapshot => {
            myFunction(Snapshot.docs)
          })
      }
    });

  const getDriverFuelbyStatus = ((myFunction, driverID, fuelStatus) => {
        db.collection("fuel")
          .where("fuelStatus", "==", fuelStatus)
          .where("driverID", "==", driverID)
          .onSnapshot(Snapshot => {
            myFunction(Snapshot.docs);
          })
  });

  
    // get all drivers
    const getAllDrivers = ((myFunction) => {
      db.collection('drivers').onSnapshot(Snapshot => {
        myFunction(Snapshot.docs)
      })
    });


    // Get all system users
    const getAllUsers = ((myFunction) => {
      db.collection('users').onSnapshot(Snapshot => {
        myFunction(Snapshot.docs)
      })
    });

    // get jobs by driver id and status
    const getDriverJobs = ((myFunction, jobStatus, driverID) => {
      db.collection('jobs')
        .where("jobStatus", "==", jobStatus)
        .where("driverID", "==", driverID)
        .onSnapshot(Snapshot => {
          myFunction(Snapshot.docs);
        })
    });
    
    // poorly named, should be get job by driver id
    const getJobByID = ((myFunction, driverID) => {
      var docRef = db.collection("jobs").doc(driverID);

      docRef.get().then(doc => {
        if (doc.exists) {
          myFunction(doc)
      } else {
          console.log("No such document!");
      }
      }).catch(function(error) {
          console.log("Error getting document:", error);
      })
    });


    const getAdjustmentByID = ((myFunction, adjustmentStatus, driverID) => {
      // review docs about this type of query and need to do forEach
      db.collection("adjustments")
      .where("adjustmentStatus", "==", adjustmentStatus)
      .where("driverID", "==", driverID)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          myFunction(doc)
        })
      })
    });

    // learning promises and async would speed this up a lot
    function getSalaryPayrollInfo(myFunction, myFunction1, status, driverID) {
      getDriverJobs(myFunction, status, driverID)
      getAdjustmentByID(myFunction1, status, driverID)
    }

    function getOwnerOpPayrollInfo(myFunction, myFunction1, myFunction2, status, driverID){
      getDriverJobs(myFunction, status, driverID);
      getDriverFuelbyStatus(myFunction1, driverID, 2);
      getAdjustmentByID(myFunction2, 2, driverID);
      
    }





    // async function getDriverDoc(myFunction, id)  {
    //   var docRef = db.collection("drivers").doc(id);
    //   let doc = await docRef.get();
    //   myFunction(doc)
    // }

    const getDriverDoc = ((myFunction, id) => {
      var docRef = db.collection("drivers").doc(id);
      docRef.get().then(function(doc) {
        if (doc.exists) {
          myFunction(doc)
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      }).catch(function(error) {
        console.log("Error getting document:", error);
      })
    });
    

  
  
    return{
      jobsByStatus,
      getAllDrivers,
      getDriverJobs,
      getJobByID,
      getDriverFuelbyStatus,
      getAdjustmentByID,
      getSalaryPayrollInfo,
      getDriverDoc,
      getOwnerOpPayrollInfo,
      getAllUsers,
    }
  })();
  
  
  // Update
  const update = (() => {
    
    const setJobStatus = ((id, statusNum) => {
      db.collection('jobs').doc(id).update({
        jobStatus: statusNum,
      })
      .then(
        console.log("document successfully updated!")
      )
      .catch(error => {
        console.log("Error updating document: ", error);
      });
    });

    const setFuelStatus = ((id, statusNum) => {
      db.collection('fuel').doc(id).update({
        fuelStatus: statusNum,
      })
      .then(
        console.log("document successfully updated!")
      )
      .catch(error => {
        console.log("Error updating document: ", error);
      });
    })

    const setAdjustmentsStatus = ((id, statusNum) => {
      db.collection('adjustments').doc(id).update({
        adjustmentStatus: statusNum,
      })
      .then(
        console.log("document successfully updated!")
      )
      .catch(error => {
        console.log("Error updating document: ", error);
      });
    })
    // why would I hard code a 1 there?? refactor later
    const sendToPayroll = ((id) => {
      db.collection('jobs').doc(id).update({
        jobStatus: 1,
      })
      .then(
        console.log("document successfully updated!")
      )
      .catch(error => {
        console.log("Error updating document: ", error);
      });
    })

    
    const editJobByID = ((obj, id) => {
      db.collection('jobs').doc(id).update({
        client: obj.client,
        deadline: obj.deadline,
        destination: obj.destination,
        loadRate: obj.loadRate,
        miles: obj.miles,
        origin: obj.origin,
      })
      .then(
        console.log("document successfully updated!")
      )
      .catch(error =>{
        console.log("Error updating document: ", error);
      });
    })

    const editAdjustmentsOwnerOp = ((form, id) => {
      db.collection('adjustments').doc(id).update({
        reimbursements: {
          detention: Number(form['detention'].value),
          extras: Number(form['extras'].value),
        },
        deductions: {
          insurance: Number(form['insurance'].value),
          reserve: Number(form['reserve'].value),
        },
      })
      .then(
        console.log("document successfully updated!")
        
      )
      .catch(error =>{
        console.log("Error updating document: ", error);
      });
    })

    const editAdjustmentsSalary = ((form, id) => {
      db.collection('adjustments').doc(id).update({
        reimbursements: {
          extras: Number(form['extras'].value),
          scale: Number(form['scale'].value),
          toll: Number(form['toll'].value),
        },
        deductions: {
          accidental: Number(form['accidental'].value),
          cashAdvance: Number(form['cashAdvance'].value),
          escrow: Number(form['escrow'].value),
          insurance: Number(form['insurance'].value),
          reserve: Number(form['reserve'].value),
        },
      })
      .then(
        console.log("document successfully updated!")
        
      )
      .catch(error =>{
        console.log("Error updating document: ", error);
      });
    })

    const editDriver = ((form, id) => {
      db.collection('drivers').doc(id).update({
        address: form['address'].value,
        email: form['email'].value,
        rate: Number(form['rate'].value),
        type: $('input[name="driverTypeRadio"]:checked').val(),
        status: $('input[name="statusRadio"]:checked').val(),
      })
      .then(
        console.log("document successfully updated!")
      )
      .catch(error =>{
        console.log("Error updating document: ", error);
      });
    })

    const setDriverStatus = ((status, id) => {
      db.collection('drivers').doc(id).update({
        status: status,
      })
      .then(
        console.log("document successfully updated!")
      )
      .catch(error =>{
        console.log("Error updating document: ", error);
      });
    })


  
    return {
      setJobStatus,
      setFuelStatus,
      setAdjustmentsStatus,
      sendToPayroll,
      editJobByID,
      editAdjustmentsOwnerOp,
      editAdjustmentsSalary,
      editDriver,
      setDriverStatus,
    }
  })();
  
  // Delete
  const deleteData = (() => {
  
    const deleteJob = ((id) => {
      db.collection('jobs').doc(id).delete()
      .then(console.log('Document Successfully Deleted'))
      .catch(err => {
        console.log("Error removing document ", err)
      })
    });

    const deleteFuelEntry = ((id) => {
      db.collection('fuel').doc(id).delete()
      .then(console.log('Document Successfully Deleted'))
      .catch(err => {
        console.log("Error removing document ", err)
      })
    });

    
    return {
      deleteJob,
      deleteFuelEntry,
    }
  })();
  
  
  // call to logout
  const logout = () => {
    auth.signOut().then(function() {
        //signout successful
        // user will be redirected because of the auth status listener
    }).catch(err => {
        console.log(err)
    })
  }

module.exports = {
    read: read,
    create: create,
    update: update,
    deleteData: deleteData,
    logout: logout,
    AuthStateListener: AuthStateListener,

}