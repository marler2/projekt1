 
let qArray = [
    'Does it have fur?',
    'Is it a mammal?',
    'Does it have 4 legs?',
    'Does it have 2 legs?'
];

let emptyArray = ['']

let returnRandomString = function (questionArray){

    /** random index för att ta ut elementet
     * om elementet redan har pushats på arrayn så får man inte ta det igen
     * 
     *obs index går från 0 till 4*/

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

let val = returnRandomString(qArray);
console.log(val);