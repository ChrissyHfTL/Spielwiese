// Einen Standard Express Server starten.
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var config = require('./config.json');

// Den Server auf den Port aus der config.json horchen lassen.
server.listen(config.port, function () {
    console.log('Server listening at port %d', config.port);
});

// Das Routing zum public Ordner einstellen, damit die Clients dort (und nur dort) Zugriff bekommen.
app.use(express.static(__dirname + '/public'));

//benutzen der jade index Datei
app.set('view engine', 'jade');
app.set('views', './public');
app.get('/', function (req, res) {
    res.render('index');
});

// ################## CHAT ROOM ##################

// Variablen um die eingeloggten Nutzer und die Anzahl nachzuverfolgen.
var usernames = {};
var numUsers = 0;

// Hauptfunktion: Hier wird eine komplette Verbindung behandelt. Diese wird eine Verbindung aufgebaut, sobald ein Nutzer auf die Seite navigiert.
io.on('connection', function (socket) {
    // Initiale Belegung, dass der User noch nicht "registriert" ist.
    var addedUser: Boolean = false;
    
    // Horcht darauf, ob ein Nutzer "new message" verschickt.
    socket.on('new message', function (data) {
        // Allen Clients wird mitgeteilt, dass eine neue Nachricht zur Verfügung steht.
        // Dazu wird ein Broadcast gemacht und die Informationen des Nutzers, der die Nachricht geschrieben hat, mitverschickt.
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });
    
    // Horcht darauf, ob ein Nutzer "add user" verschickt.
    socket.on('add user', function (username) {
        // Der Username des Nutzers wird in der Socket Session für den Client gespeichert.
        socket.username = username;
        // Der Client wird der globalen Variable aller Nutzer hinzugefügt.
        usernames[username] = username;
        ++numUsers;
        // Der User ist nun vollständig eingeloggt.
        addedUser = true;
        // Dem Client wird der eingeloggte Zustand über "login" mitgeteilt und die Anzahl der Nutzer übergeben.
        socket.emit('login', {
            numUsers: numUsers
        });
        // Es wird eine globale Nachricht über "user joined" versendet mit den Informationen des neuen Nutzers.
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });
    
    // Horcht darauf, ob ein Nutzer "disconnect" verschickt.
    socket.on('disconnect', function () {
        // Der Client wird von der globalen Variable aller Nutzer entfernt.
        // Es wird dazu zuvor geprüft, ob der Nutzer überhaupt korrekt eingeloggt war.
        if (addedUser) {
            delete usernames[socket.username];
            --numUsers;
            
            // Es wird eine globale Nachricht über "user left" versendet mit den Informationen des ausgeloggten Nutzers.
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});