function checkBibliography(arg) {
  var doc = DocumentApp.openById(DOC_ID_GOES_HERE);
  var body = doc.getBody();

  var regex = new RegExp(`xml:id="${arg}"`, 'g');
  var matches = body.getText().match(regex);
  var matchCount = matches ? matches.length : 0;

  // If there are matches return 1, otherwise return 0
  if (matchCount > 0) {
    return 1;
  } else {
    // Show a dialog box with an alert
    var ui = DocumentApp.getUi();
    ui.alert(arg + ' not defined.');
    return 0;
  }
}


function checkXmlId() {
  var doc = DocumentApp.getActiveDocument();
  var selection = doc.getSelection();
  
  if (!selection) {
    DocumentApp.getUi().alert('No text selected.');
    return;
  }
  
  var selectedElements = selection.getRangeElements();
  var selectedText = '';
  for (var i = 0; i < selectedElements.length; i++) {
    var element = selectedElements[i];
    
    if (element.getElement().editAsText) {
      var text = element.getElement().asText().getText();
      selectedText += text;
    }
  }
  
  var body = doc.getBody();
  var text = body.getText();
  
  var xmlIdPattern = /xml:id="([^"]*)"/g;
  var match, xmlIds = [];
  while (match = xmlIdPattern.exec(text)) {
    xmlIds.push(match[1]);
  }
  
  if (xmlIds.includes(selectedText)) {
    DocumentApp.getUi().alert('Match: ' + selectedText);
  } else {
    DocumentApp.getUi().alert('No match');
  }
}

function wrapLines(text) {
  // Split the text into lines
  var lines = text.split('\n');
  for (var i = 0; i < lines.length; i++) {
  lines[i] = '<l>' + lines[i] + '</l>';
}
  return lines.join('\n')
}

// This function replaces "{pA-5r-2}" with <pb n="2" img="5r" ed="#A"/>
function replacePageBreak(text) {
  var regex = /\{p([A-Za-z0-9]+)-(\d+[A-Za-z])-([0-9]+)\}/g;
  return text.replace(regex, function(match, p1, p2, p3) {
    return '<pb n="' + p2 + '" img="' + p3 + '" ed="#' + p1 + '"/>';
  });
}


// This function replaces "parallel=X, Y" with <note type="parallel"><ptr target="#X"/>Y</note>
function replaceParallel(text) {
  var regex = /parallel=(.+), (.+)/g; // regex to match "parallel=X, Y" where X and Y are word characters
  
  return text.replace(regex, function(match, p1, p2) { // replace all matches
    // Check the bibliography for p1
    checkBibliography(p1);
    
    return '\n<note type="parallel"><ptr target="#' + p1 + '"/>' + p2 + '</note>\n'; // construct the replacement string
  });
}



// This function replaces any {nAx} in a line with <lb ed="#A" n="x"/>
function replaceLineNo(text) {
  // Regex to match {n=...} where ... is any sequence of letters followed by any number
  var regex = /\{n([A-Za-z]+\d+)\}/g;

  return text.replace(regex, function(match, p1) {
    // Find the position where the number part starts (First digit in the sequence)
    var numStart = p1.search(/\d/);
    
    // split the matched string into letter and number parts
    var letterPart = p1.slice(0, numStart);
    var numberPart = p1.slice(numStart);
    
    // Construct the replacement string
    return '<lb ed="#' + letterPart + '" n="' + numberPart + '"/>';
  });
}


// This function replaces any {oAn} in a line with <app type="punct"><lem wit="#A"><space type="binding-hole" quantity="n"/></lem></app>
function replaceAo(text) {
  var regex = /\{o([A-Za-z]+?)(\d+?)\}/g; // regex to match {Ao5} where A and 5 can be any strings
  return text.replace(regex, function(match, p1, p2) { // replace all matches
    return '<app type="punct"><lem wit="#' + p1 + '"><space type="binding-hole" quantity="' + p2 + '"/></lem></app>'; // construct the replacement string
  });
}



function replaceReadings(text) {
  var regex = /\[([^,]*, )?(.*?)\]/g; // regex to match optional word and comma, and anything in square brackets
  var matches = text.match(regex); // find all matches

  if (matches) {
    for (var i = 0; i < matches.length; i++) {
      var readings = matches[i].replace('[','').replace(']','').split(','); // get all readings
      var type = '';
      if (readings[0].includes('=')) { // if the first reading contains '=', there is no type
        type = '';
      } else {
        type = readings[0].trim(); // the type is the first reading
        readings.shift(); // remove the first element (type) from readings
      }
      var replacement = '<app';
      if (type != '') {
        replacement += ' type="' + type + '"';
      }
      replacement += '>';
      for (var j = 0; j < readings.length; j++) {
        var parts = readings[j].split('='); // separate identifier and reading
        var attribute;
        if (parts[0].trim().startsWith('~')) { // if the identifier starts with '#', use 'source'
          attribute = 'source';
          parts[0] = parts[0].trim().substring(1); // remove '#' from the identifier
        } else if (parts[0].trim().length == 1) { // if the identifier is a single letter, use 'wit'
          attribute = 'wit';
        } else { // if the identifier is more than one letter, use 'resp'
          attribute = 'resp';
        }
        if (j == 0) {
          replacement += '<lem ' + attribute + '="#' + parts[0].trim() + '">' + parts[1].trim() + ' </lem>';
        } else {
          replacement += '<rdg ' + attribute + '="#' + parts[0].trim() + '">' + parts[1].trim() + '</rdg>';
        }
      }
      replacement += '</app>';
      text = text.replace(matches[i], replacement); // replace original text with new format
    }
  }

  return text;
}


function onOpen() {
  DocumentApp.getUi().createMenu('EasyTEI')
    .addItem('Transform to TEI', 'replaceReadingsInDoc')
    .addItem('Duplicate as Comment', 'copySelectionWithComments')
    .addItem('Check if Text is Defined', 'checkBibliography')
    .addToUi();
}

function replaceReadingsInDoc() {

  
  
  var doc = DocumentApp.getActiveDocument();
  var selection = doc.getSelection();
  if (selection) {
    var elements = selection.getRangeElements();

    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      if (element.getElement().editAsText) {
        var text = element.getElement().editAsText();
        var originalText = text.getText();
        var newText = originalText

        // Wrap the first two lines in <l></l> tags
        if (i<2){
          var newText = wrapLines(newText);
          }
        
        if(i == 0) { 
          newText = '<lg n="x" xml:id="RaGāKō.xx">\n\n' + newText; 
        }
        if(i == elements.length - 1) { 
          newText = newText + '\n</lg>\n\n\n'; 
        }

        var newText = replaceReadings(newText)
        newText = replaceAo(newText)
        newText = replaceLineNo(newText)
        newText = replaceParallel(newText)
        newText = replacePageBreak(newText)
        text.setText(newText);
        
      }

    }
  }
    
}

