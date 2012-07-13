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
	CubeViz_Main_Module.registerStaticUI();
		
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

		CubeViz_Ajax_Module.getDataSets(CubeViz_Main_Module.selectedDSD, $(event.target));
	});		      
	
	$(body).bind("dataSetClicked.CubeViz", function(event) {
		var newDS = {"url": $(event.target).find(":selected").val(),
					  "label": $(event.target).find(":selected").text() };
		CubeViz_Main_Module.selectDS(newDS);
		
		CubeViz_Ajax_Module.getMeasures(CubeViz_Main_Module.selectedDSD,CubeViz_Main_Module.selectedDS);
		CubeViz_Ajax_Module.getDimensions(CubeViz_Main_Module.selectedDSD,CubeViz_Main_Module.selectedDS);
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
		
	});
	
	$(body).bind("submitButtonClicked.CubeViz", function(event) {
		var emptyDimensions = CubeViz_Main_Module.checkDimensionElementCount();
		if(emptyDimensions.length != 0) {
			CubeViz_Main_Module.showEmptyDimensionsWarning(emptyDimensions);
		} else {
			
		}
		console.log(emptyDimensions);
		//var config = CubeViz_Main_Module.makeLink();
		//CubeViz_Ajax_Module.saveLinkToFile(config);
		/*
		
		
		var everything_okay = true;
		for(var i = 0, okay_length = okay.length; i < okay_length; i++) {
			everything_okay = everything_okay && okay[i];
		}
		
		if(everything_okay) {
			var config = CubeViz_Main_Module.makeLink();
			CubeViz_Ajax_Module.saveLinkToFile(config, CubeViz_Module_Parameters.cubevizPath);
		}*/
	});
	
	/****************************
	 * AJAX routine starts here *
	 ****************************/
		
	$(body).bind("AjaxDSDRetrieved.CubeViz", function(event) {
		CubeViz_Main_Module.allDSD = CubeViz_Ajax_Module.retrievedDSD;
		
		CubeViz_Main_Module.renderDSD(CubeViz_Main_Module.allDSD);
		
		if(jQuery.isEmptyObject(CubeViz_Main_Module.selectedDSD)) {
			var last_element = CubeViz_Main_Module.allDSD.length - 1;
			CubeViz_Main_Module.selectDSD(CubeViz_Main_Module.allDSD[last_element]);
			CubeViz_Ajax_Module.getDataSets(CubeViz_Main_Module.allDSD[last_element], $(event.target));
		}
	});
	
	$(body).bind("AjaxDSRetrieved.CubeViz", function(event, element) {
		CubeViz_Main_Module.allDS = CubeViz_Ajax_Module.retrievedDS;
		var last_element = CubeViz_Main_Module.allDS.length - 1;
				
		CubeViz_Main_Module.renderDS(CubeViz_Main_Module.allDS);
			
		if(jQuery.isEmptyObject(CubeViz_Main_Module.selectedDS)) {
			CubeViz_Main_Module.selectDS(CubeViz_Main_Module.allDS[last_element]);
			CubeViz_Ajax_Module.getMeasures(CubeViz_Main_Module.selectedDSD,CubeViz_Main_Module.allDS[last_element]);
			CubeViz_Ajax_Module.getDimensions(CubeViz_Main_Module.selectedDSD,CubeViz_Main_Module.allDS[last_element]);
		}
		
		if( $(element).attr('id') == "sidebar-left-data-selection-strc") {
			CubeViz_Main_Module.selectDS(CubeViz_Main_Module.allDS[last_element]);
			CubeViz_Ajax_Module.getMeasures(CubeViz_Main_Module.selectedDSD,CubeViz_Main_Module.allDS[last_element]);
			CubeViz_Ajax_Module.getDimensions(CubeViz_Main_Module.selectedDSD,CubeViz_Main_Module.allDS[last_element]);
		}
	});
	
	$(body).bind("AjaxMeasuresRetrieved.CubeViz", function(event) {
		
		CubeViz_Main_Module.allMeasures = CubeViz_Adapter_Module.processRetrievedMeasures(CubeViz_Ajax_Module.retrievedMeasures,
																						  CubeViz_Main_Module.selectedMeasures);
																						  
		CubeViz_Main_Module.renderMeasures(CubeViz_Main_Module.allMeasures);
	});
	
	$(body).bind("AjaxDimensionsRetrieved.CubeViz", function(event) {		
		
		CubeViz_Main_Module.allDimensions = CubeViz_Adapter_Module.processRetrievedDimensions(CubeViz_Ajax_Module.retrievedDimensions,
																							  CubeViz_Main_Module.selectedDimensions);
																							  
		CubeViz_Main_Module.resetSelectedDimensionComponents();
		
		CubeViz_Ajax_Module.getAllDimensionsComponents(CubeViz_Main_Module.selectedDS, CubeViz_Main_Module.allDimensions);
	});
	
	$(body).bind("AjaxAllDimensionsComponentsRetrieved.CubeViz", function(event) {
		CubeViz_Main_Module.allDimensionComponents = CubeViz_Adapter_Module.processRetrievedDimensionComponents(CubeViz_Ajax_Module.retrievedDimensionComponents,
																												CubeViz_Main_Module.selectedDimensionComponents,
																												CubeViz_Main_Module.allDimensions);
		//TODO: if no Dimension Components selected - select first N for each dimension
		
		// the order is significant here!
		CubeViz_Main_Module.setDimensionElementCount(CubeViz_Ajax_Module.retrievedDimensionComponents);	
		CubeViz_Main_Module.renderDimensions(CubeViz_Main_Module.allDimensions);
		CubeViz_Main_Module.renderDialogsForDimensions(CubeViz_Main_Module.allDimensionComponents, CubeViz_Adapter_Module, CubeViz_Dialog_Template);
	});
	
	/******************************************************
	 * Hooks for binding events after template processing *
	 ******************************************************/
	 
	$(body).bind("dimensionsRendered.CubeViz", function(event) {
		CubeViz_Main_Module.registerDimensions();
	});
	
	$(body).bind("measuresRendered.CubeViz", function(event) {
		CubeViz_Main_Module.registerMeasures();
	});
	
	$(body).bind("dsdRendered.CubeViz", function(event) {
		CubeViz_Main_Module.registerDataStructureDefinition();
	});
	
	$(body).bind("dsRendered.CubeViz", function(event) {
		CubeViz_Main_Module.registerDataSet();
	});
	
	$(body).bind("optionsDimensionRendered.CubeViz", function(event) {
	});
	
	$(body).bind("optionsMeasureRendered.CubeViz", function(event) {
	});
	
	$(body).bind("dialogsRendered.CubeViz", function(event) {
		CubeViz_Main_Module.registerDimensionDialogs();
	});
	
	/******************************
	 * DataBase interaction logic *
	 ******************************/
	 
	//on load get all DSD for chosen model
	CubeViz_Ajax_Module.getDataStructureDefinitions();
	if(!jQuery.isEmptyObject(CubeViz_Main_Module.selectedDSD)) {
		CubeViz_Ajax_Module.getDataSets(CubeViz_Main_Module.selectedDSD, $(document));
		CubeViz_Ajax_Module.getAllDimensionsComponents(CubeViz_Main_Module.selectedDS, CubeViz_Main_Module.allDimensions);
		CubeViz_Ajax_Module.getMeasures(CubeViz_Main_Module.selectedDSD,CubeViz_Main_Module.selectedDS);
	}
		
});
