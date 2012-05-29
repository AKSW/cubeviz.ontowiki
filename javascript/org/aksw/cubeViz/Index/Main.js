// https://github.com/smith/namespacedotjs
//Namespace('org.aksw.cubeViz.GUI');

// creates or use a namespace and fill it with the specified properties
Namespacedotjs('org.aksw.cubeViz.Index.Main', {
	
	/********************************
	 *                              *
	 * CubeViz GUI Global Variables *
	 *                              *
	 ********************************/	
	
	modelUri: null,
	sparqlEndpoint: null,
	selectedGraph: null,
	selectedDSD: null,
	selectedDS: null,
	selectedDimensions: [],
	optionsDimensions: [],
	allDimensions: [],
	selectedMeasures: [],
	optionsMeasures: [],
	allMeasures: [],
	selectedDimensionComponents: [],
	cubevizPath: null,
	backend: null,
	availableChartTypes: [],
	
	/**
	 * 'bar' (default)
	 * 'pie' 
	 * 'line'
	 * 'area'
	 * 'splines'
	 * 'scatterplot' 
	 * 'table' 
	 */
	chartType: 'bar',
	
	/**
	 * Limit for selected elements in the dimension dialog box
	 */	
	dimensionElementsLimit: 10,
	
	/*****************************
	 * Functions start from here *
	 *****************************/
	
	addItem: function(containerId, item) {
		switch(containerId) {
			case "sidebar-left-data-selection-strc":
				org.aksw.cubeViz.Index.Main.addItemDataStructureOrDataSet(item.uri, item.label, containerId);
				break;
			case "sidebar-left-data-selection-sets":
				org.aksw.cubeViz.Index.Main.addItemDataStructureOrDataSet(item.uri, item.label, containerId);
				break;
			case "sidebar-left-data-selection-dims":
				org.aksw.cubeViz.Index.Main.addItemDimension(item, containerId);
				break;
			case "sidebar-left-data-selection-meas":
				org.aksw.cubeViz.Index.Main.addItemMeasure(item);
				break;
		}
	},
	
	addItemDataStructureOrDataSet: function (value, label, containerId) {
		$("#"+containerId).append($("<option></option>")
						  .attr("value",value)
						  .text(label));
	},
	
	addItemDimension: function (item) {
		
	}, 
	
	addItemMeasure: function (item) {
		
	},
	
	sidebarLeftDataSelectionSubmitbtnClick: function() {
		
		//step 1: gather from user interface information
		selectedDataStructureUri = $("#sidebar-left-data-selection-strc").val();
		selectedDataSetUri = $("#sidebar-left-data-selection-sets").val();
		
		// Used in requestLabelsFor function
		org.aksw.cubeViz.Index.Main.selectedDSD = selectedDataStructureUri;
		org.aksw.cubeViz.Index.Main.selectedDS = selectedDataSetUri;
		
		selectedDimensions = $(".sidebar-left-data-selection-dims-box:checked");
		
		selectedDimensionUris = [];
		selectedDimensionLabels = [];
		$.each(selectedDimensions, function() {
			selectedDimensionUris.push($(this).val());
			selectedDimensionLabels.push($(this).next().find(".sidebar-left-data-selection-dims-box-label-value").text());
		});
		
		//read dimension option dialogs
		var optionDialogs = $(".dialog-options-dimension");
		var options = [];
		$.each(optionDialogs, function() {			
			label_current = this.id.split("-");
			label_current = label_current[3];
			orderDirection = $(this).find("#dialog-options-dimension-order-direction-value-"+label_current).text();
			chartAxis = $(this).find("#dialog-options-dimension-chart-axis-value-"+label_current).text();
			options[label_current] = [];
			options[label_current]["orderDirection"] = orderDirection;
			options[label_current]["chartAxis"] = chartAxis;
		});
		org.aksw.cubeViz.Index.Main.optionsDimensions = options;
		
		org.aksw.cubeViz.Index.Main.selectedDimensions = [];
		setXAxis = false;
		for(dimension in org.aksw.cubeViz.Index.Main.allDimensions.dimensions) {
			for(selectedDimensionUri in selectedDimensionUris) {
				if(org.aksw.cubeViz.Index.Main.allDimensions.dimensions[dimension].uri == selectedDimensionUris[selectedDimensionUri]) {
					
					label_current = org.aksw.cubeViz.Index.Main.allDimensions.dimensions[dimension].label;
									
					//read the parameters from the options selection box
					org.aksw.cubeViz.Index.Main.allDimensions.dimensions[dimension].orderDirection = 
							org.aksw.cubeViz.Index.Main.optionsDimensions[label_current]["orderDirection"];
					org.aksw.cubeViz.Index.Main.allDimensions.dimensions[dimension].chartAxis = 
							org.aksw.cubeViz.Index.Main.optionsDimensions[label_current]["chartAxis"];
					
					org.aksw.cubeViz.Index.Main.selectedDimensions.push(
								org.aksw.cubeViz.Index.Main.allDimensions.dimensions[dimension]
								);
				}
			}
		}		
				
		org.aksw.cubeViz.Index.Main.selectedDimensions = {"dimensions": org.aksw.cubeViz.Index.Main.selectedDimensions};
		
		org.aksw.cubeViz.Index.Main.selectedMeasures = [];		
		selectedMeasures = $(".sidebar-left-data-selection-meas-box:checked");
		selectedMeasureUris = [];
		$.each(selectedMeasures, function() {
			selectedMeasureUris.push($(this).val());
		});
		
		//read measure option dialogs
		var optionDialogs = $(".dialog-options-measure");
		var options = [];
		$.each(optionDialogs, function() {			
			label_current = this.id.split("-");
			label_current = label_current[3];
			aggregationMethod = $(this).find("#dialog-options-measure-aggregation-method-value-"+label_current).text();
			orderDirection = $(this).find("#dialog-options-measure-order-direction-value-"+label_current).text();
			roundValues = $(this).find("#dialog-options-measure-round-values-value-"+label_current).text();
			options[label_current] = [];
			options[label_current]["aggregationMethod"] = aggregationMethod;
			options[label_current]["orderDirection"] = orderDirection;
			options[label_current]["roundValues"] = roundValues;
		});
		org.aksw.cubeViz.Index.Main.optionsMeasures = options;
						
		for(measure in org.aksw.cubeViz.Index.Main.allMeasures.measures) {
			for(selectedMeasureUri in selectedMeasureUris) {
				if(org.aksw.cubeViz.Index.Main.allMeasures.measures[measure].uri == selectedMeasureUris[selectedMeasureUri]) {
					label_current = org.aksw.cubeViz.Index.Main.allMeasures.measures[measure].label;
					
					
					// TODO: here comes parameters from options for measures
					org.aksw.cubeViz.Index.Main.allMeasures.measures[measure].order = "-1";
					org.aksw.cubeViz.Index.Main.allMeasures.measures[measure].aggregationMethod = 
							org.aksw.cubeViz.Index.Main.optionsMeasures[label_current]["aggregationMethod"];
					org.aksw.cubeViz.Index.Main.allMeasures.measures[measure].roundValues = 
							org.aksw.cubeViz.Index.Main.optionsMeasures[label_current]["roundValues"];
					org.aksw.cubeViz.Index.Main.allMeasures.measures[measure].orderDirection = 
							org.aksw.cubeViz.Index.Main.optionsMeasures[label_current]["orderDirection"];
					org.aksw.cubeViz.Index.Main.selectedMeasures.push(
								org.aksw.cubeViz.Index.Main.allMeasures.measures[measure]
								);								
				}
			}
		}		
		org.aksw.cubeViz.Index.Main.selectedMeasures = {"measures": org.aksw.cubeViz.Index.Main.selectedMeasures};
		
		//selected dimension components
		selectedDimensionComponents_temp = [];
		selectedDimension_length = selectedDimensionLabels.length;
		while(selectedDimension_length--) {
			current_label = jQuery.trim(selectedDimensionLabels[selectedDimension_length]);
			current_dialog = $("#dialog-"+current_label);
			
			for(dimension in org.aksw.cubeViz.Index.Main.selectedDimensions.dimensions) {
				if(org.aksw.cubeViz.Index.Main.selectedDimensions.dimensions[dimension].label == current_label) {
					org.aksw.cubeViz.Index.Main.selectedDimensions.dimensions[dimension].selectedElementCount = current_dialog.find("input:checkbox:checked").next().length;
				}
			}
			
			
			
			current_dialog.find("input:checkbox:checked").each(function() {
				selectedDimensionComponents_temp.push({"label":current_label,"property":$(this).val()});
			});
		}		
		org.aksw.cubeViz.Index.Main.selectedDimensionComponents = selectedDimensionComponents_temp;
		
		//Chart Type
		//org.aksw.cubeViz.Index.Main.chartType = 
		//			org.aksw.cubeViz.Index.Main.getChartType($("#chart-selection-selected-chart").val());
		
		//TODO: ACTIVATE WHEN CHART SELECTION WILL BE AVAILABLE
		//org.aksw.cubeViz.Index.Main.chartType = $("#chart-selection-selected-chart").val();
				
		var selectedDataErrorCode = org.aksw.cubeViz.Index.Main.checkSelectedData();		
				
		/**
		 * After data selection suggest the best visualization method
		 * for instance, for three dimensions or for four dimension,
		 * and ask user if she wants to use it and define necessary params
		 * (or only do it - define params automatically)
		 * 
		 * Take a look at the selection of the data and check which
		 * bar - x >= 1, y >= 1
		 * pie - x = 1, y >= 1
		 * scatter plot - ...
		 * 
		 * TODO: separate ChartType from the config file
		 */
		
		if(selectedDataStructureUri == null ||
		   selectedDataSetUri == null ||
		   selectedDimensionUris.length == 0 ||
		   selectedMeasureUris.length == 0 ||
		   selectedDataErrorCode != "ok") {
			// Captian, we've smashed and asteroid and got an oxygen leak in the rear hold!!!
			// TODO: make notification beautiful
			console.log(selectedDataStructureUri);
			console.log(selectedDataSetUri);
			console.log(selectedDimensionUris);
			console.log(selectedMeasureUris);
			alert(selectedDataErrorCode);
		} else {
			//step 2: request all labels for necessary URIs
			uris = [];
			uris.push(selectedDataStructureUri); 
			uris.push(selectedDataSetUri); 
			org.aksw.cubeViz.Index.Main.requestLabelsFor(uris);				
		}
		
	//	org.aksw.cubeViz.Index.Main.getApplicableCharts();
		
	},
	
	/**
	 * Input: no input
	 * Action: apply restrictions on the namespace vars
	 * Note: this function is part of sidebarLeftDataSelectionSubmitbtnClick
	 * 	     and must be initialized at the end of that function
	 * Output: errorMessage(string) - "ok", "Dimension X can not have more than 10 elements chosen",
	 * "Can not have more than two dimensions chosen", "Please, specify options for dimension X",
	 * "Please, select at least two dimensions."
	 * 
	 * WARNING: This function has several return values in different places (!!!)
	 */
	checkSelectedData: function() {
		//by default - everything is okay
		var errorMessage = "ok";
		
		//if chosen dimension X have more than 10 elements chosen
		//moved to the dimension dialog checkbox event
		
		//if more than two dimensions chosen
		//TODO: need to apply translation routine to this notifications!
		
		/***********************************************
		 * Conditions are going from up to bottom.     *
		 * The higher priority - the higher it should  *
		 * be in the code. Each condition MUST return  *
		 * string of the errorMessage.                 *
		 * If no conditions met - return default value *
		 ***********************************************/
		
		var dimensionsSelected = $("#sidebar-left-data-selection-dims-boxes").find("input:checked").length;
		if(dimensionsSelected > 2) {
			errorMessage = "Can not have more than two dimensions chosen.";
			/****************************
			 * Drop out of the function *
			 ****************************/
			return errorMessage;
		}
		
		//if less that two dimensions chosen
		if(dimensionsSelected < 2) {
			errorMessage = "Please, select at least two dimensions.";
			return errorMessage;
		}
		
		//if options for chosen dimension X not specified
		for(var selectedDimension in this.selectedDimensions.dimensions) {
			var label_current = this.selectedDimensions.dimensions[selectedDimension].label;
			
			var orderDirection = $("#dialog-options-dimension-order-direction-value-"+label_current).text();			
			var axis = $("#dialog-options-dimension-chart-axis-value-"+label_current).text();			
			
			if(orderDirection == "None" || 
			   orderDirection == "Ascending" || 
			   orderDirection == "Descending" ) {
				//everything is okay
			} else {
                // TODO fix this!
                orderDirection = "None";
                //errorMessage = "Please, specify options (order direction) for dimension "+label_current;
				return errorMessage;
			}
			
			if(axis == "x" ||
			   axis == "y" ||
			   axis == "z") {
				//everything is okay
			} else { 
                // TODO fix this!
                axis = "x";
				//errorMessage = "Please, specify options (axis) for dimension "+label_current;
				return errorMessage;
		    }	
		}
		
		// measure is chosen ?
		var measuresSelected = $(".sidebar-left-data-selection-meas-box-seperator").find("input:checked").length;
		if(measuresSelected < 1) {
			errorMessage = "Please, specify at least one measure.";
			return errorMessage;
		}
		
		//check chosen measure options
		for(selectedMeasure in this.selectedMeasures.measures) {
			label_current = this.selectedMeasures.measures[selectedMeasure].label;
			var aggregationMethod = $("#dialog-options-measure-aggregation-method-value-"+label_current).text();
			var orderDirection = $("#dialog-options-measure-order-direction-value-"+label_current).text();
			var roundValues = $("#dialog-options-measure-round-values-value-"+label_current).text();
			
			if(aggregationMethod == "sum" ||
			   aggregationMethod == "average" ||
			   aggregationMethod == "minimum" ||
			   aggregationMethod == "maximum") {
				//everything okay, captain!
			} else {
				errorMessage = "Please, specify options (aggregation method) for measure "+label_current;
				return errorMessage;
			}
			
			if(orderDirection == "None" ||
			   orderDirection == "Ascending" ||
			   orderDirection == "Descending") {
				//everything okay, captain!
			} else {
				errorMessage = "Please, specify options (order direction) for measure "+label_current;
				return errorMessage;
			}
			
			if(roundValues == "yes" ||
			   roundValues == "no") {
				//everything okay, captain!
			} else {
				errorMessage = "Please, specify options (round values) for measure "+label_current;
				return errorMessage;
			}
		}
		
		return errorMessage;
	},
	
	/**
	 * Input: Chart name
	 * Output: Chart Id
	 * Action: Maps chart name to the chart id
	 * Depends on: this.availableChartTypes
	 */
	getChartType: function(chartName) {
		//If no match - returns 0
		chartId = 0; 
		switch(chartName) {
			case 'bars':
				chartId = "0";
				break;
			case 'lines':
				chartId = "1";
				break;
			case 'areas':
				chartId = "2";
				break;
			case 'splines':
				chartId = "3";
				break;
			case 'scatterplot':
				chartId = "4";
				break;
			case 'table':
				chartId = "5";
				break;
		}
		return chartId;
	},
	
	/**
	 * Input: no input, works with namespace vars
	 * Action: make a URI for saving configuration into file
	 * Output: configuration string
	 * Notice: should be run after requestLabelsFor function
	 */
	
	makeConfig: function() {
        
        var selMeas = org.aksw.cubeViz.Index.Main.selectedMeasures,
            selDim = org.aksw.cubeViz.Index.Main.selectedDimensions,
            selDimCom = org.aksw.cubeViz.Index.Main.selectedDimensionComponents;
        
		return  "?foo=&" +
                "modelUri="+org.aksw.cubeViz.Index.Main.modelUri +
                "&sparqlEndpoint=" + '"' + org.aksw.cubeViz.Index.Main.sparqlEndpoint + '"' + 
                "&selectedGraph=" + $.toJSON(org.aksw.cubeViz.Index.Main.selectedGraph) +
                "&selectedDSD=" + $.toJSON(org.aksw.cubeViz.Index.Main.selectedDSD) +
                "&selectedDS=" + $.toJSON(org.aksw.cubeViz.Index.Main.selectedDS) +
                "&selectedMeasures=" + $.toJSON(selMeas) +
                "&selectedDimensions=" + $.toJSON(selDim) +
                "&selectedDimensionComponents=" + $.toJSON(selDimCom) +
                "&selectedChartType=" + org.aksw.cubeViz.Index.Main.chartType;
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
     * 
     */
    initPageLinks: function () {
        $('.page-link').each(function(index) {

            rawId = $(this).attr('id');
            id = $(this).attr('id').replace ('page-', '');
            
            /**
             * Event: click
             */
            $( "#" + rawId ).click ( function () { 
                
                rawId = $(this).attr('id');
                id = $(this).attr('id').replace ('page-', '');
                
                $.ajax({
                    url: urlBase + "cubeviz/page/",
                    data: "page="+id,
                    success: function(html){
                        $("#content").html ( html );
                    }
                });
            
            });
            
        });
    },
	
    /**
     * 
     */
    loadPage: function (pageName) {
        $.ajax({
            url: urlBase + "cubeviz/page/",
            data: "page="+pageName,
            success: function(html){
                $("#content").html ( html );
            }
        });
    },

	/**
	 * Input: dimensions array
	 * Action: initialize "+ select some elements" link
	 * Side Effect: get dimension elements and render dialogs
	 * Output: no output
	 */
	initSelectElementLink: function(dimensions) {
		for(dimension in dimensions.dimensions) {
			$("#open-dialog-"+dimensions.dimensions[dimension].label+"-selector").click(function () {
				label_current = this.id.split("-");
				label_current = label_current[2];
				
				// here we suppose, that label is unique
				// maybe a bad assumption
				
				/********************************************************************
				 * Important notice: don't append event before template processing! *
				 ********************************************************************/
								
				//org.aksw.cubeViz.Index.Main.reloadDimensionComponentDialog(label_current);
				
				org.aksw.cubeViz.Index.Main.closeAllDialogs();
				$("#dialog-"+label_current).show();
                $("#site-overlay").show ();
			});
		}
	},
	
	/**
	 * Input: dimensions array
	 * Action: initialize "Options" link
	 * Side effect:
	 * Output: no output
	 */	
	initOptionsDimensionLinkOnInit: function(dimensions) {
		org.aksw.cubeViz.Index.Main.renderOptionsForDimensions(dimensions.dimensions);
		for(dimension in dimensions.dimensions) {
			$("#open-dialog-"+dimensions.dimensions[dimension].label+"-options").click(function () {
				label_current = this.id.split("-");
				label_current = label_current[2];
								
				/********************************************************************
				 * Important notice: don't append event before template processing! *
				 ********************************************************************/
				
				org.aksw.cubeViz.Index.Main.closeAllDialogs();
				$("#dialog-options-dimension-"+label_current).show();
			});
		}
	},
	
	/**
	 * Duplicate of initOptionsDimensionLinkOnInit
	 * Triggers on dimensions and measures retrieval
	 */	
	initOptionsDimensionLink: function(dimensions) {
		
		//fill options with dummy values
		for(dimension in dimensions.dimensions) {
			dimensions.dimensions[dimension].chartAxis = "x";
			// dimensions.dimensions[dimension].orderDirection = "Please, choose order direction";
			dimensions.dimensions[dimension].orderDirection = "None";
		}
		
		//check for options availability in this.optionsDimensions
		for(dimension in dimensions.dimensions) {
			dimension_label = dimensions.dimensions[dimension].label;
			for(option in this.optionsDimensions) {
				option_label = this.optionsDimensions[option]["label"];
				if(option_label == dimension_label) {
					dimensions.dimensions[dimension].chartAxis = this.optionsDimensions[option]["chartAxis"];
					dimensions.dimensions[dimension].orderDirection = this.optionsDimensions[option]["orderDirection"];
				}
			}
		}
		
		//render template		
		org.aksw.cubeViz.Index.Main.renderOptionsForDimensions(dimensions.dimensions);
		
		for(dimension in dimensions.dimensions) {
			$("#open-dialog-"+dimensions.dimensions[dimension].label+"-options").click(function () {
				label_current = this.id.split("-");
				label_current = label_current[2];
								
				/********************************************************************
				 * Important notice: don't append event before template processing! *
				 ********************************************************************/
				
				org.aksw.cubeViz.Index.Main.closeAllDialogs();
				//check the radio buttons here		 
				org.aksw.cubeViz.Index.Main.markRadioButtonsForDimensionDialogs(label_current);
				
				$("#dialog-options-dimension-"+label_current).show();
                $("#site-overlay").show ();
			});
		}
	},
	
	/**
	 * 
	 */
	initOptionsMeasureLinkOnInit: function(measures) {
		org.aksw.cubeViz.Index.Main.renderOptionsForMeasures(measures.measures);
		for(measure in measures.measures) {
			label_current = measures.measures[measure].label;
			$("#open-dialog-"+current_label+"-options").click(function () {
				label_current = this.id.split("-");
				label_current = label_current[2];
								
				/********************************************************************
				 * Important notice: don't append event before template processing! *
				 ********************************************************************/
				
				org.aksw.cubeViz.Index.Main.closeAllDialogs();
				$("#dialog-options-measure-"+label_current).show();
                $("#site-overlay").show ();
			});
		}
	},
	
	/**
	 * Duplicate of initOptionsMeasureLinkOnInit
	 * Triggers on dimensions and measures retrieval
	 */	
	initOptionsMeasureLink: function(measures) {
		
		//fill options with dummy values
		for(measure in measures.measures) {
			measures.measures[measure].aggregationMethod = "Please, set chartAxis.";
			measures.measures[measure].orderDirection = "Please, choose order direction";
			measures.measures[measure].roundValues = "Please, choose order direction";
		}
		
		//check for options availability in this.optionsDimensions
		for(measure in measures.measures) {
			measure_label = measures.measures[measure].label;
			for(option in this.optionsMeasures) {
				option_label = this.optionsMeasures[option]["label"];
				if(option_label == measure_label) {
					measures.measures[measure].aggregationMethod = this.optionsMeasures[option]["aggregationMethod"];
					measures.measures[measure].orderDirection = this.optionsMeasures[option]["orderDirection"];
					measures.measures[measure].roundValues = this.optionsMeasures[option]["roundValues"];
				}
			}
		}
		
		//render template		
		org.aksw.cubeViz.Index.Main.renderOptionsForMeasures(measures.measures);
		
		for(measure in measures.measures) {			
			label_current = measures.measures[measure].label;
			$("#open-dialog-"+label_current+"-options").click(function () {
				label_current = this.id.split("-");
				label_current = label_current[2];
												
				/********************************************************************
				 * Important notice: don't append event before template processing! *
				 ********************************************************************/
				
					
				/************************************
				 * Check Radio buttons for measures *
				 ************************************/
				
				org.aksw.cubeViz.Index.Main.markRadioButtonsForMeasureDialogs(label_current);
				
				org.aksw.cubeViz.Index.Main.closeAllDialogs();
				$("#dialog-options-measure-"+label_current).show();
			});
		}
	},
			
	/**
	 * Input: array [dimension_name: [label: label, list: [dimension components] ] ]
	 * Action: process dialog template on "select some elements" event
	 * Output: no output
	 */
	
	renderDialogsForDimensions: function(dimensions) {
		
		for(dimension in dimensions) {
			
			// as we remove this selector it can't be used further in the code!
			var dialog_current = $("#dialog-"+dimensions[dimension].label);
			dialog_current.remove();
			
			$("#wrapper").append(dialogTemplate.expand(dimensions[dimension]));
			
			/***************************
			 * Checking the checkboxes *
			 ***************************/
			var dialog_current = $("#dialog-"+dimensions[dimension].label);
			dialog_current.hide();
			var components = dialog_current.find(".dialog-listitem");
			var selectedDimensionComponents = org.aksw.cubeViz.Index.Main.selectedDimensionComponents;
			
			//console.log(selectedDimensionComponents);
			
			$.each(components, function() {
				
				checkbox_current = $(this).find(".dialog-listitem-box");
				componentUri = checkbox_current.val();
				
				
				for(selDimComp in selectedDimensionComponents) {
					selDimCompUri = selectedDimensionComponents[selDimComp].property;
					if(componentUri == selDimCompUri) {
						checkbox_current.attr('checked','checked');
					}
				}
			});
			
			/***********************************************************
			 * Set the .dialog-number-of-selected-elements DOM element *
			 ***********************************************************/
			 
			var selectedElementsLength = $("#dialog-"+dimensions[dimension].label).find("input:checked").length; 
			$(".dialog-number-of-selected-elements", "#dialog-"+dimensions[dimension].label).text(selectedElementsLength);
			
			/**********************************************
			 * Set initial value for selected elements    *
			 * in the dimensions box, e.g. Country (4/26) *
			 **********************************************/
			 
			// Set number of selected items
            selectedItems = selectedElementsLength + "/";
            $("#dialog-" + dimensions[dimension].label + "-selected-items").html (selectedItems);
			
			/**************************************************
			 * All event handlers for dialogs should be here! *
			 * if in other place, you should use .live jquery *
			 * method - http://api.jquery.com/live/           *
			 **************************************************/
			
			// "Save" button click event
			$("#dialog-btn-close-"+dimensions[dimension].label).click( function() {
				var label_current = this.id.split("-");
				label_current = label_current[3];
				$("#dialog-"+label_current).hide();
                $("#site-overlay").hide ();
                
                // Set number of selected items
                // in the Dimensions menu, e.g. Country (3 / 26)
                var selectedElements = $(".dialog-number-of-selected-elements", "#dialog-"+label_current).text();
                selectedElements = selectedElements + "/";
                $("#dialog-" + label_current + "-selected-items").html (selectedElements);
                
                //update namespace variable
                //selectedElementCount for this dimension in SelectedDimensions object
                for(dimension in org.aksw.cubeViz.Index.Main.selectedDimensions.dimensions) {
					var dimension_current = org.aksw.cubeViz.Index.Main.selectedDimensions.dimensions[dimension];
					if(dimension_current.label == label_current) {
						org.aksw.cubeViz.Index.Main.selectedDimensions.dimensions[dimension].selectedElementCount = parseInt(selectedElements);
					}
				}
			});
			
			// Checkbox (any) click event
            $(".dialog-listitem-box", "#dialog-"+dimensions[dimension].label).click( function() {
				
				/***************************************
				 * Here is the configurable parameter! *
				 ***************************************/
				var dimensionElementsLimit = org.aksw.cubeViz.Index.Main.dimensionElementsLimit;
				
				var label_current = $(this).parent().parent().parent().attr("id").split("-");
				label_current = label_current[1];
				var selectedElements_old = $(".dialog-number-of-selected-elements", "#dialog-"+label_current).text();
				
				// current checkbox
				var selectedElements = $(this).parent().find("input:checked").length;
				// plus all checked siblings
				selectedElements += $(this).parent().siblings().find("input:checked").length;
				
				$(".dialog-number-of-selected-elements", "#dialog-"+label_current).text(selectedElements);
				
				// check if elements are increasing and equal 10
				if( (selectedElements > selectedElements_old) && 
				    (selectedElements == dimensionElementsLimit)) {
					// TODO: replace alert with more beautiful notification
					// alert("You may have problems with visualizing more, than 10 elements.");
                    $(this).parent().siblings().find("input").each ( function () {
                        if ( false == $(this).is (':checked') ) {
                            $(this).attr('disabled','disabled');
                        } 
                    });
                    $(".dialog-header-label-warning").each ( function () {
                        $(this).show ();
                        $(this).fadeOut (9000);
                    });
				} else {
                    $(this).parent().siblings().find("input").each ( function () {
                        $(this).removeAttr('disabled');
                    });
                }				
			});
		}
	},
	
	/**
	 * Input: array [dimension_name: [label: label, list: [dimension components] ] ]
	 * Action: process dialog template on initialization of the widget
	 * Output: no output
	 */
	renderDialogsForDimensionsInit: function(dimensions) {
		for(dimension in dimensions) {
			$("#dialog-"+dimensions[dimension].label).remove();
			$("#wrapper").append(dialogTemplate.expand(dimensions[dimension]));
			$("#dialog-"+dimensions[dimension].label).hide();
			
			/**************************************************
			 * All event handlers for dialogs should be here! *
			 **************************************************/
			
		}
	},
	
	/**
	 * 
	 */
	renderOptionsForDimensions: function(options) {
		//console.log(dimensions);
		for(dimension in options) {
			$("#dialog-options-dimension-"+options[dimension].label).remove();
			$("#wrapper").append(optionsDimensionTemplate.expand(options[dimension]));
			$("#dialog-options-dimension-"+options[dimension].label).hide();
			
			/**************************************************
			 * All event handlers for dialogs should be here! *
			 **************************************************/
			
			$(".dialog-options-dimension-items-order-direction-"+options[dimension].label).click( function() {
				var label_current = $(this).attr("class").split("-");
				label_current = label_current[6];
				$(this).siblings("#dialog-options-dimension-order-direction-value-"+label_current).text($(this).val());
			});
			
			$(".dialog-options-dimension-items-chart-axis-"+options[dimension].label).click( function() {
				var label_current = $(this).attr("class").split("-");
				label_current = label_current[6];
				
				$(this).siblings("#dialog-options-dimension-chart-axis-value-"+label_current).text($(this).val());
			
				//if some other got the same chart axis - set it to another (!)
				//get all axisAllocation
				var axisAllocation = [];
				for(dimension in org.aksw.cubeViz.Index.Main.allDimensions.dimensions) {
					var label_current_inner = org.aksw.cubeViz.Index.Main.allDimensions.dimensions[dimension].label;
					axisAllocation[label_current_inner] = $("#dialog-options-dimension-chart-axis-value-"+label_current_inner).text();
				}
				
				//set other label to the different value
				for(dimension in org.aksw.cubeViz.Index.Main.allDimensions.dimensions) {
					var label_current_inner = org.aksw.cubeViz.Index.Main.allDimensions.dimensions[dimension].label;
					if( (label_current_inner != label_current) && 
						(axisAllocation[label_current_inner] == axisAllocation[label_current]) ) {
						if(axisAllocation[label_current] == "x") {
							$("#dialog-options-dimension-chart-axis-value-"+label_current_inner).text("z");
						} else {
							$("#dialog-options-dimension-chart-axis-value-"+label_current_inner).text("x");
						}						
					}
				}
				
			});
			
			$("#dialog-options-dimension-btn-close-"+options[dimension].label).click( function() {
				var label_current = this.id.split("-");
				label_current = label_current[5];
				$("#dialog-options-dimension-"+label_current).hide();
                $("#site-overlay").hide ();
			});
		}
	},
	
	/**
	 * 
	 */
	renderOptionsForMeasures: function(options) {
		for(measure in options) {
			label_current = options[measure].label;
			$("#dialog-options-measure-"+label_current).remove();
			$("#wrapper").append(optionsMeasureTemplate.expand(options[measure]));
			$("#dialog-options-measure-"+label_current).hide();
			
			/**************************************************
			 * All event handlers for dialogs should be here! *
			 **************************************************/
						
			$(".dialog-options-measure-items-order-direction-"+label_current).click( function() {
				label_current = $(this).attr("class").split("-");
				label_current = label_current[6];
				$(this).siblings("#dialog-options-measure-order-direction-value-"+label_current).text($(this).val());
			});
			
			$(".dialog-options-measure-items-round-values-"+label_current).click( function() {
				label_current = $(this).attr("class").split("-");
				label_current = label_current[6];
				$(this).siblings("#dialog-options-measure-round-values-value-"+label_current).text($(this).val());
			});
			
			$(".dialog-options-measure-items-aggregation-method-"+label_current).click( function() {
				label_current = $(this).attr("class").split("-");
				label_current = label_current[6];
				$(this).siblings("#dialog-options-measure-aggregation-method-value-"+label_current).text($(this).val());
			});
			
			$("#dialog-options-measure-btn-close-"+label_current).click( function() {
				label_current = this.id.split("-");
				label_current = label_current[5];
				$("#dialog-options-measure-"+label_current).hide();
                $("#site-overlay").hide ();
			});
		}
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
	 * Input: no input
	 * Output: no output
	 * Action: Scans through dimensions and measures lists and check
	 * checkboxes
	 */
	markSelectedDimensionsAndMeasures: function() {
		var dimensions = $("#sidebar-left-data-selection-dims-boxes").children(); 
		var selectedDimensions = org.aksw.cubeViz.Index.Main.selectedDimensions.dimensions;
		$.each(dimensions, function() {
			checkbox_current = $(this).find(".sidebar-left-data-selection-dims-box");
			dimensionUri = checkbox_current.val();
			for(selectedDimension in selectedDimensions) {
				var dimension_current = selectedDimensions[selectedDimension];
				if(dimension_current.uri == dimensionUri) {
					checkbox_current.attr('checked','checked');
				}
			}
		});
		
		var measures = $("#sidebar-left-data-selection-meas-boxes").children(); 
		var selectedMeasures = org.aksw.cubeViz.Index.Main.selectedMeasures.measures;
		$.each(measures, function() {
			checkbox_current = $(this).find(".sidebar-left-data-selection-meas-box");
			measureUri = checkbox_current.val();
			for(selectedMeasure in selectedMeasures) {
				var measure_current = selectedMeasures[selectedMeasure];
				if(measure_current.uri == measureUri) {
					checkbox_current.attr('checked','checked');
				}
			}
		});
		
		org.aksw.cubeViz.Index.Main.initDimensionRestrictions();
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
	
	/**
	 * Input: options dialog DOM element (label name!)
	 * Output: no output
	 * Action: check the radio buttons of the measure options dialogs
	 */
	markRadioButtonsForMeasureDialogs: function(label) {
		var aggrMethod = $("#dialog-options-measure-aggregation-method-value-"+label).text();
		var aggrMethodRadio = $(".dialog-options-measure-items-aggregation-method-"+label);
		$.each(aggrMethodRadio, function() {
			if($(this).val() == aggrMethod) {
				$(this).attr('checked','checked');
			}
		});
		
		var orderDirection = $("#dialog-options-measure-order-direction-value-"+label).text();
		var orderDirectionRadio = $(".dialog-options-measure-items-order-direction-"+label);
		$.each(orderDirectionRadio, function() {
			if($(this).val() == orderDirection) {
				$(this).attr('checked','checked');
			}
		});
		
		var roundValues = $("#dialog-options-measure-round-values-value-"+label).text();
		var roundValuesRadio = $(".dialog-options-measure-items-round-values-"+label);
		$.each(roundValuesRadio, function() {
			if($(this).val() == roundValues) {
				$(this).attr('checked','checked');
			}
		});	
	},
	
	/**
	 * Input: options dialog DOM element (label name!)
	 * Output: no output
	 * Action: check the radio buttons of the dimension options dialogs
	 */
	markRadioButtonsForDimensionDialogs: function(label) {
		
		var orderDirection = $("#dialog-options-dimension-order-direction-value-"+label).text();
		var orderDirectionRadio = $(".dialog-options-dimension-items-order-direction-"+label);
		$.each(orderDirectionRadio, function() {
			if($(this).val() === orderDirection) {
				$(this).attr('checked','checked');
			}
		});
		
		var chartAxis = $("#dialog-options-dimension-chart-axis-value-"+label).text();
		var chartAxisRadio = $(".dialog-options-dimension-items-chart-axis-"+label);
		$.each(chartAxisRadio, function() {
			if($(this).val() == chartAxis) {
				$(this).attr('checked','checked');
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
	},
	
	/**
	 * Input: no input
	 * Action: apply restrictions on the dimensions checkboxes
	 * Output: no output
	 */
	initDimensionRestrictions: function () {
		
		$(".sidebar-left-data-selection-dims-box").each( function() {
			$(this).click( function () {
				var count = org.aksw.cubeViz.Index.Main.countSelectedDimensionCheckboxes();
				if(count < 2) {
					$(".sidebar-left-data-selection-dims-box").each( function() {
						if($(this).attr("checked") == false) {
							$(this).attr("disabled", false);
						}		
					});
				} else {
					$(".sidebar-left-data-selection-dims-box").each( function() {
						if($(this).attr("checked") == false) {
							$(this).attr("disabled", true);
						}		
					});
				}
			});			
		});
		
		if ( 2 == this.selectedDimensions.dimensions.length) {
			$(".sidebar-left-data-selection-dims-box").each( function() {
				if($(this).attr("checked") == false) {
					$(this).attr("disabled", true);
				}		
			});
		}
	},
	
	countSelectedDimensionCheckboxes: function() {
		return $(".sidebar-left-data-selection-dims-box-seperator").find("input:checked").length;
	}
});
