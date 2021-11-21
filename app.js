const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());

let db = null;

let dbPath = path.join(__dirname, "cricketMatchDetails.db");

const initialization = async () => {
  try {
    db =await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running");
    });
  } catch (e) {
    console.log(`error: ${e}`);
  }
};
initialization();

//API-1 get players
app.get("/players/", async (req, res) => {
  const query = `SELECT 
            *
        FROM 
            player_details;`;

  const getArray =await  db.all(query);
  res.send(getArray.map((eachItem) => {
      return   { 
    playerId: eachItem.player_id,
    playerName: eachItem.player_name
   }
})
);
});

//API-2
app.get("/players/:playerId/", async (req, res) => {

  const {playerId} = req.params;
  const query = `SELECT 
            *
        FROM 
            player_details
        WHERE
            player_id = ${playerId};`;

  const getArray =await  db.all(query);
  res.send({
      playerId: getArray[0].player_id,
      playerName: getArray[0].player_name
  });
});

//API-3
app.put("/players/:playerId/", async (req, res) => {

  const {playerId} = req.params;
  const {playerName} = req.body;
  const query = `
        UPDATE player_details
        SET
        player_name ='${playerName}'
        WHERE
            player_id = ${playerId};`;

  await  db.run(query);
  res.send("Player Details Updated");
});

//API-4
app.get("/matches/:matchId/", async (req, res) => {

  const {matchId} = req.params;
  const query = `
    SELECT 
        match_id as matchId,
        match,
        year
    FROM 
        match_details 
    WHERE 
        match_id = ${matchId};`

  const getArray = await  db.get(query);
  res.send(getArray);
});

//API-5
app.get("/players/:playerId/matches/", async (req, res) => {

  const {playerId} = req.params;
  const query = `
    SELECT 
        match_details.match_id as matchId,
        match_details.match,
        match_details.year
    FROM 
        match_details inner join player_match_score on match_details.match_id = player_match_score.match_id
    WHERE 
        player_match_score.player_id = ${playerId};`

  const getArray = await  db.all(query);
  res.send(getArray);
});

//API-6
app.get("/matches/:matchId/players/", async (req, res) => {

  const {matchId} = req.params;
  const query = `
    SELECT 
        player_details.player_id as playerId,
        player_details.player_name as playerName
    FROM 
        player_details inner join player_match_score on player_details.player_id = player_match_score.player_id
    WHERE 
        player_match_score.match_id = ${matchId};`

  const getArray = await  db.all(query);
  res.send(getArray);
});

//API-7
app.get("/players/:playerId/playerScores/", async (req, res) => {

  const {playerId} = req.params;
  const query = `
    SELECT 
        player_details.player_id as playerId,
        player_details.player_name as playerName,
        sum(player_match_score.score) as totalScore,
        sum(player_match_score.fours) as totalFours,
        sum(player_match_score.sixes) as totalSixes

    FROM 
        player_details inner join player_match_score on player_details.player_id = player_match_score.player_id
    GROUP BY
        player_match_score.player_id
    HAVING
        player_match_score.player_id = ${playerId};`

  const getArray = await  db.get(query);
  res.send(getArray);
});

module.exports = app;