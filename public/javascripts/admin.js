
//var fname = prompt("Enter Facebook profile id (example: vigneshpt)", "");
$(document).ready(function () {
    $(".set-picture-button").click(function () {
        var profileId = prompt("Enter Facebook profile id (example: vigneshpt)", "");
        var imageSource = "http://graph.facebook.com/" + profileId + "/picture?width=300&height=300";
        //var dataToSend = { "src": encodeURI(imageSource) };
        if (this.id == 'player1SetPicture') {
            $.ajax({
                url: "http://" + location.host + '/admin/updateUserPicture/1',
                type: "POST",
                processData: false,
                data: 'src=' + encodeURIComponent(imageSource), //encodeURI(imageSource),
                success: function (data) { console.log(data); },
                error: function () { console.log('error'); }

            });
        }
        else if (this.id == 'player2SetPicture') {
            $.ajax({
                url: "http://" + location.host + '/admin/updateUserPicture/2',
                type: "POST",
                processData: false,
                data: 'src=' + encodeURIComponent(imageSource),
                success: function (data) { console.log(data); },
                error: function () { console.log('error'); }

            });
        }
    });

    $('#nextroundbtn').click(function () {
        $.ajax({
            url: '/resetPlayers/1', //1 => to change to next round
            type: 'GET',
            processData: false,
            success: function (successmessage) { console.log(successmessage); },
            error: function (errormessage) { console.log(errormessage); }
        });
    });

    $('.updateScoreButton').click(function () {
        switch (this.id) {
            case "upbutton1":
                {
                    //$('#player1Points').text(parseInt($('#player1Points').text(), 10) + 1);
                    $.ajax({
                        url: "/push",
                        type: "POST",
                        processData: false,
                        data: 'player=1&score=' + parseInt($('#player1Points').text(), 10),
                        success: function (data) { console.log(data); $('#player1Points').text(parseInt($('#player1Points').text(), 10) + 1); },
                        error: function (err) { console.log(err); }
                    });
                    break;
                }
            case "upbutton2":
                {
                    $.ajax({
                        url: "/push",
                        type: "POST",
                        processData: false,
                        data: 'player=2&score=' + parseInt($('#player2Points').text(), 10),
                        success: function (data) { console.log(data); $('#player2Points').text(parseInt($('#player2Points').text(), 10) + 1); },
                        error: function (err) { console.log(err); }
                    });

                    break;
                }
            case "downbutton1":
                {
                    var tempPoints = parseInt($('#player2Points').text(), 10);
                    if (tempPoints > 0) {
                        $.ajax({
                            url: "/pop",
                            type: "POST",
                            processData: false,
                            data: 'player=1&score=' + parseInt($('#player1Points').text(), 10),
                            success: function (data) { console.log(data); $('#player1Points').text(tempPoints - 1); },
                            error: function (err) { console.log(err); }
                        });
                    }
                    break;
                }
            case "downbutton2":
                {
                    var tempPoints = parseInt($('#player2Points').text(), 10);
                    if (tempPoints > 0) {
                        $.ajax({
                            url: "/pop",
                            type: "POST",
                            processData: false,
                            data: 'player=2&score=' + parseInt($('#player2Points').text(), 10),
                            success: function (data) { console.log(data); $('#player2Points').text(tempPoints - 1); },
                            error: function (err) { console.log(err); }
                        });
                    }
                    break;
                }
        }
    });
});
