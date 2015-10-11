$(function () {
    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Inputfeld für den Username
    var $messages = $('.messages'); // Chatfenster
    var $inputMessage = $('.inputMessage'); // Inputfeld für die Nachricht
    
    var $loginPage = $('.login.page'); // Loginseite
    var $chatPage = $('.chat.page'); // Chatseite
    
    var username;
    var connected = false;
    var $currentInput = $usernameInput.focus();
    
    var socket = io();
    
    // Fügt eine neue Chatzeile als Listeneintrag zum Chat hinzu und scrollt zum Ende.
    function addMessageElement(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        $el = $($el);
        
        // Optionen auf das Listenobjekt anwenden.

        // Den Listeneintrag langsam einblenden lassen.
        if (options.fade) {
            $el.hide().fadeIn(150);
        }
        // Den Listeneintrag vorneanstellen.
        if (options.prepend) {
            $messages.prepend($el);
        } 
        // Ansonsten hinten anfügen.
        else {
            $messages.append($el);
        }
        // Die gesamte Liste (also der Chat) nach unten scrollen.
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }
    
    // Fügt eine Nachricht zum Chat hinzu.
    function addChatMessage() {
        var message = $inputMessage.val();
        // Prüfung, ob die Verbindung vorhanden ist und die Nachricht nicht leer ist
        if (message && connected) {
            // Inputfeld wieder leeren
            $inputMessage.val('');
            // Die Nachricht über die addMessageElement Funktion einfügen.
            addMessageElement(username + ': ' + message, { prepend: false, fade: true });
            // Den Server über die neue Nachricht unterrichten
            socket.emit('new message', message);
        }
    }

    // Fügt die aktuelle Anzahl der eingeloggte Nutzer zum Chat hinzu.
    function addUserAmount(data){
        // Entscheidung des Nachrichtentextes je nach Anzahl der Nutzer (Mehrzahl und so).
        if (data.numUsers === 1) {
            addMessageElement('Es ist aktuell 1 Nutzer online.', { prepend: false, fade: false });
        }
        else {
            addMessageElement('Es sind aktuell ' + data.numUsers + ' Nutzer online.', { prepend: false, fade: false });
        }
    }
    
    // Tastatur Events
    $window.keydown(function (event) {
        // Wenn der Nutzer ENTER drückt
        if (event.which === 13) {
            // Prüfen, ob der Nutzer bereits einen Usernamen eingegeben hat.
            if (username) {
                addChatMessage();
            }
            else {
                username = $usernameInput.val().trim();
                // Wenn der Username valide ist.
                if (username) {
                    // Login Seite ausblenden und Chat Seite anzeigen
                    $loginPage.fadeOut();
                    $chatPage.show();
                    $loginPage.off('click');
                    // Fokus auf das neue Inputfeld
                    $currentInput = $inputMessage.focus();
                    // Dem Server den eigenen Usernamen bekannt machen.
                    socket.emit('add user', username);
                }
            }
        }
    });

    // Klick Events
    // Focus input when clicking anywhere on login page
    $loginPage.click(function () {
        $currentInput.focus();
    });
    
    // Focus input when clicking on the message input's border
    $inputMessage.click(function () {
        $inputMessage.focus();
    });
    
    // Horcht darauf, ob der Server "login" verschickt.
    socket.on('login', function (data) {
        // Die Client Variablen ändern
        connected = true;
        // Die Willkommensnachricht im Chatfenster anzeigen.
        addMessageElement('Willkommen beim Specturtly Web Chat', { prepend: false, fade: false });
        // Die aktuelle Anzahl der Nutzer wird angezeigt.
        addUserAmount(data);
    });
    
    // Horcht darauf, ob der Server "new message" verschickt.
    socket.on('new message', function (data) {
        // Die Benachrichtigung über den neuen Nutzer im Chatfenster anzeigen.
        addMessageElement(data.message, { prepend: false, fade: true });
        //addChatMessage(data, { prepend: true, fade: false });
    });
    
    // Horcht darauf, ob der Server "user joined" verschickt.
    socket.on('user joined', function (data) {
        // Die Benachrichtigung über den neuen Nutzer im Chatfenster anzeigen.
        addMessageElement(data.username + ' ist jetzt online.', { prepend: false, fade: false });
        // Die aktuelle Anzahl der Nutzer wird angezeigt.
        addUserAmount(data);
    });
    
    // Horcht darauf, ob der Server "user left" verschickt.
    socket.on('user left', function (data) {
        // Die Benachrichtigung über den verlassenen Nutzer im Chatfenster anzeigen.
        addMessageElement(data.username + ' ist jetzt offline.', { prepend: false, fade: false });
        // Die aktuelle Anzahl der Nutzer wird angezeigt.
        addUserAmount(data);
    });

});