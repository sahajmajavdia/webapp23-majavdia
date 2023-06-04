import Director from "../m/Director.mjs";
import Movie from "../m/Movie.mjs";
import Actor from "../m/Actor.mjs";
import Person from "../m/Person.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs";

Person.retrieveAll();
Movie.retrieveAll();
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", refreshManageDataUI);
}
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
window.addEventListener("beforeunload", function () {
  Director.saveAll();
});

document.getElementById("RetrieveAndListAll")
  .addEventListener("click", function () {
    const tableBodyEl = document.querySelector(
      "section#Director-R > table > tbody"
    );
    tableBodyEl.innerHTML = "";
    for (const key of Object.keys(Director.instances)) {
      const director = Director.instances[key];
      const row = tableBodyEl.insertRow();
      row.insertCell().textContent = director.personId;
      row.insertCell().textContent = director.name;
    }
    document.getElementById("Director-M").style.display = "none";
    document.getElementById("Director-R").style.display = "block";
  });

const createFormEl = document.querySelector("section#Director-C > form");
document.getElementById("Create").addEventListener("click", function () {
  document.getElementById("Director-M").style.display = "none";
  document.getElementById("Director-C").style.display = "block";
  createFormEl.reset();
});
createFormEl.personId.addEventListener("input", function () {
  createFormEl.personId.setCustomValidity(
    Person.checkPersonIdAsId(createFormEl.personId.value, Director).message);
});
createFormEl.name.addEventListener("input", function () {
  createFormEl.name.setCustomValidity(
    Person.checkName(createFormEl.name.value).message
  );
});

createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    personId: createFormEl.personId.value,
    name: createFormEl.name.value,
  };
  createFormEl.personId.setCustomValidity(
    Person.checkPersonIdAsId(slots.personId).message, Director);
  createFormEl.name.setCustomValidity(
    Person.checkName(slots.name).message);
  if (createFormEl.checkValidity()) Director.add(slots);
});
createFormEl.personId.addEventListener("change", function () {
  const persId = createFormEl.personId.value;
  if (persId in Person.instances) {
    createFormEl.name.value = Person.instances[persId].name;
  }
});

const updateFormEl = document.querySelector("section#Director-U > form");
const updSelDirectorEl = updateFormEl.selectDirector;
document.getElementById("Update").addEventListener("click", function () {
  updSelDirectorEl.innerHTML = "";
  fillSelectWithOptions(updSelDirectorEl, Director.instances,
    "personId", { displayProp: "name" });
  document.getElementById("Director-M").style.display = "none";
  document.getElementById("Director-U").style.display = "block";
  updateFormEl.reset();
});
updSelDirectorEl.addEventListener("change", handleDirectorSelectChangeEvent);
updateFormEl["commit"].addEventListener("click", function () {
  const directorIdRef = updSelDirectorEl.value;
  if (!directorIdRef) return;
  const slots = {
    personId: updateFormEl.personId.value,
    name: updateFormEl.name.value,
  };
  updateFormEl.name.setCustomValidity(
    Person.checkName(slots.name).message);
  if (updateFormEl.checkValidity()) {
    Director.update(slots);
    updSelDirectorEl.options[updSelDirectorEl.selectedIndex].text = slots.name;
  }
});
function handleDirectorSelectChangeEvent() {
  const key = updSelDirectorEl.value;
  if (key) {
    const auth = Director.instances[key];
    updateFormEl.personId.value = auth.personId;
    updateFormEl.name.value = auth.name;
  } else {
    updateFormEl.reset();
  }
}
const deleteFormEl = document.querySelector("section#Director-D > form");
const delSelDirectorEl = deleteFormEl.selectDirector;
document.getElementById("Delete").addEventListener("click", function () {
  delSelDirectorEl.innerHTML = "";
  fillSelectWithOptions(delSelDirectorEl, Director.instances,
    "personId", { displayProp: "name" });
  document.getElementById("Director-M").style.display = "none";
  document.getElementById("Director-D").style.display = "block";
  deleteFormEl.reset();
});
deleteFormEl["commit"].addEventListener("click", function () {
  const personId = delSelDirectorEl.value;
  if (!personId) return;
  if (confirm("Do you really want to delete this director?")) {
    for (const actorId of Object.keys(Actor.instances)) {
      const actor = Actor.instances[actorId];
      if (actor.agent && parseInt(personId) === actor.agent.personId) {
        actor.agent = null;
        console.log(`Deleted actor agent reference ${personId}`);
      }
    }
    Actor.saveAll();
    for (const movieId of Object.keys(Movie.instances)) {
      const movie = Movie.instances[movieId];
      if (parseInt(personId) === movie.director.personId) {
        delete Movie.instances[movieId];
        console.log(`Deleted movie ${movieId}`);
      }
      if (personId in movie.actors) {
        console.log(`Deleted movie actor reference ${personId}`);
        delete movie.actors[personId];
      }
    }
    Movie.saveAll();
    Director.destroy(personId);
    delSelDirectorEl.remove(delSelDirectorEl.selectedIndex);
  }
});

function refreshManageDataUI() {
  document.getElementById("Director-M").style.display = "block";
  document.getElementById("Director-R").style.display = "none";
  document.getElementById("Director-C").style.display = "none";
  document.getElementById("Director-U").style.display = "none";
  document.getElementById("Director-D").style.display = "none";
}
refreshManageDataUI();
