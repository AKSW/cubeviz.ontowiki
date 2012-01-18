function selectAllElements(divID) {
    
    for(var i=0;i<document.forms["dataSelectionForm"].elements["dim"+divID+"elemList[]"]['length'];i++) {
        document.forms["dataSelectionForm"].elements["dim"+divID+"elemList[]"][i].checked = true;
    }
}

function deselectAllElements(divID) {
    
    for(var i=0;i<document.forms["dataSelectionForm"].elements["dim"+divID+"elemList[]"]['length'];i++) {
        document.forms["dataSelectionForm"].elements["dim"+divID+"elemList[]"][i].checked = false;
    }
}

function submitAxisChange(element) {
    
    document.forms["dataSelectionForm"].elements[element].value = "change";
    document.forms["dataSelectionForm"].submit();
}

function toggleCreationList(uri, divName) {
    
    var divSection = document.getElementById(divName+"List");
    
    //avoid loading the elements if they are already set
    if(divSection.innerHTML == "") {
        getStructureElements(uri, divName+"List");
    }
    
    //toggle the surrounding div with the submit button
    $("#"+divName).toggle();
}

function getStructureElements(uri, divName) {
    
    var divSection = document.getElementById(divName);
    
    divSection.innerHTML = messageList["text loading"];
    
    var post = "isUriPatternSet=true";
    
    for(var spec in uriPatternList) {
        post += "&"+spec+"="+uriPatternList[spec];
    }
    
    $.ajax({
        type: "POST",
        url: uri,
        data: post,
        success: function(elements) {
            
            divSection.innerHTML = "";
            
            var componentList = new Array();
            var result = JSON.parse(elements);
            
            var i = 0;
            
            $.each(result, function(key, value){
                
                if(key == "dp") {
                    $.each(value, function(index, dpset) {
                        divSection.innerHTML += "<li class=\""+getListStyling(i)+"\"><table border=\"0\"><tr><td>"+messageList["text component for dimension"]+": "+dpset["name"]+"</td><td>"+messageList["text uri"]+": <input name=\"dp"+index+"uri\" value=\""+dpset["csuri"]+"\" size=\""+dpset["csuri"].length+"\"/></td><td>"+messageList["text name"]+": <input name=\"dp"+index+"name\" value=\""+dpset["name"]+"\"></td></tr></table></li>";
                        componentList[dpset["uri"]] = messageList["text component for dimension"]+": "+dpset["name"];
                        elementCreationList.push("dp"+index);
                        i++;
                    });
                }
                
                if(key == "mp") {
                    $.each(value, function(index, mpset) {
                        divSection.innerHTML += "<li class=\""+getListStyling(i)+"\"><table border=\"0\"><tr><td>"+messageList["text component for measure"]+": "+mpset["name"]+"</td><td>"+messageList["text uri"]+": <input name=\"mp"+index+"uri\" value=\""+mpset["csuri"]+"\" size=\""+mpset["csuri"].length+"\"/></td><td>"+messageList["text name"]+": <input name=\"mp"+index+"name\" value=\""+mpset["name"]+"\"></td></tr></table></li>";
                        componentList[mpset["uri"]] = messageList["text component for measure"]+": "+mpset["name"];
                        elementCreationList.push("mp"+index);
                        i++;
                    });
                }
                
                if(key == "ds") {
                    $.each(value, function(index, dsset) {
                        
                        var content = "";
                        
                        content += "<li class=\""+getListStyling(i)+"\">";
                        content += "<table border=\"0\"><tr><td>"+messageList["text dataset"].replace(/%1/, dsset["obsCount"])+"</td><td>"+messageList["text uri"]+": <input name=\"ds"+index+"uri\" value=\""+dsset["dsuri"]+"\" size=\""+dsset["dsuri"].length+"\"/></td><td>"+messageList["text name"]+": <input name=\"ds"+index+"name\" value=\""+dsset["dsname"]+"\"></td></tr>";
                        elementCreationList.push("ds"+index);
                        content += "<tr><td colspan=\"3\">"+messageList["text with"]+"</td></tr>"
                        content += "<tr><td>"+messageList["text datastructure"]+"</td><td>"+messageList["text uri"]+": <input name=\"dsd"+index+"uri\" value=\""+dsset["dsduri"]+"\" size=\""+dsset["dsduri"].length+"\"/></td><td>"+messageList["text name"]+": <input name=\"dsd"+index+"name\" value=\""+dsset["dsdname"]+"\"></td></tr>";
                        elementCreationList.push("dsd"+index);
                        content += "<tr><td colspan=\"3\">"+messageList["text using components"]+"<br /><br />"
                        $.each(dsset, function(key, value) {
                            if((key != "obsCount") && (key != "dsduri") && (key != "dsuri") && (key != "dsdname") && (key != "dsname")) {
                                content += componentList[value]+"<br />";
                            }
                        });
                        content += "</td></tr></table></li>";
                        divSection.innerHTML += content;
                        i++;
                    });
                }
                
            });
            
            if(divSection.innerHTML != "") {
                divSection.innerHTML += "<input type=\"hidden\" name=\"creationList\" value=\"true\" />";
                divSection.innerHTML = "<ol class=\"bullets-none separated\">"+divSection.innerHTML+"</ol>";
            }
        }
    })
    
}

function toggleComponentElements(uri, ds, component, divName) {
    
    var divSection = document.getElementById("dim"+divName+"elem");
    
    //avoid loading the elements if they are already set
    if(divSection.innerHTML == "") {
        getComponentElements(uri, ds, component, divName);
    }
    
    //toggle the surrounding div with the submit button
    $("#dim"+divName).toggle();
}

function getComponentElements(uri, ds, component, divID) {
    
    var divName = "dim"+divID+"elem";
    
    document.getElementById(divName).innerHTML = messageList["text loading"];
    
    $.ajax({
        type: "POST",
        url: uri,
        data: "component="+component+"&ds="+ds,
        success: function(elements) {
            
            document.getElementById(divName).innerHTML = "";

            var result = JSON.parse(elements);
            
            var i = 0;

            $.each(result, function(key, value) {
                
                i++;
                var selected = "";
                var elemList = selectedElementsList[divName+"List"];
                
                //preselect all elements of the dimension if there is no elemList yet
                if(($.inArray(key, elemList) != -1) || (elemList.length == 0)) {
                    selected = "checked=\"checked\"";
                }
                document.getElementById(divName).innerHTML += "<li class=\""+getListStyling(i)+"\"><input type=\"checkbox\" name=\""+divName+"List[]\" value=\""+key+"\" "+selected+"> "+value["name"]+"</li>";

            });
            
            document.getElementById(divName).innerHTML = "<ol class=\"bullets-none separated\">"+document.getElementById(divName).innerHTML+"</ol>";
        }

    })

}

function getListStyling(i) {
    
    var cls = "";
    //styling the output with the li-classes
    if(i % 2 == 0) cls = "even"
    else cls = "odd";
    
    return cls;
}