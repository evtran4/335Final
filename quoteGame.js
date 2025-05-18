//imports
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
const path = require("path");

require("dotenv").config({
   path: path.resolve(__dirname, "creds/.env"),
});

const express = require("express");
const leaderBoard = require("./leaderboard");

//init server
const app = express();
let client; // Declare client at a higher scope to be accessible globally

const portNumber = 5001;
app.listen(portNumber);
console.log(`Web server started and running at http://localhost:5001`);

async function main(){

    //mongo configure
    const databaseName = "finalProj";
    const collectionName = "scores";
    const uri = process.env.MONGO_CONNECTION_STRING;
    client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 }); // Assign to the global client variable

    //serve files
    app.set("view engine", "ejs");
    app.set("views", path.resolve(__dirname, "client"));
    app.use('/styles', express.static(path.join(__dirname, 'client/styles')));
    app.use('/assets', express.static(path.join(__dirname, 'client/assets')));
    app.use("/leaderboard", leaderBoard);

    
    app.use(express.json()); 
    app.use(bodyParser.urlencoded({ extended: false }));

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

        app.post("/gameOver", async (request, response) => {
            console.log(request.body)
            const { name, score, url} = request.body;
            const numericScore = Number(score);
            await collection.insertOne({ name, score: numericScore, url });

            response.redirect("/");
        });
          
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();