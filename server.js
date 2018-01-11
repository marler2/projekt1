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
            let collection = mongo.DB.collection('testDjur');
            collection.find({treeIndex: 1}).toArray(
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


let serverGuess = false;
let serverGuessOne = false;
let serverGuessTwo = false;
let treeIndexForNewNode = 1;
let newInsertArray = {"guessedAnimal":"", "newAnimal":"", "newQuestion":""};
let questionCounter = 0;

app.post('/questions', function(req, res) {    

    /** får in arrayn med frågan och svaret från frontenden */
    //collector[0] = Y / N
    //collector[1] = fråga

    req.on('data', function(data) {
        collector = JSON.parse(data);
    });

    req.on('end', function () {

        console.log(collector);

         /* inputen från frontenden är en array med längd 2*/
        /** om vi har en fråga, dvs. längden är större än 0*/


            //innan man skickar tillbaka en childnode som är ett djur så måste man veta att den
            // inte har några childnodes: man får alltså göra en ny findNode() 
            
            //SERVERGUESS MÅSTE LIGGA UTANFÖR POST REQUESTEN

            if(questionCounter==20){
                res.send(JSON.stringify('QUESTIONLIMIT'));
            }


            if(!serverGuess){
                mongoConnection.findNode(collector[1]).then(function(results){
                    if(results['children']['Y']==''&&results['children']['N']==''){
                        //vi vet att det är ett djur
                        if(collector[0] == 'N'){
                            //servern går in i "gissnings-mode"
                            //sätter in vad servern gissade i arrayn som sen ska insertas i databasen
                            newInsertArray["guessedAnimal"]=collector[1];
                            treeIndexForNewNode = results['treeIndex'];
                            serverGuess = true;
                            res.send(JSON.stringify('What animal where you thinking of?'));
                            // om detta stämmer går vi över till nästa block, dvs. serverGuess=true
                        }else if(collector[0] == 'Y'){
                            // det är bättre att frontenden får ta hand om det
                            // då den ska refresha sidan och fixa andra grejer
                            res.send(JSON.stringify('CONGRATULATIONS'));
                        }
                    }else{
                        //något av childsen innehåller något, det är antagligen en fråga
                        mongoConnection.findNode(collector[1]).then(function(results){
                            questionCounter++;
                            res.send(JSON.stringify(results['children'][collector[0]]));
                        });
                    }
            }).catch(function(error){
                    console.log('Something went wrong with findNode():' + error);
                });
               // om vi vet att förra request skickade ett djur
            }else if(serverGuess){
                //om svaret som komemr tillbaka är ett djur
                if(newInsertArray["newAnimal"]==""){
                    console.log('steg1: vi har fått ett nytt djur');
                    //då har vi gissat fel och får förbereda en array som ska lagras
                    newInsertArray["newAnimal"]=collector[0];
                    serverGuessOne = true;
                    res.send(JSON.stringify('What question would you use to distinguish '+newInsertArray['guessedAnimal']+' from '+newInsertArray['newAnimal']+'?'));
                }else if(serverGuess && serverGuessOne){
                    console.log('steg2: vi har fått en ny fråga');
                    //då har vi fått ett nytt djur
                    newInsertArray['newQuestion'] = collector[0];
                    serverGuessOne = false;
                    serverGuessTwo = true;
                    res.send(JSON.stringify('What is the answer for '+ newInsertArray['newAnimal']+'?'));
                }else if(serverGuessTwo){
                    console.log('steg3: vi har fått svaret på den nya frågan och sätter in i databasen..');
                    //om vi har kommit hit så ska vi lägga in en ny fråga på gamla djurets plats och lägga det gamla djuret under frågan
                    //samt det nya djuret
                    console.log('kommer vi hit?');
                    serverGuessTwo = false;
                    serverGuess = false;
                    if(collector[0]=='Y'){
                        mongoConnection.insertNode(treeIndexForNewNode, newInsertArray['newQuestion'],[newInsertArray['newAnimal'], newInsertArray['guessedAnimal']]);
                        //om Y så ska den nya noden vara n*2 och den gamla (n*2)+1
                        mongoConnection.insertNode(treeIndexForNewNode*2, newInsertArray['newAnimal'], ['','']);
                        mongoConnection.moveNode((treeIndexForNewNode*2)+1, newInsertArray['guessedAnimal']);
                    }else if(collector[0]=='N'){
                        mongoConnection.insertNode(treeIndexForNewNode, newInsertArray['newQuestion'],[newInsertArray['guessedAnimal'], newInsertArray['newAnimal']]);
                        //om N så ska den nya noden vara (n*2+1) och den gamla n*2
                        mongoConnection.moveNode(treeIndexForNewNode*2, newInsertArray['guessedAnimal']);
                        mongoConnection.insertNode((treeIndexForNewNode*2)+1, newInsertArray['newAnimal'], ['','']);
                    }
                    newInsertArray['guessedAnimal']='';
                    newInsertArray['newAnimal']='';
                    newInsertArray['newQuestion']='';
                    res.send(JSON.stringify('RETRY'));
                }
            }
});
});

app.listen(8000, 'localhost', function(){
    console.log('App listening on port 8000');
});






/**
                    console.log('Result från outer findNode : ' + results['value']);
                    mongoConnection.findNode(results['children']).then(function(resultsInner){
                        console.log('Result från inner findNode' + resultsInner);
                        if(resultsInner === undefined){
                            //då vet man att man har ett djur
                            //serverGuess = true;
                            treeIndexForNewNode = results['treeIndex'];
                            res.send(JSON.stringify(results['children'][collector[0]]));
                        }else{
                            // då vet man att man har en fråga
                            res.send(JSON.stringify(results['children'][collector[0]]));
                        }
                    }).catch(function (error){
                       console.log(error);
                       // är man redan på ett child, dvs... exempelvis första entryn i hela trädet
                       //serverGuess = true;
                       res.send(JSON.stringify('What animal where you thinking of?'));
                }); */