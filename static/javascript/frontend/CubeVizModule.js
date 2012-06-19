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
	Namespacedotjs.include('org.aksw.CubeViz.Module.Ajax');	
	
	/************************
	 * Initializing objects *
	 ************************/
	var CubeViz_Main_Module = org.aksw.CubeViz.Module.Main;
	var CubeViz_Adapter_Module = org.aksw.CubeViz.Module.Adapter;
	var CubeViz_Ajax_Module = org.aksw.CubeViz.Module.Ajax;
	
	CubeViz_Ajax_Module.init(CubeViz_Parameters);
	
	CubeViz_Main_Module.init(CubeViz_Parameters, CubeViz_Adapter_Module);
	CubeViz_Main_Module.load(CubeViz_Dimension_Template,
							 CubeViz_Measure_Template,
							 CubeViz_Dialog_Template,
							 CubeViz_Options_Dimension_Template,
							 CubeViz_Options_Measure_Template,
							 CubeViz_Adapter_Module);
						   
	CubeViz_Main_Module.setControlElements();					     
	CubeViz_Main_Module.registerUiEvents();
	
	/*********************
	 * UI event handling *
	 *********************/
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
		
		var isComponentSelected = $(event.target).attr('checked');
		var url = $(event.target).val();
		if(isComponentSelected) {
			var component = CubeViz_Main_Module.getDimensionComponentByUrl(url);
			CubeViz_Main_Module.selectDimensionComponent(component);
		} else {
			CubeViz_Main_Module.unselectDimensionComponent(url);
		}
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
		CubeViz_Main_Module.selectDSD(newDSD);
	});		      
	
	$(body).bind("dataSetClicked.CubeViz", function(event) {
		var newDS = {"url": $(event.target).find(":selected").val(),
					  "label": $(event.target).find(":selected").text() };
		CubeViz_Main_Module.selectDS(newDS);
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
		CubeViz_Main_Module.updateDimension(newDimension);
		CubeViz_Main_Module.updateSelectedDimension(newDimension);
	});
	
	$(body).bind("optionsDimensionChartAxisClicked.CubeViz", function(event) {
		var elementClass = $(event.target).attr("class").split("-");
		var label_current = elementClass[6];
		
		var newChartAxis = $(event.target).val();
		var newDimension = CubeViz_Main_Module.getDimensionByLabel(label_current);
		newDimension.chartAxis = newChartAxis;
		CubeViz_Main_Module.updateDimension(newDimension);
		CubeViz_Main_Module.updateSelectedDimension(newDimension);
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
		CubeViz_Main_Module.updateMeasure(newMeasure);
		CubeViz_Main_Module.updateSelectedMeasure(newMeasure);
	});
	
	$(body).bind("optionsMeasureOrderDirectionClicked.CubeViz", function(event) {
		var elementClass = $(event.target).attr("class").split("-");
		var label_current = elementClass[6];
		
		var newOrderDirection = $(event.target).val();
		var newMeasure = CubeViz_Main_Module.getMeasureByLabel(label_current);
		newMeasure.orderDirection = newOrderDirection;
		CubeViz_Main_Module.updateMeasure(newMeasure);
		CubeViz_Main_Module.updateSelectedMeasure(newMeasure);
	});
	
	$(body).bind("optionsMeasureRoundValuesClicked.CubeViz", function(event) {
		var elementClass = $(event.target).attr("class").split("-");
		var label_current = elementClass[6];
		
		var newRoundValues = $(event.target).val();
		var newMeasure = CubeViz_Main_Module.getMeasureByLabel(label_current);
		newMeasure.roundValues = newRoundValues;
		CubeViz_Main_Module.updateMeasure(newMeasure);
		CubeViz_Main_Module.updateSelectedMeasure(newMeasure);
	});
	
	$(body).bind("dimensionCheckBoxClicked.CubeViz", function(event) {
		var elementId = $(event.target).attr("id").split("-");
		var label_current = elementId[6];
		
		var isDimensionSelected = $(event.target).attr('checked');
		if(isDimensionSelected) {
			var dimension = CubeViz_Main_Module.getDimensionByLabel(label_current);
			CubeViz_Main_Module.selectDimension(dimension);
		} else {
			CubeViz_Main_Module.unselectDimension(label_current);
		}
		
		console.log(CubeViz_Main_Module.selectedDimensions);
	});
	
	$(body).bind("measureCheckBoxClicked.CubeViz", function(event) {
		var elementId = $(event.target).attr("id").split("-");
		var label_current = elementId[6];
		
		var isMeasureSelected = $(event.target).attr('checked');
		if(isMeasureSelected) {
			var measure = CubeViz_Main_Module.getMeasureByLabel(label_current);
			CubeViz_Main_Module.selectMeasure(measure);
		} else {
			CubeViz_Main_Module.unselectMeasure(label_current);
		}
		
		console.log(CubeViz_Main_Module.selectedMeasures);
	});
	
	$(body).bind("submitButtonClicked.CubeViz", function(event) {
		var config = CubeViz_Main_Module.makeLink();
		CubeViz_Ajax_Module.saveLinkToFile(config);
	});
	
	/******************************
	 * DataBase interaction logic *
	 ******************************/
	 
	//on load get all DSD for chosen model
	CubeViz_Ajax_Module.getDataStructureDefinitions();

	/****************************
	 * AJAX routine starts here *
	 ****************************/
		
	$(body).bind("AjaxDSDRetrieved.CubeViz", function() {
		CubeViz_Main_Module.allDSD = CubeViz_Ajax_Module.retrievedDSD;
		
		CubeViz_Main_Module.renderDSD(CubeViz_Main_Module.allDSD);
		
		if(CubeViz_Main_Module.allDSD.length == 1) {
			CubeViz_Ajax_Module.getDataSets(CubeViz_Main_Module.allDSD[0]);
		}
	});
	
	$(body).bind("AjaxDSRetrieved.CubeViz", function() {
		CubeViz_Main_Module.allDS = CubeViz_Ajax_Module.retrievedDS;
				
		CubeViz_Main_Module.renderDS(CubeViz_Main_Module.allDS);
				
		if(CubeViz_Main_Module.allDS.length == 1) {
			CubeViz_Ajax_Module.getMeasures(CubeViz_Main_Module.selectedDSD,CubeViz_Main_Module.allDS[0]);
			CubeViz_Ajax_Module.getDimensions(CubeViz_Main_Module.selectedDSD,CubeViz_Main_Module.allDS[0]);
		}		

	});
	
	$(body).bind("AjaxMeasuresRetrieved.CubeViz", function() {
		
		CubeViz_Main_Module.allMeasures = CubeViz_Adapter_Module.processRetrievedMeasures(CubeViz_Ajax_Module.retrievedMeasures,
																						  CubeViz_Main_Module.selectedMeasures);
																						  
		CubeViz_Main_Module.renderMeasures(CubeViz_Main_Module.allMeasures);
		CubeViz_Main_Module.renderOptionsForMeasures(CubeViz_Main_Module.allMeasures, CubeViz_Options_Measure_Template);
	});
	
	$(body).bind("AjaxDimensionsRetrieved.CubeViz", function() {		
		
		CubeViz_Main_Module.allDimensions = CubeViz_Adapter_Module.processRetrievedDimensions(CubeViz_Ajax_Module.retrievedDimensions,
																							  CubeViz_Main_Module.selectedDimensions);
		
		CubeViz_Ajax_Module.getAllDimensionsComponents(CubeViz_Main_Module.selectedDS, CubeViz_Main_Module.allDimensions);
	});
	
	$(body).bind("AjaxAllDimensionsComponentsRetrieved.CubeViz", function() {
		CubeViz_Main_Module.allDimensionComponents = CubeViz_Adapter_Module.processRetrievedDimensionComponents(CubeViz_Ajax_Module.retrievedDimensionComponents,
																												CubeViz_Main_Module.selectedDimensionComponents);
		// the order is significant here!
		CubeViz_Main_Module.setDimensionElementCount(CubeViz_Ajax_Module.retrievedDimensionComponents);	
		CubeViz_Main_Module.renderDimensions(CubeViz_Main_Module.allDimensions);
		CubeViz_Main_Module.renderOptionsForDimensions(CubeViz_Main_Module.allDimensions, CubeViz_Options_Dimension_Template);
		CubeViz_Main_Module.renderDialogsForDimensions(CubeViz_Main_Module.allDimensionComponents, CubeViz_Adapter_Module, CubeViz_Dialog_Template);
	});
	
	/******************************************************
	 * Hooks for binding events after template processing *
	 ******************************************************/
	 
	$(body).bind("dimensionsRendered.CubeViz", function() {
		CubeViz_Main_Module.registerDimensions();
	});
	
	$(body).bind("measuresRendered.CubeViz", function() {
		CubeViz_Main_Module.registerMeasures();
	});
	
	$(body).bind("dsdRendered.CubeViz", function() {
		CubeViz_Main_Module.registerDataStructureDefinition();
	});
	
	$(body).bind("dsRendered.CubeViz", function() {
		CubeViz_Main_Module.registerDataSet();
	});
	
	$(body).bind("optionsDimensionRendered.CubeViz", function() {
		CubeViz_Main_Module.registerDimensionOptions();
	});
	
	$(body).bind("optionsMeasureRendered.CubeViz", function() {
		CubeViz_Main_Module.registerMeasureOptions();
	});
	
	$(body).bind("dialogsRendered.CubeViz", function() {
		CubeViz_Main_Module.registerDimensionDialogs();
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
