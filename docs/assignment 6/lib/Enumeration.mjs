import { ConstraintViolation } from "./errorTypes.mjs";
// Defining the Enumeration constructor function
function Enumeration(enumArg) {
  var i = 0, lbl = "", LBL = "";
  if (Array.isArray(enumArg)) {
    if (!enumArg.every(function (n) {
      return (typeof (n) === "string");
    })) {
      throw new ConstraintViolation(
        "A list of enumeration labels must be an array of strings!");
    }
    this.labels = enumArg;
    this.enumLitNames = this.labels;
    this.codeList = null;
  } else if (typeof (enumArg) === "object" && Object.keys(enumArg).length > 0) {
    if (!Object.keys(enumArg).every(function (code) {
      return (typeof (enumArg[code]) === "string");
    })) {
      throw new ConstraintViolation(
        "All values of a code list map must be strings!");
    }
    this.codeList = enumArg;
    this.enumLitNames = Object.keys(this.codeList);
    this.labels = this.enumLitNames.map(function (c) {
      return enumArg[c] + " (" + c + ")";
    });
  } else {
    throw new ConstraintViolation(
      `Invalid Enumeration constructor argument: ${enumArg}`);
  }
  this.MAX = this.enumLitNames.length;
 // Assigning integer values to enumeration labels
 for (i = 1; i <= this.enumLitNames.length; i++) {
    lbl = this.enumLitNames[i - 1].replace(/( |-)/g, "_");
    LBL = lbl.split("_").map(function (lblPart) {
      return lblPart.toUpperCase();
    }).join("_");
    this[LBL] = i;
  }
  Object.freeze(this);
}
// Adding a toString method to the Enumeration prototype
Enumeration.prototype.toString = function (a) {
  return a.map(function (enumInt) {
    return this.enumLitNames[enumInt - 1];
  }, this).join(", ");
}
export { Enumeration };
