
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
  
    return {
      newJob,
    }
  })();
  
  // Read data
  const read = (() => {
    // gets active job documents as a snapshot(listens for changes)
    // myFunction is placeholder for whichever UI function we are using in the other .js files  
    const getActiveJobs = ((myFunction) => {
      db.collection("jobs").where("jobStatus", "==", 0)
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
  
  
    return{
      getActiveJobs,
      getAllDrivers,
  
    }
  })();
  
  
  // let list = read.getActiveJobs;
  // console.log(list)
  
  
  // Update
  const update = (() => {
  
    const sendToPayroll = ((id) => {
      db.collection('jobs').doc(id).update({
        jobStatus: 1,
      })
      .then(
        console.log("document successfully updated!")
      )
      .catch(err => {
        console.log("Error updating document: ", error);
      });
    })
  
  
  
    return {
      sendToPayroll,
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
    
    return {
      deleteJob,
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