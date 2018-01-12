let express = require('express'),
    path = require('path'),
    url = require('url'),
    app = express(),
    mongoConnection = require('./BinaryDB');
    mongo = require('mongodb'),
    mongoClient = mongo.MongoClient,
    mongoUrl = 'mongodb://localhost:27017/BinaryTree',
    mongoId = require('mongodb').ObjectID;
 
app.use(express.static(path.join(__dirname + '/public')));

//första entryn i databasen/skapandet av databasen om det/den inte finns

mongoConnection.findDatabase('BinaryTree').then(function (result){
    if(result===null){
        mongoConnection.insertNode(1, "Dog", ['','']).then(function (results){
            console.log('inserted first animal : ' + results);
        }).catch(function (results){
            console.log('something went wrong: ' + results);
        });
    }else{
        console.log('Database operational');
    }
}).catch(function (error){
    console.log('Something went wrong with finding the database');
});

//getrequesten när sidan laddas

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


// alla variabler som behövs för att servern ska kunna sortera och processa frontendens svar

let collector = [];
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

            if(questionCounter==20){
                res.send(JSON.stringify('QUESTIONLIMIT'));
            }

            if(collector[0]!='Y'||collector[0]!='N'){
                res.send(JSON.stringify('INPUTERROR'));
            }

            if(!serverGuess){
                mongoConnection.findNode(collector[1]).then(function(results){
                    if(results['children']['Y']==''&&results['children']['N']==''){
                        //vi vet att det är ett djur eftersom den inte har några childnodes
                        if(collector[0] == 'N'){
                            //servern går in i "gissnings-läge" serverGuess = true
                            //sätter in vad servern gissade på för djur i arrayn som sen ska insertas i databasen
                            newInsertArray["guessedAnimal"]=collector[1]; 
                            treeIndexForNewNode = results['treeIndex'];
                            treeIndexForParent = Math.ceil((results['treeIndex']/2)-1);
                            serverGuess = true;
                            res.send(JSON.stringify('What animal where you thinking of?'));
                            // om detta stämmer går vi över till nästa block, dvs. serverGuess=true
                        }else if(collector[0] == 'Y'){
                            // användaren har gissat rätt
                            // frontenden får ta hand om det
                            // vi skickar tillbaka en sträng som den får använda för att utföra något
                            res.send(JSON.stringify('CONGRATULATIONS'));
                        }
                    }else{
                        mongoConnection.findNode(collector[1]).then(function(results){
                            //questioncounter för att se om vi har kommit upp i 20 frågor än
                            questionCounter++;
                            // by default så skickar tillbaka nästa fråga / djur
                            res.send(JSON.stringify(results['children'][collector[0]]));
                        });
                    }
            }).catch(function(error){
                    console.log('Something went wrong with findNode():' + error);
                });
               // om vi vet att förra request skickade ett djur
               //så påbörjar servern att sampla ihop en ny array för att lagra i databasen
            }else if(serverGuess){
                if(newInsertArray["newAnimal"]==""){
                    //då har vi gissat fel och fått ett nytt djur att lagra
                    newInsertArray["newAnimal"]=collector[0];
                    serverGuessOne = true;
                    res.send(JSON.stringify('What question would you use to distinguish '+newInsertArray['guessedAnimal']+' from '+newInsertArray['newAnimal']+'?'));
                }else if(serverGuessOne){
                    //då har vi fått en ny fråga
                    newInsertArray['newQuestion'] = collector[0];
                    serverGuessOne = false;
                    serverGuessTwo = true;
                    res.send(JSON.stringify('What is the answer for '+ newInsertArray['newAnimal']+'?'));
                }else if(serverGuessTwo){
                    //hela arrayn som är nödvändig för att generera ett nytt objekt i databasen är färdig och vi kan börja lagra
                    serverGuessTwo = false;
                    serverGuess = false;
                    if(collector[0]=='Y'){

                        // lägger in den nya frågan

                        mongoConnection.insertNode(treeIndexForNewNode, 
                                                    newInsertArray['newQuestion'],
                                                    [newInsertArray['newAnimal'], 
                                                    newInsertArray['guessedAnimal']]);

                        //lägger in det nya djuret
                        //om Y så ska den nya noden vara n*2(Y platsen) och den gamla (n*2)+1 (N platsen)

                        mongoConnection.insertNode(treeIndexForNewNode*2, 
                                                    newInsertArray['newAnimal'], 
                                                    ['','']);
                        //flyttar det gamla djuret
                        mongoConnection.moveNode((treeIndexForNewNode*2)+1, 
                                                    newInsertArray['guessedAnimal']);

                    }else if(collector[0]=='N'){

                        mongoConnection.insertNode(treeIndexForNewNode, 
                                                    newInsertArray['newQuestion'],
                                                    [newInsertArray['guessedAnimal'], 
                                                    newInsertArray['newAnimal']]);
                        //flyttar det nya djuret

                        mongoConnection.moveNode(treeIndexForNewNode*2, 
                                                    newInsertArray['guessedAnimal']);
                        

                        //lägger in det nya djuret
                        //om N så ska den nya noden vara (n*2+1)(N platsen) och den gamla n*2(Y platsen)

                        mongoConnection.insertNode((treeIndexForNewNode*2)+1, 
                                                    newInsertArray['newAnimal'], 
                                                    ['','']);
                        
                    }

                    // ser till så att alla treeIndex matchar childrennoderna och vice versa

                    mongoConnection.treeUpdate();

                    //rensar alla variabler "cachet"

                    newInsertArray['guessedAnimal']='';
                    newInsertArray['newAnimal']='';
                    newInsertArray['newQuestion']='';
                    questionCounter = 0;

                    //skickar tillbaka ett värde så frontenden vet vad den ska göra

                    res.send(JSON.stringify('RETRY'));
                }
            }
});
});

app.listen(8000, 'localhost', function(){
    console.log('App listening on port 8000');
});