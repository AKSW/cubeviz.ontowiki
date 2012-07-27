Namespacedotjs('org.aksw.CubeViz.Charts.HighCharts.Bar2', {
    
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
    init: function (resultObservations, componentParameter, nDimensions) {
        
        // Include org.aksw.CubeViz.Charts.HighCharts.Chart
        Namespacedotjs.include ('org.aksw.CubeViz.Charts.HighCharts.Chart');
        var chart = org.aksw.CubeViz.Charts.HighCharts.Chart;
        
        // set x-axis
        this.config.xAxis.categories  = this.getCategories ( resultObservations, componentParameter, nDimensions );
        
        // set values itself
        this.config.series = this.getSeries ( 
            resultObservations, 
            componentParameter, 
            nDimensions, 
            this.config.xAxis.categories 
        );
        
        this.config.title.text = chart.getTitle ( resultObservations, componentParameter, nDimensions ); 
    },
    
    /**
     * Calling different function to compute an object which represents a barchart
     */
    getRenderResult: function () {
        return this.config;
    },
    
    /**
     * 
     */
    getCategories: function(resultObservations, componentParameter, nDimensions) {
        
		var series = [];
        var i = 0;
        
		var dimensionForXAxis = this.getEntireLengthOfDimensionLabels (componentParameter, nDimensions) [0].dimension;
		
		var categories = [];
		
		// get all selected components for first dimension
		$.each ( resultObservations, function ( index, element ) {
			element = element [ dimensionForXAxis ] [0].value;
			if(-1 == $.inArray(element, categories))
				categories.push (element);
		});
		
		categories.sort ();
        
        return categories;
	},
	
	/**
     * 
     */
	getSeries: function(resultObservations, componentParameter, nDimensions, categories) {
        
        // Make sure, that categories are available
        if ( 0 == categories.length ) {
            return [];
        }
        
        // http://www.w3.org/2000/01/rdf-schema#label
        var dimensionLengths = this.getEntireLengthOfDimensionLabels (componentParameter, nDimensions);
		var series = [];
        var i = 0;
                    
		var data = [];
		
		var dimensionForSeriesGroup = dimensionLengths [1].dimension;
		
		resultObservations.sort (function(a, b){                
			if (a [dimensionLengths [1].dimension] [0].value > b [dimensionLengths [1].dimension] [0].value) 
				return 1;
			else 
				return -1;
		});
		
		var selectedComponents = componentParameter.selectedDimensionComponents.selectedDimensionComponents;
		
		$.each ( selectedComponents, function ( componentIndex, componentElement ) {
			if ( componentElement ["dimension_type"] == dimensionForSeriesGroup ) {
				
				componentElementLabel = componentElement [ "property_label" ];
				componentElementUri = componentElement [ "property" ];
				
				data = [];
				
				$.each ( resultObservations, function ( observationIndex, observationElement ) {
					
					if ( componentElementUri == observationElement [dimensionForSeriesGroup][0].value ) {
						// TODO: find a way to extract proerties/value dynamically!
						data.push (observationElement ["http://data.lod2.eu/scoreboard/properties/value"] [0].value);
					}
				});
				
				series.push ({
					name:componentElementLabel, 
					data:data
				});
			}
		});
        
        return series;
	},
	
	/**
     * 
     */
    getEntireLengthOfDimensionLabels: function (parameters, multipleDimensions) {
		var selectedComponents = parameters.selectedDimensionComponents.selectedDimensionComponents;
		var dimensionLabelLengths = [];
		var entry = {};
		
		$.each ( multipleDimensions, function ( dimensionIndex, dimensionElement ) {
			
			entry = { 
				dimension: dimensionElement, 
				entireLength: 0
			};
			
			$.each ( selectedComponents, function ( componentIndex, componentElement ) {
				
				if ( dimensionElement == componentElement ["dimension_type"] )
					entry.entireLength += componentElement ["property_label"].length;
			});
			
			dimensionLabelLengths.push ( entry );
		});
		
		// sort array by entireLengths
		dimensionLabelLengths.sort ( function (a, b) {
			return b.entireLength < a.entireLength ? 1 : -1;
		});
		
		return dimensionLabelLengths;
    },
});
