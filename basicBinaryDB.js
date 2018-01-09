
let mongo = require('mongodb'),
    mongoClient = mongo.MongoClient,
    mongoUrl = 'mongodb://localhost:27017/BinaryTree',
    mongoId = require('mongodb').ObjectID,
    mongoCollection = 'BTNodesComplete',
    dataBaseConnection;


/** BUGGAR:
 *  har inget sätt att avsluta connectionen dvs. genom db.close(),
 *  så man öppnar typ 10 connections bara för att byta plats på en nod
 */









// let treeIndexCounter = 1;

// /** det måste var plus 2 hela tiden, det ska se ut:
//  * 
//  *                        1
//  *                  2           3
//  *              4      5     6      7
//  *          8     9  10 11 12 13  14    15 
//  * 
//  * 
//  * 
//  */

// for(treeIndexCounter; treeIndexCounter< 20; treeIndexCounter++){

    

//     // sätta in dom också så att dom förhåller sig till varandra

//     let insertNode = createNode(treeIndexCounter, [treeIndexCounter*2, treeIndexCounter*2+1]);
//     // bara befolk databasen med lite random noder

//     mongoClient.connect(mongoUrl, function (err, db){
//         if(err){ console.log(err.message);
//         }else{
//         mongo.DB = db.db('BinaryTree');
//         let collection = mongo.DB.collection('BTNodesComplete');
//         let results = collection.insertOne(insertNode, function(err, results){
//             if(err){
//                 console.log(err.message);
//             }else{
//                 console.log("round: "+treeIndexCounter+" \n result: "+ results);
//             }

//         });
//     }
//     });
// }



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





// FIND NODE
    // returnar objektet



let findNode = function (findNodeValue) {

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
                    reject(results);
                }else{
                    /** returner hela objektet */
                    resolve(results[0]);
                }
            });
            
        }
        });
    });
}


// findNode('nod3', 3).then(function (result) {
//     console.log(result);
//     /** men vi vill kunna pipea vidare värdet och childrenen och id:et så att det hamnar på
//      *  ett nytt ställe
//      */
//     console.log('Id:et : ' + result['_id']);
//     console.log('Child Y: ' + result['children']['Y']);
//     console.log('Child N: ' + result['children']['N']);
//     console.log('Value: ' + result['value']);
//     console.log('TreeIndex: ' + result['treeIndex']);
// });








//  INSERT NY NODE

    // returnar också det nya objektet

    //treenum är vart vi ska sätta den, children är en array av två som sätter in det iett
    // objekt av två

let insertNode = function (treeNum, value, children) {

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

// insertNode(1, 'Dog', ['nod2', 'nod3']).then(function (result) {
//     console.log(result);
// });



// DELETE NODE

let deleteNode = function (removeNodeVal, removeNodeTreeIndex){

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

// deleteNode('DoggieDo', 19).then(function (results) {
//     console.log(results);
// });



// MOVE NODE TO NEW TREEINDEX

    // alltså FIND NODE A --> INSERT NODE --> *A DELETE NODE A

// value i parametern är för den vi ska hitta för att flytta
// treeNum är för dit vi vill att den ska gå till 

let moveNode = function (newTreeIndex, value) {

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

let changeNodes = function (nodeOne, nodeTwo){

    findNode(nodeOne).then( function (resultNodeOne) {
        findNode(nodeTwo).then(function (resultNodeTwo){
            moveNode(resultNodeTwo['treeIndex'], nodeOne);
            moveNode(resultNodeOne['treeIndex'], nodeTwo);
        });
    });
}


changeNodes('nod3', 'nod13');

// CHANGE CHILDREN TO NODE
    // göra en insert sätta på en helt random nod med dom två nya childrensen
    // sen flytta tillbaka den  

// inserta en fråga på ett ställe 

//let changeChildToNode = function (){}

// REDIRECT TO CHILD FROM PARENT
    // använda find fast bara selecta children
