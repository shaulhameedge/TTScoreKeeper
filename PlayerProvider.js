var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSONPure;
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
/*
    { 
        _id:ObjectID,
        playerNumber: 1 or 2,
        name: "Ramkumar",
        profileImage: "http://graph.facebook.com/{id}/picture?width=300&height=300",
        points: 0
    }
*/
var connection_string = '127.0.0.1:27017/ttremote';
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
var globalDB = null;
function getDB() {
    MongoClient.connect('mongodb://' + connection_string, function (err, db) {
        if (err) throw err;
        console.log('connected db');
        var collection = db.collection('players'); // .find().toArray(function (err, docs) {
        collection.count(function (err, count) {
            if (err || count < 2) {
                console.log("the players collection doesn't exist, creating default players");
                collection.drop();
                collection.insert(defaultPlayers, { safe: true }, function (err, result) {
                    if (!err)
                        console.log('inserted default players');
                });
            }
        });
        //callback(null, db);
        globalDB = db;
        //db.close();
        //});
    });
};
PlayerProvider = function () {
    getDB();
};

PlayerProvider.prototype.getPlayerCollection = function (callback) {
    if (!globalDB) getDB();
    globalDB.collection('players', function (error, player_collection) {
        if (error) callback(error);
        else callback(null, player_collection);
    });
};
PlayerProvider.prototype.getRoundCollection = function(callback){
    if(!globalDB) getDB();
    globalDB.collection('rounds',function(error,round_collection){
        if(error) callback(error);
        else callback(null,round_collection);
    });
}
PlayerProvider.prototype.insertRoundData = function(data,callback){
  this.getRoundCollection(function(error,round_collection){
      round_collection.insert(data,{safe:true},function(err,docs){
          if(err){console.log('could not insert round data'); callback(err);}
          else{ console.log('inserted round data'); callback(null,docs);}
      });
  });  
};
PlayerProvider.prototype.getAllRounds = function(callback){
    this.getRoundCollection(function(error,round_collection){
        round_collection.find().sort({timestamp:-1}).toArray(function(err,results){
            if(err)callback(err);
            else callback(null,results);
        });
    });
};
PlayerProvider.prototype.getPlayers = function (callback) {
    this.getPlayerCollection(function (error, player_collection) {
        player_collection.find().sort({playerNumber:1}).toArray(function (error, results) {
            if (error) callback(error);
            else callback(null, results);
        });
    })
};

PlayerProvider.prototype.getFirstPlayer = function (callback) {
    this.getPlayerCollection(function (error, player_collection) {
        if (error) callback(error);
        else {
            player_collection.findOne({ playerNumber: 1 }, function (error, player_one) {
                if (error) callback(error);
                else callback(null, player_one);
            })
        }
    });
};

PlayerProvider.prototype.getSecondPlayer = function (callback) {
    this.getPlayerCollection(function (error, player_collection) {
        if (error) callback(error);
        else {
            player_collection.findOne({ playerNumber: 2 }, function (error, player_two) {
                if (error) callback(error);
                else callback(null, player_two);
            })
        }
    });
};

PlayerProvider.prototype.updateProfilePic = function (playerNo, imageSources, callback) {
    this.getPlayerCollection(function (error, players) {
        if (error) callback(error);
        else {
            players.findOne({ playerNumber: parseInt(playerNo) }, function (findError, playerToUpdate) {
                if (findError)
                    console.log('find error');
                else {
                    //console.log(playerToUpdate);
                    players.update({ _id: new ObjectId(playerToUpdate._id.toString()) }, { $set: { profileImages: imageSources} }, { multi: false, safe: true }, function (updateError, result) {
                        if (!updateError) {
                            console.log("imageSources updated for player" + playerNo);
                            console.log('affected ' + result + " docs");
                            callback();
                        }
                        else
                            console.log(updateError);
                    });
                }
            });
        }
    });
};


PlayerProvider.prototype.updateScore = function (playerNo, score, callback) {

    this.getPlayerCollection(function (error, players) {
        if (error) callback(error);
        else {
            players.update({ playerNumber: parseInt(playerNo) }, { $set: { points: score} }, { multi: false, safe: true }, function (err, result) {
                if (err) { console.log("error updating image source"); callback(err); }
                else {
                    console.log("points updated for player" + playerNo);
                    callback(null, result);
                }
            });

        }
    });
};

PlayerProvider.prototype.updatePlayerName = function (playerNo, _name,_type, callback) {
    this.getPlayerCollection(function (error, players) {
        if (error) callback(error);
        else {
            players.update({ playerNumber: parseInt(playerNo) }, { $set: { name: _name, type:_type} }, { multi: false, safe: true }, function (err, result) {
                if (err) { console.log("error updating player name: " + err); callback(err); }
                else {
                    console.log('player name updated for player' + playerNo);
                    callback(null, result);
                }
            });
        }
    });
};

//not yet used
PlayerProvider.prototype.updatePlayer = function (player, callback) {
    this.getPlayerCollection(function (error, players) {
        if (error) callback(error);
        else {
            console.log(JSON.stringify(player));
            // players.update({ playerNumber: player.playerNumber }, {$set: JSON.stringify(player)}, { multi: false }, function (err, result) {
            //     if (err) { console.log("error updating player"); callback(err); }
            //     else {
            //         console.log("player " + player.playerNumber + " updated");
            //         callback(null, result);
            //     }
            // });
        }
    });
};

var defaultPlayers = [
    {
        playerNumber: 1,
        name: "Home",
        type:"single",  //or double
        profileImages: ["/images/men.jpg"],
        points: 0
    },
    {
        playerNumber: 2,
        name: "Away",
        type:"single",
        profileImages: ["/images/men.jpg"],
        points: 0
    }
];


PlayerProvider.prototype.resetPlayers = function (callback) {
    this.getPlayerCollection(function (error, players) {
        if (error) console.log(error);
        else {
            players.drop();
            players.insert(defaultPlayers, { safe: true,multi:true }, function (err, result) {
                if (err) { console.log("couldn't reset player"); callback(err); }
                else {
                    console.log("resetted players ");
                    callback(null, result)
                }
            });
        }
    });

};

PlayerProvider.prototype.resetScores = function (callback) {
    this.getPlayerCollection(function (error, players) {
        if (error) { console.log('[resetScores function] error to getCollection: ' + error); }
        else {
            players.update({}, { $set: { points: 0} }, { multi: true, safe: true }, function (err, result) {
                if (err) { console.log('error resetting scores: ' + err); callback(err); }
                else {
                    console.log('resetted scores');
                    callback(null, result);
                }
            });
        }
    });
}

exports.PlayerProvider = PlayerProvider;