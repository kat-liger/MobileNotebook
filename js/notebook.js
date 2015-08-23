/*global localStorage,window,document*/

(function () {
    "use strict";
    var i, elem, notesListEl, noteText, notesContents,  destroyButtons, count;

    function init() {
        //filling the list of notes
        for (i = 0; i < localStorage.length; i++) {
            notesListEl = document.createElement("li");
            noteText = localStorage.getItem(localStorage.key(i));
            //our list of notes should only contain those values from local storage, whose keys start with "notebook"
            if ((localStorage.key(i) !== "notebook.maxCount") && (localStorage.key(i).substring(0, 8) === "notebook")) {
                notesListEl.innerHTML =
                    "<div id='" + localStorage.key(i) + "'>" +
                        "<div>" +
                            "<label class='note-content'>" + noteText + "</label>" +
                            "<button class='note-destroy'></button>" +
                        "</div>" +
                        "<div class='hidden'>" +
                            "<input class='edit-note' type='text' value='" + noteText + "'></input>" +
                        "</div>" +
                    "</div>";
                document.getElementById("notes").appendChild(notesListEl);
            }
        }
    }

    function onKeyPressHandler(e) {
        //adding a new note
        var newNoteEl,
            event = e || window.event,
            charCode = event.which || event.keyCode;
        if (localStorage["notebook.maxCount"] === undefined) {
            localStorage["notebook.maxCount"] = 0;
        }
        count = parseInt(localStorage["notebook.maxCount"]) + 1;
        if (charCode === 13) {
            //getting the content of input
            var newNote = document.getElementById("new-note").value;
            //saving new note to local Storage
            localStorage["notebook.note" + count] = newNote;
            localStorage["notebook.maxCount"]++;
            //removing the content of input
            document.getElementById("new-note").value = '';
            //adding new note to DOM
            newNoteEl = document.createElement("li");
            newNoteEl.innerHTML =
                "<div id='notebook.note" + count + "'>" +
                    "<div>" +
                        "<label class='note-content'>" + newNote + "</label>" +
                        "<button class='note-destroy'></button>" +
                    "</div>" +
                    "<div class='hidden'>" +
                        "<input class='edit-note' type='text' value='" + newNote + "'></input>" +
                    "</div>" +
                "</div>";
            document.getElementById("notes").appendChild(newNoteEl);
            //after adding a new note input loses focus
            document.getElementById("new-note").blur();
            //making sure that the newly added div listens to events
            updateState();
            return false;
        }
    }

    //replace content of note with content of input when edit is finished
    function inputToNote(noteId) {
        var divToUpdate = document.getElementById(noteId),
        //getting the content of input
            newText = divToUpdate.lastChild.querySelector(".edit-note").value;
        //proceeding only if input is not empty
        if (newText !== "") {
            //updating note to local Storage
            localStorage.setItem(noteId, newText);
            //updating the first div
            divToUpdate.firstChild.querySelector(".note-content").textContent = newText;
            divToUpdate.firstChild.classList.remove("hidden");
            divToUpdate.lastChild.setAttribute("class", "hidden");
            return false;
        }
    }

    //updating the existing note
    function updateNote(noteId) {
        var divToUpdate = document.getElementById(noteId);
        divToUpdate.firstChild.setAttribute("class", "hidden");
        divToUpdate.lastChild.classList.remove("hidden");
        divToUpdate.lastChild.querySelector(".edit-note").focus();
        divToUpdate.addEventListener("keypress", function (e) {
            var event = e || window.event,
                charCode = event.which || event.keyCode;
            if (charCode === 13) {
                inputToNote(noteId);
            }
        });

        divToUpdate.lastChild.querySelector(".edit-note").addEventListener("blur", function () {
            inputToNote(noteId);
        });
    }

    //updating the state of the list of notes
    function updateState() {
        notesContents = document.querySelectorAll(".note-content");
        for (i = 0; i < notesContents.length; i++) {
            elem = notesContents[i];
            elem.addEventListener("click", (function (elem) {
                console.log("updateState click");
                return function () {
                    updateNote(elem.parentElement.parentElement.id);
                };
            })(elem));
        }

        destroyButtons = document.querySelectorAll(".note-destroy");
        for (i = 0; i < destroyButtons.length; i++) {
            elem = destroyButtons[i];
            elem.addEventListener("click", (function (elem) {
                return function () {
                    console.log("destroyButtons click");
                    //removing from local storage
                    localStorage.removeItem(elem.parentNode.parentNode.id);
                    //removing from DOM
                    var toRemove = document.getElementById(elem.parentNode.parentNode.id);
                    toRemove.parentNode.removeChild(toRemove);
                };
            })(elem));
        }
    }

    /**
     * JSDoc
     */
    function subscribe() {
        document.getElementById("new-note").addEventListener("keypress", onKeyPressHandler);
    }

    window.addEventListener("load", function () {
        init();
        subscribe();
        updateState();
    });


})();