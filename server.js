let express = require('express'),
    path = require('path'),
    url = require('url'),
    app = express(),
    mongoConnection = require('./basicBinaryDB');
    mongo = require('mongodb'),
    mongoClient = mongo.MongoClient,
    mongoUrl = 'mongodb://localhost:27017/BinaryTree',
    mongoId = require('mongodb').ObjectID;
 
app.use(express.static(path.join(__dirname + '/public')));

/** 20 frågor är maxxet, den gränsen sätter man på serversidan
* iom hur långt ner man kommit i trädet
*/

/** frågorna skall laddas en och en så att följer trädet, hur man
* går nedåt genom trädet
*/

/**när databasen/servern har en möjlighet kvar, en nod så kommer den att gissa
*/

/** JSON.parse() / JSON.stringify() måste alltid motsvara varandra */


app.get('/questions', function(req, res) {

        mongoClient.connect(mongoUrl, function (err, db){
            if(err){ console.log(err.message);
            }else{
            mongo.DB = db.db('BinaryTree');
            let collection = mongo.DB.collection('BTNodesComplete');
            collection.find({treeIndex: 57}).toArray(
                function (err, results) {
                    res.send(JSON.stringify(results[0]['value']));
                }
            );
        }
        db.close();
        });
});

let collector = [];
let queryString = '';
let dataBaseObj = {};


let serverGuess;
let serverGuessNewAnimal;
let serverGuessNewQuestion;
let serverGuessNewQuestionAnswer;
let treeIndexForNewNode;
let newInsertArray = {"guessedAnimal":"", "newAnimal":"", "newQuestion":""};

app.post('/questions', function(req, res) {    

    /** får in arrayn med frågan och svaret från frontenden */
    //collector[0] = Y / N
    //collector[1] = fråga

    req.on('data', function(data) {
        collector = JSON.parse(data);
    });

    req.on('end', function () {

         /* inputen från frontenden är en array med längd 2*/
        /** om vi har en fråga, dvs. längden är större än 0*/


            //innan man skickar tillbaka en childnode som är ett djur så måste man veta att den
            // inte har några childnodes: man får alltså göra en ny findNode() 
            
            //SERVERGUESS MÅSTE LIGGA UTANFÖR POST REQUESTEN

            if(!serverGuess){
                mongoconnect.find(collector[1]).then(function(results){
                    mongoconnect.find(results['children']).then(function(resultsInner){
                        if(resultsInner['Y'] == '' && resultsInner['N'] == ''){
                            //då vet man att man har ett djur
                            serverGuess = true;
                            treeIndexForNewNode = resultsInner['treeIndex'];
                            res.send(JSON.stringify('Is it a ' + results['children'][collector[0]]+'?'));
                        }else{
                            // då vet man att man har en fråga
                            res.send(JSON.stringify(results['children'][collector[0]]));
                        }
                    });
                });
                // om vi vet att förra request skickade ett djur
            }else if(serverGuess){
                //om svaret som komemr tillbaka är ett djur
                if(collector[0]=='Y'&&newInsertArray['guessedAnimal']==''){
                    res.send('Congratulations!')
                    serverGuess = false;
                }else if(collector[0]=='N'&&newInsertArray['guessedAnimal']==''){
                    //då har vi gissat fel och får förbereda en array som ska lagras
                    newInsertArray['guessedAnimal']=collector[1];
                    serverGuessNewAnimal = true;
                    res.send(JSON.stringify('What animal did you think of?'));
                }else if(serverGuess && serverGuessNewAnimal){
                    //då har vi fått ett nytt djur
                    newInsertArray['newAnimal'] = collector[0]
                    serverGuessNewAnimal = false;
                    serverGuessNewQuestion = true;
                    res.send(JSON.stringify('What question would you use to distinguish '+newInsertArray['guessedAnimal']+' from '+newInsertArray['newAnimal']+'?'));
                }else if(serverGuess && serverGuessNewQuestion){
                    //dvs. vi har fått en ny fråga för att skilja åt
                    newInsertArray['newQuestion']=collector[0];
                    serverGuessNewQuestion = false;
                    serverGuessNewQuestionAnswer = true;
                    res.send(JSON.stringify('What is the answer for '+ newInsertArray['newAnimal']+'?'))
                }else if(serverGuess && serverGuessNewQuestionAnswer&&newInsertArray['newQuestion']!=''){
                    //om vi har kommit hit så ska vi lägga in en ny fråga på gamla djurets plats och lägga det gamla djuret under frågan
                    //samt det nya djuret
                    serverGuessNewQuestionAnswer = false;
                    serverGuess = false;
                    if(collector[0]=='Y'){
                        mongoconnect.insertNode(treeIndexForNewNode, newInsertArray['newQuestion'],[newInsertArray['newAnimal'], newInsertArray['guessedAnimal']]);
                        //om Y så ska den nya noden vara n*2 och den gamla (n*2)+1
                        mongoconnect.insertNode(treeIndexForNewNode*2, newInsertArray['newAnimal'], ['','']);
                        mongoconnect.moveNode((treeIndexForNewNode*2)+1, newInsertArray['guessedAnimal']);
                    }else if(collector[0]=='N'){
                        mongoconnect.insertNode(treeIndexForNewNode, newInsertArray['newQuestion'],[newInsertArray['guessedAnimal'], newInsertArray['newAnimal']]);
                        //om N så ska den nya noden vara (n*2+1) och den gamla n*2
                        mongoconnect.moveNode(treeIndexForNewNode*2, newInsertArray['guessedAnimal']);
                        mongoconnect.insertNode((treeIndexForNewNode*2)+1, newInsertArray['newAnimal'], ['','']);
                    }
                    newInsertArray['guessedAnimal']='';
                    newInsertArray['newAnimal']='';
                    newInsertArray['newQuestion']='';
                }
            }

            

            

            /** när vi vet att vi har fått en ny fråga så inserta den */
            /** dela upp conditionens och mongodb requestsen */


        /** hitta den i databasen för att se om den har några barn 
         *  skicka tillbaka barnet som svaret pekat mot
        */

        // if(dataBaseObj['children'][collector[0]]){
        //     res.send(dataBaseObj['children'][collector[0]]);
        // }else{
        //     /** så har den inga barn, alltså är det ett djur */
        //     res.send('')
        // }
  
    });
});

