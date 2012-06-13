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
	retrievedComponentElements: null,
	
	
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
	
	getComponentElements: function(ds, component) {
		var action = "getcomponentelements";
		$.getJSON(this.cubevizPath + action + "/", "m="+this.modelUrl+"&dsUrl="+ds.url+"&cP="+component.type, $.proxy(function(json) {
			this.retrievedComponentElements = json;
			$(body).trigger("AjaxComponentElementsRetrieved.CubeViz");
		}, this));
	},
	
	/**
	 * Input: [ number: uri ] array
	 * Come from: sidebarLeftDataSelectionSubmitbtnClick - Step 2
	 * Chained to: makeConfig
	 * Side Action: set labels to the global namespace vars
	 * Action: forward to the config save function
	 * Output: no output
	 */
	requestLabelsFor: function (uris) {
		actionName = "getlabelsfor";
		$.ajax({
			type: "POST",
			url: this.cubevizPath + actionName + "/",
			data: "uris="+ $.toJSON(uris) +
				"&modelUri="+this.modelUri,
			success: function(data){
				var labels = JSON.parse(data);				
				org.aksw.cubeViz.Index.Main.selectedDSD = {label: labels[org.aksw.cubeViz.Index.Main.selectedDSD], 
														   uri:org.aksw.cubeViz.Index.Main.selectedDSD};
				org.aksw.cubeViz.Index.Main.selectedDS = {label: labels[org.aksw.cubeViz.Index.Main.selectedDS], 
														   uri:org.aksw.cubeViz.Index.Main.selectedDS};		
						
				var config = org.aksw.cubeViz.Index.Main.makeConfig();
				org.aksw.cubeViz.Index.Main.saveConfigurationToFile(config);
			}
		});
	},
	
	/**
	 * Input: configuration string with POST variables
	 * usually initialized after sidebarLeftDataSelectionSubmitbtnClick
	 * Action: redirect user to the new visualization
	 * Output: no output
	 */	
	saveConfigurationToFile: function(configuration) {
		actionName = "saveconfiguration";
        
		$.ajax({
			type: "POST",
			url: this.cubevizPath + actionName + "/",
			data: configuration,
			success: function(uri){
				var uri_full = uri+"&chartType="+org.aksw.cubeViz.Index.Main.chartType;
				window.location.replace(uri_full);	
			}
		});
	},
	
	/**
	 * Input: Data Structure URI (string)
	 * Action: Retrieve Data Sets for specific Data Structure from DB
	 * and append it to the Data Set container (reload it)
	 * Output: no output
	 */
	reloadDataSetList: function(dataStructureUri) {
		actionName = "getdatasets";
		$.ajax({
			type: "POST",
			url: this.cubevizPath + actionName + "/",
			data: "dataStructure="+dataStructureUri,
			success: function(jsonObject){
				var dataSets = JSON.parse(jsonObject);
				dataSets = createDataSetObjects(dataSets);
				
				//empty container
				$("#sidebar-left-data-selection-sets").empty();
								
				//Append item to container
				containerId = "sidebar-left-data-selection-sets";
				org.aksw.cubeViz.Index.Main.addItem(containerId, dataSets);
				
				//check if only one dataSet exists
				if($("#sidebar-left-data-selection-sets").children().length == 1) {
					org.aksw.cubeViz.Index.Main.reloadDimensionsAndMeasuresList($("#sidebar-left-data-selection-sets").val());
				}
			}
		});
		
		function createDataSetObjects(dataSets) {
			dss_temp = new Array();
			for(ds in dataSets) {
				var dataSet = {
					label: dataSets[ds],
					uri: ds
				};
				dss_temp.push(dataSet);
			}
			// Suppose that we have only one data set now
			return dss_temp[0];
		}
	},  
	
	/**
	 * Input: dataset URI
	 * Action: retrieve dimensions and measures from the DB
	 * and show it in the lists (reload)
	 * Output: no output
	 */
	reloadDimensionsAndMeasuresList: function(dataSetUri) {
		actionName = "getdimensionsandmeasures";
		$.ajax({
			type: "POST",
			url: this.cubevizPath + actionName + "/",
			data: "dataSet="+dataSetUri+"&dataStructure="+this.selectedDSD.uri,
			success: function(jsonObject){
				var temp = JSON.parse(jsonObject);
				var dimensions = {"dimensions": temp["dimensions"]};
				org.aksw.cubeViz.Index.Main.allDimensions = dimensions;
				var measures = {"measures": temp["measures"]};
				org.aksw.cubeViz.Index.Main.allMeasures = measures;
				
				// TODO: wrap templates in the its own namespace (?)
				//Append dimensions to the container
				$("#sidebar-left-data-selection-dims-boxes").html(dimensionsTemplate.expand(dimensions));
				org.aksw.cubeViz.Index.Main.initSelectElementLink(dimensions);
				org.aksw.cubeViz.Index.Main.initOptionsDimensionLink(dimensions);
				//Append measures to the container
				$("#sidebar-left-data-selection-meas-boxes").html(measuresTemplate.expand(measures));
				org.aksw.cubeViz.Index.Main.initOptionsMeasureLink(measures);
				
				//check checkboxes
				org.aksw.cubeViz.Index.Main.markSelectedDimensionsAndMeasures();
				
				//load dialogs (!)
				//get all labels!
				var dims = dimensions.dimensions;
				for(var dim in dims) {
					org.aksw.cubeViz.Index.Main.reloadDimensionComponentDialog(dims[dim].label);
				}
			}
		});
	},
	
	/**
	 * Input: dimention label - we assume that label is unique
	 * Action: get dimension components from backend and
	 * forward them to the renderDialogsForDimensions
	 * Output: no output
	 */
	reloadDimensionComponentDialog: function (dimensionLabel) {		
		actionName = "getcomponentelements";
		$.ajax({
			type: "POST",
			url: this.cubevizPath + actionName + "/",
			data: "dimensionLabel="+dimensionLabel+
				  "&dataSet="+this.selectedDS.uri+
				  "&dataStructure="+this.selectedDSD.uri+
				  "&m="+this.modelUri,
			success: function(jsonObject){
				var specificDimensions = JSON.parse(jsonObject);			
								
				org.aksw.cubeViz.Index.Main.renderDialogsForDimensions(specificDimensions);
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
				console.log(applicableCharts);
			}
		});
	}
});
