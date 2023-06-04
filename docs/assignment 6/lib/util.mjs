function isIntegerOrIntegerString(x) {
  return Number.isInteger(parseInt(x));
}
function isNonEmptyString(x) {
  return typeof (x) === "string" && x.trim() !== "";
}
function createIsoDateString(d) {
  return d.toISOString().substring(0, 10);
}
function createElement(elemName, id, classValues, txt) {
  var el = document.createElement(elemName);
  if (id) el.id = id;
  if (classValues) el.className = classValues;
  if (txt) el.textContent = txt;
  return el;
}
function createPushButton(id, classValues, txt) {
  if (txt === undefined) txt = id;
  var pB = createElement("button", id, classValues, txt);
  pB.type = "button";
  return pB;
}
function createOption(val, txt, classValues) {
  var el = document.createElement("option");
  el.value = val;
  el.text = txt;
  if (classValues) el.className = classValues;
  return el;
}

function fillSelectWithOptions(selectEl, selectionRange, keyProp, optPar) {
  var optionEl = null, displayProp = "";
  selectEl.innerHTML = "";
  if (!selectEl.multiple) selectEl.add(createOption("", " --- "));
  var options = Array.isArray(selectionRange) ? selectionRange :
    Object.keys(selectionRange);
  for (let i = 0; i < options.length; i++) {
    if (Array.isArray(selectionRange)) {
      optionEl = createOption(i, options[i]);
    } else {
      const key = options[i];
      const obj = selectionRange[key];
      if (!selectEl.multiple) obj.index = i + 1; 
      if (optPar && optPar.displayProp) displayProp = optPar.displayProp;
      else displayProp = keyProp;
      optionEl = createOption(key, obj[displayProp]);
      if (selectEl.multiple && optPar && optPar.selection &&
        optPar.selection[keyProp]) {
        optionEl.selected = true;
      }
    }
    selectEl.add(optionEl);
  }
}
function typeName(val) {
  var typeName =
    Object.prototype.toString.call(val).match(/^\[object\s(.*)\]$/)[1];
  if (val === null) return "Null";
  if (typeName === "Object") return val.constructor.name || "Object";
  return typeName;
}
function cloneObject(obj) {
  var clone = Object.create(Object.getPrototypeOf(obj));
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      if (typeof obj[p] === "number" ||
        typeof obj[p] === "string" ||
        typeof obj[p] === "boolean" ||
        typeName(obj[p]) === "Function" ||
        (typeName(obj[p]) === "Date" && obj[p] != null)) {
        clone[p] = obj[p];
      }
    }
  }
  return clone;
}

function createListFromMap(entityTbl, displayProp) {
  const listEl = document.createElement("ul");
  listEl.innerHTML = "";
  for (const key of Object.keys(entityTbl)) {
    const listItemEl = document.createElement("li");
    listItemEl.textContent = entityTbl[key][displayProp];
    listEl.appendChild(listItemEl);
  }
  return listEl;
}

function createMultiSelectionWidget(widgetContainerEl,
  selection, selectionRange, keyProp, displayProp, minCard) {
  const selectedItemsListEl = document.createElement("ul"),
    selectEl = document.createElement("select");
  var el = null;
  if (!minCard) minCard = 0;  
  widgetContainerEl.innerHTML = "";  
  if (!displayProp) displayProp = keyProp;
  fillSelectedItemsList(selectedItemsListEl, selection, keyProp, displayProp);
  selectedItemsListEl.addEventListener("click", function (e) {
    if (e.target.tagName === "BUTTON") {  
      const btnEl = e.target,
        listItemEl = btnEl.parentNode,
        listEl = listItemEl.parentNode;
      if (listEl.children.length <= minCard) {
        alert("A movie must have at least one person!");
        return;
      }
      if (listItemEl.classList.contains("removed")) {
        listItemEl.classList.remove("removed");
        btnEl.textContent = "✕";
      } else if (listItemEl.classList.contains("added")) {
        listItemEl.parentNode.removeChild(listItemEl);
        const optionEl = createOption(listItemEl.getAttribute("data-value"),
          listItemEl.firstElementChild.textContent);
        selectEl.add(optionEl);
      } else {
        listItemEl.classList.add("removed");
        btnEl.textContent = "undo";
      }
    }
  });
  widgetContainerEl.appendChild(selectedItemsListEl);
  el = document.createElement("div");
  el.appendChild(selectEl);
  el.appendChild(createPushButton("add"));
  selectEl.parentNode.addEventListener("click", function (e) {
    if (e.target.tagName === "BUTTON") {  // the add button was clicked
      if (selectEl.value) {
        addItemToListOfSelectedItems(selectedItemsListEl, selectEl.value,
          selectEl.options[selectEl.selectedIndex].textContent, "added");
        selectEl.remove(selectEl.selectedIndex);
        selectEl.selectedIndex = 0;
      }
    }
  });
  widgetContainerEl.appendChild(el);
  fillMultiSelectionListWithOptions(selectEl, selectionRange, keyProp,
    { "displayProp": displayProp, "selection": selection });
}
function fillMultiSelectionListWithOptions(
  selectEl, selectionRange, keyProp, optPar
) {
  var options = [], obj = null, displayProp = "";
  selectEl.innerHTML = "";
  selectEl.add(createOption("", " --- "));
  options = Object.keys(selectionRange);
  for (const i of options.keys()) {
    if (!optPar || !optPar.selection || !optPar.selection[options[i]]) {
      obj = selectionRange[options[i]];
      if (optPar && optPar.displayProp) displayProp = optPar.displayProp;
      else displayProp = keyProp;
      selectEl.add(createOption(obj[keyProp], obj[displayProp]));
    }
  }
}
function fillSelectedItemsList(listEl, selection, keyProp, displayProp) {
  listEl.innerHTML = "";
  for (const objId of Object.keys(selection)) {
    const obj = selection[objId];
    addItemToListOfSelectedItems(listEl, obj[keyProp], obj[displayProp]);
  }
}

function addItemToListOfSelectedItems(
  listEl, stdId, humanReadableId, classValue
) {
  var el = null;
  const listItemEl = document.createElement("li");
  listItemEl.setAttribute("data-value", stdId);
  el = document.createElement("span");
  el.textContent = humanReadableId;
  listItemEl.appendChild(el);
  el = createPushButton("✕");
  listItemEl.appendChild(el);
  if (classValue) listItemEl.classList.add(classValue);
  listEl.appendChild(listItemEl);
}

export {
  createListFromMap, createIsoDateString, isNonEmptyString, cloneObject,
  isIntegerOrIntegerString, fillSelectWithOptions, createMultiSelectionWidget
};
