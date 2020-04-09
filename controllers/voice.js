const express = require('express');
const router = require('express').Router();
const verify = require("../models/verifyToken");
const VoiceMethods = require('../models/Voice');

var cookieParser = require('cookie-parser');
router.use(cookieParser());

//Static files
router.use("/", express.static("assets"));




//login GET
router.get("/start", async (req, res) => {
    let userBackupId = await req.cookies['userBackupId'];
    let userWords = await VoiceMethods.getUserWords(userBackupId);
    res.cookie("userWords", userWords);
    let counterWordsInt = await req.cookies['counterWords'];
    res.render("../views/start.ejs", { totalWords: counterWordsInt });
});


//talk-login GET
router.get("/talk-login", verify, async (req, res) => {
    //Verifies(verify middleware) that user logged in.
    if (req.user == "Access denied") {
        res.render("../views/error.ejs", {msg: "Please login"});
    } else if (req.user == "Invalid token") {
        res.render("../views/error.ejs", {msg: "Wrong email or password"});
    } else {
        let userBackupId = await req.cookies['userBackupId'];

        //Sets the current word that is sent to user
        let userWords = await req.cookies['userWords'];
        let startCounter = await req.cookies['startCounter'];

        let currentWord = await Object.keys(userWords)[parseInt(startCounter)];
        res.cookie("currentWord", currentWord);

        let currentResWords = userWords[currentWord];
        res.cookie("currentResWords", currentResWords);

        //Check if test if finished or not
        let counterWords = await req.cookies['counterWords'];


        if (parseInt(counterWords) > parseInt(startCounter)) {
            res.render("../views/talk.ejs", { msg: currentWord });
        } if (counterWords == startCounter) {
            let userBackupId = await req.cookies['userBackupId'];
            let score = await req.cookies['score'];
            // Adds score to statistics in DB
            await VoiceMethods.addToStatistics(userBackupId, parseInt(score), parseInt(counterWords));

            res.render("../views/finished.ejs", {score: parseInt(score), total: parseInt(counterWords)});
        }

    }
});


//submit POST
router.post("/submit", async (req, res) => {
    //Adds one(1) to startCounter
    let startCounter = await req.cookies['startCounter'];
    let startCounterInt = parseInt(startCounter);
    let userBackupId = await req.cookies['userBackupId'];
    res.cookie("startCounter", parseInt(startCounterInt+1));
    res.cookie("subWord", req.body.value.toLowerCase());

    //Checks if word exists under res_word for current word
    let currentResWords = await req.cookies['currentResWords'];
    let subWord = req.body.value.toLowerCase();
    let checkIfWordExist = currentResWords.includes(subWord);

    if (checkIfWordExist == true) {
        // word exist
        let score = await req.cookies['score'];
        await VoiceMethods.addToNrOfTries(userBackupId, subWord);
        let scoreInt = parseInt(score)
        res.cookie("score", parseInt(scoreInt+1));
        res.redirect('./talk-login');
    } else {
        // word does not exist

        // Check that no clash with other word
        let words = await req.cookies['words'];
        let checkNoClash = words.includes(subWord); //ÄNDRA?

        if (checkNoClash == true) {
            //Clash. Word not added to res_word
            res.redirect('./talk-login');
        } else {
            //No clash. Word added to res_word
            let currentWord = await req.cookies['currentWord'];
            await VoiceMethods.addResWord(userBackupId, currentWord, subWord);
            res.redirect('./talk-login');
        }
    }
});




//restart GET
router.get("/restart", verify, async (req, res) => {
    res.clearCookie('userBackupId');
    res.clearCookie('globalToken');
    res.clearCookie('words');
    res.clearCookie('userWords');
    res.clearCookie('counterWords');
    res.clearCookie('currentResWords');
    res.clearCookie('subWord');
    res.clearCookie('result');
    res.clearCookie('startCounter');
    res.clearCookie('score');
    res.clearCookie('currentWord');



    res.redirect('../user/login');
});




module.exports = router;
