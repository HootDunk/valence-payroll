
// Listens for authentication state changes, if no longer logged in returns user to sign in page
  const AuthStateListener = () => {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'index.html';
        }
      });
  }
  
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
  
    return {
      newJob,
      fuelEntry,
    }
  })();
  
  // Read data
  const read = (() => {
    // gets active job documents as a snapshot(listens for changes)
    // myFunction is placeholder for whichever UI function we are using in the other .js files 
    // could add 3rd param that dicates whether its an onSnapshotListener or just a simple call
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
      
      //add listener param to include a version w/o snapshot and add if statement aboove
      // else {
      //   db.collection('fuel')
      //     .where("jobStatus", "==", jobStatus)
      //     .get()
      //     .then(Snapshot => {
      //       myFunction(Snapshot.docs)
      //     })
      // }
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
      //   .get()
      //   .then(Snapshot => {
      //     myFunction(Snapshot.docs)
      // })
    });

    const getJobByID = ((myFunction, driverID) => {

      var docRef = db.collection("jobs").doc(driverID);

      docRef.get().then(doc => {
        if (doc.exists) {
          myFunction(doc)
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
      }).catch(function(error) {
          console.log("Error getting document:", error);
      })
      // db.collection('jobs')
      //   .where("driverID", "==", driverID)
      //   .get()
      //   .then(doc => {
      //     myFunction(doc)
      //   })
      //   .catch(error => {
      //     console.log(error)
      // })
    });
  
  
    return{
      jobsByStatus,
      getAllDrivers,
      getDriverJobs,
      getJobByID,
      getDriverFuelbyStatus,
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
  
    return {
      sendToPayroll,
      editJobByID,
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