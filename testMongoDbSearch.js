let mongo = require('mongodb'),
    mongoClient = mongo.MongoClient,
    mongoUrl = 'mongodb://localhost:27017/testDjur',
    mongoId = require('mongodb').ObjectID;



/** befolka en ny databas med massa djur, testa att uppdatera / omstrukturera trädet */    



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

//let testObject = createNode(1, 'Dog', ['', '']);
//let testObject = createNode(, 'Dog', ['', '']);

// mongoClient.connect(mongoUrl, function (err, db){
//     if(err){
//         console.log("some problem with mongodb");
//     }else{
//         if(!mongo.DB){
//             /** om redan connectad */
//             mongo.DB = db.db('testDjur');
//         }
//         let collection = mongo.DB.collection('testBinaryTree');
//         collection.insertOne(testObject, function(err, results){
//             if(err){
//                 console.log("funker inte");
//             }else{
//                 console.log(results.result);
//                 db.close();
//             }
//         });
//     }
// });

let collector = [];

collector[0] = 'N';
collector[1] = 'Is it a dog?';

/** detta är en connection som hittar childrenet som frågan från frontenden
 * pekar mot i det binära trädet
*/

let a = 'asd';

if(a.endsWith('asd')){
    console.log('a ends with asd');
}

// gör en connection mot mongodb som hittar något och byter plats med det

//då måste man veta vart man befinner sig





// i senaste collector har vi senaste frågan från servern, den frågar "is it a dog? med svaret 'N'"

// man tar reda på att det 


// hur skulle vi göra om vi skulle uppdatera databasen med en ny fråga, ändra 

// om  collector[0] = Y så treeIndex skulle plussas med 1 på dog
// om collector[0] = N så treeIndex skulle plussas med 2 på dog

// när vi lägger in den nya frågan så lägger vi båda djuren vi för närvarande har som dess children
// hund i detta fallet på 'N'

mongoClient.connect(mongoUrl, function (err, db){
        if(err){ console.log(err.message);
        }else{
        mongo.DB = db.db('testDjur');
        let collection = mongo.DB.collection('testBinaryTree');
        let results = collection.find({value: collector[1]}).toArray(function(err, results){
            let queryResult = results[0]['children'][collector[0]];

            if(queryResult.endsWith('?')){
                console.log(queryResult);
            }else if(queryResult !== null){
                console.log('Is it a ' + queryResult+'?');
            }

        });
    }
});


// /** om det är så att vi har fått ett svar på ett djur och det är nej */



// mongoClient.connect(mongoUrl, function (err, db){
//     if(err){
//         console.log("some problem with mongodb");
//     }else{
//         if(!mongo.DB){
//             /** om redan connectad */
//             mongo.DB = db.db('books');
//         }
//         let collection = mongo.DB.collection('testBinaryTree');
//         collection.insertOne(POSTquestion, function(err, results){
//             if(err){
//                 res.send(err.message);
//             }else{
//                 console.log(results.result);
//                 db.close();
//             }
//         });
//     }
// });