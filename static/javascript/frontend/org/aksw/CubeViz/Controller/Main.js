// https://github.com/smith/namespacedotjs
//Namespace('org.aksw.cubeViz.GUI');

// creates or use a namespace and fill it with the specified properties
Namespacedotjs('org.aksw.CubeViz.Controller.Main', {
	
	modelUrl: null,
	cubevizPath: null,
	retrievedResultObservations: null,
	
	init: function(CubeViz_Parameters) {
		this.CubeViz_Parameters = CubeViz_Parameters;
		this.modelUrl = CubeViz_Parameters.modelUrl;
		this.sparqlEndpoint = CubeViz_Parameters.sparqlEndpoint;
		this.cubevizPath = CubeViz_Parameters.cubevizPath;
		this.dimensions = CubeViz_Parameters.selectedDimensions;
		this.measures = CubeViz_Parameters.selectedMeasures;
	},
		
	getResultObservations: function(linkCode) {
		var action = "getresultobservations";
		$.getJSON(this.cubevizPath + action + "/", "m="+this.modelUrl+"&lC="+linkCode+"&sparqlEndpoint="+this.sparqlEndpoint, $.proxy(function(json) {
			this.retrievedResultObservations = json;
			$(body).trigger("AjaxResultObservationsRetrieved.CubeViz");
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
		var numberOfMultipleDimensions = multipleDimensions.length;
		
		return CubeViz_ChartConfig[numberOfMultipleDimensions];
	},
	
    /**
     * Renders HighCharts
     */
	renderChart: function(renderedChart) {
		new Highcharts.Chart(renderedChart);
	}
});
