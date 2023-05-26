 import Person from "../m/Person.mjs";
 import Movie from "../m/Movie.mjs";
 import { fillSelectWithOptions, createListFromMap } from "../../lib/util.mjs";
  // Retrieve all Person and Movie instances
 Person.retrieveAll();
 Movie.retrieveAll();
 // Attach event listeners to all "back-to-menu" buttons
 for (const btn of document.querySelectorAll("button.back-to-menu")) {
   btn.addEventListener('click', function () {refreshManageDataUI();});
 }
  // Prevent the default form submission behavior for all forms and reset them
 for (const frm of document.querySelectorAll("section > form")) {
   frm.addEventListener("submit", function (e) {
     e.preventDefault();
     frm.reset();
   });
 }
 // This code adds an event listener to the window that triggers a saveAll function
 window.addEventListener("beforeunload", function () {
   Person.saveAll();
   Movie.saveAll();
 });
 // This code adds an event listener to a button with id "RetrieveAndListAll" that retrieves and displays all Person instances in a table
 document.getElementById("RetrieveAndListAll")
     .addEventListener("click", function () {
   const tableBodyEl = document.querySelector("section#Person-R > table > tbody");
   tableBodyEl.innerHTML = "";
   for (const key of Object.keys( Person.instances)) {
     const person = Person.instances[key];
     const row = tableBodyEl.insertRow();
     row.insertCell().textContent = person.personId;
     row.insertCell().textContent = person.name;
     const listDir = createListFromMap(person.directedMovies, "title");
     row.insertCell().appendChild(listDir);
     const listAct = createListFromMap(person.playedMovies, "title");
     row.insertCell().appendChild(listAct);
   }
   document.getElementById("Person-M").style.display = "none";
   document.getElementById("Person-R").style.display = "block";
 });
 // This code sets up the form for creating a new Person instance
 const createFormEl = document.querySelector("section#Person-C > form");
 document.getElementById("Create").addEventListener("click", function () {
   document.getElementById("Person-M").style.display = "none";
   document.getElementById("Person-C").style.display = "block";
   createFormEl.reset();
 });
 // validates user input for a new Person's id
 createFormEl.personId.addEventListener("input", function () {
   createFormEl.personId.setCustomValidity(
       Person.checkPersonIdAsId( createFormEl.personId.value).message);
 });
  // validates user input for a new Person's name
 createFormEl.name.addEventListener("input", function () {
   createFormEl.name.setCustomValidity(
       Person.checkName( createFormEl.name.value).message);
 });
 // Adds a new Person instance to the system when the user clicks the "commit" button on the create form
 createFormEl["commit"].addEventListener("click", function () {
   const slots = {
     personId: createFormEl.personId.value,
     name: createFormEl.name.value
   };
   createFormEl.personId.setCustomValidity(
       Person.checkPersonIdAsId( slots.personId).message);
   
   createFormEl.name.setCustomValidity(
       Person.checkName( slots.name).message);
 
   if (createFormEl.checkValidity()) Person.add( slots);
 });
  // Sets up the form for updating an existing Person instance
 const updateFormEl = document.querySelector("section#Person-U > form");
 const updSelPersonEl = updateFormEl.selectPerson;
 document.getElementById("Update").addEventListener("click", function () {
   document.getElementById("Person-M").style.display = "none";
   document.getElementById("Person-U").style.display = "block";
   fillSelectWithOptions( updSelPersonEl, Person.instances,
       "personId", {displayProp:"name"});
   updateFormEl.reset();
 });
 updSelPersonEl.addEventListener("change", handlePersonSelectChangeEvent);
 // Updates an existing Person instance when the user clicks the "commit" button on the update form
 updateFormEl["commit"].addEventListener("click", function () {
   const personIdRef = updSelPersonEl.value;
   if (!personIdRef) return;
   const slots = {
     personId: updateFormEl.personId.value,
     name: updateFormEl.name.value
   }
   updateFormEl.personId.setCustomValidity( Person.checkPersonIdAsId( slots.personId).message);
   updateFormEl.name.setCustomValidity(
     Person.checkName( slots.name).message);
   if (updSelPersonEl.checkValidity()) {
     Person.update( slots);
     updSelPersonEl.options[updSelPersonEl.selectedIndex].text = slots.name;
   }
 });
 function handlePersonSelectChangeEvent () {
   var key = updateFormEl.selectPerson.value;
   var per = null;
   if (key) {
     per = Person.instances[key];
     updateFormEl.personId.value = per.personId;
     updateFormEl.name.value = per.name;
   } else {
     updateFormEl.reset();
   }
 }
 
 const deleteFormEl = document.querySelector("section#Person-D > form");
 const delSelPersonEl = deleteFormEl.selectPerson;
 document.getElementById("Delete").addEventListener("click", function () {
   fillSelectWithOptions( delSelPersonEl, Person.instances,
     "personId", {displayProp:"name"});  
   document.getElementById("Person-M").style.display = "none";
   document.getElementById("Person-D").style.display = "block";
   deleteFormEl.reset();
 });
 deleteFormEl["commit"].addEventListener("click", function () {
   const personIdRef = delSelPersonEl.value;
   if (!personIdRef) return;
   if (confirm("Do you really want to delete this person?")) {
     Person.destroy( personIdRef);
     delSelPersonEl.remove( delSelPersonEl.selectedIndex);
   }
 });
 // Function to refresh the manage data UI to show the update movie UI element and hide the create, read, and delete movie UI elements
 function refreshManageDataUI() {
   document.getElementById("Person-M").style.display = "block";
   document.getElementById("Person-R").style.display = "none";
   document.getElementById("Person-C").style.display = "none";
   document.getElementById("Person-U").style.display = "none";
   document.getElementById("Person-D").style.display = "none";
 }
 // Call the refreshManageDataUI function to set the initial UI state
  refreshManageDataUI();