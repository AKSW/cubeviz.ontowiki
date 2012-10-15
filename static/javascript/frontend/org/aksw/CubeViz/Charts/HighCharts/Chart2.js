Namespacedotjs('org.aksw.CubeViz.Charts.HighCharts.Chart2', {
    
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
		
		if(typeof dsdPart !== 'undefined')
			if(dsdPart != null)
				title += dsdPart;
		
		if(typeof dsPart !== 'undefined')
			if(dsPart != null)
				title += " - "+dsPart;
		
		if(typeof dimCompsLabels !== 'undefined')
			if(dimCompsLabels.length > 0)
				title += " - "+dimCompsLabels.join(' ');
				
        return title;
    },
    
    initDimension: function(observations, parameters, dimensionUri) {
		dimension = {};
		dimension.uri = dimensionUri;        
        dimension.elements = this.getElements ( observations, parameters, dimensionUri);
        dimension.distinctElements = dimension.elements.slice(0);
        dimension.distinctElements = this.getDistinctElements(dimension.distinctElements);
        dimension.elementLabels = this.getLabelsForElements ( dimension.distinctElements, parameters );
        dimension.overallLabelLength = this.calculateLabelLength(dimension.elementLabels);
        dimension.categories = this.getCategories(dimension.elementLabels);
        dimension.measures = this.getMeasures(parameters);
        dimension.values = this.getElements(observations, parameters, dimension.measures[0]);
        
        return dimension;
	},
	
	
    /**
     * return URIs
     */    
	getElements: function(observations, parameters, dimensionUri) {
		var elements = [];
		var observation_current = null;
		var object_current = null;
		for(observation in observations) {
			observation_current = observations[observation];
			for(property in observation_current) {
				object_current = observation_current[property];
				if(property == dimensionUri) {
					elements.push(object_current[0].value);
				}
			}
		}
		return elements;
	},
	
	/**
	 * Notice: elements have to be sorted
	 */
	getDistinctElements: function(elements) {
		var elements_length = elements.length;
		var i = 0, j;
		var deleteThese = [];
		for(i; i < elements_length; i++) {
			for(j = i + 1; j < elements_length; j++) {
				if(elements[i] == elements[j]) {
					deleteThese.push(j);
				}
			}
		}
				
		var deleteThere_length = deleteThese.length;
		for(i = 0; i < deleteThere_length; i++) {
			delete elements[deleteThese[i]];
		}
		
		elements = this.cleanUpArray(elements);
		
		return elements;
	},
	
	getLabelsForElements: function(elements, parameters) {
		var labels = [];
		var dimensionComponents = parameters.selectedDimensionComponents.selectedDimensionComponents;
		var dimensionComponents_length = dimensionComponents.length;
		var elements_length = elements.length;
		var i = 0, j;
		
		for(i; i < elements_length; i++) {
			for(j = 0; j < dimensionComponents_length; j++) {
				if(elements[i] == dimensionComponents[j].property) {
					labels.push(dimensionComponents[j].property_label);
				}
			}
		}		
		return labels;
	},
	
	calculateLabelLength: function(labels) {
		var overallLabelLength = 0;
		var labels_length = labels.length;
		var i = 0;
		for(i; i < labels_length; i++) {
			overallLabelLength += labels[i].length;
		}
		
		return overallLabelLength;
	},
	
	getCategories: function(elementLabels) {
		var i = 0;
		var categories = [];
		var elementLabels_length = elementLabels.length;
		for(i; i < elementLabels_length; i++) {
			categories.push(elementLabels[i]);
		}
		return categories;
	},
	
	/**
	 * We suppose that there is only one measure
	 */
	getMeasures: function(parameters) {
		return [parameters.selectedMeasures.measures[0].type];
	},
	
	getSeries: function(thisDimension, otherDimension) {
		// initialize counters
    var serie_name, serie_data, k;
		// initialize series
    var series = [];
		var serie = {name: '', data: []};
    //take other distinct
    var otherDistinct = otherDimension.distinctElements;
    var otherLabels = otherDimension.elementLabels;
    var otherElements = otherDimension.elements;
    var thisDistinct = thisDimension.distinctElements;
    var thisElements = thisDimension.elements;
    var thisValue = thisDimension.values;
    for(serie_name = 0; serie_name < otherDistinct.length; serie_name++) {
      serie.name = otherLabels[serie_name];
      otherData = otherDistinct[serie_name];
      //take each this distinct
      for(serie_data = 0; serie_data < thisDistinct.length; serie_data++) {
        //if value got otherDistinct and thisDistinct as elements - put it in the series
        for(var k = 0; k < thisElements.length; k++) {
          if(thisElements[k] == thisDistinct[serie_data] &&
            otherElements[k] == otherData) {
              serie.data[serie_data] = thisValue[k];
            }
        }
      }
      
      for(k = 0; k < serie.data.length; k++) {
        if(typeof serie.data[k] === "undefined") {
          serie.data[k] = 0;
        }
      }
      
      series.push(serie);
      serie = {name: '', data: []};
    }
        
		return series;
	},
  
  
    
  cleanUpArray: function(arr) {
		var newArr = new Array();for (var k in arr) if(arr[k]) newArr.push(arr[k]);
		return newArr;
	}
});
