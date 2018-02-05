Ett spel gjort i jQuery, Nodejs, MongoDB och Javascript:


Man ska tänka på ett djur och servern ska sedan försöka gissa vilket djur det är.
Om servern gissar fel så begär servern att man matar in en ny fråga för att särskilja djuret man tänkte på mot det som servern tänkte på.
Både den nya frågan och det nya djuret matas sedan in i MongoDB i formen av ett binärt träd som följer gissandets JA/NEJ struktur.
På så sätt växer databasen och serverns "kunskap" om vilka olika typer av djur det finns och vad som skiljer dom från varandra.


/////////////////////////////////////////////////////////////////////////////////////////
					SETUP:
////////////////////////////////////////////////////////////////////////////////////////

1) Installera Node
 
2) installera dependencies i projektet:
    - npm install express --save
    - npm install mongodb --save

3) anslut till mongodb med: 
    - mongod.exe

4) starta servern:
    - node ./server.js

5) anslut till servern i browsern via:
    - localhost:8000
