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
    app.set("views", path.resolve(__dirname, "templates"));

    try {
        await client.connect();
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        app.get("/", (request, response) => {
            response.render("index");
        });

        app.get("/game", (request, response) => {
            response.render("game");
        });

        app.post("/game", async (request, response) => {
            const { name, score } = request.body;
            await collection.insertOne({ name, score });

            const variables = { score }; // Pass the score to the template

            response.render("gameOver", variables);
        });

        // app.get("/reviewApplication", (request, response) => {
        //     const variables = {  pn: portNumber  };

        //     response.render("reviewApplication", variables);
        // });

        // app.use(bodyParser.urlencoded({extended:false}));

        // app.post("/reviewApplication", async (request, response) => {
        //     let query = { email: request.body.email };
        //     let result = await collection.findOne(query);

        //     if (!result || result === null) {
        //         const variables = {
        //             name: "NONE",
        //             email: "NONE",
        //             gpa: "NONE",
        //             bginfo: "NONE"
        //         }
        //         response.render("returnApplication", variables);
        //     } else {
        //         const variables = {
        //             name: result.name,
        //             email: result.email,
        //             gpa: result.gpa,
        //             bginfo: result.bginfo
        //         };
        //         response.render("returnApplication", variables);
        //     }
        // });

        // app.get("/selectByGPA", (request, response) => {
        //     const variables = {  pn: portNumber  };

        //     response.render("selectByGPA", variables);
        // });

        // app.use(bodyParser.urlencoded({extended:false}));

        // app.post("/selectByGPA", async (request, response) => {
        //     filter = { gpa: { $gte: request.body.gpa }};
        //     const cursor = collection.find(filter);
        //     result = await cursor.toArray();

        //     if (!result || result === null) {
        //         const variables = {
        //             name: "NONE",
        //             email: "NONE",
        //             gpa: "NONE",
        //             bginfo: "NONE"
        //         }
        //         response.render("returnListGPA", variables);
        //     } else {
        //         let res = `<table border="1">
        //                         <tr>
        //                             <th>Name</th>
        //                             <th>GPA</th>
        //                         </tr>`;
        //         result.forEach(a => {
        //             res += `<tr><td>${a.name}</td><td>${parseFloat(a.gpa).toFixed(2)}</td></tr>`;
        //         });
        //         res += `</table>`;

        //         const variables = {  itemsTable: res  };
        //         response.render("returnListGPA", variables);
        //     }
        // });

        // app.get("/removeAllApplications", (request, response) => {
        //     const variables = {  pn: portNumber  };

        //     response.render("delete", variables);
        // });

        // app.post("/removeAllApplications", async (request, response) => {
        //     filter = { };
        //     const result = await collection.deleteMany(filter);

        //     const variables = {  numDeleted: result.deletedCount  };
        //     response.render("deleted", variables);
        // });

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();