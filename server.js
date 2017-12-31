let express = require('express'),
    path = require('path'),
    fs = require('fs'),
    url = require('url'),
    https = require('https'),
    http = require('http'),
    bodyParser = require('body-parser'),
    app = express();

app.use(express.static(path.join(__dirname + '/public')));


app.listen(8000, 'localhost', function(){
    console.log('App listening on port 8000');
});

/* express enskilda routs */


/** path.join för att låta express/node hitta den absoluta pathen till filen */
/** för att göra en post så använder man sig bara av req parametern */

var questions = 'name : John';

let testArrayOfQuestions = [
    'Does it have fur?',
    'Does it live on land?',
    'Does it bark?',
    'Does it live in the forest?',
    'Does it fly?'
];


//var questions = '{ "name":"John", "age":30, "city":"New York"}';


/**
 * Responds with 5 random questions
 */
app.get('/questions', function(req, res) {
    
        res.json(testArrayOfQuestions);

});

/**
 * 
 */
app.get('/guess', function(req, res) {
    res.json(questions);
});


/**
 * Saves answer to 5 questions with answers and new animal
 */
app.post('/questions', function(req, res) {
    var body = '';

    req.on('data', function(data) {
        body += data;
    });

    req.on('end', function () {
        body = JSON.parse(body);

        res.json(body);
    });
});