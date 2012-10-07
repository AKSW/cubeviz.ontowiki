Namespacedotjs('org.aksw.CubeViz.Charts.HighCharts.Bar0', {
	
	aDimension: {},
    
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
        tooltip: {
            formatter: function() {
                return ' ';
            }
        },
        xAxis: {
            categories: []
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
        Namespacedotjs.include ('org.aksw.CubeViz.Charts.HighCharts.Chart0');
        var chart = org.aksw.CubeViz.Charts.HighCharts.Chart0;
        this.config.title.text = chart.getTitle ( observations, parameters, nDimensions ); 
        
        var dimension = this.initDimension(observations, parameters);
        this.config.xAxis.categories = dimension.xAxis.categories;
        
        this.setName(parameters);
    },
    
    /**
     * Calling different function to compute an object which represents a barchart
     */
    getRenderResult: function () {
        return this.config;
    },
    
    initDimension: function(observations, parameters) {
        
        dimension = {
            elements:[],
            elementLabels:[],
            measures:[],
            series:[],
            uri:"",
            values:[],
            xAxis:{categories:[]}
        };

        /**
         * Uri of the value
         * e.g. http://data.lod2.eu/scoreboard/properties/value
         */
        var uri = parameters.selectedMeasures.measures [0];
        uri = uri ["type"];          
        dimension.uri = uri;
        
        /**
         * List of values
         * in this case its only one element
         */
        dimension.elements = this.getElements ( observations, parameters, dimension.uri);
        
        dimension.elementLabels = this.getLabelsForElements ( observations );
        
        dimension.measures = this.getMeasures(parameters);
        
        dimension.values = this.convertToNum(
                                this.getElements(observations, parameters, dimension.measures[0])
                            );
        
        dimension.series = this.getSeries(dimension.elements, 
										  dimension.elementLabels,
										  dimension.values);
        
        dimension.xAxis.categories = [ dimension.elementLabels [0] ];
        
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
	
    /**
     * 
     */
	getLabelsForElements: function(observations) {        
        for ( var o in observations ) {
            o = observations [ o ];
            o = o ["http://www.w3.org/2000/01/rdf-schema#label"];
            o = o [0];
            return [ o ["value"] ];
        }
	},
	
	/**
	 * We suppose that there is only one measure
	 */
	getMeasures: function(parameters) {
		return [parameters.selectedMeasures.measures[0].type];
	},
	
	getSeries: function(elements, labels, values) {
        
        this.config.series = [
            {
                name: labels [0],
                data: [
                    values [0]
                ]
            }
        ];
        
		return this.config.series;
	},
	
	setName: function(parameters) {
		var dimensionComps = parameters.selectedDimensionComponents.selectedDimensionComponents;
		var dimensionComps_length = dimensionComps.length;
		for(var i = 0; i < dimensionComps_length; ++i) {
			return dimensionComps[i].property_label;
		}		
	},
	
	convertToNum: function(array) {
		var i = array.length;
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
