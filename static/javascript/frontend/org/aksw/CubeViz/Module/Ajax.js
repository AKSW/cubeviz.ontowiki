// https://github.com/smith/namespacedotjs
//Namespace('org.aksw.cubeViz.GUI');

// creates or use a namespace and fill it with the specified properties
Namespacedotjs('org.aksw.CubeViz.Module.Ajax', {
	
	cubevizPath: null,
	modelUrl: null,
	
	retrievedDSD: null,
	retrievedDS: null,
	retrievedMeasures: null,
	retrievedDimensions: null,
	retrievedDimensionComponents: null,
	
	
	init: function(CubeViz_Parameters) {
		this.cubevizPath = CubeViz_Parameters.cubevizPath;
		this.modelUrl = CubeViz_Parameters.modelUrl;
	},
	
	/**
	 * @param: m = this.modelUri
	 */
	getDataStructureDefinitions: function() {
		var action = "getdatastructuredefinitions";
		$.getJSON(this.cubevizPath + action + "/", "m="+this.modelUrl, $.proxy(function(json) {
			this.retrievedDSD = json;
			$(body).trigger("AjaxDSDRetrieved.CubeViz");
		}, this));
	},
	
	/**
	 * @param: m = this.modelUrl
	 * @param: dsdUrl = this.retrievedDSD.url
	 */
	getDataSets: function(dsd) {
		var action = "getdatasets";
		$.getJSON(this.cubevizPath + action + "/", "m="+this.modelUrl+"&dsdUrl="+dsd.url, $.proxy(function(json) {
			this.retrievedDS = json;
			$(body).trigger("AjaxDSRetrieved.CubeViz");
		}, this));
	},
	
	getMeasures: function(dsd, ds) {
		var action = "getcomponents";
		$.getJSON(this.cubevizPath + action + "/", "m="+this.modelUrl+"&dsdUrl="+dsd.url+"&ds="+ds.url+"&cT=measure", $.proxy(function(json) {
			this.retrievedMeasures = json;
			$(body).trigger("AjaxMeasuresRetrieved.CubeViz");
		}, this));
	},
	
	getDimensions: function(dsd, ds) {
		var action = "getcomponents";
		$.getJSON(this.cubevizPath + action + "/", "m="+this.modelUrl+"&dsdUrl="+dsd.url+"&ds="+ds.url+"&cT=dimension", $.proxy(function(json) {
			this.retrievedDimensions = json;
			$(body).trigger("AjaxDimensionsRetrieved.CubeViz");
		}, this));
	},
	
	getAllDimensionsComponents: function(ds, dimensions) {
		var action = "getalldimensionselements";
		$.getJSON(this.cubevizPath + action + "/", "m="+this.modelUrl+"&dsUrl="+ds.url+"&dimensions="+$.toJSON(dimensions), $.proxy(function(json) {
			this.retrievedDimensionComponents = json;
			$(body).trigger("AjaxAllDimensionsComponentsRetrieved.CubeViz");
		}, this));
	},
	
	/**
	 * Input: configuration string with POST variables
	 * usually initialized after sidebarLeftDataSelectionSubmitbtnClick
	 * Action: redirect user to the new visualization
	 * Output: no output
	 */	
	saveLinkToFile: function(link) {
		actionName = "savelinktofile";
        
		$.ajax({
			type: "POST",
			url: this.cubevizPath + actionName + "/",
			data: link,
			success: function(uri){
				//var uri_full = uri+"&chartType="+org.aksw.cubeViz.Index.Main.chartType;
				//window.location.replace(uri_full);	
			}
		});
	}, 
	
	/**
	 * Input: number of selected dimensions and measures
	 * Action: sends AJAX request to server to get list of possible chart
	 * types for the particular selection of dimensions and measures
	 * UI update: process chart selection bar on the right
	 * Output: no output
	 * Fires on events: 
	 * --- Dimensions and measures checkbox click
	 */
	getApplicableCharts: function () {	
		//get number of selected dimensions
		var numberof_selectedDimensions = $("#sidebar-left-data-selection-dims-boxes").find("input:checked").length;		
		var numberof_selectedMeasures = $("#sidebar-left-data-selection-meas-boxes").find("input:checked").length;		
			
		actionName = "getapplicablecharts";
		$.ajax({
			type: "POST",
			url: this.cubevizPath + actionName + "/",
			data: "numberof_selectedDimensions="+numberof_selectedDimensions+
				  "&numberof_selectedMeasures="+numberof_selectedMeasures+
				  "&m="+this.modelUri,
			success: function(jsonObject){
				var applicableCharts = JSON.parse(jsonObject, true);			
			}
		});
	}
});