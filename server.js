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

//första entryn i databasen om den inte finns

mongoConnection.findDatabase('testDjur').then(function (result){
    if(result===null){
        mongoConnection.insertNode(1, "Dog", ['','']).then(function (results){
            console.log(results);
        }).catch(function (results){
            console.log('something went wrong: ' + results);
        });
    }else{
        console.log('Database operational');
    }
}).catch(function (error){
    console.log('Something went wrong with finding the database');
});

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
let serverGuess = false;
let serverGuessOne = false;
let serverGuessTwo = false;
let treeIndexForNewNode = 1;
let newInsertArray = {"guessedAnimal":"", "newAnimal":"", "newQuestion":""};
let parentNodeY = '';
let questionCounter = 0;
let treePathLeft;

app.post('/questions', function(req, res) {    

    /** får in arrayn med frågan och svaret från frontenden */
    //collector[0] = Y / N
    //collector[1] = fråga

    req.on('data', function(data) {
        collector = JSON.parse(data);
    });

    req.on('end', function () {

        console.log(collector);


            //innan man skickar tillbaka en childnode som är ett djur så måste man veta att den
            // inte har några childnodes: man får alltså göra en ny findNode() 

            if(questionCounter==20){
                res.send(JSON.stringify('QUESTIONLIMIT'));
            }

            // KAN MAN GÅ VÄNSTER I TRÄDET OCH ÄNDÅ UPPDATERA FÖRÄLDERNODEN KORREKT?

            if(!serverGuess){
                mongoConnection.findNode(collector[1]).then(function(results){
                    if(results['children']['Y']==''&&results['children']['N']==''){
                        //vi vet att det är ett djur
                        if(collector[0] == 'N'){
                            //servern går in i "gissnings-mode"
                            //sätter in vad servern gissade i arrayn som sen ska insertas i databasen
                            newInsertArray["guessedAnimal"]=collector[1]; 





                            //collector[0] här säger vilken väg vi har tagit i trädet!
                            // använda det för att uppdatera föräldranoden!!





                            treeIndexForNewNode = results['treeIndex'];
                            treeIndexForParent = Math.ceil((results['treeIndex']/2)-1);
                            console.log('förädlernodens index: ' + treeIndexForParent);
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
                            parentNodeY = results['children']['Y'];
                            // så man får frågan från 
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
                }else if(serverGuessOne){
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

                        mongoConnection.insertNode(treeIndexForNewNode, 
                                                    newInsertArray['newQuestion'],
                                                    [newInsertArray['newAnimal'], 
                                                    newInsertArray['guessedAnimal']]);

                        //om Y så ska den nya noden vara n*2 och den gamla (n*2)+1

                        mongoConnection.insertNode(treeIndexForNewNode*2, 
                                                    newInsertArray['newAnimal'], 
                                                    ['','']);

                        mongoConnection.moveNode((treeIndexForNewNode*2)+1, 
                                                    newInsertArray['guessedAnimal']);

                    }else if(collector[0]=='N'){

                        mongoConnection.insertNode(treeIndexForNewNode, 
                                                    newInsertArray['newQuestion'],
                                                    [newInsertArray['guessedAnimal'], 
                                                    newInsertArray['newAnimal']]);

                        //om N så ska den nya noden vara (n*2+1) och den gamla n*2

                        mongoConnection.moveNode(treeIndexForNewNode*2, 
                                                    newInsertArray['guessedAnimal']);

                        mongoConnection.insertNode((treeIndexForNewNode*2)+1, 
                                                    newInsertArray['newAnimal'], 
                                                    ['','']);
                        
                    }


                    // FIXA IMORGON FREDAG!!!

                    //man uppdaterar ju alltid frågan på N noden

                    /** Vart ska dom vara? bereonde på om vi går höger eller vänster i trädet
                     * ska någon av dom aktiveras men dom kan bara aktiveras här nere, så newInsertArray 
                     * har några entrys
                     * 
                     *  mongoConnection.updateChildrenOnNode(treeIndexForParent, 
                                                    newInsertArray['newQuestion'],
                                                    newInsertArray['guessedAnimal']);
                        
                        Här ska det vara som det var innan 
                        
                        mongoConnection.updateChildrenOnNode(treeIndexForParent, 
                                                        newInsertArray['guessedAnimal'],
                                                        newInsertArray['newQuestion']);
                         */

                    newInsertArray['guessedAnimal']='';
                    newInsertArray['newAnimal']='';
                    newInsertArray['newQuestion']='';
                    questionCounter = 0;
                
                    res.send(JSON.stringify('RETRY'));
                }
            }
});
});

app.listen(8000, 'localhost', function(){
    console.log('App listening on port 8000');
});