//Importing modules
const express = require('express');
const app = express();
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const VoiceMethods = require('./models/Voice');

//Importing controllers
const authRoute = require("./controllers/auth");
const voiceRoute = require("./controllers/voice");

//Config
dotenv.config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Variables
const port = 8333;


var cookieParser = require('cookie-parser');
app.use(cookieParser());


//Static files
app.use("/", express.static("assets"));

//Index GET
app.get("/", (req, res) => {
    res.render("index.ejs");
});




//middleware
app.use(express.json());
//Route middleware
app.use("/user", authRoute);
app.use("/voice", voiceRoute);

app.listen(port, () => console.log(`the server is running on port ${port}`));
