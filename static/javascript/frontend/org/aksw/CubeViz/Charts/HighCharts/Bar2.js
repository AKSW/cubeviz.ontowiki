Namespacedotjs('org.aksw.CubeViz.Charts.HighCharts.Bar2', {
	
	aDimension: {},
	bDimension: {},
    
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
        Namespacedotjs.include ('org.aksw.CubeViz.Charts.HighCharts.Chart');
        var chart = org.aksw.CubeViz.Charts.HighCharts.Chart;
        this.config.title.text = chart.getTitle ( observations, parameters, nDimensions ); 
        
        this.aDimension = this.initDimension(observations, parameters, nDimensions[0]);
        this.bDimension = this.initDimension(observations, parameters, nDimensions[1]);
        
        if(this.aDimension.overallLabelLength > this.bDimension.overallLabelLength) {
			this.config.xAxis.categories = this.aDimension.categories;
			this.config.series = this.bDimension.series;
		} else {
			this.config.xAxis.categories = this.bDimension.categories;
			this.config.series = this.aDimension.series;
		}
        
        
        // set values itself
        // this.config.series = this.getSeries ( observations, parameters, nDimensions );

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
        dimension.series = this.getSeries(dimension.elements, 
										  dimension.distinctElements, 
										  dimension.elementLabels,
										  dimension.values);
        
        return dimension;
	},
    
    /**
     * Calling different function to compute an object which represents a barchart
     */
    getRenderResult: function () {
        return this.config;
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
	
	/**
     * TODO!!! get the series
     */
	getSeries: function(elements, distinctElements, labels, values) {
		var i = 0, j;
		var distinctElements_length = distinctElements.length;
		var elements_length = elements.length;
		var series = [];
		var serie = {name: '', data: []};
		for (i; i < distinctElements_length; i++) {
			serie.name = labels[i];
			for(j = 0; j < elements_length; j++) {
				if(elements[j] == distinctElements[i]) {
					serie.data.push(values[j]);
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
	},
});
