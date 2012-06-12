$(function() {
	/************************
	 * Initialize templates *
	 ************************/
		 
	CubeViz_Dimension_Template = jsontemplate.Template(CubeViz_Dimension_Template);
	CubeViz_Measure_Template = jsontemplate.Template(CubeViz_Measure_Template);
	CubeViz_Dialog_Template = jsontemplate.Template(CubeViz_Dialog_Template);
	CubeViz_Options_Dimension_Template = jsontemplate.Template(CubeViz_Options_Dimension_Template);
	CubeViz_Options_Measure_Template = jsontemplate.Template(CubeViz_Options_Measure_Template);
	
	/************************************
	 * Import namespaces as global vars *
	 ************************************/
		 
	Namespacedotjs.include('org.aksw.CubeViz.Module.Main');	
	Namespacedotjs.include('org.aksw.CubeViz.Module.Adapter');	
	
	/************************
	 * Initializing objects *
	 ************************/
	$(document).ready(function() {
		var CubeViz_Main_Module = org.aksw.CubeViz.Module.Main;
		var CubeViz_Adapter_Module = org.aksw.CubeViz.Module.Adapter;
		
		CubeViz_Main_Module.init(CubeViz_Parameters, CubeViz_Adapter_Module);
		CubeViz_Main_Module.load(CubeViz_Dimension_Template,
								 CubeViz_Measure_Template,
								 CubeViz_Dialog_Template,
								 CubeViz_Options_Dimension_Template,
								 CubeViz_Options_Measure_Template,
								 CubeViz_Adapter_Module);
							   
		
		CubeViz_Main_Module.setControlElements();					     
		CubeViz_Main_Module.registerUiEvents();
	});


	// events reference here!				     	
	$(body).bind("dialogOpened.CubeViz", function(event) {
		//console.log($(event.target));
	});		
	
	$(body).bind("dialogClosed.CubeViz", function(event) {
		// make a function for retrieving ID (class?)
		var elementId = $(event.target).attr('id').split("-");
		var label_current = elementId[3];
		
		CubeViz_Main_Module.updateDimensionElementCount(label_current);
	});		
	
	$(body).bind("dialogCheckboxClicked.CubeViz", function(event) {
		var elementClass = $(event.target).attr('class').split("-");
		var label_current = elementClass[3];
		
		CubeViz_Main_Module.recalculateSelectedElementsCount(label_current);
	});		           
	
	$(body).bind("dialogMaxDimensionComponentsExceeded.CubeViz", function(event) {
		var elementClass = $(event.target).attr('id').split("-");
		var label_current = elementClass[1];		
		
		CubeViz_Main_Module.blockDialogCheckboxes(label_current);
		CubeViz_Main_Module.showMaxDimensionsWarning();		
	});     
	
	$(body).bind("dialogMaxDimensionComponentsNotExceeded.CubeViz", function(event) {
		var elementClass = $(event.target).attr('id').split("-");
		var label_current = elementClass[1];
			
		CubeViz_Main_Module.unblockDialogCheckboxes(label_current);
	});		           
	
	$(body).bind("dataStructureDefinitionClicked.CubeViz", function(event) {
		var newDSD = {"url": $(event.target).find(":selected").val(),
					       "label": $(event.target).find(":selected").text() };
		CubeViz_Main_Module.setDSD(newDSD);
	});		      
	
	$(body).bind("dataSetClicked.CubeViz", function(event) {
		var newDS = {"url": $(event.target).find(":selected").val(),
					  "label": $(event.target).find(":selected").text() };
		CubeViz_Main_Module.setDS(newDS);
	});		          
	
	$(body).bind("optionsDimensionOpened.CubeViz", function(event) {
		var elementId = $(event.target).parent().attr("id").split("-");
		var label_current = elementId[2];
		
	});
	
	$(body).bind("optionsDimensionClosed.CubeViz", function(event) {
		var elementId = $(event.target).parent().attr("id").split("-");
		var label_current = elementId[3];
		
	});
	
	$(body).bind("optionsDimensionOrderDirectionClicked.CubeViz", function(event) {
		var elementClass = $(event.target).attr("class").split("-");
		var label_current = elementClass[6];
		
		var newOrderDirection = $(event.target).val();
		var newDimension = CubeViz_Main_Module.getDimensionByLabel(label_current);
		newDimension.orderDirection = newOrderDirection;
		CubeViz_Main_Module.setDimension(newDimension);
	});
	
	$(body).bind("optionsDimensionChartAxisClicked.CubeViz", function(event) {
		var elementClass = $(event.target).attr("class").split("-");
		var label_current = elementClass[6];
		
		var newChartAxis = $(event.target).val();
		var newDimension = CubeViz_Main_Module.getDimensionByLabel(label_current);
		newDimension.chartAxis = newChartAxis;
		CubeViz_Main_Module.setDimension(newDimension);
	
	});
	
	$(body).bind("optionsMeasureOpened.CubeViz", function(event) {
		var elementId = $(event.target).parent().attr("id").split("-");
		var label_current = elementId[2];
		
	});
	
	$(body).bind("optionsMeasureClosed.CubeViz", function(event) {
		var elementId = $(event.target).parent().attr("id").split("-");
		var label_current = elementId[3];
		
	});
	
	$(body).bind("optionsMeasureAggregationMethodClicked.CubeViz", function(event) {
		var elementClass = $(event.target).attr("class").split("-");
		var label_current = elementClass[6];
		
		var newAggregationMethod = $(event.target).val();
		var newMeasure = CubeViz_Main_Module.getMeasureByLabel(label_current);
		newMeasure.aggregationMethod = newAggregationMethod;
		CubeViz_Main_Module.setMeasure(newMeasure);
	});
	
	$(body).bind("optionsMeasureOrderDirectionClicked.CubeViz", function(event) {
		var elementClass = $(event.target).attr("class").split("-");
		var label_current = elementClass[6];
		
		var newOrderDirection = $(event.target).val();
		var newMeasure = CubeViz_Main_Module.getMeasureByLabel(label_current);
		newMeasure.orderDirection = newOrderDirection;
		CubeViz_Main_Module.setMeasure(newMeasure);
	});
	
	$(body).bind("optionsMeasureRoundValuesClicked.CubeViz", function(event) {
		var elementClass = $(event.target).attr("class").split("-");
		var label_current = elementClass[6];
		
		var newRoundValues = $(event.target).val();
		var newMeasure = CubeViz_Main_Module.getMeasureByLabel(label_current);
		newMeasure.roundValues = newRoundValues;
		CubeViz_Main_Module.setMeasure(newMeasure);
	});
	
	$(body).bind("dimensionCheckBoxClicked.CubeViz", function(event) {
		var elementId = $(event.target).attr("id").split("-");
		var label_current = elementId[6];
	});
	
	$(body).bind("measureCheckBoxClicked.CubeViz", function(event) {
		var elementId = $(event.target).attr("id").split("-");
		var label_current = elementId[6];
	});
	     		
	/************************
	 * Template Processing  *
	 * Initialization stage *
	 ************************
	

	/*


	
	//initialize the Options link for dimensions
	org.aksw.cubeViz.Index.Main.initOptionsDimensionLinkOnInit(org.aksw.cubeViz.Index.Main.selectedDimensions);	
	
	//initialize the Options link for measures
	org.aksw.cubeViz.Index.Main.initOptionsMeasureLinkOnInit(org.aksw.cubeViz.Index.Main.selectedMeasures);
	
	/*************************************************
	 * Logic branch: if only one selection exists in *
	 * datastructures or dataelements                *
	 * dialog render is also here                    *
	 *************************************************
	
	//check if there is only one dataStructure exist
	if($("#sidebar-left-data-selection-strc").children().length == 1) {
		org.aksw.cubeViz.Index.Main.selectedDSD = {
			"label": "datastructureLabel",
			"uri": $("#sidebar-left-data-selection-strc").val()
			};
		
		org.aksw.cubeViz.Index.Main.reloadDataSetList($("#sidebar-left-data-selection-strc").val());
		console.log("here");
	}
	
	//next logic step is in the reloadDataSetList function
	
	/**************************
	 * Button event listeners *
	 **************************
	$("#sidebar-left-data-selection-submitbtn").click(org.aksw.cubeViz.Index.Main.sidebarLeftDataSelectionSubmitbtnClick);
		
	/****************************
	 * Data Selection listeners *
	 ****************************
	
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
	 **********************************
	
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
	}*/

	
});
