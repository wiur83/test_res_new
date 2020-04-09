const sqlite3 = require('sqlite3').verbose();


//DB connect
let db = new sqlite3.Database('./db/texts.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
});

module.exports = {
    getWords: async function() {
        return new Promise(resolve => {
            let arrayWords = [];
            db.all("SELECT * FROM words", async (err, row) => {
                if (err) {
                    console.log(err);
                } else {
                    row.forEach(element => arrayWords.push(element["word"]));
                    // res.cookie("words", arrayWords);
                    resolve(arrayWords);
                }
            });
        })
    },
    setUserWords: async function(wordsList, userBackupId) {
        return new Promise(resolve => {
            for (let i = 0; i < wordsList.length; i++) {
                db.get("SELECT COUNT(*) AS total FROM data WHERE word = ? AND user_id = ?",
                wordsList[i],userBackupId,(err, row) => {

                    if (err) {
                        resolve(err);
                    } else {
                        if (row.total == 0) {
                            //ord finns inte
                            db.run("INSERT INTO data (user_id, word, res_word, nr_of_tries) VALUES (?, ?, ?, ?)",
                                userBackupId, wordsList[i], wordsList[i], 1, (err) => {
                                if (err) {
                                    resolve(err);
                                }
                            });
                        }
                    }
                    resolve("success");
                });
            }
        })
    },
    getUserWords: async function(userBackupId) {
        return new Promise(resolve => {
            db.all("SELECT * FROM data WHERE user_id = ?",
            userBackupId, async (err, row) => {
                if (err) {
                    console.log(err);
                    resolve(err);
                } else {
                    let Obj = {};
                    for (let i = 0; i < row.length; i++) {
                        if (!(row[i]["word"] in Obj)) {
                            Obj[row[i]["word"]] = [row[i]["res_word"]];
                        } else {
                            Obj[row[i]["word"]].push(row[i]["res_word"]);
                        }
                    }
                    console.log(Obj);
                    resolve(Obj);
                }

            });


        })
    },
    getCounterWords: async function(words) {
        return new Promise(resolve => {
            let count = 0;
            for (var c in words) {
                count = count + 1;
            }
            resolve(parseInt(count));
        })

    },
    addToNrOfTries: async function(userBackupId, subWord) {
        return new Promise(resolve => {
            db.get("SELECT nr_of_tries FROM data WHERE user_id = ? AND res_word = ?",
            userBackupId, subWord,(err, row) => {
                if (err) {
                    resolve(err);
                } else {
                    let newNumberOfTries = row.nr_of_tries + 1;
                    db.run("UPDATE data SET nr_of_tries = ? WHERE user_id = ? AND res_word = ?",
                        newNumberOfTries, userBackupId, subWord, (err) => {
                        if (err) {
                            resolve(err);
                        }
                    });
                    resolve("success");
                }
            });
        })
    },
    addResWord: async function(userBackupId, currentWord, subWord) {
        return new Promise(resolve => {
            db.run("INSERT INTO data (user_id, word, res_word, nr_of_tries) VALUES (?, ?, ?, ?)",
                userBackupId, currentWord, subWord, 1, (err) => {
                if (err) {
                    resolve(err);
                }
            });
            resolve("Success");
        })
    },
    addToStatistics: async function(userBackupId, score, counterWords) {
        return new Promise(resolve => {
            db.run("INSERT INTO statistics (user_id, score, total_score) VALUES (?, ?, ?)",
                userBackupId, parseInt(score),parseInt(counterWords), (err) => {
                if (err) {
                    resolve(err);
                }
            });
            resolve("Success");
        })
    },
    resetStartCounter: async function() {
        return new Promise(resolve => {
            resolve(parseInt(0));
        })
    },
    resetScore: async function() {
        return new Promise(resolve => {
            resolve(parseInt(0));
        })
    }

}
