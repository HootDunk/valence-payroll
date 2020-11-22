
// Listens for authentication state changes, if no longer logged in returns user to sign in page
  const AuthStateListener = () => {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'index.html';
        }
      });
  }
  

  // module for writing client side dates
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
        driverRate: obj.driverRate,
        driverType: obj.driverType,
        jobStatus: obj.jobStatus,
        loadRate: obj.loadRate,
        miles: obj.miles,
        origin: obj.origin,
      })
      .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });
    }

    const fuelEntry = (fuelForm, driverID, year, month, day, weekNum) => {
      db.collection('fuel').add({
        driverID: driverID,
        city: fuelForm['city'].value,
        state: fuelForm['state'].value,
        gallons: fuelForm['gallons'].value,
        amount: fuelForm['amount'].value,
        fuelStatus: 1,
        month: month,
        year: year,
        day: day,
        weekNum: weekNum,
        date: `${year}-${month}-${day}`,
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
            detention: parseInt(adjustmentsForm['detention'].value),
            extras: parseInt(adjustmentsForm['extras'].value),
          },
          deductions: {
            insurance: parseInt(adjustmentsForm['insurance'].value),
            reserve: parseInt(adjustmentsForm['reserve-ownerOp'].value),
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
            toll: parseInt(adjustmentsForm['toll'].value),
            scale: parseInt(adjustmentsForm['scale'].value),
            extras: parseInt(adjustmentsForm['extras'].value),
          },
          deductions: {
            insurance: parseInt(adjustmentsForm['insurance'].value),
            accidental: parseInt(adjustmentsForm['accidental'].value),
            cashAdvance: parseInt(adjustmentsForm['cashAdvance'].value),
            escrow: parseInt(adjustmentsForm['escrow'].value),
            reserve: parseInt(adjustmentsForm['reserve-salary'].value),
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
  
    return {
      newJob,
      fuelEntry,
      newAdjustments,
    }
  })();
  
  // Read data
  const read = (() => {
    // gets active job documents as a snapshot(listens for changes)
    // myFunction is placeholder for whichever UI function we are using in the other .js files 
    // 3rd param dictates whether its an onSnapshotListener or just a simple call
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
      db.collection('drivers').get().then(Snapshot => {
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


    
    // const getAdjustmentByID = ((myFunction, adjustmentStatus, driverID) => {
    //   // review docs about this type of query and need to do forEach
    //   db.collection("adjustments")
    //   .where("adjustmentStatus", "==", adjustmentStatus)
    //   .where("driverID", "==", driverID)
    //   .get()
    //   .then(function(snapshot) {
    //       snapshot.forEach(function(doc) {
    //         myFunction(doc)
    //       })
    //   }).catch(function(error) {
    //       console.log("Error getting documents: ", error);
    //   });
    // });


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

    const adjustmentsTest = (() => {
      db.collection("adjustments")
      .where("driverType", "==", "salary")
      .get()
      .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
              // doc.data() is never undefined for query doc snapshots
              console.log(doc.id, " => ", doc.data());
          });
      })
      .catch(function(error) {
          console.log("Error getting documents: ", error);
      });

    })
  
  
    return{
      jobsByStatus,
      getAllDrivers,
      getDriverJobs,
      getJobByID,
      getDriverFuelbyStatus,
      getAdjustmentByID,
      adjustmentsTest,
    }
  })();
  
  
  // Update
  const update = (() => {

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
          detention: parseInt(form['detention'].value),
          extras: parseInt(form['extras'].value),
        },
        deductions: {
          insurance: parseInt(form['insurance'].value),
          reserve: parseInt(form['reserve'].value),
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
          extras: parseInt(form['extras'].value),
          scale: parseInt(form['scale'].value),
          toll: parseInt(form['toll'].value),
        },
        deductions: {
          accidental: parseInt(form['accidental'].value),
          cashAdvance: parseInt(form['cashAdvance'].value),
          escrow: parseInt(form['escrow'].value),
          insurance: parseInt(form['insurance'].value),
          reserve: parseInt(form['reserve'].value),
        },
      })
      .then(
        console.log("document successfully updated!")
        
      )
      .catch(error =>{
        console.log("Error updating document: ", error);
      });
    })
  
    return {
      sendToPayroll,
      editJobByID,
      editAdjustmentsOwnerOp,
      editAdjustmentsSalary,
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