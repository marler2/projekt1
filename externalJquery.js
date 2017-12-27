$(document).ready(function(){

    /** numQuestions pekar mot databasen
    * JSON databasen som innehåller alla frågor
    */

    var numQuestions;
    var Questions = string[];


    $('#yes').click(function(){
        //läsa av vilken av radio knapparna som
        //var ikryssad
        let nextQuestion = Questions[Math.random()*numQuestions];
        /** här är den som ändras eftersom servern får in fler frågor alla frågor */ 
        //nästa fråga laddas in
        $('#question').html(nextQuestion);

    });
    
    $('#no').click(function(){
        //läsa av vilken av radio knapparna som
        //var ikryssad
        let nextQuestion = Questions[Math.random()*numQuestions];
        /** här är den som ändras eftersom servern får in fler frågor alla frågor */ 
        //nästa fråga laddas in
        $('#question').html(nextQuestion);

    });
});