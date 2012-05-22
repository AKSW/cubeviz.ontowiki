function getDimensionList(componentTypeUri, dsUri, baseUri, type) {
	
	component = componentTypeUri;
	ds = dsUri;
	uri = "http://localhost/cubeviz/filter/"; // need to be based on baseUri or something else
	
    $.ajax({
		type: "POST",
		url: uri,
		data: "component="+component+"&ds="+ds,
		success: function(elements) {
			
			var result = JSON.parse(elements);
			
			// Create new block in #component property
			if($("#"+type) != undefined) {
				$("#"+type).remove();
			}
			$("#dim-list").append('<div id='+type+' class="component-list">');
			
			//console.log(result);
			
			for(component in result) {
				$("#"+type).append('<p>'+component+'</p>');
			}
		} 
	});
}
