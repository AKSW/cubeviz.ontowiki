// https://github.com/smith/namespacedotjs
//Namespace('org.aksw.cubeViz.GUI');

// creates or use a namespace and fill it with the specified properties
Namespacedotjs('org.aksw.CubeViz.Module.Main', {
	
	/********************************
	 *                              *
	 * CubeViz GUI Global Variables *
	 *                              *
	 ********************************/	
	
	modelUrl: null,
	sparqlEndpoint: null,
	selectedGraph: null,
	allDSD: [],
	selectedDSD: null,
	allDS: [],
	selectedDS: null,
	allDimensions: [],	
	selectedDimensions: [],
	optionsDimensions: [],
	allMeasures: [],
	selectedMeasures: [],
	optionsMeasures: [],
	selectedDimensionComponents: [],
	cubevizPath: null,
	backend: null,
	
	/**
	 * Limit for selected elements in the dimension dialog box
	 */	
	dimensionElementsLimit: 10,
	
	/*****************************
	 * Functions start from here *
	 *****************************/
	
	/****************************
	 * Initialization functions *
	 *        API level         *
	 ****************************/
	
	/**
	 * Input: CubeViz_Parameters object
	 */
	init: function(CubeViz_Parameters, CubeViz_Adapter_Module) {		
		this.sparqlEndpoint = CubeViz_Parameters.sparqlEndpoint; 
		this.selectedGraph = CubeViz_Parameters.selectedGraph; 
		this.selectedDSD = CubeViz_Parameters.selectedDSD; 
		this.selectedDS = CubeViz_Parameters.selectedDS; 
		this.selectedMeasures = CubeViz_Parameters.selectedMeasures; 
		this.selectedDimensions = CubeViz_Parameters.selectedDimensions; 
		this.selectedDimensionComponents = CubeViz_Parameters.selectedDimensionComponents; 
		this.modelUrl = CubeViz_Parameters.modelUrl; 
		this.cubevizPath = CubeViz_Parameters.cubevizPath; 
		this.backend = CubeViz_Parameters.backend;
		this.chartType = CubeViz_Parameters.chartType;
				
		// unpack options from selectedDimensions object
		this.optionsDimensions = CubeViz_Adapter_Module.extractOptionsFromSelectedDimensions(this.selectedDimensions);
		
		// unpack options from selectedMeasures object
		this.optionsMeasures = CubeViz_Adapter_Module.extractOptionsFromSelectedMeasures(this.selectedMeasures);
	},
	
	/**
	 * Action: adds elements to the module
	 */
	load: function(CubeViz_Dimension_Template,
				   CubeViz_Measure_Template,
				   CubeViz_Dialog_Template,
				   CubeViz_Options_Dimension_Template,
				   CubeViz_Options_Measure_Template,
				   CubeViz_Adapter_Module) {
		try {
			containerId = "sidebar-left-data-selection-strc";
			this.addItem(containerId, this.selectedDSD);
			containerId = "sidebar-left-data-selection-sets";
			this.addItem(containerId, this.selectedDS);
			$("#sidebar-left-data-selection-dims-boxes").html(CubeViz_Dimension_Template.expand(this.selectedDimensions));
			$("#sidebar-left-data-selection-meas-boxes").html(CubeViz_Measure_Template.expand(this.selectedMeasures));
			
			var dimCompForTemplate = [];
			var dimCompForTemplate = CubeViz_Adapter_Module.packDimensionComponentsForTemplate(this.selectedDimensionComponents, 
																							   this.selectedDimensions);
			this.renderDialogsForDimensions(dimCompForTemplate, CubeViz_Dialog_Template);
			
			this.renderOptionsForDimensions(this.selectedDimensions, CubeViz_Options_Dimension_Template);
			this.renderOptionsForMeasures(this.selectedMeasures, CubeViz_Options_Measure_Template);
			
		} catch(error) {
			throw error + ":\n Failed to 'load'. Some of CubeViz_Main_Module object parameters are missing. Make sure, that you run init before loading data into the page.";
		}
	
	},
	
	setControlElements: function() {
		this.setDialogCheckBoxes();
		this.setOptionRadioButtons();
		this.setDimensionsMeasuresCheckBoxes();
		
		for(dimension in this.selectedDimensions.dimensions) {
			var dimension_current = this.selectedDimensions.dimensions[dimension];
			
			
		}
		
		for(measure in this.selectedMeasures.measures) {
			var measure_current = this.selectedMeasures.measures[measure];
			
		}
		
	}, 
	
	registerUiEvents: function() {
		for(dimension in this.selectedDimensions.dimensions) {
			var dimension_current = this.selectedDimensions.dimensions[dimension];
			
			this.registerOpenDialog(dimension_current.label);
			this.registerCloseDialog(dimension_current.label);
			this.registerCheckboxDialog(dimension_current.label);
			this.registerOptionsDimensionOpen(dimension_current.label);
			this.registerOptionsDimensionClose(dimension_current.label);
			this.registerOptionsDimensionOrderDirection(dimension_current.label);
			this.registerOptionsDimensionChartAxis(dimension_current.label);
			this.registerDimensionCheckBox(dimension_current.label);
		}
		
		for(measure in this.selectedMeasures.measures) {
			var measure_current = this.selectedMeasures.measures[measure];
			
			this.registerOptionsMeasureOpen(measure_current.label);
			this.registerOptionsMeasureClose(measure_current.label);
			this.registerOptionsMeasureAggregationMethod(measure_current.label);
			this.registerOptionsMeasureOrderDirection(measure_current.label);
			this.registerOptionsMeasureRoundValues(measure_current.label);
			this.registerMeasureCheckBox(measure_current.label);
		}
		
		this.registerDataStructureDefinition();
		this.registerDataSet();
		this.registerSubmitButton();
	},
	
	registerOpenDialog: function(dimensionLabel) {
		$("#open-dialog-"+dimensionLabel+"-selector").click($.proxy(function(event) {
			var elementId = $(event.target).parent().attr('id').split("-");
			var label_current = elementId[2];
			this.closeAllDialogs();
			$("#dialog-"+label_current).show();
			$("#site-overlay").show ();
			
			$(event.target).trigger("dialogOpened.CubeViz");
		}, this));
	},
	
	registerCloseDialog: function(dimensionLabel) {
		$("#dialog-btn-close-"+dimensionLabel).click( $.proxy(function(event) {
			var elementId = $(event.target).attr('id').split("-");
			var label_current = elementId[3];
			
			$("#dialog-"+label_current).hide();
			$("#site-overlay").hide ();
			
			$(event.target).trigger("dialogClosed.CubeViz");
		}, this));
	},
	
	registerCheckboxDialog: function(dimensionLabel) {
		$(".dialog-listitem-box-"+dimensionLabel).click( $.proxy(function(event) {
			
			var dimensionElementsLimit = this.dimensionElementsLimit;
			
			var elementClass = $(event.target).attr("class").split("-");
			var label_current = elementClass[3];
			
			$(event.target).trigger("dialogCheckboxClicked.CubeViz");			
		}, this));
	},
	
	registerDataStructureDefinition: function() {
		// TODO: use .change event here
		$("#sidebar-left-data-selection-strc").click( $.proxy(function(event) {
			$(event.target).trigger("dataStructureDefinitionClicked.CubeViz");			
		}, this));
	},
	
	registerDataSet: function() {
		// TODO: use .change event here
		$("#sidebar-left-data-selection-sets").click( $.proxy(function(event) {
			$(event.target).trigger("dataSetClicked.CubeViz");			
		}, this));
	},
	
	registerOptionsDimensionOpen: function(dimensionLabel) {
		$("#open-dialog-"+dimensionLabel+"-options").click($.proxy(function(event) {
			var elementId = $(event.target).parent().attr("id").split("-");
			var label_current = elementId[2];
			
			this.closeAllDialogs();
			$("#dialog-options-dimension-"+label_current).show();
							
			$(event.target).trigger("optionsDimensionOpened.CubeViz");
		}, this));
	},
	
	registerOptionsDimensionClose: function(dimensionLabel) {
		$("#dialog-options-dimension-btn-close-"+dimensionLabel).click($.proxy(function(event) {
			var elementId = $(event.target).attr("id").split("-");
			var label_current = elementId[5];
			
			$("#dialog-options-dimension-"+label_current).hide();
			$("#site-overlay").hide ();
			
			$(event.target).trigger("optionsDimensionClosed.CubeViz");
		}, this));
	},
	
	registerOptionsDimensionOrderDirection: function(dimensionLabel) {
		$(".dialog-options-dimension-items-order-direction-"+dimensionLabel).click($.proxy(function(event) {
			var elementClass = $(event.target).attr("class").split("-");
			var label_current = elementClass[6];
			
			$(event.target).trigger("optionsDimensionOrderDirectionClicked.CubeViz");
		}, this));
	},
	
	registerOptionsDimensionChartAxis: function(dimensionLabel) {
		$(".dialog-options-dimension-items-chart-axis-"+dimensionLabel).click($.proxy(function(event) {
			var elementClass = $(event.target).attr("class").split("-");
			var label_current = elementClass[6];
			
			$(event.target).trigger("optionsDimensionChartAxisClicked.CubeViz");
		}, this));
	},
	
	registerOptionsMeasureOpen: function(measureLabel) {
		$("#open-dialog-"+measureLabel+"-options").click($.proxy(function(event) {
			var elementId = $(event.target).parent().attr("id").split("-");
			var label_current = elementId[2];
			
			this.closeAllDialogs();
			$("#dialog-options-measure-"+label_current).show();
							
			$(event.target).trigger("optionsMeasureOpened.CubeViz");
		}, this));
	},
	
	registerOptionsMeasureClose: function(measureLabel) {
		$("#dialog-options-measure-btn-close-"+measureLabel).click($.proxy(function(event) {
			var elementId = $(event.target).attr("id").split("-");
			var label_current = elementId[5];
			
			$("#dialog-options-measure-"+label_current).hide();
			$("#site-overlay").hide ();
			
			$(event.target).trigger("optionsMeasureClosed.CubeViz");
		}, this));
	},
	
	registerOptionsMeasureAggregationMethod: function(measureLabel) {
		$(".dialog-options-measure-items-aggregation-method-"+measureLabel).click($.proxy(function(event) {
			var elementClass = $(event.target).attr("class").split("-");
			var label_current = elementClass[6];
			
			$(event.target).trigger("optionsMeasureAggregationMethodClicked.CubeViz");
		}, this));
	},
	
	registerOptionsMeasureOrderDirection: function(measureLabel) {
		$(".dialog-options-measure-items-order-direction-"+measureLabel).click($.proxy(function(event) {
			var elementClass = $(event.target).attr("class").split("-");
			var label_current = elementClass[6];
			
			$(event.target).trigger("optionsMeasureOrderDirectionClicked.CubeViz");
		}, this));
	},
	
	registerOptionsMeasureRoundValues: function(measureLabel) {
		$(".dialog-options-measure-items-round-values-"+measureLabel).click($.proxy(function(event) {
			var elementClass = $(event.target).attr("class").split("-");
			var label_current = elementClass[6];
			
			$(event.target).trigger("optionsMeasureRoundValuesClicked.CubeViz");
		}, this));
	},
	
	registerDimensionCheckBox: function(dimensionLabel) {
		$("#sidebar-left-data-selection-dims-box-"+dimensionLabel).click($.proxy(function(event) {
			var elementId = $(event.target).attr("id").split("-");
			var label_current = elementId[6];
			
			$(event.target).trigger("dimensionCheckBoxClicked.CubeViz");
		}, this));
	},
	
	registerMeasureCheckBox: function(measureLabel) {
		$("#sidebar-left-data-selection-meas-box-"+measureLabel).click($.proxy(function(event) {
			var elementId = $(event.target).attr("id").split("-");
			var label_current = elementId[6];
			
			$(event.target).trigger("measureCheckBoxClicked.CubeViz");
		}, this));
	},	
	
	registerSubmitButton: function() {
		$("#sidebar-left-data-selection-submitbtn").click($.proxy(function(event) {
			$(event.target).trigger("submitButtonClicked.CubeViz");
		}, this));
	},
	
	/****************************
	 * View rendering functions *
	 ****************************/
	
	addItem: function(containerId, item) {
		switch(containerId) {
			case "sidebar-left-data-selection-strc":
				this.addItemDataStructureOrDataSet(item.url, item.label, containerId);
				break;
			case "sidebar-left-data-selection-sets":
				this.addItemDataStructureOrDataSet(item.url, item.label, containerId);
				break;
		}
	},
	
	addItemDataStructureOrDataSet: function (value, label, containerId) {
		$("#"+containerId).append($("<option></option>")
						  .attr("value",value)
						  .text(label));
	},
	
	emptyDataStructureDefinitions: function() {
		$("#sidebar-left-data-selection-strc").find("option").remove();
	},
	
	emptyDataSets: function() {
		$("#sidebar-left-data-selection-sets").find("option").remove();
	},
	
	renderDialogsForDimensions: function(dimensions, CubeViz_Dialog_Template) {
		for(dimension in dimensions) {
			$("#dialog-"+dimensions[dimension].label).remove();
			$("#wrapper").append(CubeViz_Dialog_Template.expand(dimensions[dimension]));
			$("#dialog-"+dimensions[dimension].label).hide();
		}
	},
	
	renderOptionsForDimensions: function(dimensions, CubeViz_Options_Dimension_Template) {
		for(dimension in dimensions.dimensions) {
			var dimension_current = dimensions.dimensions[dimension];
			$("#dialog-options-dimension-"+dimension_current.label).remove();
			$("#wrapper").append(CubeViz_Options_Dimension_Template.expand(dimension_current));
			$("#dialog-options-dimension-"+dimension_current.label).hide();
		}
	},
	
	renderOptionsForMeasures: function(measures, CubeViz_Options_Measure_Template) {
		for(measure in measures.measures) {
			var measure_current = measures.measures[measure];
			$("#dialog-options-measure-"+measure_current.label).remove();
			$("#wrapper").append(CubeViz_Options_Measure_Template.expand(measure_current));
			$("#dialog-options-measure-"+measure_current.label).hide();
		}
	}, 
	
	renderDSD: function(allDSD) {
		this.emptyDataStructureDefinitions();
		
		var allDSD_length = allDSD.length;
		while(allDSD_length--) {
			this.addItem("sidebar-left-data-selection-strc",allDSD[allDSD_length]);
		}
		
		this.setSelectedDSD();
	},
	
	setSelectedDSD: function() {
		var allDSD = $("#sidebar-left-data-selection-strc").find("option");
		var selDSD = this.selectedDSD;
		$.each(allDSD, function() {
			if($(this).val() == selDSD.url) {
				$(this).attr("selected", "selected");
			}
		});
	},
	
	renderDS: function(allDS) {
		this.emptyDataSets();
		
		var allDS_length = allDS.length;
		while(allDS_length--) {
			this.addItem("sidebar-left-data-selection-sets",allDS[allDS_length]);
		}
		
		this.setSelectedDS();
	},
	
	setSelectedDS: function() {
		var allDS = $("#sidebar-left-data-selection-sets").find("option");
		var selDS = this.selectedDS;
		$.each(allDS, function() {
			if($(this).val() == selDS.url) {
				$(this).attr("selected", "selected");
			}
		});
	},
	
	/*******************
	 * UI interactions *
	 *******************/
	
	checkSelectedData: function() {
		//for scoreboard 3 dimensions should be chosen!
		
		//if options for chosen dimension X not specified
		for(var selectedDimension in this.selectedDimensions.dimensions) {
			var dimension_current = this.selectedDimensions.dimensions[selectedDimension];
			
			var orderDirection = dimension_current.orderDirection;
			var axis = dimension_current.chartAxis;
			
			if(orderDirection == "None" || 
			   orderDirection == "Ascending" || 
			   orderDirection == "Descending" ) {
				//everything is okay
			} else {
                dimension_current.orderDirection = "None";
			}
			
			if(axis == "x" ||
			   axis == "y" ||
			   axis == "z") {
				//everything is okay
			} else { 
                dimension_current.chartAxis = "x";
		    }	
		}
		
		// measure is chosen ?
		
		//check chosen measure options
		for(selectedMeasure in this.selectedMeasures.measures) {
			measure_current = this.selectedMeasures.measures[selectedMeasure];
			var aggregationMethod = measure_current.aggregationMethod;
			var orderDirection = measure_current.orderDirection;
			var roundValues = measure_current.roundValues;
			
			if(aggregationMethod == "sum" ||
			   aggregationMethod == "average" ||
			   aggregationMethod == "minimum" ||
			   aggregationMethod == "maximum") {
				//everything okay, captain!
			} else {
				measure_current.aggregationMethod = "sum";
			}
			
			if(orderDirection == "None" ||
			   orderDirection == "Ascending" ||
			   orderDirection == "Descending") {
				//everything okay, captain!
			} else {
				measure_current.orderDirection = "None";
			}
			
			if(roundValues == "yes" ||
			   roundValues == "no") {
				//everything okay, captain!
			} else {
				measure_current.roundValues = "no";
			}
		}
	},
	
	/**
	 * Input: no input, works with namespace vars
	 * Action: make a URI for saving configuration into file
	 * Output: configuration string
	 * Notice: should be run after requestLabelsFor function
	 */
	
	makeConfig: function() {
        
		return  "?foo=&" +
                "modelUrl="+'"'+this.modelUrl+'"'+
                "&sparqlEndpoint=" + '"' + this.sparqlEndpoint + '"' + 
                "&selectedGraph=" + $.toJSON(this.selectedGraph) +
                "&selectedDSD=" + $.toJSON(this.selectedDSD) +
                "&selectedDS=" + $.toJSON(this.selectedDS) +
                "&selectedMeasures=" + $.toJSON(this.selectedMeasures) +
                "&selectedDimensions=" + $.toJSON(this.selectedDimensions) +
                "&selectedDimensionComponents=" + $.toJSON(this.selectedDimensionComponents) +
                "&selectedChartType=" + this.chartType;
	},
	
	/**
	 * Input: no input
	 * Output: no output
	 * Action: close all dialogs
	 */
	closeAllDialogs: function() {
		$(".dialog-options-measure").hide();
		$(".dialog-options-dimension").hide();
		$(".dialog").hide();
	},
	
	/***********************
	 * Dialog interactions *
	 ***********************/
	 
	recalculateSelectedElementsCount: function(dimensionLabel) {
		var dialog_current = $("#dialog-"+dimensionLabel);
		var selectedElements = $(dialog_current).find("input:checked").length;
		
		// set selectedElements to the selectedDimensions object
		for(dimension in this.selectedDimensions.dimensions) {
			var dimension_current = this.selectedDimensions.dimensions[dimension];
			if(dimension_current.label == dimensionLabel) {
				this.selectedDimensions.dimensions[dimension].selectedElementCount = selectedElements;
			}
		}
		
		if(selectedElements == this.dimensionElementsLimit) {
			$(dialog_current).trigger("dialogMaxDimensionComponentsExceeded.CubeViz");
		} else {
			$(dialog_current).trigger("dialogMaxDimensionComponentsNotExceeded.CubeViz");
		}	
	},
	
	updateDimensionElementCount: function(dimensionLabel) {
		for(dimension in this.selectedDimensions.dimensions) {
			var dimension_current = this.selectedDimensions.dimensions[dimension];
			if(dimensionLabel == dimension_current.label) {
				var selectedElements = dimension_current.selectedElementCount + "/";
				$("#dialog-" + dimensionLabel + "-selected-items").html (selectedElements);
			}
		}
	},
	
	blockDialogCheckboxes: function(dimensionLabel) {
		var dialog_current = $("#dialog-"+dimensionLabel);
		$(dialog_current).find("input").each ( function () {
			if ( false == $(this).is (':checked') ) {
				$(this).attr('disabled','disabled');
			} 
		});				
	},
	
	unblockDialogCheckboxes: function(dimensionLabel) {
		var dialog_current = $("#dialog-"+dimensionLabel);
		$(dialog_current).find("input").each ( function () {
				$(this).removeAttr('disabled');
		});					
	},
	
	showMaxDimensionsWarning: function() {
		$(".dialog-header-label-warning").each ( function () {
			$(this).show ();
			$(this).fadeOut (9000);
		});	
	},
	
	setDialogCheckBoxes: function() {
		//TODO: change bruteforce method to some smart algo here				
		for(dimComp in this.selectedDimensionComponents.selectedDimensionComponents) {
			dimComp_current = this.selectedDimensionComponents.selectedDimensionComponents[dimComp];
			
			$.each( $(".dialog-listitem-box-"+dimComp_current.label), function() {
				if( $(this).val() == dimComp_current.property) {
					$(this).attr('checked', true);
				}
			});
		}
	},
	
	/***********************
	 * Setters and getters *
	 ***********************/
	 
	setDSD: function(newDSD) {
		this.selectedDSD = newDSD;
	},
	
	setDS: function(newDS) {
		this.selectedDS = newDS;
	},
	
	
	/*********************************************************
	 * STARTOF: Check if I can merge four functions into two *
	 *********************************************************/
	 
	getDimensionByLabel: function(label) {
		for(dimension in this.selectedDimensions.dimensions) {
			var dimension_current = this.selectedDimensions.dimensions[dimension];
			if(dimension_current.label == label) {
				return dimension_current;
			}
		}
		throw new "There is no dimesions with "+label+" label in selectedDimensions array!";
	},
	
	setDimension: function(newDimension) {
		var index = "Make an new array element!";
		for(dimension in this.selectedDimensions.dimensions) {
			var dimension_current = this.selectedDimensions.dimensions[dimension];
			
			if(dimension_current.label == newDimension.label) {
				index = dimension;
				break;
			} else {
				index = "Make an new array element!";
			}
		}
		
		if(isNaN(index)) {
			this.selectedDimensions.dimensions.push(newDimension);
		} else {
			this.selectedDimensions.dimensions[index] = newDimension;
		}		
	},
	
	getMeasureByLabel: function(label) {
		for(measure in this.selectedMeasures.measures) {
			var measure_current = this.selectedMeasures.measures[measure];
			if(measure_current.label == label) {
				return measure_current;
			}
		}
		throw new "There is no measures with "+label+" label in selectedMeasures array!";
	},
	
	setMeasure: function(newMeasure) {
		var index = "Make an new array element!";
		for(measure in this.selectedMeasures.measures) {
			var measure_current = this.selectedMeasures.measures[measure];
			
			if(measure_current.label == newMeasure.label) {
				index = measure;
				break;
			} else {
				index = "Make an new array element!";
			}
		}
		
		if(isNaN(index)) {
			this.selectedMeasures.measures.push(newMeasure);
		} else {
			this.selectedMeasures.measures[index] = newMeasure;
		}	
	},
	
	/*******************************************************
	 * ENDOF: Check if I can merge four functions into two *
	 *******************************************************/
	
	/**************************************
	 * Dimension Options Dialog functions *
	 **************************************/
		
	setOptionRadioButtons: function() {
		//TODO: change bruteforce method to some smart algo here			

		
		for(meas in this.selectedMeasures.measures) {
			var meas_current = this.selectedMeasures.measures[meas];
			
			var aggregationMethodRadio = $(".dialog-options-measure-items-aggregation-method-"+meas_current.label);
			this.setRadioButtonIn(aggregationMethodRadio, meas_current.aggregationMethod);
			
			var orderDirectionRadio = $(".dialog-options-measure-items-order-direction-"+meas_current.label);
			this.setRadioButtonIn(orderDirectionRadio, meas_current.orderDirection);
			
			var roundValuesRadio = $(".dialog-options-measure-items-round-values-"+meas_current.label);
			this.setRadioButtonIn(roundValuesRadio, meas_current.roundValues);
		}
		
		for(dim in this.selectedDimensions.dimensions) {
			var dim_current = this.selectedDimensions.dimensions[dim];
						
			var orderDirectionRadio = $(".dialog-options-dimension-items-order-direction-"+dim_current.label);
			this.setRadioButtonIn(orderDirectionRadio, dim_current.orderDirection);
			
			var chartAxisRadio = $(".dialog-options-dimension-items-chart-axis-"+dim_current.label);
			this.setRadioButtonIn(chartAxisRadio, dim_current.chartAxis);
		}
	},
	
	setRadioButtonIn: function(radioButtons, value) {
		$.each(radioButtons, function() {
			if( $(this).val() == value) {
				//$(this)[0].checked = true;
				$(this).attr('checked',true);
			}
		});
	},
	
	/**************************************
	 * Dimensions and Measures CheckBoxes *
	 **************************************/
	 
	setDimensionsMeasuresCheckBoxes: function() {
		var dimensions = $("#sidebar-left-data-selection-dims-boxes").children(); 
		var selectedDimensions = this.selectedDimensions.dimensions;
		$.each(dimensions, function() {
			var checkbox_current = $(this).find(".sidebar-left-data-selection-dims-box");
			var dimensionUrl = checkbox_current.val();
			for(selectedDimension in selectedDimensions) {
				var dimension_current = selectedDimensions[selectedDimension];
				if(dimension_current.url == dimensionUrl) {
					checkbox_current.attr('checked','checked');
				}
			}
		});
		
		var measures = $("#sidebar-left-data-selection-meas-boxes").children(); 
		var selectedMeasures = this.selectedMeasures.measures;
		$.each(measures, function() {
			var checkbox_current = $(this).find(".sidebar-left-data-selection-meas-box");
			var measureUrl = checkbox_current.val();
			for(selectedMeasure in selectedMeasures) {
				var measure_current = selectedMeasures[selectedMeasure];
				if(measure_current.url == measureUrl) {
					checkbox_current.attr('checked','checked');
				}
			}
		});
	}
});
