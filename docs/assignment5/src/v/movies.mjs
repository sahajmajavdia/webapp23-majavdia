 import Person from "../m/Person.mjs";
 import Movie from "../m/Movie.mjs";
 import { fillSelectWithOptions, createListFromMap, createMultipleChoiceWidget }
     from "../../lib/util.mjs";
 // Retrieve all Person and Movie instances
 Person.retrieveAll();
 Movie.retrieveAll();
  // Attach event listeners to all "back-to-menu" buttons
 for (const btn of document.querySelectorAll("button.back-to-menu")) {
   btn.addEventListener("click", function() {refreshManageDataUI();});
 }
  // Prevent the default form submission behavior for all forms and reset them
 for (const frm of document.querySelectorAll("section > form")) {
   frm.addEventListener("submit", function (e) {
     e.preventDefault();
     frm.reset();
   });
 }
 window.addEventListener("beforeunload", function () {
  Movie.saveAll();
 });
  // Attach event listener to the "Retrieve and List All Movies" button
 document.getElementById("moviesRetrieveAndListAll")
     .addEventListener("click", function () {
      document.getElementById("Movie-M").style.display = "none";// Hide the "Manage Movies" section and display the "List All Movies" section
      document.getElementById("Movie-R").style.display = "block";
   const tableBodyEl = document.querySelector("section#Movie-R > table > tbody");
   tableBodyEl.innerHTML = "";  // drop old content
  // Iterate over all Movie instances and add them to the table
   for (const key of Object.keys( Movie.instances)) {
     const movie = Movie.instances[key];
     const actListEl = createListFromMap( movie.actors, "name");
     const row = tableBodyEl.insertRow();
     row.insertCell().textContent = movie.movieId;
     row.insertCell().textContent = movie.title;
     row.insertCell().textContent = movie.releaseDate;
     row.insertCell().textContent = movie.director.name;
     row.insertCell().appendChild( actListEl);
   }
   document.getElementById("Movie-M").style.display = "none";
   document.getElementById("Movie-R").style.display = "block";
 });
  // Get references to the form elements in the "Create Movie" section
 const createFormEl = document.querySelector("section#Movie-C > form"),
       selectDirectorEl = createFormEl.selectDirector,
       selectActorsEl = createFormEl.selectActors;
 document.getElementById("Create").addEventListener("click", function () {
// Fill the "Select Director" and "Select Actors" select elements with Person instances
   fillSelectWithOptions( selectDirectorEl, Person.instances, "personId", { displayProp: "name" });
   fillSelectWithOptions( selectActorsEl, Person.instances,"personId", {displayProp: "name"});
   document.getElementById("Movie-M").style.display = "none";
   document.getElementById("Movie-C").style.display = "block";
// Reset the form
   createFormEl.reset();
 });
 // Attach event listeners to form input elements to validate their values
 createFormEl.movieId.addEventListener("input", function () {
   createFormEl.movieId.setCustomValidity(
       Movie.checkMovieIdAsId( createFormEl.movieId.value).message);
 });
 createFormEl.title.addEventListener("input", function () {
   createFormEl.title.setCustomValidity(
       Movie.checkTitle( createFormEl["title"].value).message);
 });
 createFormEl.releaseDate.addEventListener("input", function () {
   createFormEl.releaseDate.setCustomValidity(
       Movie.checkReleaseDate( createFormEl["releaseDate"].value).message);
 });
 createFormEl.selectDirector.addEventListener("input", function () {
  createFormEl.selectDirector.setCustomValidity(
      Movie.checkDirector(createFormEl["selectDirector"].value).message);
});
 // Attach event listener to the "Create Movie" button in the form
 createFormEl["commit"].addEventListener("click", function () {
   const slots = {
     movieId: createFormEl.movieId.value,
     title: createFormEl.title.value,
     releaseDate: createFormEl.releaseDate.value,
     director: createFormEl.selectDirector.value,
     actorIdRefs: []
   };
   createFormEl.movieId.setCustomValidity(
       Movie.checkMovieIdAsId( slots.movieId).message);
   createFormEl.title.setCustomValidity(
       Movie.checkTitle( slots.title).message);
   createFormEl.releaseDate.setCustomValidity(
       Movie.checkReleaseDate( slots.releaseDate).message);  
       createFormEl.selectDirector.setCustomValidity(
        Movie.checkDirector(slots.director).message);
   // get the list of selected actors
   const selActOptions = createFormEl.selectActors.selectedOptions;
   // save the input data only if all form fields are valid
   if (createFormEl.checkValidity()) {
     for (const opt of selActOptions) {
       slots.actorIdRefs.push( opt.value);
     }
     Movie.add( slots);
   }
 });
 // get the necessary HTML elements for updating movie data
 const updateFormEl = document.querySelector("section#Movie-U > form");
 const updSelMovieEl = updateFormEl.selectMovie;
 document.getElementById("Update").addEventListener("click", function () {
   updSelMovieEl.innerHTML = "";
   fillSelectWithOptions( updSelMovieEl, Movie.instances,
       "movieId", {displayProp: "title"});
  // hide the view for movie management and show the form for updating movie data
   document.getElementById("Movie-M").style.display = "none";
   document.getElementById("Movie-U").style.display = "block";
   updateFormEl.reset();
 });
 updSelMovieEl.addEventListener("change", handleMovieSelectChangeEvent);
 // add an event listener for the select element for movies to be updated
 function handleMovieSelectChangeEvent() {
   const saveButton = updateFormEl.commit,
     selectActorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
     selectDirectorEl = updateFormEl.selectDirector,
     movieId = updateFormEl.selectMovie.value;
  // if a movie is selected, fill the form for updating movie data with the movie's data
   if (movieId !== "") {
     const movie = Movie.instances[movieId];
     updateFormEl.movieId.value = movie.movieId;
     updateFormEl.title.value = movie.title;
     updateFormEl.releaseDate.value = movie.releaseDate;
  // fill the select element for directors with all person instances
  fillSelectWithOptions( selectDirectorEl, Person.instances, "personId", {displayProp: "name"});
  // create a widget for selecting multiple actors, pre-selecting the movie's actors
  createMultipleChoiceWidget( selectActorsWidget, movie.actors,
         Person.instances, "personId", "name", 1);
  // set the selected director in the form
  updateFormEl.selectDirector.value = movie.director.personId;
     saveButton.disabled = false;
   } else {
  // if no movie is selected, reset the form for updating movie data and disable the save button
     updateFormEl.reset();
     updateFormEl.selectDirector.selectedIndex = 0;
     selectActorsWidget.innerHTML = "";
     saveButton.disabled = true;
   }
 }
 // handle Save button click events
 updateFormEl["commit"].addEventListener("click", function () {
   const movieIdRef = updSelMovieEl.value,
     selectActorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
     selectedActorsListEl = selectActorsWidget.firstElementChild;
   if (!movieIdRef) return;
   const slots = {
     movieId: updateFormEl.movieId.value,
     title: updateFormEl.title.value,
     releaseDate: updateFormEl.releaseDate.value,
     director: updateFormEl.selectDirector.value
   };
   // add event listeners for responsive validation
   updateFormEl.movieId.setCustomValidity(
       Movie.checkMovieIdAsId( slots.movieId).message);
   updateFormEl.title.setCustomValidity(
       Movie.checkTitle( slots.title).message);
   updateFormEl.releaseDate.setCustomValidity(
       Movie.checkReleaseDate( slots.releaseDate).message);
   updateFormEl.selectDirector.setCustomValidity(
        Movie.checkDirector(slots.director).message);
   if (updateFormEl.checkValidity()) {
     let actorIdRefsToAdd=[], actorIdRefsToRemove=[];
    // Loop through each selected actor in the selected actors list
     for (const actorItemEl of selectedActorsListEl.children) {
       if (actorItemEl.classList.contains("removed")) {
         actorIdRefsToRemove.push( actorItemEl.getAttribute("data-value"));
       }
       if (actorItemEl.classList.contains("added")) {
         actorIdRefsToAdd.push( actorItemEl.getAttribute("data-value"));
       }
     }
     if (actorIdRefsToRemove.length > 0) {
       slots.actorIdRefsToRemove = actorIdRefsToRemove;
     }
     if (actorIdRefsToAdd.length > 0) {
       slots.actorIdRefsToAdd = actorIdRefsToAdd;
     }
   }
     Movie.update( slots);
  // Update the selected movie option in the update form with the new title
  updSelMovieEl.options[updSelMovieEl.selectedIndex].text = slots.title;
  selectActorsWidget.innerHTML = "";
 });
 const deleteFormEl = document.querySelector("section#Movie-D > form");
 const delSelMovieEl = deleteFormEl.selectMovie;
 document.getElementById("Delete").addEventListener("click", function () {
   document.getElementById("Movie-M").style.display = "none";
   document.getElementById("Movie-D").style.display = "block";  
   delSelMovieEl.innerHTML = "";
   fillSelectWithOptions( delSelMovieEl, Movie.instances,
       "movieId", {displayProp: "title"});
   deleteFormEl.reset();
 });
  deleteFormEl["commit"].addEventListener("click", function () {
   const movieIdRef = delSelMovieEl.value;
   if (!movieIdRef) return;
   if (confirm("Do you really want to delete this movie?")) {
     Movie.destroy( movieIdRef);
     delSelMovieEl.remove( delSelMovieEl.selectedIndex);
   }
 });
 
 function refreshManageDataUI() {
 // Function to refresh the manage data UI to show the update movie UI element and hide the create, read, and delete movie UI elements
   document.getElementById("Movie-M").style.display = "block";
   document.getElementById("Movie-R").style.display = "none";
   document.getElementById("Movie-C").style.display = "none";
   document.getElementById("Movie-U").style.display = "none";
   document.getElementById("Movie-D").style.display = "none";
 }
 // Call the refreshManageDataUI function to set the initial UI state
 refreshManageDataUI();