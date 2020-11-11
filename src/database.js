
// Figure out where the code for creating the json objects to pass
 //  in to the front-end functions will go (either in here or on the relative
 //   javascript page). 

// Either do a factory or a class for each of these
// Create

// Read

// Update

// Delete



function logDriver() {
    db.collection('Driver').get().then((snapshot) => {
        snapshot.docs.forEach(doc => {
            console.log(doc.data())
        })
    })
}

exports.logDriver = logDriver