let express = require('express'),
    path = require('path'),
    url = require('url'),
    app = express();

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

let answerChecker = function (answerString){

    let lastCharacter = answerString.charAt(answerString.length-1);

    if(lastCharacter == 'N'){
        return false;
    }else if(lastCharacter == 'Y'){
        return true;
    }else{
        /** om det händer något här så får man skicka någon slags 
         * uppmaning eller nåt till hemsidan
         */
        return 'error';
    }
}

/** sorterar ut EN FRÅGA fråga från en given array 
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
        let response = returnRandomString(testArrayOfQuestions);
        res.send(JSON.stringify(response));
});

app.get('/guess', function(req, res) {

    res.send(JSON.stringify('Is it a '+ animalGuessArray[0]+'?'));
});

app.post('/guess', function(req, res){

    /** ska kolla strängen som kommer in om den slutar på N 
     * om den slutar på N så måste man göra en ny get request från
     * servern, då kommer det behövas en fråga
    */

    req.on('data', function(data){
        postGuess += JSON.parse(data);
    });

    req.on('end', function(){
            res.json(answerChecker(postGuess));
    });
});

/**
 * Saves answer to 5 questions
 */

app.post('/questions', function(req, res) {

    /** obs! inte säkert att man kan ha något här,
     * eller rättare sagt att det alls körs
     */

    returnArrayOfQuestions = [];

    req.on('data', function(data) {
        returnArrayOfQuestions += data;
    });

    req.on('end', function () {
        /** när submitten har kommit in så skickar man tillbaka nya frågor */

        console.log('inkommande fråga: ' + JSON.parse(returnArrayOfQuestions));
        returnArrayOfQuestions = [];
        let response = returnRandomString(testArrayOfQuestions);
        console.log('utåtgående fråga: '+ response);
        res.send(JSON.stringify(response));

    });
});

app.listen(8000, 'localhost', function(){
    console.log('App listening on port 8000');
});

