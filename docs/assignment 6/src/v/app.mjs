function undisplayAllSegmentFields(domNode, segmentNames) {
  if (!domNode) domNode = document;  
  for (const segmentName of segmentNames) {
    const fields = domNode.getElementsByClassName(segmentName);
    for (const el of fields) {
      el.style.display = "none";
    }
  }
}

function displaySegmentFields(domNode, segmentNames, segmentIndex) {
  if (!domNode) domNode = document;
  for (let i = 0; i < segmentNames.length; i++) {
    const fields = domNode.getElementsByClassName(segmentNames[i]);
    for (const el of fields) {
      el.style.display = (i === segmentIndex - 1) ? "block" : "none";
    }
  }
}

export { undisplayAllSegmentFields, displaySegmentFields };
