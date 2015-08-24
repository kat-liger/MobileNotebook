/*global localStorage,window,document*/

(function () {
    "use strict";
    var i, notes,
        //the maximum allowed length of note
        maxLength = 800;

    /**
     * Show the list of notes stored in local storage (the most recent go first)
     */
    function init() {
        var notesListEl, noteText;
        //filling the list of notes
        for (i = localStorage.length - 1; i >= 0; i = i - 1) {
            notesListEl = document.createElement("li");
            noteText = localStorage.getItem(localStorage.key(i));
            //our list of notes should only contain those values from local storage, whose keys start with "note"
            if (localStorage.key(i).substring(0, 4) === "note") {
                notesListEl.innerHTML =
                    "<div class='note' id='" + localStorage.key(i) + "'>" +
                        "<div>" +
                            "<label class='note-content'>" + noteText + "</label>" +
                            "<button class='note-destroy'></button>" +
                        "</div>" +
                        "<div class='hidden'>" +
                            "<input class='edit-note' type='text' maxlength='" + maxLength + "' value='" + noteText + "'></input>" +
                        "</div>" +
                    "</div>";
            document.getElementById("notes").appendChild(notesListEl);
            }
        }
    }

    /**
     * Replace content of note with the content of input when edit is finished
     * @param {string} noteId - the id of the note in local storage database
     */
    function inputToNote(noteId) {
        var divToUpdate = document.getElementById(noteId), newText;
        if (!divToUpdate) { return; }
        //getting the content of input
        newText = divToUpdate.lastChild.querySelector(".edit-note").value;
        //proceeding only if input is not empty and doesn't contain only whitespaces
        if (/\S/.test(newText)) {
            //trimming the note content to acceptable length
            newText = newText.substring(0, maxLength);
            //updating note value in local storage
            localStorage.setItem(noteId, newText);
            //updating the label content, making input hidden and label visible
            divToUpdate.firstChild.querySelector(".note-content").textContent = newText;
            divToUpdate.firstChild.classList.remove("hidden");
            divToUpdate.lastChild.setAttribute("class", "hidden");
        } else {
            //remove the note
            removeNoteById(noteId);
        }
    }

    /**
     * Update the existing note
     * @param {event} e - the event that happens when the note content is clicked
     */
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

    /**
     * Remove the existing note by its id
     * @param {string} noteId - the id of the note in local storage database
     */
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

    /**
     * Start removing the note by calling removeNoteById
     * @param {event} e - the event that happens when the delete button is clicked
     */
    function onRemoveNote(event) {
        var noteId = event.target.parentElement.parentElement.id;
        removeNoteById(noteId);
    }

    /**
     * Subscribe a note to click events using its id: we use it on load for existing notes
     * and then every time when a new note is created
     * @param {string} noteId - the id of the note in local storage database
     */
    function subscribeNote(noteId) {
        var note, noteContent, destroyButton;
        note = document.getElementById(noteId);
        noteContent = note.querySelector(".note-content");
        destroyButton = note.querySelector(".note-destroy");
        noteContent.addEventListener("click", onUpdateNote);
        destroyButton.addEventListener("click", onRemoveNote);
    }

    /**
     * Create a new note
     * @param {event} e - the event that happens when enter is pressed on new-note input
     */
    function onKeyPressHandler(e) {
        var newNoteEl, newNote, list,
            event = e || window.event,
            charCode = event.which || event.keyCode,
            count = Date.now();
        if (charCode === 13) {
            //getting the content of input
            newNote = document.getElementById("new-note").value;
            //trimming the note content to acceptable length
            newNote = newNote.substring(0, maxLength);
            //saving new note to local Storage
            localStorage["note" + count] = newNote;
            //removing the content of input
            document.getElementById("new-note").value = '';
            //adding new note to DOM
            newNoteEl = document.createElement("li");
            newNoteEl.innerHTML =
                "<div class='note' id='note" + count + "'>" +
                    "<div>" +
                        "<label class='note-content'>" + newNote + "</label>" +
                        "<button class='note-destroy'></button>" +
                    "</div>" +
                    "<div class='hidden'>" +
                        "<input class='edit-note' type='text' maxlength='" + maxLength + "' value='" + newNote + "'></input>" +
                    "</div>" +
                "</div>";
            list =  document.getElementById("notes");
            if (list.firstChild) {
                list.insertBefore(newNoteEl, list.firstChild);
            } else {
                list.appendChild(newNoteEl);
            }
            //after adding a new note input loses focus
            document.getElementById("new-note").blur();
            //making sure that the newly added div listens to events
            subscribeNote("note" + count);
        }
    }

    /**
     * Subscribe the initial list of notes to events
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

    /**
     * The initial actions made after app is loaded
     */
    window.addEventListener("load", function () {
        init();
        subscribe();
    });


})();