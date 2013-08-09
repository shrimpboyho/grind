/* Pre game menu */

var nameGiven = prompt('Enter a username','you_username_here');

toastr.info('Welcome to Grind')

/* Globals */

var client = new player(nameGiven);
var world;
enterGameLoop();

function enterGameLoop() {

    /* Rendering loop */

    setInterval(function() {
        // Clear canvas
        $("canvas").clearCanvas();

        // Draw stuff
        client.draw();

    }, 50);

}

/* Player class */

function player(username) {

    // identity
    this.username = username;

    // position variables
    this.x = 60;
    this.y = 20;

}

player.prototype.getX = function() {
    return this.x;
};

player.prototype.getY = function() {
    return this.y;
};

player.prototype.setX = function(x) {
    this.x = x;
};

player.prototype.setY = function(y) {
    this.y = y;
};

player.prototype.draw = function() {
    // player body

    $("canvas").drawImage({
        source: "/sprites/original.png",
        x: this.x, y: this.y,
        width: 30,
        height: 35,
        fromCenter: false
    });

    // player name
    $("canvas").drawText({
        fillStyle: "#999",
        strokeWidth: 2,
        x: this.x + 15,
        y: this.y + 35,
        fontSize: "10pt",
        fontfamily: "Trebuchet MS",
        text: this.username
    });

};

/* Hardware controls */

document.onkeydown = function() {
    switch (window.event.keyCode) {
        // left key
        case 37:
            client.setX(client.getX() - 5);
            break;
            // up key
        case 38:
            client.setY(client.getY() - 5);
            break;
            // right key
        case 39:
            client.setX(client.getX() + 5);
            break;
            // down key
        case 40:
            client.setY(client.getY() + 5);
            break;
    }
};

$('#chatBox').keypress(function(event) {

    // Enter key press
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        $('#send').get(0).click();
    }

});

/* Chat system via socket.io */

// Create a socket

var socket = io.connect('/');

// Create a blackmonkey instance

angrymonkey = new blackmonkey();

angrymonkey.setSocket(socket);

angrymonkey.setUserId(client.username);


angrymonkey.onNewMessage(function(data) {

    // Update the chat box if the server contacts us

    $('#chatMessageBox').val(($('#chatMessageBox').val() + '\n' + data.userId + ": " + data.message));

    // Scroll to the bottom

    $('#chatMessageBox').scrollTop($('#chatMessageBox')[0].scrollHeight);

});

/*

angrymonkey.onNewWhisper(function(data){

    // Update the chat box if the server contacts us with a whisper

    $('#chatBox').val(($('#chatBox').val() + '\n' + "Whisper From: " + data.srcId + " : " + data.message));  

});

*/

$('#send').click(function() {

    // Post message to the server

    angrymonkey.postMessage($('#chatBox').val());

    // Clear the current message

    $('#chatBox').val("");


});

/*

$('#sendWhisperButton').click(function(){

    // Post message to the server
    
    angrymonkey.whisperMessage($('#whisperMessageBox').val(),$("#whisperNameArea").val());

    // Clear the current whisper message

    $('#whisperMessageBox').val("");


});

*/

// Begin the chat

angrymonkey.initChat();

/* Chat wrapper code */

$("#chatMessageBoxWrapper").dialog({
    dialogClass: 'transparent_class',
    minHeight: 223,
    minWidth: 376,
    closeOnEscape: false,
    open: function(event, ui) {
        $(".ui-dialog-titlebar-close", ui.dialog || ui).hide();
    }
});

$("#chatMessageBoxWrapper").mouseenter(function(){
    $("#chatMessageBoxWrapper").dialog({dialogClass : 'nontransparent_class'});
});

$("#chatMessageBoxWrapper").mouseleave(function(){
    $("#chatMessageBoxWrapper").dialog({dialogClass : 'transparent_class'});
});

$("#chatMessageBoxWrapper").dialog("option", "position", ["left", "bottom"]);

/* GAME WORLD MULTIPLAYER CODE */

socket.on('firstConnectionLoad', function(data) {
    console.log("RECIEVED FIRST LOAD: " + data);

    // Set world on first connection
    world = data.world;

    // Get a copy of the new world every time it changes
    socket.on('newWorldLoad', function(data) {
        world = data.world;
    });
});


/* Sends the updated world to the server */
function emitUpdatedWorld(){
    socket.emit('worldUpdate', {world: world});
}