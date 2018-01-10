let mongo = require('mongodb'),
    mongoClient = mongo.MongoClient,
    mongoUrl = 'mongodb://localhost:27017/BinaryTree',
    mongoId = require('mongodb').ObjectID,
    mongoCollection = 'BTNodesComplete',
    dataBaseConnection,
    setTimeout = require('timers').setTimeout;

// TEMPLATE FÖR NODERNA

exports.createNode = function(treeNum, value, children){

    return {
        treeIndex: treeNum,
        value: value,
        children: {
            'Y' : children[0],
            'N' : children[1]
        }
    }
};

// FIND NODE
    // returnar objektet

let connectionToMDB = function (){
    return new Promise(function (resolve, reject){
        mongoClient.connect(mongoUrl, function(err, db){
            //let DBconnection = db.db('BinaryTree');
            //let collection = DBconnection.collection(mongoCollection);
            if (err){
                reject(err);
            }else{
                resolve(db);
            }
        });
    });
}

// den avslutar connectionen för varje gång men resolve/rejectar också innan!!!!!
// allt annat ska följa det här exemplet, man måste dela upp db och mongoClient.connect i två
//för att kunna få med sig db påvägen

let findNode = function (nodeValue) {

    return new Promise(function (resolve,reject) {connectionToMDB().then(function(db){
        let collection = db.db('BinaryTree').collection(mongoCollection);
        collection.find({value: nodeValue}).toArray(function(err, results){
            if(err){
                reject(err);
                db.close();
            }else{
                resolve(results[0]);
                db.close();
            }
        });
    }).catch(function (error) {
        console.log(error);
    });
});
}

// Det är såhär det ska se ut på serversidan
findNode('nod7').then(function(results){
    console.log(results);
});

/////////////////////////////////////////////////////////////////

// ATT GÖRA!!!:

    
    // NY INSERTNODE


    // NY DELETENODE



////////////////////////////////////////////////////////////////////













exports.findNode = function (findNodeValue) {

    return new Promise( function (resolve, reject){    
        
        mongoClient.connect(mongoUrl, function (err, db){
            if(err){ console.log(err.message);
            }else{
            if(!dataBaseConnection){
                    dataBaseConnection = db.db('BinaryTree');
            }  
            let collection = dataBaseConnection.collection(mongoCollection);
            /** alla entrys kommer vara unika så behöver bara value för att hitta något */
            let results = collection.find({value : findNodeValue}).toArray(function(err, results){
                if(err){ 
                    reject(err);
                }else{
                    /** returner hela objektet */
                    resolve(results[0]);
                }
            });  
        }
        });
    });
}


//  INSERT NY NODE

    // returnar också det nya objektet

    //treenum är vart vi ska sätta den, children är en array av två som sätter in det iett
    // objekt av två

exports.insertNode = function (treeNum, value, children) {

        return new Promise(function(resolve, reject){

            let newNode = createNode(treeNum, value, children);

            mongoClient.connect(mongoUrl, function (err, db){
                if(err){ 
                    console.log(err.message);
                }else{
                    if(!dataBaseConnection){
                        dataBaseConnection = db.db('BinaryTree');
                    }  
                    let collection = dataBaseConnection.collection(mongoCollection);
                    let results = collection.insertOne(newNode, function(err, results){
                        if(err){
                            reject(results);
                        }else{
                            resolve(results['ops'][0]);
                        }
                        });
                        
                    }
                });
        });
}

// DELETE NODE

exports.deleteNode = function (removeNodeVal, removeNodeTreeIndex){

    // man kanske kan returna det från connectionen, sen close:a den och sen fånga upp det i resolvet
    // och då returna det igen? 

    return new Promise(function (resolve, reject) { 
        mongoClient.connect(mongoUrl, function (err, db){
            if(err){ 
                console.log(err.message);
            }else{
                if(!dataBaseConnection){
                    dataBaseConnection = db.db('BinaryTree');
                }
                let collection = dataBaseConnection.collection(mongoCollection);
                let results = collection.remove({value: removeNodeVal, treeIndex: removeNodeTreeIndex}, function(err, results) {
                    if (err){
                        reject(result);
                    }else{
                        resolve(results);
                    }
                } 
                );
                
            }
        });
    });
}

// MOVE NODE TO NEW TREEINDEX

    // value i parametern är för den vi ska hitta för att flytta
    // treeNum är för dit vi vill att den ska gå till 

exports.moveNode = function (newTreeIndex, value) {

    findNode(value).then(function (resultFind) {

        //console.log(result);
        //sen inserta en ny node med alla attribut vi hittat och den nya noden
        //dvs: directionInTree ,result['value'], result[children]['Y']+result[children]['N'],


        //sen deleta den gamla från samma första find
        //med hjälp av result['value'], result['treeIndex'] 

        insertNode(newTreeIndex, resultFind['value'], [resultFind['children']['Y'], resultFind['children']['N']])
            .then(deleteNode(value, resultFind['treeIndex']).then(function (results) {
                console.log(results.result);
        }));
})};

// BYT PLATS PÅ TVÅ NODER I DATABASEN

exports.changeNodes = function (nodeOne, nodeTwo){

    findNode(nodeOne).then( function (resultNodeOne) {
        findNode(nodeTwo).then(function (resultNodeTwo){
            moveNode(resultNodeTwo['treeIndex'], nodeOne);
            moveNode(resultNodeOne['treeIndex'], nodeTwo);
        });
    });
}

/** när man då får ett svar från sidan att man ska lägga in en ny fråga så: 
 * 1) insertar man frågan, sätter in ett eller om två barn i dess children ---> insertNode()
 * 3) sen moveNode för barnen, ett och ett ---> moveNode()*/