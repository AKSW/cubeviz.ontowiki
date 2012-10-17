Namespacedotjs('org.aksw.CubeViz.Charts.HighCharts.Line1', {
	
	aDimension: {},
    
    /**
     * Standard configuration object for a chart
     */
    config: {
        chart: {
            renderTo: 'container',
            type: 'line'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: []
        },
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					formatter: function() {
						return '<b>'+ this.point.name +'</b>';
					}
				}
			}
		},
		series: [{
			name: '', //not nDimension here
			data: []
		}]
    },
    
    /**
     * Initialize the chart object
     * @param resultObservations
     * @param componentParameter
     */
    init: function (observations, parameters, nDimensions) {
        
        // Include org.aksw.CubeViz.Charts.HighCharts.Chart
        Namespacedotjs.include ('org.aksw.CubeViz.Charts.HighCharts.Chart1');
        var chart = org.aksw.CubeViz.Charts.HighCharts.Chart1;
        this.config.title.text = chart.getTitle ( observations, parameters, nDimensions ); 
        
        this.aDimension = this.initDimension(observations, parameters, nDimensions[0]);
        this.aDimension.series.name = this.setPieName(parameters, nDimensions[0]);
        this.config.xAxis.categories = dimension.elements;
        this.config.series = [this.aDimension.series];
    },
    
    /**
     * Calling different function to compute an object which represents a barchart
     */
    getRenderResult: function () {
        return this.config;
    },
    
    initDimension: function(observations, parameters, dimensionUri) {
        
        console.log ( observations ) ;
        console.log ( dimensionUri ) ;
        
		dimension = {};
		dimension.uri = dimensionUri;        
        dimension.elements = this.getElements ( observations, parameters, dimensionUri);
        dimension.distinctElements = dimension.elements.slice(0);
        dimension.distinctElements = this.getDistinctElements(dimension.distinctElements);
        dimension.elementLabels = this.getLabelsForElements ( dimension.distinctElements, parameters );
        dimension.measures = this.getMeasures(parameters);
        dimension.values = this.getElements(observations, parameters, dimension.measures[0]);
        dimension.values = this.convertToNum(dimension.values);
        dimension.series = this.getSeries(dimension.elements, 
										  dimension.distinctElements, 
										  dimension.elementLabels,
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
	
	/**
	 * We suppose that there is only one measure
	 */
	getMeasures: function(parameters) {
		return [parameters.selectedMeasures.measures[0].type];
	},
	
	getSeries: function(elements, distinctElements, labels, values) {
		var i = 0, j;
		var distinctElements_length = distinctElements.length;
		var elements_length = elements.length;
		var series = {
			name: '',
			data: []
		};
		var serie = [];
		for (i; i < distinctElements_length; i++) {
			serie[0] = labels[i];
			for(j = 0; j < elements_length; j++) {
				if(elements[j] == distinctElements[i]) {
					serie[1] = values[j];
				}
			}
			series.data.push(serie);
			serie = [];
		}
		return series;
	},
	
	setPieName: function(parameters, nDimension) {
		var dimensionComps = parameters.selectedDimensionComponents.selectedDimensionComponents;
		var dimensionComps_length = dimensionComps.length;
		var i = 0;
		for(i; i < dimensionComps_length; i++) {
			if(dimensionComps[i].dimension_type != nDimension) {
				return dimensionComps[i].property_label;
			}
		}
		
	},
	
	convertToNum: function(array) {
		i = array.length;
		while(i--) {
			array[i] = parseFloat(array[i]);
		}
		return array;
	},
    
    cleanUpArray: function(arr) {
		var newArr = new Array();for (var k in arr) if(arr[k]) newArr.push(arr[k]);
		return newArr;
	}
});
