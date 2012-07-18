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
	}
});
