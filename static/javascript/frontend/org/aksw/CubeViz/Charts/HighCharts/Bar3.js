Namespacedotjs('org.aksw.CubeViz.Charts.HighCharts.Bar3', {
	
	aDimension: {},
	bDimension: {},
	cDimension: {},
    
    /**
     * Standard configuration object for a chart
     */
    config: {
        chart: {
            renderTo: 'container',
            type: 'column'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: []
        },
        plotOptions: {
            series: {
                groupPadding: 0.2
            },
            column: {
				stacking: 'normal'
			}
        },
        series: []
    },
    
    /**
     * Initialize the chart object
     * @param resultObservations
     * @param componentParameter
     */
    init: function (observations, parameters, nDimensions) {
        
        // Include org.aksw.CubeViz.Charts.HighCharts.Chart
        Namespacedotjs.include ('org.aksw.CubeViz.Charts.HighCharts.Chart3');
        var chart = org.aksw.CubeViz.Charts.HighCharts.Chart3;
        this.config.title.text = chart.getTitle ( observations, parameters, nDimensions ); 
        
        this.aDimension = this.initDimension(observations, parameters, nDimensions[0], nDimensions[2], nDimensions[1]);
        this.config.series = this.aDimension.series;
        this.config.xAxis.categories = this.aDimension.categories;
        
    },
    
    /**
     * Calling different function to compute an object which represents a barchart
     */
    getRenderResult: function () {
        return this.config;
    },
    
    initDimension: function(observations, parameters, aDimension, bDimension, cDimension) {
		dimension = {};
		dimension.aUri = aDimension;
		dimension.bUri = bDimension;
		dimension.cUri = cDimension;
        dimension.aElements = this.getElements ( observations, parameters, aDimension);
        dimension.bElements = this.getElements ( observations, parameters, bDimension);
        dimension.cElements = this.getElements ( observations, parameters, cDimension);
        
        dimension.aDistinctElements = dimension.aElements.slice(0);
        dimension.aDistinctElements = this.getDistinctElements(dimension.aDistinctElements);
        dimension.bDistinctElements = dimension.bElements.slice(0);
        dimension.bDistinctElements = this.getDistinctElements(dimension.bDistinctElements);
        dimension.cDistinctElements = dimension.cElements.slice(0);
        dimension.cDistinctElements = this.getDistinctElements(dimension.cDistinctElements);
        
        dimension.aElementLabels = this.getLabelsForElements ( dimension.aDistinctElements, parameters );
        dimension.bElementLabels = this.getLabelsForElements ( dimension.bDistinctElements, parameters );
        dimension.cElementLabels = this.getLabelsForElements ( dimension.cDistinctElements, parameters );
        
        dimension.aOverallLabelLength = this.calculateLabelLength(dimension.aElementLabels);
        dimension.bOverallLabelLength = this.calculateLabelLength(dimension.bElementLabels);
        dimension.cOverallLabelLength = this.calculateLabelLength(dimension.cElementLabels);
        
        dimension.measures = this.getMeasures(parameters);
        dimension.values = this.getElements(observations, parameters, dimension.measures[0]);
        
        dimension.categories = this.getCategories(dimension.aElementLabels);
        
        dimension.series = this.getSeries(dimension.aDistinctElements, dimension.aElements, dimension.aElementLabels,
										  dimension.bDistinctElements, dimension.bElements, dimension.bElementLabels,
										  dimension.cDistinctElements, dimension.cElements, dimension.cElementLabels,
										  dimension.values);
        
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
	
	getSeries: function(aDistinctElements, aElements, aElementLabels,
						bDistinctElements, bElements, bElementLabels,
						cDistinctElements, cElements, cElementLabels,
						values) {
		var elements_length = aElements.length;
		var aDistinctElements_length = aDistinctElements.length;
		var bDistinctElements_length = bDistinctElements.length;
		var cDistinctElements_length = cDistinctElements.length;
		var i, j, k, m;
		var serie = {
						name: '',
						data: [],
						stack: ''
					};
		var serieData_length = null;
		var series = [];
		for(i = 0; i < bDistinctElements_length; i++) {
			for(j = 0; j < cDistinctElements_length; j++) {
				serie.stack = bElementLabels[i];
				serie.name = cElementLabels[j];
				//make dummy values for each a
				for(k = 0; k < aDistinctElements_length; k++) {
					serie.data.push(aDistinctElements[k]);
				}
				var serieData_length = serie.data.length;
				
				for(k = 0; k < elements_length; k++) {
					if(bElements[k] == bDistinctElements[i] &&
					   cElements[k] == cDistinctElements[j]) {
						
						for(m = 0; m < serieData_length; m++) {
							if(aElements[k] == serie.data[m]) {
								serie.data[m] = values[k];
							}
						}
						
					}
				}
				
				for(k = 0; k < aDistinctElements_length; k++) {
					if(serie.data[k] == aDistinctElements[k]) {
						serie.data[k] = 0;
					}
				}
				
				series.push(serie);
				serie = {
							name: '',
							data: [],
							stack: ''
						};
			}
		}
		
		return series;		
	},
    
    cleanUpArray: function(arr) {
		var newArr = new Array();for (var k in arr) if(arr[k]) newArr.push(arr[k]);
		return newArr;
	}
});
