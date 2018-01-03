let express = require('express'),
    path = require('path'),
    url = require('url'),
    app = express();

app.use(express.static(path.join(__dirname + '/public')));

let testArrayOfQuestions = [
    'Does it have fur?',
    'Does it live on land?',
    'Does it bark?',
    'Does it live in the forest?',
    'Does it fly?'
];

let returnArrayOfQuestions = [];

let returnRandomString = function (questionArray){

    /** random index for selecting a element in an array
     *  if the array already contains the element it searches for a new one
     */

    let randomQuestion = '';
    let returnArr = [];
    let randomIndex;

    for(let i = 0; i < questionArray.length; i ++){

        if(questionArray[i] == ''){
            break;
        }
        randomIndex = Math.floor(Math.random()*questionArray.length);
        randomQuestion = questionArray[randomIndex];
        
        if(returnArr.includes(randomQuestion)){
            do{
                randomIndex = Math.floor(Math.random()*questionArray.length);
                randomQuestion = questionArray[randomIndex];
            }while(returnArr.includes(randomQuestion));
        }
        returnArr.push(randomQuestion);
    }
    return returnArr;
};

/**
 * Responds with 5 random questions
 */
app.get('/questions', function(req, res) {
    
        /** här är response en array */
        let response = returnRandomString(testArrayOfQuestions);
        res.send(JSON.stringify(response));
});

/**
 * Responds with a random guess
 * den ska liksom söka igenom namnen på alla jsonobjekt
 * och skicka tillbaka en sträng i formatet 'är det en '+jsonObjekt.name+'?'
 */
/* app.get('/guess', function(req, res) {
    res.json(questions);
}); */



/**
 * Saves answer to 5 questions with answers and new animal
 */

app.post('/addQuestions', function(req, res) {


    req.on('data', function(data) {
        returnArrayOfQuestions += data;
    });

    req.on('end', function () {
        /** när submitten har kommit in så skickar man tillbaka nya frågor */
        res.json('successful submit');
        console.log(JSON.parse(returnArrayOfQuestions));
        returnArrayOfQuestions = [];
    });
});

app.listen(8000, 'localhost', function(){
    console.log('App listening on port 8000');
});

