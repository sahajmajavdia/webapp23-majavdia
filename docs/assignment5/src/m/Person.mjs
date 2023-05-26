import Movie from "./Movie.mjs";
import { cloneObject } from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, UniquenessConstraintViolation,
  ReferentialIntegrityConstraintViolation }
  from "../../lib/errorTypes.mjs";

class Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({personId, name}) {
    // assign properties by invoking implicit setters
    this.personId = personId; 
    this.name = name;
    this._directedMovies = {};
    this._playedMovies = {};
  }
  get personId() {
    return this._personId;
  }
  static checkPersonId( id) {
    if (!id) {
      return new NoConstraintViolation();
    } else {
      id = parseInt( id);  
      if (isNaN( id) || !Number.isInteger( id) || id < 1) {
        return new RangeConstraintViolation("The person ID must be a positive integer!");
      } else {
        return new NoConstraintViolation();
      }
    }
  }
  static checkPersonIdAsId( id) {
    var constraintViolation = Person.checkPersonId(id);
    if ((constraintViolation instanceof NoConstraintViolation)) {
      id = parseInt(id);
      if (isNaN(id)) {
        return new MandatoryValueConstraintViolation(
            "A positive integer value for the person ID is required!");
      } else if (Person.instances[id]) {  // convert to string if number
        constraintViolation = new UniquenessConstraintViolation(
            "There is already a person record with this person ID!");
      } else {
        constraintViolation = new NoConstraintViolation();
      }
    }
    return constraintViolation;
  }
  static checkPersonIdAsIdRef( id) {
    var constraintViolation = Person.checkPersonId( id);
    if ((constraintViolation instanceof NoConstraintViolation) && 
        id !== undefined) {
      if (!Person.instances[String(id)]) {
        constraintViolation = new ReferentialIntegrityConstraintViolation(
            "There is no person record with this person ID!");
      }
    }
    return constraintViolation;
  }
  set personId( id) {
    var constraintViolation = Person.checkPersonIdAsId( id);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._personId = parseInt( id);
    } else {
      throw constraintViolation;
    }
  }
  get name() {
    return this._name;
  }
  static checkName(n) {
    if (!n) {
      return new MandatoryValueConstraintViolation(
          'A name must be provided!');
    } else if (!(typeof(n) === 'string' && n.trim() !== '')) {
      return new RangeConstraintViolation(
          'The name must be a non-empty string!');
    } else {
      return new NoConstraintViolation();
    }
  };
  set name( n) {
    const validationResult = Person.checkName( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._name = n;
    } else {
      throw validationResult;
    }
  }

  get directedMovies() {
    return this._directedMovies;
  }

  get playedMovies() {
    return this._playedMovies;
  }

  toJSON() {  
    var rec = {};
    for (const p of Object.keys( this)) {
      if (p.charAt(0) === "_" && 
      p !== "_directedMovies" && 
      p !== "_playedMovies") rec[p.substr(1)] = this[p];
    }
    return rec;
  }
}
Person.instances = {};
Person.add = function (slots) {
  try {
    const person = new Person( slots);
    Person.instances[person.personId] = person;
    console.log(`Saved: ${person.name}`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};
Person.update = function ({personId, name}) {
  const person = Person.instances[String( personId)],
        objectBeforeUpdate = cloneObject( person);
  var noConstraintViolated=true, ending="", updatedProperties=[];
  try {
    if (name && person.name !== name) {
      person.name = name;
      updatedProperties.push("name");
    }
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    Person.instances[String(personId)] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log( `Propert${ending} ${updatedProperties.toString()} modified for person ${name}`);
    } else {
      console.log( `No property value changed for person ${name}!`);
    }
  }
};

Person.destroy = function (personId) {
  const person = Person.instances[personId];
  for (const movieId of Object.keys( person.directedMovies)) { 
    let movie = person.directedMovies[movieId];
    if (person === movie.director) Movie.destroy(movieId);
  }

  for (const movieId of Object.keys( person.playedMovies)) { 
    let movie = person.playedMovies[movieId];
    if (movie.actors[personId]) delete movie.actors[personId];
  }
  delete Person.instances[personId];
  console.log( `Person ${person.name} deleted.`);
  Person.saveAll();
  Movie.saveAll();
};

Person.retrieveAll = function () {
  var persons = {};
  if (!localStorage["persons"]) localStorage["persons"] = "{}";
  try {
    persons = JSON.parse( localStorage["persons"]);
  } catch (e) {
    console.log( "Error when reading from Local Storage\n" + e);
    persons = {};
  }
  for (const key of Object.keys( persons)) {
    try {
      // convert record to (typed) object
      Person.instances[key] = new Person( persons[key]);
    } catch (e) {
      console.log( `${e.constructor.name} while deserializing person ${key}: ${e.message}`);
    }
  }
  console.log( `${Object.keys( persons).length} person records loaded.`);
};

Person.saveAll = function () {
  const nmrOfPersons = Object.keys( Person.instances).length;
  try {
    localStorage["persons"] = JSON.stringify( Person.instances);
    console.log( `${nmrOfPersons} person records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};

export default Person;