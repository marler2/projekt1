let mongo = require('mongodb'),
    mongoClient = mongo.MongoClient,
    mongoUrl = 'mongodb://localhost:27017/BinaryTree',
    mongoId = require('mongodb').ObjectID,
    mongoCollection = 'testDjur',
    dataBaseConnection;


// Det är såhär det ska se ut på serversidan
// när man använder metoderna
// findNode('nod7').then(function(results){
//     console.log(results);
// });

// TEMPLATE FÖR NODERNA

let createNode = function(treeNum, value, children){

    return {
        treeIndex: treeNum,
        value: value,
        children: {
            'Y' : children[0],
            'N' : children[1]
        }
    }
};

// CONNECTION TILL DATABAS

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

// FIND NODE
    // returnar objektet

exports.findNode = function (nodeValue) {

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

// EN METOD SOM SÖKER PÅ INDEX OCH UPPDATERAR DESS BARN

exports.updateChildrenOnNode = function (nodeIndex, childrenValY, childrenValN){
    
    return new Promise(function (resolve, reject) {connectionToMDB().then(function (db) {
        let collection = db.db('BinaryTree').collection(mongoCollection);
        collection.updateOne({treeIndex : nodeIndex}, {$set : {children: {Y: childrenValY, N: childrenValN}}}, function (err, results){
            if(err){
                reject(err);
                db.close();
            }else{
                resolve(results);
                db.close();
            }
        });
    }).catch(function (error){
        console.log(error);
    });
});

}

// kolla om databasen finns
exports.findDatabase = function (dbVal) {

    return new Promise(function (resolve,reject) {connectionToMDB().then(function(db){
        let database = db.db('BinaryTree');
        database.listCollections({name: dbVal}).next(function (err, result) {

            if(err){
                reject(err);
                db.close();
            }else{
                resolve(result);
                db.close();
            }
        });
    }).catch(function (error){
        console.log(error);  
    });
    });
}

// INSERT NEW NODE


exports.insertNode = function (treeNum, value, children) {

        let newNode = createNode(treeNum, value, children);

        return new Promise(function (resolve,reject) {connectionToMDB().then(function(db){
            let collection = db.db('BinaryTree').collection(mongoCollection);
            collection.insert(newNode, function(err, results){
                if(err){
                    reject(err);
                    db.close();
                }else{
                    resolve(results['ops'][0]);
                    db.close();
                }
            });
        }).catch(function (error) {
            console.log(error);
        });
});}



  


// DELETE NODE

exports.deleteNode = function (removeNodeVal, removeNodeTreeIndex) {

    return new Promise(function (resolve,reject) {connectionToMDB().then(function(db){
        let collection = db.db('BinaryTree').collection(mongoCollection);
        collection.remove({value: removeNodeVal, treeIndex: removeNodeTreeIndex}, function(err, results){
            if(err){
                reject(err);
                db.close();
            }else{
                resolve(results);
                db.close();
            }
        });
    }).catch(function (error) {
        console.log(error);
    });
});
}

// MOVE NODE TO NEW TREEINDEX

exports.moveNode = function (newTreeIndex, value) {

    exports.findNode(value).then(function (resultFind) {

        //console.log(result);
        //sen inserta en ny node med alla attribut vi hittat och den nya noden
        //dvs: directionInTree ,result['value'], result[children]['Y']+result[children]['N'],

        //sen deleta den gamla från samma första find
        //med hjälp av result['value'], result['treeIndex'] 

        exports.insertNode(newTreeIndex, resultFind['value'], [resultFind['children']['Y'], resultFind['children']['N']])
            .then(exports.deleteNode(value, resultFind['treeIndex']).then(function (results) {
                console.log(results.result);
        }));
})};

// BYT PLATS PÅ TVÅ NODER I DATABASEN

let changeNodes = function (nodeOne, nodeTwo){

    findNode(nodeOne).then( function (resultNodeOne) {
        findNode(nodeTwo).then(function (resultNodeTwo){
            moveNode(resultNodeTwo['treeIndex'], nodeOne);
            moveNode(resultNodeOne['treeIndex'], nodeTwo);
        });
    });
}