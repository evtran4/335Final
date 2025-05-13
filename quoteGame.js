const path = require("path");
require("dotenv").config({
   path: path.resolve(__dirname, "creds/.env"),
});
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
let client; // Declare client at a higher scope to be accessible globally

process.stdin.setEncoding("utf8"); /* encoding */
process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
    if (process.argv.length !== 2){
        process.stdout.write("Usage quoteGame.js");
        process.exit(0);
    } else {
        const dataInput = process.stdin.read();
        if (dataInput !== null) {
            const command = dataInput.trim();
            if (command === "stop") {
                console.log("Shutting down the server");
                client.close();
                process.exit(0);  /* exiting */
            } else {
                console.log(`Invalid command: ${command}`);
                process.stdout.write("Type stop to shutdown the server: ");
            }
            process.stdin.resume(); 
        }
    }
	
});

const portNumber = 5001;
app.listen(portNumber);
console.log(`Web server started and running at http://localhost:5001`);

async function main(){
    const databaseName = "finalProj";
    const collectionName = "scores";
    const uri = process.env.MONGO_CONNECTION_STRING;
    client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 }); // Assign to the global client variable

    app.set("view engine", "ejs");
    app.set("views", path.resolve(__dirname, "client"));
    app.use('/styles', express.static(path.join(__dirname, 'client/styles')));
    app.use('/assets', express.static(path.join(__dirname, 'client/assets')));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.json()); 


    try {
        await client.connect();
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        app.get("/", (request, response) => {
            response.render("index");
        });

        app.get("/gameOver", (request, response) => {
            const score = request.query.score;
            response.render("gameOver", { score });
        });

        app.get("/game", (request, response) => {
            response.render("game");
        });

        app.get("/leaderBoard", async (request, response) => {
            try {
              const topScores = await collection
                .find({})
                .sort({ score: -1 })
                .limit(3)
                .toArray();

              const variables = {first: topScores[0], second: topScores[1], third: topScores[2] };
              console.log(variables)
              response.render("leaderboard", variables);
            } catch (error) {
              console.error("error"); 
            }
          });

        app.post("/gameOver", async (request, response) => {
            console.log(request.body)
            const { name, score, url} = request.body;
            const numericScore = Number(score);
            await collection.insertOne({ name, score: numericScore, url });

            response.render("index");
        });
          
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();