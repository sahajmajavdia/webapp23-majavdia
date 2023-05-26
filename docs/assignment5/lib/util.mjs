function isNotIsoDateString( ds) {
  var dateArray = [], YYYY = 0, MM = 0, DD = 0;
  if (typeof( ds) !== "string") return "Date value must be a string!";
  dateArray = ds.split("-");
  if (dateArray.length < 3) return "Date string has less than 2 dashes!";
  YYYY = parseInt( dateArray[0]);
  MM = parseInt( dateArray[1]);
  DD = parseInt( dateArray[2]);
  if (!Number.isInteger(YYYY) || YYYY<1000 || YYYY>9999) return "YYYY out of range!";
  if (!Number.isInteger(MM) || MM<1 || MM>12) return "MM out of range!";
  if (!Number.isInteger(DD) || DD<1 || DD>31) return "MM out of range!";
  return "";
}
function createIsoDateString(d) {
  return d.toISOString().substring(0,10);
}
function createPushButton( txt) {
  var pB = document.createElement("button");
  pB.type = "button";
  if (txt) pB.textContent = txt;
  return pB;
}
function createOption( val, txt, classValues) {
  var el = document.createElement("option");
  el.value = val;
  el.text = txt;
  if (classValues) el.className = classValues;
  return el;
}
function createTimeElem(d) {
  var tEl = document.createElement("time");
  tEl.textContent = d.toLocaleDateString();
  tEl.datetime = d.toISOString();
  return tEl;
}
function createListFromMap( entTbl, displayProp) {
  var listEl = document.createElement("ul");
  fillListFromMap( listEl, entTbl, displayProp);
  return listEl;
}
function fillListFromMap( listEl, entTbl, displayProp) {
  listEl.innerHTML = "";
  for (const key of Object.keys( entTbl)) {
    let listItemEl = document.createElement("li");
    listItemEl.textContent = entTbl[key][displayProp];
    listEl.appendChild( listItemEl);
  }
}
function fillSelectWithOptions( selectEl, selectionRange, keyProp, optPar) {
  var optionEl = null, options = [], obj = null, displayProp = "";
  selectEl.innerHTML = "";
  if (!selectEl.multiple) {
    selectEl.add( createOption(""," --- "));
  }
  options = Object.keys( selectionRange);
  for (let i=0; i < options.length; i++) {
    obj = selectionRange[options[i]];
    if (optPar && optPar.displayProp) displayProp = optPar.displayProp;
    else displayProp = keyProp;
    optionEl = createOption( obj[keyProp], obj[displayProp]);
    if (selectEl.multiple && optPar && optPar.selection &&
        optPar.selection[keyProp]) {
      optionEl.selected = true;
    }
    selectEl.add( optionEl);
  }
}
function createMultipleChoiceWidget( widgetContainerEl, selection, selectionRange,
  keyProp, displayProp, minCard) {
var assocListEl = document.createElement("ul"), 
    selectEl = document.createElement("select"),
    el = null;
if (minCard === undefined) minCard = 0;  
widgetContainerEl.innerHTML = "";
if (!displayProp) displayProp = keyProp;
fillChoiceSet( assocListEl, selection, keyProp, displayProp);
assocListEl.addEventListener( 'click', function (e) {
  var listItemEl = null, listEl = null;
  if (e.target.tagName === "BUTTON") {  
    listItemEl = e.target.parentNode;
    listEl = listItemEl.parentNode;
    if (listEl.children.length <= minCard) {
      alert( "A book must have at least one author!");
      return;
    }
    if (listItemEl.classList.contains("removed")) {
      listItemEl.classList.remove("removed");
      e.target.textContent = "✕";
    } else if (listItemEl.classList.contains("added")) {
      listItemEl.parentNode.removeChild( listItemEl);
      const optionEl = createOption( listItemEl.getAttribute("data-value"),
          listItemEl.firstElementChild.textContent);
      selectEl.add( optionEl);
    } else {
      listItemEl.classList.add("removed");
      e.target.textContent = "undo";
    }
  }
});
widgetContainerEl.appendChild( assocListEl);
el = document.createElement("div");
el.appendChild( selectEl);
el.appendChild( createPushButton("add"));
selectEl.parentNode.addEventListener( 'click', function (e) {
  var assocListEl = e.currentTarget.parentNode.firstElementChild,
      selectEl = e.currentTarget.firstElementChild;
  if (e.target.tagName === "BUTTON") {  // add button
    if (selectEl.value) {
      addItemToChoiceSet( assocListEl, selectEl.value,
          selectEl.options[selectEl.selectedIndex].textContent, "added");
      selectEl.remove( selectEl.selectedIndex);
      selectEl.selectedIndex = 0;
    }
  }
});
widgetContainerEl.appendChild( el);
fillMultipleChoiceWidgetWithOptions( selectEl, selectionRange, keyProp,
    {"displayProp": displayProp, "selection": selection});
}
function fillMultipleChoiceWidgetWithOptions( selectEl, selectionRange, keyProp, optPar) {
var options = [], obj = null, displayProp = "";
selectEl.innerHTML = "";
selectEl.add( createOption(""," --- "));
options = Object.keys( selectionRange);
for (const i of options.keys()) {
  if (!optPar || !optPar.selection || !optPar.selection[options[i]]) {
    obj = selectionRange[options[i]];
    if (optPar && optPar.displayProp) displayProp = optPar.displayProp;
    else displayProp = keyProp;
    selectEl.add( createOption( obj[keyProp], obj[displayProp]));
  }
}
}
function fillChoiceSet( listEl, selection, keyProp, displayProp) {
var options = [], obj = null;
listEl.innerHTML = "";
options = Object.keys( selection);
for (const j of options.keys()) {
  obj = selection[options[j]];
  addItemToChoiceSet( listEl, obj[keyProp], obj[displayProp]);
}
}
function addItemToChoiceSet( listEl, stdId, humanReadableId, classValue) {
var listItemEl = null, el = null;
listItemEl = document.createElement("li");
listItemEl.setAttribute("data-value", stdId);
el = document.createElement("span");
el.textContent = humanReadableId;
listItemEl.appendChild( el);
el = createPushButton("✕");
listItemEl.appendChild( el);
if (classValue) listItemEl.classList.add( classValue);
listEl.appendChild( listItemEl);
}

function typeName(val) {
var typeName = Object.prototype.toString.call(val).match(/^\[object\s(.*)\]$/)[1];
if (val === null) return "Null";
if (typeName === "Object") return val.constructor.name || "Object";
return typeName;
}
function cloneObject(obj) {
const clone = Object.create( Object.getPrototypeOf(obj));
for (const p in obj) {
  if (obj.hasOwnProperty(p)) {
    const val = obj[p];
    if (typeof val === "number" ||
        typeof val === "string" ||
        typeof val === "boolean" ||
        val instanceof Date ||
        typeof val === "object" && !!val.constructor ||
        Array.isArray( val) &&  
          !val.some( function (el) {
            return typeof el === "object";
          }) ||
        Array.isArray( val) &&  
          val.every( function (el) {
            return (typeof el === "object" && !!el.constructor);
          })
    ) {
      if (Array.isArray( val)) clone[p] = val.slice(0);
      else clone[p] = val;
    }
  }
}
return clone;
}

export { fillSelectWithOptions, createListFromMap,
createMultipleChoiceWidget, cloneObject, isNotIsoDateString,
createIsoDateString, createPushButton, createOption, createTimeElem,
fillMultipleChoiceWidgetWithOptions, fillChoiceSet, addItemToChoiceSet,
typeName };