app.listen(8000, 'localhost', function(){
    console.log('App listening on port 8000');
});































// if(collector[0]=='Y'||collector[0]=='N'){

//     /** använder findNode dels för att testa men också returna */

//     mongoConnection.findNode(collector[1]).then(function (results){
        
//         if(results['value'].length>0){

//             if(results['children'][collector[0]]){

//                 if(results['children'][collector[0]].endsWith('?')){
//                     /** det här är en fråga */
//                     console.log("såhär ser begäran från frontenden ut: " + JSON.stringify(results['children'][collector[0]]));
//                     res.send(JSON.stringify(results['children'][collector[0]]));
//                 }else{
//                         /** det här är ett djur */
//                         res.send(JSON.stringify("is it a " + results['value'] + " ?"));
//                 }}
//         }else{
//             console.log("does not exist in database");
//         }});

// }else{
//     /** fixa på f
//      * rontenden vad som ska hända om dom inte har skickat något*/
//     res.send(JSON.stringify('NOENTRY'));
// }



// mongoClient.connect(mongoUrl, function (err, db){
//     if(err){ console.log(err.message);
//     }else{
//     mongo.DB = db.db('books');
//     let collection = mongo.DB.collection('bookCollection');
//     let results = collection.find({value: collector[1]}).toArray(function(err, results){
        
//         queryResult = results[0]['children'][collector[0]];

//         if(queryResult.endsWith('?')){
//             res.send(queryResult);
//         }else if(queryResult !== null){
//             res.send('Is it a ' + queryResult+'?');
//         }
//     });
// }
// });



// mongoClient.connect(mongoUrl, function (err, db){
//     if(err){
//         console.log("some problem with mongodb");
//     }else{
//         if(!mongo.DB){
//             /** om redan connectad */
//             mongo.DB = db.db('books');
//         }
//         let collection = mongo.DB.collection('bookCollection');
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