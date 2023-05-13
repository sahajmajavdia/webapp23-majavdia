import Person from "./Person.mjs";
import {cloneObject} from "../../lib/util.mjs";
import {NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation}
  from "../../lib/errorTypes.mjs";
// class representing a Movie object
class Movie {
  constructor ({movieId, title, releaseDate, director, director_id, actors, actorIdRefs}) {
    this.movieId = movieId;    // initialize movie properties
    this.title = title;
    this.releaseDate = releaseDate;
    this.actors = actors || actorIdRefs;
    this.director = director || director_id;
  }
// getters and setters for movie properties with validation
  get movieId() {
    return this._movieId;
  }
  static checkMovieId( movieId) {
    if (!movieId) return new NoConstraintViolation();    // validate movieId
    else if (!(typeof(movieId) === 'number' && Number.isInteger(movieId) && movieId > 0 ||
    typeof(movieId) === 'string' && movieId.search(/^-?[0-9]+$/) === 0 && movieId > 0)) {
      return new RangeConstraintViolation(
          "The movie ID must be a Positive Integer!");
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkMovieIdAsId( movieId) {
    var validationResult = Movie.checkMovieId( movieId);    // check that movieId is unique
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!movieId) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for Movie ID must be provided!");
      } else if (Movie.instances[movieId]) {
        validationResult = new UniquenessConstraintViolation(
            `There is already a movie with ID ${movieId}`);
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set movieId( n) {
    const validationResult = Movie.checkMovieIdAsId( n);    // set movieId with validation
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = n;
    } else {
      throw validationResult;
    }
  }
  get title() {
    return this._title;
  }
  static checkTitle(t) {
    if (!t) {
      return new MandatoryValueConstraintViolation(
          'A title must be provided!');    // validate title
    } else if (!(typeof(t) === 'string' && t.trim() !== '')) {
      return new RangeConstraintViolation(
          'The title must be a non-empty string!');
    } else {
      return new NoConstraintViolation();
    }
  };
  set title( t) {
    const validationResult = Movie.checkTitle( t);    // set title with validation
    if (validationResult instanceof NoConstraintViolation) {
      this._title = t;
    } else {
      throw validationResult;
    }
  }
  get releaseDate() {
    return this._releaseDate;
  }
  static checkReleaseDate(d) {
    if (!d) {
      return new MandatoryValueConstraintViolation(
          'A release date must be provided!');    // validate release date
    } else {
      return new NoConstraintViolation();
    }
  };
  set releaseDate( d) {
    const validationResult = Movie.checkReleaseDate( d);    // set release date with validation
    if (validationResult instanceof NoConstraintViolation) {
      this._releaseDate = d;
    } else {
      throw validationResult;
    }
  }
  get director() {
    return this._director;
  }
  static checkDirector( director_id) {
    var validationResult = null;    // validate director name
    if (!director_id) {
      validationResult = new MandatoryValueConstraintViolation(
        'A director must be specified!');
    } else {
      validationResult = Person.checkName( director_id);
    }
    return validationResult;
  }
  // Setters and getters for the properties
  set director( d) {
    const director_id = (typeof d !== "object") ?  d : d.name;
  // Check if the director is valid using the checkDirector method of the Movie class  
    const validationResult = Movie.checkDirector( director_id);
    if (validationResult instanceof NoConstraintViolation) {
      this._director = director_id;
    } else {
      throw validationResult;
    }
  }
  get actors() {  // Getter for the actors property
    return this._actors;
  }
  // Static method to check if an actor is valid
  static checkActor( actor_id) {
    var validationResult = null;
    if (!actor_id) {
      validationResult = new NoConstraintViolation();
    } else {
      validationResult = Person.checkPersonIdAsIdRef( actor_id);
    }
    return validationResult;
  }
  // Method to add an actor to the movie
  addActor( a) {
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.personId;
    if (actor_id) {
      const validationResult = Movie.checkActor( actor_id);
      if (actor_id && validationResult instanceof NoConstraintViolation) {
        const key = String( actor_id);
        this._actors[key] = Person.instances[key];
      } else {
        throw validationResult;
      }
    }
  }
  removeActor( a) {
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.actorId;
    if (actor_id) {
      const validationResult = Movie.checkActor( actor_id);
      if (validationResult instanceof NoConstraintViolation) {
        delete this._actors[String( actor_id)];
      } else {
        throw validationResult;
      }
    }
  }
  set actors( a) {
    this._actors = {};
    if (Array.isArray(a)) {  
      for (const idRef of a) {
        this.addActor( idRef);
      }
    } else {  
      for (const idRef of Object.keys( a)) {
        this.addActor( a[idRef]);
      }
    }
  }
  toString() {
    var movieStr = `Movie{ Movie ID: ${this.movieId}, title: ${this.title}, releaseDate: ${this.releaseDate}, director: ${this.director.name}`;
    return `${movieStr}, actors: ${Object.keys( this.actors).join(",")} }`;
  }
  toJSON() { 
    var rec = {};
    for (const p of Object.keys( this)) {
      if (p.charAt(0) !== "_") continue;
      switch (p) {
        case "_director":
          rec.director = this._director;
          break;
        case "_actors":
          rec.actorIdRefs = [];
          for (const actorIdStr of Object.keys( this.actors)) {
            rec.actorIdRefs.push( parseInt( actorIdStr));
          }
          break;
        default:
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }
}
Movie.instances = {};
Movie.add = function (slots) {
  try {
    const movie = new Movie( slots);
    Movie.instances[movie.movieId] = movie;
    console.log(`Movie record ${movie.toString()} created!`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};
Movie.update = function ({movieId, title, releaseDate, director,
    actorIdRefsToAdd, actorIdRefsToRemove }) {
  const movie = Movie.instances[movieId],
        objectBeforeUpdate = cloneObject( movie);
  var noConstraintViolated=true, updatedProperties=[];
  try {
    if (title && movie.title !== title) {
      movie.title = title;
      updatedProperties.push("title");
    }
    if (releaseDate && movie.releaseDate !== releaseDate) {
      movie.releaseDate = releaseDate;
      updatedProperties.push("releaseDate");
    }
    if (director && movie.director !== director) {
      movie.director = director;
      updatedProperties.push("director");
    }
    if (actorIdRefsToAdd) {
      updatedProperties.push("actors(added)");
      for (const actorIdRef of actorIdRefsToAdd) {
        movie.addActor( actorIdRef);
      }
    }
    if (actorIdRefsToRemove) {
      updatedProperties.push("actors(removed)");
      for (const actor_id of actorIdRefsToRemove) {
        movie.removeActor( actor_id);
      }
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    Movie.instances[movieId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for movie ${movieId}`);
    } else {
      console.log(`No property value changed for movie ${movie.movieId}!`);
    }
  }
};
Movie.destroy = function (movieId) {
  if (Movie.instances[movieId]) {
    console.log(`${Movie.instances[movieId].toString()} deleted!`);
    delete Movie.instances[movieId];
  } else {
    console.log(`There is no movie with the ID ${movieId} in the database!`);
  }
};
Movie.retrieveAll = function () {
  var movies = {};
  try {
    if (!localStorage["movies"]) 
      localStorage["movies"] = "{}";
    else {
      movies = JSON.parse( localStorage["movies"]);
      console.log(`${Object.keys( movies).length} movie records loaded.`);
    }
  } catch (e) {
    alert( "Error when reading from Local Storage\n" + e);
  }
  for (const movieId of Object.keys( movies)) {
    try {
      Movie.instances[movieId] = new Movie( movies[movieId]);
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
    }
  }
};
Movie.saveAll = function () {
  const nmrOfMovies = Object.keys( Movie.instances).length;
  try {
    localStorage["movies"] = JSON.stringify( Movie.instances);
    console.log(`${nmrOfMovies} movie records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};

export default Movie;
