
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
