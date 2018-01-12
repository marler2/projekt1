let mongo = require('mongodb'),
    mongoClient = mongo.MongoClient,
    mongoUrl = 'mongodb://localhost:27017/BinaryTree',
    mongoId = require('mongodb').ObjectID,
    mongoCollection = 'testDjur',
    dataBaseConnection;

// template för noderna / objekten i databasen

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

// connectionen till databasen, passar vidare db objektet genom en resolve
// så man kan close():a connectionen

let connectionToMDB = function (){
    return new Promise(function (resolve, reject){
        mongoClient.connect(mongoUrl, function(err, db){
            if (err){
                reject(err);
            }else{
                resolve(db);
            }
        });
    });
}

// returnerar objektet med valuet ifråga

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

// en metod som söker på dess index och uppdaterar children Y

exports.updateParentYNode = function (nodeIndex, childrenVal){
    
    return new Promise(function (resolve, reject) {connectionToMDB().then(function (db) {
        let collection = db.db('BinaryTree').collection(mongoCollection);
        collection.updateOne({'treeIndex' : nodeIndex}, {$set : {'children.Y': childrenVal}}, function (err, results){
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

// en metod som söker på dess index och uppdaterar children N

exports.updateParentNNode = function (nodeIndex, childrenVal){
    
    return new Promise(function (resolve, reject) {connectionToMDB().then(function (db) {
        let collection = db.db('BinaryTree').collection(mongoCollection);
        collection.updateOne({'treeIndex' : nodeIndex}, {$set : {'children.N': childrenVal}}, function (err, results){
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


// uppdaterar hela databasens träd så att namnen på children noderna är korrekt

exports.searchAndUpdate = function (){

        return new Promise(function (resolve,reject) {connectionToMDB().then(function(db){
            let collection = db.db('BinaryTree').collection(mongoCollection);
            collection.find({}).sort({treeIndex: -1}).toArray(function (err, docs){
                if(err){
                    reject(err);
                    db.close();
                }else{
                    resolve(docs);
                    db.close();
                }
            });
        }).catch(function (error) {
                    console.log(error);
        });
        });

}

exports.treeUpdate = function (){

    //gör en descending sort på databasen utifrån treeIndex,
    // iterera genom hela trädet
    // hitta en node på treeIndex, som är > 1
    // om (node%2)==0 (är ett jämnt tal) så:
        // hitta föräldranoden med (treeIndex/2) och uppdatera dess Y nod med nodens value
    // om (node%2!=0) (är ett ojämnt tal) så:
        // hitta föräldranoden med ((treeIndex/2)-1) och uppdatera dess N nod med nodens value

    exports.searchAndUpdate().then(function(results){

        let sortArray = [];

        results.forEach(function(element){
            sortArray[element['treeIndex']] = element['value'];
        })
        
        for(i in sortArray){
            //uppdaterar bara barnen
            if(i>1){
                if((i%2)==0){
                    //så är indexet ett jämnt tal
                    // exempelvis 2
                    exports.updateParentYNode((i/2), sortArray[i]).then(function (result) {
                        console.log('updated successfully: ' + result);
                    }
                    ).catch(function(error){
                        console.log(error);
                    });
                }else if((i%2)!=0){
                    //så är indexet ett ojämnt tal
                    exports.updateParentNNode(Math.ceil(((i/2)-1)), sortArray[i]).then(function (result){
                        console.log('updated successfully: ' + result);
                    }).catch(function(error){
                        console.log(error);
                    });
                }else{
                    // så är det kanske ett tomt element?
                    console.log('some sort of trash: '+sortArray[i]);
                }
            }
        }

    }).catch(function(error){
        console.log(error);
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

// sätter in, skapar en ny node

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

// tar bort en node

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

// flyttar en node till ett nytt index, tar bort den gamla noden

exports.moveNode = function (newTreeIndex, value) {

    exports.findNode(value).then(function (resultFind) {

        //hittar en node utifrån value

        //sen deleta den gamla från samma första find
        //med hjälp av result['value'], result['treeIndex'] 

        exports.insertNode(newTreeIndex, resultFind['value'], [resultFind['children']['Y'], resultFind['children']['N']])
            .then(exports.deleteNode(value, resultFind['treeIndex']).then(function (results) {
                console.log(results.result);
        }));
})};

// byt plats på två noder i databasen

exports.changeNodes = function (nodeOne, nodeTwo){

    exports.findNode(nodeOne).then( function (resultNodeOne) {
        exports.findNode(nodeTwo).then(function (resultNodeTwo){
            exports.moveNode(resultNodeTwo['treeIndex'], nodeOne);
            exports.moveNode(resultNodeOne['treeIndex'], nodeTwo);
        });
    });
}