import Person from "./Person.mjs";
import {cloneObject} from "../../lib/util.mjs";
import {NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, UniquenessConstraintViolation}
  from "../../lib/errorTypes.mjs";
// class representing a Movie object
class Movie {
  // ES6 function parameter
  constructor ({movieId, title, releaseDate, director, director_id, actors, actorIdRefs}) {
    this.movieId = movieId;   // initialize movie properties
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
    var validationResult = Movie.checkMovieId( movieId);  // check that movieId is unique
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
    var validationResult = Movie.checkMovieIdAsId( n); // set movieId with validation
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
          'A title must be provided!');
    } else if (!(typeof(t) === 'string' && t.trim() !== '')) {
      return new RangeConstraintViolation(
          'The title must be a non-empty string!');
    } else {
      return new NoConstraintViolation();
    }
  };
  set title( t) {
    const validationResult = Movie.checkTitle( t);
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
          'A release date must be provided!');
    } else {
      return new NoConstraintViolation();
    }
  };
  set releaseDate( d) {
    const validationResult = Movie.checkReleaseDate( d);
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
    var validationResult = null;  // validate director name
    if (!director_id) {
      validationResult = new MandatoryValueConstraintViolation(
        'A director must be specified!');
    } else {
      validationResult = Person.checkPersonIdAsIdRef( director_id);
    }
    return validationResult;
  }
  // Setters and getters for the properties
  set director( d) {
    const director_id = (typeof d !== "object") ?  d : d.personId;
  // Check if the director is valid using the checkDirector method of the Movie class  
    const validationResult = Movie.checkDirector( director_id);
    if (validationResult instanceof NoConstraintViolation) {
      if (this._director) {
        delete this._director.directedMovies[this._movieId]}
      this._director = Person.instances[director_id];
      this._director.directedMovies[this._movieId] = this;
    } else {
      throw validationResult;
    }
  }
  get actors() {   // Getter for the actors property
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
    const validationResult = Movie.checkActor( actor_id);
    if (actor_id && validationResult instanceof NoConstraintViolation) {
      this._actors[actor_id] = Person.instances[actor_id];
      this._actors[actor_id].playedMovies[this._movieId] = this;
      } else {
        throw validationResult;
      }
  }
  removeActor( a) {
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.actorId;
    const validationResult = Movie.checkActor( actor_id);
    if (validationResult instanceof NoConstraintViolation) {
      delete this._actors[actor_id].playedMovies[this._movieId];      
      delete this._actors[actor_id];
      } else {
        throw validationResult;
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
      if (p.charAt(0) === "_") {
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
    if (director && String(movie.director.personId) !== director) {
      movie.director = Person.instances[director];
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
  const movie = Movie.instances[movieId];
  if (movie) {
    console.log(`${Movie.instances[movieId].toString()} deleted!`);
    if (movie.director) {
      delete movie.director.directedMovies[movieId];
    }
    for (const actorId of Object.keys(movie.actors)) {
      delete movie.actors[actorId].playedMovies[movieId];
    }
    delete Movie.instances[movieId];
  } else {
    console.log(`There is no movie with the ID ${movieId} in the database!`);
  }
};

Movie.retrieveAll = function () {
  var movies = {};
  try {
    if (!localStorage["movies"]) {
      localStorage.setItem("movies", JSON.stringify({}));
    } else {
      movies = JSON.parse( localStorage["movies"]);
      console.log(`${Object.keys( movies).length} movie records loaded.`);
    }
  } catch (e) {
    console.error( "Error when reading from Local Storage\n" + e);
  }
  for (const movieId of Object.keys( movies)) {
    try {
      Movie.instances[movieId] = new Movie( movies[movieId]);
    } catch (e) {
      console.error(`${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
    }
  }
};
Movie.saveAll = function () {
  const nmrOfMovies = Object.keys( Movie.instances).length;
  try {
    localStorage["movies"] = JSON.stringify( Movie.instances);
    console.log(`${nmrOfMovies} movies saved.`);
  } catch (e) {
    console.error( "Error when writing to Local Storage\n" + e);
  }
};

export default Movie;
