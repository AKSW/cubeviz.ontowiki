Namespacedotjs('org.aksw.CubeViz.Controller.Main', {
	
	modelUrl: null,
	cubevizPath: null,
	retrievedResultObservations: null,
	
	init: function(CubeViz_Parameters) {
		//only static parameters here!
		this.modelUrl = CubeViz_Parameters.modelUrl;		
		this.sparqlEndpoint = CubeViz_Parameters.sparqlEndpoint;		
		this.cubevizPath = CubeViz_Parameters.cubevizPath;		
		this.cubevizImagesPath = CubeViz_Parameters.cubevizImagesPath;		
		this.backend = CubeViz_Parameters.backend;		
		this.visualizationContainer = CubeViz_Parameters.visualizationContainer;		
		this.chartType = CubeViz_Parameters.chartType;
	},
		
	getResultObservations: function(linkCode) {
		
		var action = "getresultobservations";
		$.getJSON(this.cubevizPath + action + "/", "m="+this.modelUrl+"&lC="+linkCode+"&sparqlEndpoint="+this.sparqlEndpoint, $.proxy(function(json) {
			this.retrievedResultObservations = json;
			$(body).trigger("AjaxResultObservationsRetrieved.CubeViz");
		}, this));
	},
	
	getParametersFromLink: function(linkCode) {
		var action = "getparametersfromlink";
		$.getJSON(this.cubevizPath + action + "/", "m="+this.modelUrl+"&lC="+linkCode+"&sparqlEndpoint="+this.sparqlEndpoint, $.proxy(function(json) {
			this.retrievedCubeVizParameters = json;
			$(body).trigger("AjaxCubeVizParametersRetrieved.CubeViz", linkCode);
		}, this));
	},	
	
	/**
     * Extracts all dimensions which appears two or more times
     * @return array List of dimension names which appears two or more times
     */
    getMultipleDimensions: function (CubeViz_Parameters_Component) {
        
        var i = 0;
        var multipleDimensions = [];
        var dimensions = CubeViz_Parameters_Component.selectedDimensions.dimensions;
        var dimensions_length = dimensions.length;
        
        for(i; i < dimensions_length; i++) {
			if(dimensions[i].selectedElementCount > 1) {
				multipleDimensions.push(dimensions[i].type);
			}
		}
        
        return multipleDimensions;
    },
    
    getSuitableChartTypes: function(multipleDimensions, CubeViz_ChartConfig) {
		return CubeViz_ChartConfig[multipleDimensions.length];
	},
	
	/**
     * 
     */
	sortObservations: function(observations) {
		var sortedObservations = {};
		
		var indexArray = [];
		var i;
		for (i in observations) {
			indexArray.push(i);   // collect all indexes
		}
		indexArray.sort();  
		for (i = 0; i < indexArray.length; i++) {
			sortedObservations[indexArray[i]] = observations[indexArray[i]];
		}
		
		return sortedObservations;
    },
    
    /**
     * Renders HighCharts
     */
	renderChart: function(renderedChart) {
		new Highcharts.Chart(renderedChart);
	}
});
