function validateDataSelectionForm() {
    
    for(var dimensionName in elementCountList) {
        
        var limitName = dimensionName+"Limit";
        var offsetName = dimensionName+"Offset";
        
        if(document.forms["dataSelectionForm"].elements[limitName]
                && document.forms["dataSelectionForm"].elements[offsetName]) {
            
            var limit = parseInt(document.forms["dataSelectionForm"].elements[limitName].value);
            var offset = parseInt(document.forms["dataSelectionForm"].elements[offsetName].value);
            
            if(limit > parseInt(optionList["paginationLimit"])) {
                alert(messageList["alert pagination limit"]);
                document.forms["dataSelectionForm"].elements[limitName].select();
                return false;
            }
            
            if(offset > parseInt(elementCountList[dimensionName])) {
                alert(messageList["alert offset limit"].replace(/%1/, elementCountList[dimensionName]));
                document.forms["dataSelectionForm"].elements[offsetName].select();
                return false;
            }
        }
    }
    return true;
}

function validateUriPatternForm() {

    for (var specification in uriPatternList) {
        
        var patternValue = document.forms["uriPatternForm"].elements[specification].value;
        
        if(patternValue == "") {
            alert(messageList["alert empty pattern values"]);
            document.forms["uriPatternForm"].elements[specification].select();
            return false;
        }
        
        if((patternValue.search(/<MD5>/) == -1) && (patternValue.search(/<COUNTER>/) == -1)) {
            alert(messageList["alert missing generic name"]);
            document.forms["uriPatternForm"].elements[specification].select();
            return false;
        }
    }
    return true;
}

function validateGenericElementsCreationForm() {
    
    var uris = new Array();
    var names = new Array();
    
    for (var index in elementCreationList) {
        
        var elementUri = document.forms["genericElementsCreationForm"].elements[elementCreationList[index]+"uri"].value;
        var elementName = document.forms["genericElementsCreationForm"].elements[elementCreationList[index]+"name"].value;
        
        if(elementUri == "") {
            alert(messageList["alert missing uri"]);
            document.forms["genericElementsCreationForm"].elements[elementCreationList[index]+"uri"].select();
            return false;
        }
        
        if(elementName == "") {
            alert(messageList["alert missing name"]);
            document.forms["genericElementsCreationForm"].elements[elementCreationList[index]+"name"].select();
            return false;
        }
        
        for(var i = 0; i<uris.length; i++) {
            if(uris[i] == elementUri) {
                alert(messageList["alert doubled uri"]);
                document.forms["genericElementsCreationForm"].elements[elementCreationList[index]+"uri"].select();
                return false;
            }
            if(names[i] == elementName) {
                alert(messageList["alert doubled name"]);
                document.forms["genericElementsCreationForm"].elements[elementCreationList[index]+"name"].select();
                return false;
            }
        }
        
        uris[index] = elementUri;
        names[index] = elementName;
    }
    return true;
}