let express = require('express'),
    path = require('path'),
    fs = require('fs'),
    url = require('url'),
    https = require('https'),
    http = require('http'),
    bodyParser = require('body-parser'),
    app = express();

app.use(express.static(path.join(__dirname+'/public')));

/** dom här två metoderna funkar nog inte ihop */


http.createServer(function(req, res){
    if(req.method === 'GET') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.createReadStream('./public/index.html', 'UTF-8').pipe(res);
    } else if (req.method === 'POST') {
        let body = '';
        
        req.on('data', function(DATA){
            body += DATA;
        });

        req.on('end', function(){
            fs.appendFile('/public/data.txt', body, function(){
                console.log('Wrote to file');
            });
        });
    }
});


app.listen(8000, 'localhost', function(){
    console.log('App listening on port 8000');
});



























/* var options = {
    hostname: 'en.wikipedia.org',
    port: 443,
    path: '/wiki/George_Washington',
    method: 'GET'
};

let req = https.request(options, function(res){
    let responseBody= '';
    console.log('Init...');
    console.log(`Server Status: ${res.statusCode}`);
    console.log('Response Headers: %j', res.headers);
    
    res.setEncoding('UTF-8');

    res.on('data', function(DATA){
        responseBody += DATA;
    });
    res.on('end', function(){
        fs.writeFile("George_washington.html", responseBody, function(err){
            if(err){
                throw err;
            }
            console.log('file has been downloaded!');
        });
    });
});

req.on('error', function(err){
    console.log(`problem with request: ${err.message}`);
});

//måste lägga till end, annars så slutför den aldrig

//data är en stream och liksom inbyggd

req.end();


/** man kan säkert använda detta ihop
 * med att man gör som en temporär fil 
 * i den personens minne, eller
 */ 












/* express enskilda routs */


/** path.join för att låta express/node hitta den absoluta pathen till filen */
/* 
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/main.css', function(req, res){
    res.sendFile(path.join(__dirname+'/main.css'));
});

app.get('/animaltree.html', function(req, res){
    res.sendFile(path.join(__dirname+'/animaltree.html'));
})
*/ 

/** för att göra en post så använder man sig bara av req parametern */
/* app.get( ,function(req, res){

}); */







// = NODE
//let http = require('http');
// http.createServer(function (request, response){

//     response.writeHead(200, {'Content-type':'text/plain'});

//     response.end('Hello World\n');

// }).listen(5000, 'localhost');

// parametrarna för listen är (port, url) */

//console.log('Server running at Localhost...');


//ÖVRIGT:

/* app.post('/receive', function(request, respond) {
    var body = '';
    filePath = __dirname + '/public/data.txt';
    request.on('data', function(data) {
        body += data;
    });

    request.on('end', function (){
        fs.appendFile(filePath, body, function() {
            respond.end();
        });
    });
});
 */
