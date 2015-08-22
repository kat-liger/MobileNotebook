(function() {

    var notesContents,  destroyButtons, count;



        //filling the list of notes
        for (var i = 0; i < localStorage.length; i++) {
            var notesListEl = document.createElement("li");
            var noteText = localStorage.getItem(localStorage.key(i));
            if (localStorage.key(i) !== "notebook.maxCount") {
                notesListEl.innerHTML = "<div id='" + localStorage.key(i) + "'><div><label class='note-content'>" + noteText +
                    "</label><button class='note-destroy'></button></div><div class='hidden'><input class='edit-note' type='text' value='" +
                    noteText + "'></input></div></div>";
                document.getElementById('notes').appendChild(notesListEl);
            }
        }


        //adding a new note
        document.getElementById('new-note').onkeypress = function (e) {
            var event = e || window.event;
            var charCode = event.which || event.keyCode;

            if (localStorage["notebook.maxCount"] === undefined) {
                localStorage["notebook.maxCount"] = 0;
            }

            count = parseInt(localStorage["notebook.maxCount"]) + 1;

            if (charCode == '13') {

                //getting the content of input
                var newNote = document.getElementById('new-note').value;

                //saving new note to local Storage
                localStorage["notebook.note" + count] = newNote;
                localStorage["notebook.maxCount"]++;

                console.log("Added the following note to localStorage " + newNote);

                //removing the content of input
                document.getElementById('new-note').value = '';

                //adding new note to DOM
                var newNoteEl = document.createElement("li");

                newNoteEl.innerHTML = "<div id='notebook.note" + count +
                    "'><div><label class='note-content'>" + newNote + "</label><button class='note-destroy'></button>"+
                    "</div><div class='hidden'><input class='edit-note' type='text' value='"+
                    newNote+"'></input></div></div>";


                document.getElementById('notes').appendChild(newNoteEl);

                //making sure that the newly added div listens to events
                updateState();

                return false;
            }
        }



    //updating the existing note
    function updateNote(noteId) {

        console.log("We will be editing the note with id "+noteId);

        var divToUpdate = document.getElementById(noteId);
        divToUpdate.firstChild.setAttribute("class", "hidden");
        divToUpdate.lastChild.classList.remove("hidden");
        divToUpdate.lastChild.querySelector('.edit-note').focus();

        divToUpdate.onkeypress = function(e) {

            var event = e || window.event;
            var charCode = event.which || event.keyCode;

            if (charCode == '13') {
                inputToNote(noteId);
            }

        }

        divToUpdate.lastChild.querySelector('.edit-note').onblur= function(e) {

            inputToNote(noteId);
        }

    }

    //replace content of note with content of input when editing
    function inputToNote(noteId) {
        var divToUpdate = document.getElementById(noteId);
        //getting the content of input
        var newText = divToUpdate.lastChild.querySelector('.edit-note').value;
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

    //updating the state of the list of notes
    function updateState() {

        notesContents = document.querySelectorAll(".note-content");
        for (var i = 0; i < notesContents.length; i++) {
            var elem = notesContents[i];
            elem.addEventListener('click', (function (elem) {
                return function () {
                    console.log("Update state called on the note with id " + elem.parentElement.parentElement.id);
                    updateNote(elem.parentElement.parentElement.id);
                }
            })(elem));
        }


        destroyButtons = document.querySelectorAll(".note-destroy");
        for (var z = 0; z < destroyButtons.length; z++) {
            var elem = destroyButtons[z];
            elem.addEventListener('click', (function (elem) {
                return function () {

                    console.log("Deleting the note with id " + elem.parentNode.parentNode.id);
                    //removing from local storage
                    localStorage.removeItem(elem.parentNode.parentNode.id);
                    //removing from DOM
                    var toRemove = document.getElementById(elem.parentNode.parentNode.id);
                    toRemove.parentNode.removeChild(toRemove);

                }
            })(elem));
        }
    }

    updateState();


})();