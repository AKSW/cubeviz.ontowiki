// https://github.com/smith/namespacedotjs
//Namespace('org.aksw.cubeViz.GUI');

// creates or use a namespace and fill it with the specified properties
Namespacedotjs('org.aksw.CubeViz.Index.Main', {
	
	modelUrl: null,
	cubevizPath: null,
	retrievedResultObservations: null,
	
	init: function(CubeViz_Parameters) {
		
		console.log(CubeViz_Parameters);
		this.CubeViz_Parameters = CubeViz_Parameters;
		this.modelUrl = CubeViz_Parameters.modelUrl;
		this.cubevizPath = CubeViz_Parameters.cubevizPath;
		this.dimensions = CubeViz_Parameters.selectedDimensions;
		this.measures = CubeViz_Parameters.selectedMeasures;
	},
		
	getResultObservations: function(linkCode) {
		var action = "getresultobservations";
		$.getJSON(this.cubevizPath + action + "/", "m="+this.modelUrl+"&lC="+linkCode, $.proxy(function(json) {
			this.retrievedResultObservations = json;
			$(body).trigger("AjaxResultObservationsRetrieved.CubeViz");
		}, this));
	},
	
	processRetrievedObservations: function() {
		
		var observations = [];
		
		var observation_current = null;
		for(observation in this.retrievedResultObservations) {
			observation_current = this.retrievedResultObservations[observation];
			
		}
		
		console.log(this.retrievedResultObservations);
		console.log(this.dimensions);
	}
});
