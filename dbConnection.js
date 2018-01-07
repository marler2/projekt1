let mongo = require('mongodb');
let mongoClient = mongo.MongoClient;

exports.connect = function(){

    if(mongo.DB){
        /** om redan connectad */
        return mongo.DB;
        }

    mongoClient.connect('mongodb://localhost:27017/djur', function (err, db){

        if(err){
            console.log("some problem with mongo");
            process.exit(1);
        }else{
            console.log("Connection established");
            /** man använder alltså return objektet från node funktionen till att
             * return med dess db funktion vilken databas vi tänker på
                kan också vara så att vi går ett steg för djupt här... */
            mongo.DB = db.db('djur');
            /** eventuellt sätta mongo.DB = Db( eller db).db("namn på databasen"); */
        }    
    });
}