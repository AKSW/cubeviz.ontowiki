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
	allMeasures: [],
	selectedMeasures: [],
	allDimensionComponents: [],
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
		this.allDSD = [CubeViz_Parameters.selectedDSD]; 
		this.selectedDS = CubeViz_Parameters.selectedDS; 
		this.allDS = [CubeViz_Parameters.selectedDS]; 
		this.selectedMeasures = CubeViz_Parameters.selectedMeasures; 
		this.allMeasures = CubeViz_Parameters.selectedMeasures; 
		this.selectedDimensions = CubeViz_Parameters.selectedDimensions; 
		this.allDimensions = CubeViz_Parameters.selectedDimensions; 
		this.selectedDimensionComponents = CubeViz_Parameters.selectedDimensionComponents; 
		this.allDimensionComponents = CubeViz_Parameters.selectedDimensionComponents; 
		this.modelUrl = CubeViz_Parameters.modelUrl; 
		this.cubevizPath = CubeViz_Parameters.cubevizPath; 
		this.backend = CubeViz_Parameters.backend;
	},
	
	/*****************************************************
	 * Factory methods for after template events binding *
	 *****************************************************/
	 
	registerDimensions: function() {
		var dimension_current = null;
		for(dimension in this.allDimensions.dimensions) {
			dimension_current = this.allDimensions.dimensions[dimension];
			
			this.registerDimensionCheckBox(dimension_current.label);
		}
	},
	
	registerDimensionDialogs: function() {
		var dimension_current = null;
		for(dimension in this.allDimensions.dimensions) {
			dimension_current = this.allDimensions.dimensions[dimension];
						
			this.registerOpenDialog(dimension_current.label);
			this.registerCloseDialog(dimension_current.label);
			this.registerCheckboxDialog(dimension_current.label);
		}
	},
	
	registerMeasures: function() {
		var measure_current = null;
		for(measure in this.allMeasures.measures) {
			measure_current = this.allMeasures.measures[measure];
			
			this.registerMeasureCheckBox(measure_current.label);
		}
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
	
	renderDialogsForDimensions: function(dimensionComponents, CubeViz_Adapter_Module, CubeViz_Dialog_Template) {
		
		var selectedDimensions = this.selectedDimensions;
		var tempDimensions = CubeViz_Adapter_Module.packDimensionComponentsForTemplate(dimensionComponents, 
																					   selectedDimensions);
											
		for(dimension in tempDimensions) {
			$("#dialog-"+tempDimensions[dimension].label).remove();
			$("#wrapper").append(CubeViz_Dialog_Template.expand(tempDimensions[dimension]));
			$("#dialog-"+tempDimensions[dimension].label).hide();
		}
		
		$(body).trigger("dialogsRendered.CubeViz");
	
		this.setDialogCheckBoxes();
	},
	
	renderDSD: function(allDSD) {
		this.emptyDataStructureDefinitions();
		
		var allDSD_length = allDSD.length;
		while(allDSD_length--) {
			this.addItem("sidebar-left-data-selection-strc",allDSD[allDSD_length]);
		}
		
		$("sidebar-left-data-selection-strc").trigger("dsdRendered.CubeViz");
		
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
		
		$("sidebar-left-data-selection-sets").trigger("dsRendered.CubeViz");
		
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
	
	renderDimensions: function(dimensions) {
		$("#sidebar-left-data-selection-dims-boxes").html(CubeViz_Dimension_Template.expand(dimensions));
		this.setDimensionsMeasuresCheckBoxes();
		$("#sidebar-left-data-selection-dims-boxes").trigger("dimensionsRendered.CubeViz");
	},
	
	renderMeasures: function(measures) {
		$("#sidebar-left-data-selection-meas-boxes").html(CubeViz_Measure_Template.expand(measures));
		this.setDimensionsMeasuresCheckBoxes();
		$("#sidebar-left-data-selection-meas-boxes").trigger("measuresRendered.CubeViz");
	},
	
	/*******************
	 * UI interactions *
	 *******************/
	
	/**
	 * Input: no input, works with namespace vars
	 * Action: make a URI for saving configuration into file
	 * Output: configuration string
	 * Notice: should be run after requestLabelsFor function
	 */
	
	makeLink: function() {

		return  "?foo=&" +
                "modelUrl="+'"'+this.modelUrl+'"'+
                "&sparqlEndpoint=" + '"' + this.sparqlEndpoint + '"' + 
                "&selectedGraph=" + $.toJSON(this.selectedGraph) +
                "&selectedDSD=" + $.toJSON(this.selectedDSD) +
                "&selectedDS=" + $.toJSON(this.selectedDS) +
                "&selectedMeasures=" + $.toJSON(this.selectedMeasures) +
                "&selectedDimensions=" + $.toJSON(this.selectedDimensions) +
                "&selectedDimensionComponents=" + $.toJSON(this.selectedDimensionComponents.selectedDimensionComponents) +
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
		var dimension_current = null;
		for(dimension in this.allDimensions.dimensions) {
			dimension_current = this.allDimensions.dimensions[dimension];
			if(dimension_current.label == dimensionLabel) {
				this.allDimensions.dimensions[dimension].selectedElementCount = selectedElements;
			}
		}
		
		if(selectedElements == this.dimensionElementsLimit) {
			$(dialog_current).trigger("dialogMaxDimensionComponentsExceeded.CubeViz");
		} else {
			$(dialog_current).trigger("dialogMaxDimensionComponentsNotExceeded.CubeViz");
		}	
	},
	
	updateDimensionElementCount: function(dimensionLabel) {
		var dimension_current = null;
		for(dimension in this.allDimensions.dimensions) {
			dimension_current = this.allDimensions.dimensions[dimension];
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
		var dimComp_current = null;		
		for(dimComp in this.selectedDimensionComponents.selectedDimensionComponents) {
			dimComp_current = this.selectedDimensionComponents.selectedDimensionComponents[dimComp];
			
			$.each( $(".dialog-listitem-box-"+dimComp_current.dimension_label), function() {
				if( $(this).val() == dimComp_current.property) {
					$(this).attr('checked', true);
				}
			});
		}
	},
	
	/***********************
	 * Setters and getters *
	 ***********************/
	 
	/*********************************************************
	 * STARTOF: Check if I can merge four functions into two *
	 *********************************************************/
		 
	getDimensionByLabel: function(label) {
		var dimension_current = null;
		for(dimension in this.allDimensions.dimensions) {
			dimension_current = this.allDimensions.dimensions[dimension];
			if(dimension_current.label == label) {
				return dimension_current;
			}
		}
		throw ("There is no dimesions with "+label+" label in allDimensions array!");
	},
	
	updateDimension: function(newDimension) {
		var dimension_current = null;
		for(dimension in this.allDimensions.dimensions) {
			dimension_current = this.allDimensions.dimensions[dimension];
			
			if(dimension_current.label == newDimension.label) {
				this.allDimensions.dimensions[dimension] = newDimension;
				return;
			} 
		}
		
		throw ("No dimension with label "+newDimension.label+" found in allDimensions array. Can't update.");	
	},
	
	updateSelectedDimension: function(newDimension) {
		var dimension_current = null;
		for(dimension in this.selectedDimensions.dimensions) {
			dimension_current = this.selectedDimensions.dimensions[dimension];
			
			if(dimension_current.label == newDimension.label) {
				this.selectedDimensions.dimensions[dimension] = newDimension;
				return;
			} 
		}
		
		throw ("No dimension with label "+newDimension.label+" found in selectedDimensions array. Can't update.");	
	},
	
	getMeasureByLabel: function(label) {
		var measure_current = null;
		for(measure in this.allMeasures.measures) {
			measure_current = this.allMeasures.measures[measure];
			if(measure_current.label == label) {
				return measure_current;
			}
		}
		throw ("There is no measures with "+label+" label in selectedMeasures array!");
	},
	
	updateMeasure: function(newMeasure) {
		var measure_current = null;
		for(measure in this.allMeasures.measures) {
			measure_current = this.allMeasures.measures[measure];
			if(measure_current.label == newMeasure.label) {
				this.allMeasures.measures[measure] = newMeasure;
				return;
			} 
		}
		
		throw ("No measure with label "+newMeasure.label+" found in allMeasures array. Can't update.");	
	},
	
	updateSelectedMeasure: function(newMeasure) {
		var measure_current = null;
		for(measure in this.selectedMeasures.measures) {
			measure_current = this.selectedMeasures.measures[measure];
			
			if(measure_current.label == newMeasure.label) {
				this.selectedMeasures.measures[measure] = newMeasure;
				return;
			} 
		}
		
		throw ("No measure with label "+newMeasure.label+" found in selectedMeasures array. Can't update.");	
	},
	
	setDimensionElementCount: function(dimensionComponents) {
		var dimension_current = null;
		for(dimension in this.allDimensions.dimensions) {
			dimension_current = this.allDimensions.dimensions[dimension];
			for(comp in dimensionComponents) {
				if(comp == dimension_current.label) {
					dimension_current.elementCount = dimensionComponents[comp].length;
				}
			}
		}
	},
	
	getDimensionComponentByUrl: function(url) {
		var component_current = null;
		for(component in this.allDimensionComponents.selectedDimensionComponents) {
			component_current = this.allDimensionComponents.selectedDimensionComponents[component];
			if(component_current.property == url) {
				return component_current;
			}
		}
		throw ( "There is no dimension component "+url+" in allDimensionComponents array!");
	},
	
	resetSelectedDimensionComponents: function() {
		this.selectedDimensionComponents.selectedDimensionComponents = [];
		this.setDialogCheckBoxes();
		var dimension_current = null;
		for(dimension in this.allDimensions.dimensions) {
			dimension_current = this.allDimensions.dimensions[dimension];
			dimension_current.selectedElementCount = 0;
		}
	},
	
	/*******************************************************
	 * ENDOF: Check if I can merge four functions into two *
	 *******************************************************/
	
	/**************************************
	 * Dimension Options Dialog functions *
	 **************************************/
	
	/**
	 * Options related - disabled
	 */	
	setDimensionsOptionRadioButtons: function(dimensions) {
		var dim_current = null;
		for(dim in dimensions.dimensions) {
			dim_current = dimensions.dimensions[dim];
						
			var orderDirectionRadio = $(".dialog-options-dimension-items-order-direction-"+dim_current.label);
			this.setRadioButtonIn(orderDirectionRadio, dim_current.orderDirection);
			
			var chartAxisRadio = $(".dialog-options-dimension-items-chart-axis-"+dim_current.label);
			this.setRadioButtonIn(chartAxisRadio, dim_current.chartAxis);
		}
	},
	
	/**
	 * Options related - disabled
	 */
	setMeasuresOptionRadioButtons: function(measures) {
		var meas_current = null;
		for(meas in measures.measures) {
			meas_current = measures.measures[meas];
			
			var aggregationMethodRadio = $(".dialog-options-measure-items-aggregation-method-"+meas_current.label);
			this.setRadioButtonIn(aggregationMethodRadio, meas_current.aggregationMethod);
			
			var orderDirectionRadio = $(".dialog-options-measure-items-order-direction-"+meas_current.label);
			this.setRadioButtonIn(orderDirectionRadio, meas_current.orderDirection);
			
			var roundValuesRadio = $(".dialog-options-measure-items-round-values-"+meas_current.label);
			this.setRadioButtonIn(roundValuesRadio, meas_current.roundValues);
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
		var checkbox_current = null;
		var dimension_current = null;
		$.each(dimensions, function() {
			checkbox_current = $(this).find(".sidebar-left-data-selection-dims-box");
			var dimensionUrl = checkbox_current.val();
			for(selectedDimension in selectedDimensions) {
				dimension_current = selectedDimensions[selectedDimension];
				if(dimension_current.url == dimensionUrl) {
					checkbox_current.attr('checked','checked');
				}
			}
		});
		
		var measures = $("#sidebar-left-data-selection-meas-boxes").children(); 
		var selectedMeasures = this.selectedMeasures.measures;
		var checkbox_current = null;
		var measure_current = null;
		$.each(measures, function() {
			checkbox_current = $(this).find(".sidebar-left-data-selection-meas-box");
			var measureUrl = checkbox_current.val();
			for(selectedMeasure in selectedMeasures) {
				measure_current = selectedMeasures[selectedMeasure];
				if(measure_current.url == measureUrl) {
					checkbox_current.attr('checked','checked');
				}
			}
		});
	},
	
	/*******************
	 * Selecting stuff *
	 *******************/
	 
	selectDSD: function(newDSD) {
		this.selectedDSD = newDSD;
	},
	
	selectDS: function(newDS) {
		this.selectedDS = newDS;
	},
	
	selectDimension: function(dimension) {
		this.selectedDimensions.dimensions.push(dimension); 
	},

	unselectDimension: function(label) {
		var dimension_current = null;
		for(dimension in this.selectedDimensions.dimensions) {
			dimension_current = this.selectedDimensions.dimensions[dimension];
			if(dimension_current.label == label) {
				delete this.selectedDimensions.dimensions[dimension];
				this.selectedDimensions.dimensions = this.cleanUpArray(this.selectedDimensions.dimensions);
				return;
			}
		}
		throw ("There is no dimesions with "+label+" label in selectedDimensions array!");
	},
	
	selectMeasure: function(measure) {
		this.selectedMeasures.measures.push(measure); 
	},
	
	unselectMeasure: function(label) {
		var measure_current = null;
		for(measure in this.selectedMeasures.measures) {
			measure_current = this.selectedMeasures.measures[measure];
			if(measure_current.label == label) {
				delete this.selectedMeasures.measures[measure]; 
				this.selectedMeasures.measures = this.cleanUpArray(this.selectedMeasures.measures);
				return;
			}
		}
		throw ("There is no measures with "+label+" label in selectedMeasures array!");
	},
	
	selectDimensionComponent: function(component) {
		this.selectedDimensionComponents.selectedDimensionComponents.push(component); 
	},
	
	unselectDimensionComponent: function(url) {
		var component_current = null;
		for(component in this.selectedDimensionComponents.selectedDimensionComponents) {
			component_current = this.selectedDimensionComponents.selectedDimensionComponents[component];
			if(component_current.property == url) {
				delete this.selectedDimensionComponents.selectedDimensionComponents[component]; 
				this.selectedDimensionComponents.selectedDimensionComponents = this.cleanUpArray(this.selectedDimensionComponents.selectedDimensionComponents);
				return;
			}
		}
		throw ("There is no dimension component "+url+" in selectedDimensionComponents array!");
	},
	
	cleanUpArray: function(arr) {
		var newArr = new Array();for (var k in arr) if(arr[k]) newArr.push(arr[k]);
		return newArr;
	},
	
});
