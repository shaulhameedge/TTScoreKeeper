
var app = angular.module("tt", []);
app.controller('master', ["$scope", "$http", function ($scope, $http) {
    $scope.player1 = players[0] || { name: "Home", points: 0, type:"single", profileImages: ["/images/men.jpg"] };
    $scope.player2 = players[1] || { name: "Away", points: 0, type:"single", profileImages: ["/images/men.jpg"] };
    
    $scope.$watch("player1", function (newValue, oldValue) {
        if (newValue.profileImages[0]== "") {
            $scope.player1.profileImages[0] = "/images/men.jpg"
        }
        if(newValue.profileImages[1]==""){
            $scope.player1.profileImages[1] = "/images/men.jpg"    
        }
    });
    $scope.$watch("player2", function (newValue, oldValue) {
        if (newValue.profileImages[0]== "") {
            $scope.player2.profileImages[0] = "/images/men.jpg"
        }
        if(newValue.profileImages[1]==""){
            $scope.player2.profileImages[1] = "/images/men.jpg"    
        }
    });
    var socket = io.connect("http://" + location.host);
    $scope.round = 1;
    socket.on('updateCount', function (e) {
        $scope.player1.points = e[0].points;
        $scope.player2.points = e[1].points;
        document.getElementById('player-points-1').style.color="#333";
        document.getElementById('player-points-1').style.color="#333";
        $scope.$apply();
    });
    socket.on('negateCount', function (e) {
        $scope.player1.points = e[0].points;
        $scope.player2.points = e[1].points;
        document.getElementById('player-points-1').style.color="#333";
        document.getElementById('player-points-1').style.color="#333";
        $scope.$apply();
    });


    socket.on('connected', function () {
        console.log('Congrats, you are connected successfully');
    });

    socket.on('updatePlayers', function (data) {
        document.getElementById('player-points-1').style.color="#333";
        document.getElementById('player-points-1').style.color="#333";
        $scope.player1 = data.players[0];
        $scope.player2 = data.players[1];
        if (data.advanceRound == 1) {
                $scope.round = parseInt($scope.round, 10) + 1;
        } //Advance to next round
        else if (data.advanceRound == 2)
            $scope.round = 1;
        $scope.$apply();
    });
    
    socket.on('playerWon', function (param) {
        //Decide how to show the WIN message in a good way
        if (param == 1)
        { document.getElementById('player-points-1').style.color="green"; }
        else if (param == 2)
        { document.getElementById('player-points-2').style.color="green"; }
        
    });
    
} ]);




/* admin.jade javascript */
