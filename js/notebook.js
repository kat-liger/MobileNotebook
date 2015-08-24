/*global localStorage,window,document*/

(function () {
    "use strict";
    var i, notes;

    function init() {
        var notesListEl, noteText;
        //filling the list of notes
        for (i = 0; i < localStorage.length; i = i + 1) {
            notesListEl = document.createElement("li");
            noteText = localStorage.getItem(localStorage.key(i));
            //our list of notes should only contain those values from local storage, whose keys start with "notebook"
            if ((localStorage.key(i) !== "notebook.maxCount") && (localStorage.key(i).substring(0, 8) === "notebook")) {
                notesListEl.innerHTML =
                    "<div class='note' id='" + localStorage.key(i) + "'>" +
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

    //replace content of note with content of input when edit is finished
    function inputToNote(noteId) {
        var divToUpdate = document.getElementById(noteId), newText;
        if (!divToUpdate) { return; }
        //getting the content of input
        newText = divToUpdate.lastChild.querySelector(".edit-note").value;
        //proceeding only if input is not empty and consists not only of whitespaces
        if (/\S/.test(newText)) {
            //updating note to local Storage
            localStorage.setItem(noteId, newText);
            //updating the first div
            divToUpdate.firstChild.querySelector(".note-content").textContent = newText;
            divToUpdate.firstChild.classList.remove("hidden");
            divToUpdate.lastChild.setAttribute("class", "hidden");
        } else {
            //remove the note
            removeNoteById(noteId);
        }
        return;
    }

    //updating the existing note
    function onUpdateNote(e) {
        var noteId = e.target.parentElement.parentElement.id,
            divToUpdate = document.getElementById(noteId);
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
        divToUpdate.addEventListener("focusout", function () {
            inputToNote(noteId);
        });
    }

    function removeNoteById(noteId) {
        var note, destroyButton, elem, liToRemove;
        //making sure that the note exists
        if (!localStorage.getItem(noteId)) {
            return;
        }
        //removing from local storage
        localStorage.removeItem(noteId);
        //unsubscribe a note
        elem = document.getElementById(noteId);
        note = elem.querySelector(".note-content");
        destroyButton = elem.querySelector(".note-destroy");
        note.removeEventListener("click", onUpdateNote);
        destroyButton.removeEventListener("click", onRemoveNote);
        //removing from DOM
        liToRemove = elem.parentNode;
        liToRemove.parentNode.removeChild(liToRemove);
    }

    //remove a note
    function onRemoveNote(event) {
        var noteId = event.target.parentElement.parentElement.id;
        removeNoteById(noteId);
    }

    //subscribe a note
    function subscribeNote(noteId) {
        var note, noteContent, destroyButton;
        note = document.getElementById(noteId);
        noteContent = note.querySelector(".note-content");
        destroyButton = note.querySelector(".note-destroy");
        noteContent.addEventListener("click", onUpdateNote);
        destroyButton.addEventListener("click", onRemoveNote);
    }

    function onKeyPressHandler(e) {
        //adding a new note
        var newNoteEl, count, newNote,
            event = e || window.event,
            charCode = event.which || event.keyCode;
        if (localStorage["notebook.maxCount"] === undefined) {
            localStorage["notebook.maxCount"] = 0;
        }
        count = parseInt(localStorage["notebook.maxCount"], 10) + 1;
        if (charCode === 13) {
            //getting the content of input
            newNote = document.getElementById("new-note").value;
            //saving new note to local Storage
            localStorage["notebook.note" + count] = newNote;
            localStorage["notebook.maxCount"] = parseInt(localStorage["notebook.maxCount"], 10) + 1;
            //removing the content of input
            document.getElementById("new-note").value = '';
            //adding new note to DOM
            newNoteEl = document.createElement("li");
            newNoteEl.innerHTML =
                "<div class='note' id='notebook.note" + count + "'>" +
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
            subscribeNote("notebook.note" + count);
            return false;
        }
    }

    /**
     * subscribe the initial list of notes
     */
    function subscribe() {
        //subscribe the new-note input
        document.getElementById("new-note").addEventListener("keypress", onKeyPressHandler);
        //subscribe all the notes
        notes = document.querySelectorAll(".note");
        for (i = 0; i < notes.length; i = i + 1) {
            subscribeNote(notes[i].id);
        }
    }

    window.addEventListener("load", function () {
        init();
        subscribe();
    });


})();