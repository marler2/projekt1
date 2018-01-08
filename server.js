let express = require('express'),
    path = require('path'),
    url = require('url'),
    app = express(),
    mongo = require('mongodb'),
    mongoClient = mongo.MongoClient,
    mongoUrl = 'mongodb://localhost:27017/books',
    mongoId = require('mongodb').ObjectID;

app.use(express.static(path.join(__dirname + '/public')));

/** 20 frågor är maxxet, den gränsen sätter man på serversidan
* iom hur långt ner man kommit i trädet
*/

/** frågorna skall laddas en och en så att följer trädet, hur man
* går nedåt genom trädet
*/

/**när databasen/servern har en möjlighet kvar, en nod så kommer den att gissa
* 
*/

/** fixa så att arrayn spliceas till 5 här! */
/** grejen när servern frågar är ju att den då redan "har" ett svar,
 * om den ändå får ett N så måste den särskilja dom från varandra
 */

let testArrayOfQuestions = [
    'Does it have fur?',
    'Does it live on land?',
    'Does it bark?',
    'Does it live in the forest?',
    'Does it fly?'
];

let animalGuessArray = [
    'Cat',
    'Lion',
    'Dog'
];

let returnArrayOfQuestions = [];
let postGuess = '';

/** kolla vad strängen slutar på för bokstav */

let answerChecker = function (answerArray){

    let answerChar = answerArray.answer;

    if(answerChar == 'N'){
        return false;
    }else if(answerChar == 'Y'){
        return true;
    }else{
        /** om det händer något här så får man skicka någon slags 
         * uppmaning eller nåt till hemsidan
         */
        return 'error';
    }
}

/** sorterar ut EN FRÅGA från en given array 
 *  */

let returnRandomString = function (questionArray){

    let randomQuestion = '';
    let randomIndex;

    for(let i = 0; i < questionArray.length; i ++){

        if(questionArray[i] == ''){
            break;
        }
        randomIndex = Math.floor(Math.random()*questionArray.length);
        randomQuestion = questionArray[randomIndex];
        
}return randomQuestion;
};

/**
 * skickar tillbaka random frågor till framsidan
 */

app.get('/questions', function(req, res) {
        /** här är response en array */

        mongoClient.connect(mongoUrl, function (err, db){
            if(err){ console.log(err.message);
            }else{
            mongo.DB = db.db('books');
            let collection = mongo.DB.collection('bookCollection');
            collection.find({}).limit(1).toArray(
                function (err, results) {
                    res.send({
                        books: results
                    })
                }
            );
        }
        });
/*         let response = findQuestions();
        console.log(findQuestions());
        res.send(JSON.stringify(response)); */
});

let treeIndex = 1;
let createNode = function(treeNum, value, children){

    return {
        treeNum: treeIndex++,
        value: value,
        children: {
            'Y' : children[0],
            'N' : children[1]
        }
    }
};

app.post('/questions', function(req, res) {

    let collector = [];
    let queryString = '';

    /** får in arrayn med frågan och svaret från frontenden */

    req.on('data', function(data) {
        collector = JSON.parse(data);
    });

    req.on('end', function () {
        let response = "success";
        let queryString = '';

        /** det är först här vi sparar noderna i objektform
         * inputen från frontenden är en array, det kommer trots allt alltid
         *  bara vara två svar
         * frontend=array, databasobjektet=objekt med utförligare info
         */


        /** om vi har en fråga, dvs. längden är större än 0, servern är
         * ju själv ansvarig för att skicka frågorna, så man kan anta
         * att det inte går att få något annat fel här
         */

        if(collector[1].length>0){
    
            if(collector[0]=='Y'){

                queryString = '{value: '+collector[1]+'}';
           
            }else if(collector[0]=='N'){
                
                 queryString = '{value: '+collector[1]+'}';
                 
            }else{
                /** detta borde break:a hela funktionen */
                res.send('ERROR');
            }
        }

        /** här ska vi söka med queryStringen i databasen för att hitta childrenen till
         * frågan
         */

        let returnAnimal = {};

        mongoClient.connect(mongoUrl, function (err, db){
            if(err){ console.log(err.message);
            }else{
            mongo.DB = db.db('books');
            let collection = mongo.DB.collection('bookCollection');
            collection.find(queryString).toArray(
                function (err, results) {
                    /** här har vi fått tillbaka ett objekt
                    skicka tillbaka till*/

                    returnAnimal = results.children.collector[0];
                    
                    // man kanske inte måste skicka tillbaka härifrån, man
                    // kanske bara kan spara det som ett objekt och fortsätta
                    // använda det på något sätt
                    
                    // res.send({
                    //     books: results
                    // });
                }
            );
        }
        });

        

        mongoClient.connect(mongoUrl, function (err, db){
            if(err){
                console.log("some problem with mongodb");
            }else{
                if(!mongo.DB){
                    /** om redan connectad */
                    mongo.DB = db.db('books');
                }
                let collection = mongo.DB.collection('bookCollection');
                collection.insertOne(POSTquestion, function(err, results){
                    if(err){
                        res.send(err.message);
                    }else{
                        console.log(results.result);
                        db.close();
                    }
                });
            }
        });
    });
});

app.listen(8000, 'localhost', function(){
    console.log('App listening on port 8000');
});

