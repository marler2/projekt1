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
        


        mongoClient.connect(mongoUrl, function (err, db){
            if(err){ console.log(err.message);
            }else{
            mongo.DB = db.db('books');
            let collection = mongo.DB.collection('bookCollection');
            collection.find({treeIndex: 1}).toArray(
                function (err, results) {
                    res.send(results[0]['value']);
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


/** template för vilket djur är det? hur skiljer man ... från ... ? */
let collector = [];
let queryString = '';


app.post('/questions', function(req, res) {    

    /** får in arrayn med frågan och svaret från frontenden */

    req.on('data', function(data) {
        collector = JSON.parse(data);
    });


    req.on('end', function () {

        /*if(collector[1] starts with 'Is it a .... ? ')*/

        let response = "success";

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
    
            if(collector[0]=='Y'||collector[0]=='N'){
                queryString = '{value: '+collector[1]+'}';
            }else{
                /** detta borde break:a hela funktionen */
                res.send('ERROR');
            }
        }

        /** här ska vi söka med queryStringen i databasen för att hitta childrenen till
         * frågan
         * för att få tag på nästa fråga
         */

        let returnAnimal = {};

        /** härinne ska man  kolla om det är ett djur, om det inte är ett djur skickar vi tillbaka
         * nästa Y/N fråga
         * 
         * om ett djur så skicka tillbaka frågan, är det ett... =  
        */

        

     
        let queryResult = '';

        mongoClient.connect(mongoUrl, function (err, db){
            if(err){ console.log(err.message);
            }else{
            mongo.DB = db.db('books');
            let collection = mongo.DB.collection('bookCollection');
            let results = collection.find({value: collector[1]}).toArray(function(err, results){
                
                queryResult = results[0]['children'][collector[0]];

                if(queryResult.endsWith('?')){
                    res.send(queryResult);
                }else if(queryResult !== null){
                    res.send('Is it a ' + queryResult+'?');
                }
            });
        }
        });

        
        /** om vi har kommit hit så är det ett djur och frågan är nej */

        /** då är queryResult == null */

        /** då får man använda collector igen 
         * dvs. collector[1] är lika med djurnamnet */

         /** så vad gör man då om man kommit ner till ett "löv"? */

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

