$(function() {
	/********************************
	 * Quick Fixes need refactoring *
	 ********************************/
	
	// title change
	//document.title = "CubeViz";
	
	/************************************************
	 * Include org.aksw.cubeViz.GUI.Views namespace *
	 ************************************************/
	 
	Namespace.include('org.aksw.cubeViz.Index.Main');	
	Namespace.include('org.aksw.cubeViz.Index.Adapter');	
	
	/***************************
	 * Configurable parameters *
	 ***************************/
	
	org.aksw.cubeViz.Index.Main.availableChartTypes = new Array("bar","pie","line","area","splines","scatterplot","table");
	
	/************************
	 * Initialize templates *
	 ************************/
	
	//for template code look into index.phtml file
	 
	dimensionsTemplate = jsontemplate.Template(dimensionsTemplate);
	measuresTemplate = jsontemplate.Template(measuresTemplate);
	dialogTemplate = jsontemplate.Template(dialogTemplate);
	optionsDimensionTemplate = jsontemplate.Template(optionsDimensionTemplate);
	optionsMeasureTemplate = jsontemplate.Template(optionsMeasureTemplate);
		
	/**********************************
	 * Set variables to the namespace *
	 **********************************/
	
	// parse strings to JSON object
	cubevizParameters.selectedDimensions = JSON.parse(cubevizParameters.selectedDimensions);
	cubevizParameters.selectedMeasures = JSON.parse(cubevizParameters.selectedMeasures);
	cubevizParameters.selectedDimensionComponents = JSON.parse(cubevizParameters.selectedDimensionComponents);
	
	//TODO: use the package vars everywhere
	org.aksw.cubeViz.Index.Main.sparqlEndpoint = cubevizParameters.sparqlEndpoint; 
	org.aksw.cubeViz.Index.Main.selectedGraph = cubevizParameters.selectedGraph; 
	org.aksw.cubeViz.Index.Main.selectedDSD = cubevizParameters.selectedDSD; 
	org.aksw.cubeViz.Index.Main.selectedDS = cubevizParameters.selectedDS; 
	org.aksw.cubeViz.Index.Main.selectedMeasures = cubevizParameters.selectedMeasures; 
	org.aksw.cubeViz.Index.Main.selectedDimensions = cubevizParameters.selectedDimensions; 
	org.aksw.cubeViz.Index.Main.selectedDimensionComponents = cubevizParameters.selectedDimensionComponents; 
	org.aksw.cubeViz.Index.Main.modelUri = cubevizParameters.modelUri; 
	org.aksw.cubeViz.Index.Main.cubevizPath = cubevizParameters.cubevizPath; 
	org.aksw.cubeViz.Index.Main.backend = cubevizParameters.backend;
	org.aksw.cubeViz.Index.Main.chartType = cubevizParameters.chartType;
	
	// unpack options from selectedDimensions object
	org.aksw.cubeViz.Index.Main.optionsDimensions = 
			org.aksw.cubeViz.Index.Adapter.extractOptionsFromSelectedDimensions(
								 org.aksw.cubeViz.Index.Main.selectedDimensions);
	
	// unpack options from selectedMeasures object
	org.aksw.cubeViz.Index.Main.optionsMeasures = 
			org.aksw.cubeViz.Index.Adapter.extractOptionsFromSelectedMeasures(
			                     org.aksw.cubeViz.Index.Main.selectedMeasures);
		
	/**************************
	 * Global scope functions *
	 **************************/
	 
	String.prototype.hashCode = function() {
	  for(var ret = 0, i = 0, len = this.length; i < len; i++) {
	    ret = (31 * ret + this.charCodeAt(i)) << 0;
	  }
	  return ret;
	};		 
			 
	/******************************
	 * Bind events to the buttons *
	 ******************************/
		
	//chart options button
	//$("#specify-chart-options-button").click(org.aksw.cubeViz.GUI.Views.specifyChartOptionsButton);
	
	/*******************
	 * Set header etc. *
	 *******************/
	
	//$("#header-model-uri").text(modelUri);
	
	/************************
	 * Template Processing  *
	 * Initialization stage *
	 ************************/
	
	containerId = "sidebar-left-data-selection-strc";
	org.aksw.cubeViz.Index.Main.addItem(containerId, org.aksw.cubeViz.Index.Main.selectedDSD);
	containerId = "sidebar-left-data-selection-sets";
	org.aksw.cubeViz.Index.Main.addItem(containerId, org.aksw.cubeViz.Index.Main.selectedDS);
	
	$("#sidebar-left-data-selection-dims-boxes").html(dimensionsTemplate.expand(org.aksw.cubeViz.Index.Main.selectedDimensions));
	$("#sidebar-left-data-selection-meas-boxes").html(measuresTemplate.expand(org.aksw.cubeViz.Index.Main.selectedMeasures));
	
	//TODO: retrieve labels for selected components and save them to the file!
	var dimensionComponentsAggregated = [];
	var dimensionComponentsAggregated = 
			org.aksw.cubeViz.Index.Adapter.packDimensionComponentsForTemplate(org.aksw.cubeViz.Index.Main.selectedDimensionComponents, 
																			  org.aksw.cubeViz.Index.Main.selectedDimensions);
	
	org.aksw.cubeViz.Index.Main.renderDialogsForDimensionsInit(dimensionComponentsAggregated);
			
	//set events for page links
	org.aksw.cubeViz.Index.Main.initPageLinks ();
			
	//create dialogs for each dimension (and fill it with dimension components)
	org.aksw.cubeViz.Index.Main.initSelectElementLink(org.aksw.cubeViz.Index.Main.selectedDimensions);
	
	//initialize the Options link for dimensions
	org.aksw.cubeViz.Index.Main.initOptionsDimensionLinkOnInit(org.aksw.cubeViz.Index.Main.selectedDimensions);	
	
	//initialize the Options link for measures
	org.aksw.cubeViz.Index.Main.initOptionsMeasureLinkOnInit(org.aksw.cubeViz.Index.Main.selectedMeasures);
	
	/*************************************************
	 * Logic branch: if only one selection exists in *
	 * datastructures or dataelements                *
	 * dialog render is also here                    *
	 *************************************************/
	
	//check if there is only one dataStructure exist
	if($("#sidebar-left-data-selection-strc").children().length == 1) {
		org.aksw.cubeViz.Index.Main.selectedDSD = {
			"label": "datastructureLabel",
			"uri": $("#sidebar-left-data-selection-strc").val()
			};
		
		org.aksw.cubeViz.Index.Main.reloadDataSetList($("#sidebar-left-data-selection-strc").val());
	}
	
	//next logic step is in the reloadDataSetList function
	
	/**************************
	 * Button event listeners *
	 **************************/
	$("#sidebar-left-data-selection-submitbtn").click(org.aksw.cubeViz.Index.Main.sidebarLeftDataSelectionSubmitbtnClick);
		
	/****************************
	 * Data Selection listeners *
	 ****************************/
	
	// data structure
	$("#sidebar-left-data-selection-strc").click( function() {
		org.aksw.cubeViz.Index.Main.selectedDSD = {
			"label": "datastructureLabel",
			"uri": $(this).val()
			};
		
		org.aksw.cubeViz.Index.Main.reloadDataSetList($(this).val());
	});
	
	// data set
	$("#sidebar-left-data-selection-sets").click( function() {
		// get dimensions and measures from the DB and renew dimensions and measures list
		org.aksw.cubeViz.Index.Main.reloadDimensionsAndMeasuresList($(this).val());
	});
	
	/**********************************
	 * Chart selection event listener *
	 *      For chart icon menu       *
	 **********************************/
	
	$("#chart-selection-selected-chart").val(org.aksw.cubeViz.Index.Main.chartType);
	//set the default selected chart type
	chartType = $("#chart-selection-selected-chart").val();
	//setting this opacity to 100%
	$("#chart-selection-"+chartType).css("opacity","0.6");
	// for IE8-
	$("#chart-selection-"+chartType).css("filter","alpha(opacity=60)");
	
	// append event to each img id=chart-selection-arrayelement
	var availableChartTypesLength = org.aksw.cubeViz.Index.Main.availableChartTypes.length;
	while(availableChartTypesLength--) {
		var currentChartType = org.aksw.cubeViz.Index.Main.availableChartTypes[availableChartTypesLength];
		
		$("#chart-selection-"+currentChartType).click(function() {			
			//setting this opacity to 100%
			$(this).css("opacity","0.6");
			// for IE8-
			$(this).css("filter","alpha(opacity=60)");
			//setting old selected opacity to 60%
			var oldChartType = $("#chart-selection-selected-chart").val();
			$("#chart-selection-"+oldChartType).css("opacity","1.0");
			// for IE8-
			$("#chart-selection-"+oldChartType).css("filter","alpha(opacity=100)");
			
			
			//getting the chart type from id
			var id = $(this).attr('id');
			id = id.split("-");
			var chartType = id[2];
			$("#chart-selection-selected-chart").val(chartType);
			
			//set chartType to the Main namespace
			org.aksw.cubeViz.Index.Main.chartType = chartType;
			
			//construct URI
			var uri_search = window.location.search.split("&");
			var patt=/chartType/i;
			uri_search = jQuery.grep(uri_search, function(n, i){
				return (!patt.test(n));
			});
			uri_search = uri_search.join("&");
			uri_search += "&chartType="+chartType; 
			uri_full = window.location.href.split(window.location.search)[0] + uri_search;
			
			window.location.replace(uri_full);
			//var config = org.aksw.cubeViz.Index.Main.makeConfig();
			//org.aksw.cubeViz.Index.Main.saveConfigurationToFile(config);
		});
		
		$("#chart-selection-"+currentChartType).mouseover(function() {
			$(this).css("opacity","0.6");
			
			// for IE8-
			$(this).css("filter","alpha(opacity=60)");
		});
		
		$("#chart-selection-"+currentChartType).mouseout(function() {
			// get chart type
			var id = $(this).attr('id');
			id = id.split("-");
			var chartType = id[2];
			
			if($("#chart-selection-selected-chart").val() != chartType) {
				$(this).css("opacity","1.0");
			
				//for IE8-
				$(this).css("filter","alpha(opacity=100)");
			}
		});
	}

	
});
