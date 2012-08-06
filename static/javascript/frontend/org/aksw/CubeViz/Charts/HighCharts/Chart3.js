Namespacedotjs('org.aksw.CubeViz.Charts.HighCharts.Chart3', {
    

    /**
     * 
     */
    getTitle: function(observations, parameters, nDimensions) {
		var title = '';
		var dsdPart = parameters.selectedDSD.label;
		var dsPart = parameters.selectedDS.label;
		
		//iterate through dimension components and extract which are not nDimension
		var i = 0, j = 0;
		var nDimensions_length = nDimensions.length;
		var dimComps = parameters.selectedDimensionComponents.selectedDimensionComponents;
		var dimComps_length = dimComps.length;
		var dimCompsLabels = [];
		for(j = 0; j < dimComps_length; j++) {
			var notN = true;
			for(i = 0; i < nDimensions_length; i++) {
				if(dimComps[j].dimension_type == nDimensions[i]) {
					notN = false;
				}
			}
			if(notN) {
				dimCompsLabels.push(dimComps[j].property_label);
			}
		}
		
		title = dsdPart + ' , ' + dsPart + ' , ' + dimCompsLabels.join(' ');
        return title;
    },
});
