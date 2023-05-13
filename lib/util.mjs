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

function createListFromMap( entityTbl, displayProp) {
  const listEl = document.createElement("ul");
  listEl.innerHTML = "";
  for (const key of Object.keys( entityTbl)) {
    const listItemEl = document.createElement("li");
    listItemEl.textContent = entityTbl[key][displayProp];
    listEl.appendChild( listItemEl);
  }
  return listEl;
}
function fillSelectWithOptions( selectEl, selectionRange, keyProp, optPar) {
  var optionEl = null, obj = null, displayProp = "";
  selectEl.innerHTML = "";
  if (!selectEl.multiple) selectEl.add( createOption(""," --- "));
  var options = Object.keys( selectionRange);
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

function createMultiSelectionWidget( widgetContainerEl, selection, selectionRange,
                                    keyProp, displayProp, minCard) {
  const selectedItemsListEl = document.createElement("ul"),  // shows the selected objects
        selectEl = document.createElement("select");
  var el=null;
  if (!minCard) minCard = 0;  // default
  widgetContainerEl.innerHTML = "";  // delete old contents
  if (!displayProp) displayProp = keyProp;
  fillSelectedItemsList( selectedItemsListEl, selection, keyProp, displayProp);
  // event handler for removing an item from the selection
  selectedItemsListEl.addEventListener( 'click', function (e) {
    if (e.target.tagName === "BUTTON") {  // delete/undo button
      const btnEl = e.target,
            listItemEl = btnEl.parentNode,
            listEl = listItemEl.parentNode;
      if (listEl.children.length <= minCard) {
        alert("A movie must have at least one author!");
        return;
      }
      if (listItemEl.classList.contains("removed")) {
        listItemEl.classList.remove("removed");
        btnEl.textContent = "✕";
      } else if (listItemEl.classList.contains("added")) {
        listItemEl.parentNode.removeChild( listItemEl);
        const optionEl = createOption( listItemEl.getAttribute("data-value"),
                           listItemEl.firstElementChild.textContent);
        selectEl.add( optionEl);
      } else {
        // removing an ordinary item
        listItemEl.classList.add("removed");
        // change button text
        btnEl.textContent = "undo";
      }
    }
  });
  widgetContainerEl.appendChild( selectedItemsListEl);
  el = document.createElement("div");
  el.appendChild( selectEl);
  el.appendChild( createPushButton("add"));
  // event handler for moving an item from the selection range list to the selected items list
  selectEl.parentNode.addEventListener( 'click', function (e) {
    if (e.target.tagName === "BUTTON") {  // the add button was clicked
      if (selectEl.value) {
        addItemToListOfSelectedItems( selectedItemsListEl, selectEl.value,
            selectEl.options[selectEl.selectedIndex].textContent, "added");
        selectEl.remove( selectEl.selectedIndex);
        selectEl.selectedIndex = 0;
      }
    }
  });
  widgetContainerEl.appendChild( el);
  // create select options from selectionRange minus selection
  fillMultiSelectionListWithOptions( selectEl, selectionRange, keyProp,
      {"displayProp": displayProp, "selection": selection});
}

function fillMultiSelectionListWithOptions( selectEl, selectionRange, keyProp, optPar) {
  var options = [], obj = null, displayProp = "";
  // delete old contents
  selectEl.innerHTML = "";
  // create "no selection yet" entry
  selectEl.add( createOption(""," --- "));
  // create option elements from object property values
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

function fillSelectedItemsList( listEl, selection, keyProp, displayProp) {
  // delete old contents
  listEl.innerHTML = "";
  for (const objId of Object.keys( selection)) {
    const obj = selection[objId];
    addItemToListOfSelectedItems( listEl, obj[keyProp], obj[displayProp]);
  }
}
function addItemToListOfSelectedItems( listEl, stdId, humanReadableId, classValue) {
  var el=null;
  const listItemEl = document.createElement("li");
  listItemEl.setAttribute("data-value", stdId);
  el = document.createElement("span");
  el.textContent = humanReadableId;
  listItemEl.appendChild( el);
  el = createPushButton("✕");
  listItemEl.appendChild( el);
  if (classValue) listItemEl.classList.add( classValue);
  listEl.appendChild( listItemEl);
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
          // typed object reference
          typeof val === "object" && !!val.constructor ||
          // list of data values
          Array.isArray(val) && !val.some( el => typeof el === "object") ||
          // list of typed object references
          Array.isArray(val) &&
          val.every( el => typeof el === "object" && !!el.constructor)
      ) {
        if (Array.isArray(val)) clone[p] = val.slice(0);
        else clone[p] = val;
      }
    }
  }
  return clone;
}

export { fillSelectWithOptions, createListFromMap, createMultiSelectionWidget,
  cloneObject };
