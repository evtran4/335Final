const express = require('express');
const router = express.Router();
const path = require("path");
const { MongoClient, ServerApiVersion } = require("mongodb");
let client; 
require("dotenv").config({
   path: path.resolve(__dirname, "creds/.env"),
});

async function main(){
    const databaseName = "finalProj";
    const collectionName = "scores";
    const uri = process.env.MONGO_CONNECTION_STRING;
    client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 }); 

    try {
        await client.connect();
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        router.get("/", async (request, response) => {
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
                console.error(error); 
            }
        });
          
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
 
 
module.exports = router;