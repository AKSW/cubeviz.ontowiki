// https://github.com/smith/namespacedotjs
//Namespace('org.aksw.cubeViz.GUI');

// creates or use a namespace and fill it with the specified properties
Namespacedotjs('org.aksw.cubeViz.GUI.Views', {
	
	/********************************
	 *                              *
	 * CubeViz GUI Global Variables *
	 *                              *
	 ********************************/	
	
	sparqlEndpoint: null,
	selectedGraph: null,
	selectedDSD: null,
	selectedDS: null,
	selectedDimensions: [],
	selectedMeasures: [],
	selectedDimensionComponents: [],
	
	/******************************************
	 *                                        *
	 * View #1 - SPARQL Endpoint View Section *
	 *                                        *
	 ******************************************/	
	
	/**
	 * 
	 */	
	getGraphNamesFor: function(sparqlEndpoint, cubevizPath) {
		actionName = "getgraphnames";
		$.ajax({
			url: cubevizPath + actionName + "/",
			data: "sparqlEndpoint="+sparqlEndpoint,
			success: function(jsonObject){
				var graphNames = JSON.parse(jsonObject);
				
				org.aksw.cubeViz.GUI.Views.viewGraphNames(graphNames);
			}
		});
	},
	
	/**
	 * 
	 */
	selectSparqlEndpointButton: function() {
		org.aksw.cubeViz.GUI.Views.sparqlEndpoint = $("#sparql-endpoint-input").val();
		if(org.aksw.cubeViz.GUI.Views.sparqlEndpoint == "") {
			alert("Specify SPARQL Endpoint, please!");
		} else {
			// Append SPARQL Endpoint to the summary
			$("#summary-sparql-endpoint").text(org.aksw.cubeViz.GUI.Views.sparqlEndpoint);			
			
			$("#sparql-endpoint-view").hide("slow");
			graphNames = org.aksw.cubeViz.GUI.Views.getGraphNamesFor(org.aksw.cubeViz.GUI.Views.sparqlEndpoint,
																	 cubevizPath);
		}
	},
	
	/******************************************
	 *                                        *
	 * View #2 - Graph Selection View Section *
	 *                                        *
	 ******************************************/
	
	/**
	 * 
	 */
	viewGraphNames: function(graphNames) {		
		// create graph objects
		graphs = createGraphObjects(graphNames);
		// if only one graph exists - select it and proceed to the DSD selection
		if(graphs.length == 1) {
			onlyOneGraphCase(graphs);
		} else {
			// append graphs to the table
			appendGraphsToView(graphs);
			// initialize selectable interface
			initGraphSelection();
			// initialize the view
			$("#graph-view").show();
		}
		/*******************
		 * Inner functions *
		 *******************/
		function createGraphObjects(graphNames) {
			graphs_temp = new Array();
			for(i=0; i < graphNames.length; i++) {
				var graph = {
					name: graphNames[i],
					number: i
				};
				// pack to an array
				graphs_temp.push(graph);
			}
			return graphs_temp;
		}
		
		function appendGraphsToView(graphs) {
			for(i = 0; i < graphs.length; i++){
				var newRow = $("#graph-table .template").clone().removeClass('template');
				graphTemplate(newRow, graphs[i]).appendTo('#graph-table').fadeIn();
			}
		}
		
		function graphTemplate(row, graphName) {
			row.find('.graph-number').text(graphName.number);
			row.find('.graph-name').text(graphName.name);
			return row;
		}
		
		function initGraphSelection() {
			$(".selectable").click(function() {
				$(this).toggleClass("selected");
			});
		}
		
		function onlyOneGraphCase(graphs) {
			var graph = {
				label: graphs[0].name,
				number: graphs[0].number
			};
			
			org.aksw.cubeViz.GUI.Views.selectedGraph = graph;
			//append graph to the summary
			$("#summary-graph-name").text(org.aksw.cubeViz.GUI.Views.selectedGraph.label);
			
			//hide graph view
			$("#graph-view").hide("slow");
			
			/***********************
			 * Go to the next View *
			 ***********************/
			//ajax request to get the Data Sets
			org.aksw.cubeViz.GUI.Views.getDataStructuresFor(org.aksw.cubeViz.GUI.Views.selectedGraph, cubevizPath);			
		}
	},
	
	/**
	 * 
	 */
	selectGraphButton: function() {
		//check if only one div is selected
		numberOfSelectedGraphs = $("#graph-table .selected").length;
		
		if(numberOfSelectedGraphs == 1) {
			//get the selected graph
			graphsValue = $("#graph-table .selected > td");
			selectedGraphNumber = $(graphsValue).find(".graph-number").text();
			selectedGraphName = $(graphsValue).find(".graph-name").text();
			var graph = {
				label: selectedGraphName,
				number: selectedGraphNumber
			};
			org.aksw.cubeViz.GUI.Views.selectedGraph = graph;
			//append graph to the summary
			$("#summary-graph-name").text(org.aksw.cubeViz.GUI.Views.selectedGraph.label);
			
			//hide graph view
			$("#graph-view").hide("slow");
			
			/***********************
			 * Go to the next View *
			 ***********************/
			//ajax request to get the Data Sets
			org.aksw.cubeViz.GUI.Views.getDataStructuresFor(org.aksw.cubeViz.GUI.Views.selectedGraph, cubevizPath);
						
		} else {
			alert("Only one graph can be selected.");
		}
	},
	
	/****************************************************
	 *                                                  *
	 *  View #3 - Data Structure Selection View Section *
	 *                                                  *
	 ****************************************************/
	
	/**
	 * 
	 */
	getDataStructuresFor: function(graph, cubevizPath) {
		actionName = "getdatastructures";
		$.ajax({
			url: cubevizPath + actionName + "/",
			data: "graphName="+graph.label,
			success: function(jsonObject){
				var dataStructures = JSON.parse(jsonObject);
				
				org.aksw.cubeViz.GUI.Views.viewDataStructures(dataStructures);
			}
		});
	},
	
	/**
	 * 
	 */
	viewDataStructures: function(dataStructures) {
		// create graph objects
		DSDs = createDataStructureObjects(dataStructures);
		if(DSDs.length == 1) {
			oneDSDCase(DSDs);
		} else {
			// append graphs to the table
			appendDSDsToView(DSDs);
			// initialize selectable interface
			initDSDsSelection();
			// initialize the view
			$("#datastructure-view").show();
		}
				
		/*******************
		 * Inner functions *
		 *******************/
		function createDataStructureObjects(dataStructures) {
			dsds_temp = new Array();
			for(ds in dataStructures) {
				var dataStructure = {
					label: dataStructures[ds],
					uri: ds
				};
				// pack to an array
				dsds_temp.push(dataStructure);
			}
			return dsds_temp;
		}
		
		function appendDSDsToView(DSDs) {
			for(i = 0; i < DSDs.length; i++){
				var newRow = $("#datastructure-table .template").clone().removeClass('template');
				DSDTemplate(newRow, DSDs[i]).appendTo('#datastructure-table').fadeIn();
			}
		}
		
		function DSDTemplate(row, DSD) {
			row.find('.datastructure-uri').text(DSD.uri);
			row.find('.datastructure-label').text(DSD.label);
			return row;
		}
		
		function initDSDsSelection() {
			$(".selectable").click(function() {
				$(this).toggleClass("selected");
			});
		}
		
		function oneDSDCase(DSDs) {
			var DSD = {
				label: DSDs[0].label,
				uri: DSDs[0].uri
			};
			
			org.aksw.cubeViz.GUI.Views.selectedDSD = DSD;
			
			//append DSD to the summary
			$("#summary-dsd").text(org.aksw.cubeViz.GUI.Views.selectedDSD.label);
			
			//hide DSD view
			$("#datastructure-view").hide("slow");
			
			/***********************
			 * Go to the next View *
			 ***********************/
			//ajax request to get the Data Sets
			org.aksw.cubeViz.GUI.Views.getDataSetsFor(org.aksw.cubeViz.GUI.Views.selectedDSD, cubevizPath);		
		}
	},
	
	/**
	 * 
	 */
	selectDataStructureButton: function() {
		//check if only one div is selected
		numberOfSelectedDSDs = $("#datastructure-table .selected").length;
		
		if(numberOfSelectedDSDs == 1) {
			//get the selected DSD
			DSDsValue = $("#datastructure-table .selected > td");
			selectedDSDLabel = $(DSDsValue).find(".datastructure-label").text();
			selectedDSDUri = $(DSDsValue).find(".datastructure-uri").text();
			var DSD = {
				label: selectedDSDLabel,
				uri: selectedDSDUri
			};
			org.aksw.cubeViz.GUI.Views.selectedDSD = DSD;
			
			//append DSD to the summary
			$("#summary-dsd").text(org.aksw.cubeViz.GUI.Views.selectedDSD.label);
			
			//hide DSD view
			$("#datastructure-view").hide("slow");
			
			/***********************
			 * Go to the next View *
			 ***********************/
			//ajax request to get the Data Sets
			org.aksw.cubeViz.GUI.Views.getDataSetsFor(org.aksw.cubeViz.GUI.Views.selectedDSD, cubevizPath);		
		} else {
			alert("Only one data structure can be selected.");
		}	
	},
	
	/*********************************************
	 *                                           *
	 * View #4 - Data Set Selection View Section *
	 *                                           *
	 *********************************************/
	
	/**
	 * 
	 */
	getDataSetsFor: function(DSD, cubevizPath) {
		actionName = "getdatasets";
		$.ajax({
			url: cubevizPath + actionName + "/",
			data: "dataStructure="+DSD.uri,
			success: function(jsonObject){
				var dataSets = JSON.parse(jsonObject);
				
				org.aksw.cubeViz.GUI.Views.viewDataSets(dataSets);
			}
		});
	},
	
	/**
	 * 
	 */
	viewDataSets: function(dataSets) {
		// create graph objects
		DSs = createDataSetObjects(dataSets);
		if(DSs.length == 1) {
			oneDSCase(DSs);
		} else {
			// append graphs to the table
			appendDSsToView(DSs);
			// initialize selectable interface
			initDSsSelection();
			// initialize the view
			$("#dataset-view").show();
		}
		/*******************
		 * Inner functions *
		 *******************/
		 
		function createDataSetObjects(dataSets) {
			dss_temp = new Array();
			for(ds in dataSets) {
				var dataSet = {
					label: dataSets[ds],
					uri: ds
				};
				// pack to an array
				dss_temp.push(dataSet);
			}
			return dss_temp;
		}
		
		function appendDSsToView(DSs) {
			for(i = 0; i < DSs.length; i++){
				var newRow = $("#dataset-table .template").clone().removeClass('template');
				DSTemplate(newRow, DSs[i]).appendTo('#dataset-table').fadeIn();
			}
		}
		
		function DSTemplate(row, DS) {
			row.find('.dataset-label').text(DS.label);
			row.find('.dataset-uri').text(DS.uri);
			return row;
		}
		
		function initDSsSelection() {
			$(".selectable").click(function() {
				$(this).toggleClass("selected");
			});
		}
		
		function oneDSCase(DSs) {
			var DS = {
				label: DSs[0].label,
				uri: DSs[0].uri
			};
			
			org.aksw.cubeViz.GUI.Views.selectedDS = DS;
			
			//append DS to the summary
			$("#summary-ds").text(org.aksw.cubeViz.GUI.Views.selectedDS.label);
			
			//hide DSD view
			$("#dataset-view").hide("slow");
			
			/***********************
			 * Go to the next View *
			 ***********************/
			//ajax request to get the Data Sets
			org.aksw.cubeViz.GUI.Views.getDimensionsAndMeasuresFor(org.aksw.cubeViz.GUI.Views.selectedDS, 
																   org.aksw.cubeViz.GUI.Views.selectedDSD, 
																   cubevizPath);
		}
	},
	
	/**
	 * 
	 */
	selectDataSetButton: function() {
		//check if only one div is selected
		numberOfSelectedDSs = $("#dataset-table .selected").length;
		if(numberOfSelectedDSs == 1) {
			//get the selected DSD
			DSsValue = $("#dataset-table .selected > td");
			selectedDSLabel = $(DSsValue).find(".dataset-label").text();
			selectedDSUri = $(DSsValue).find(".dataset-uri").text();
			var DS = {
				label: selectedDSLabel,
				uri: selectedDSUri
			};
			org.aksw.cubeViz.GUI.Views.selectedDS = DS;
			
			//append DS to the summary
			$("#summary-ds").text(org.aksw.cubeViz.GUI.Views.selectedDS.label);
			
			//hide DSD view
			$("#dataset-view").hide("slow");
			
			/***********************
			 * Go to the next View *
			 ***********************/
			//ajax request to get the Data Sets
			org.aksw.cubeViz.GUI.Views.getDimensionsAndMeasuresFor(org.aksw.cubeViz.GUI.Views.selectedDS, 
																   org.aksw.cubeViz.GUI.Views.selectedDSD, 
																   cubevizPath);
						
		} else {
			alert("Only one data structure can be selected.");
		}
	},
	
	/***********************************************************
	 *                                                         *
	 * View #5 - Dimensions and Meaures Selection View Section *
	 *                                                         *
	 ***********************************************************/
	
	/**
	 * 
	 */
	getDimensionsAndMeasuresFor: function(DS, DSD, cubevizPath) {
		actionName = "getdimensionsandmeasures";
		$.ajax({
			url: cubevizPath + actionName + "/",
			data: "dataSet="+DS.uri+"&dataStructure="+DSD.uri,
			success: function(jsonObject){
				var temp = JSON.parse(jsonObject);
				var dimensions = temp["dimensions"];
				var measures = temp["measures"];
				
				org.aksw.cubeViz.GUI.Views.viewMeasuresAndDimensions(dimensions, measures);
			}
		});
	},
	
	/**
	 * 
	 */
	viewMeasuresAndDimensions: function(dimensions, measures) {
		
		// show dimensions to the user
		appendDimensionsToView(dimensions);
		// show measures to the user
		appendMeasuresToView(measures);
		
		// initialize selectable interface
		initDimensionsAndMeasuresSelection();
		// initialize the view
		$("#dimension-measure-view").show();
		
		/*******************
		 * Inner functions *
		 *******************/
		
		function appendDimensionsToView(dimensions) {
			for(dimension in dimensions){
				var newRow = $("#dimension-table .template").clone().removeClass('template');
				dimensionTemplate(newRow, dimensions[dimension]).appendTo('#dimension-table').fadeIn();
			}
		}
		
		function dimensionTemplate(row, dimension) {
			row.find('.dimension-uri').text(dimension.uri);
			row.find('.dimension-label').text(dimension.label);
			row.find('.dimension-type').text(dimension.type);
			row.find('.dimension-order').text(dimension.order);
			row.find('.dimension-element-count').text(dimension.elemCount);
			return row;
		}
		
		function appendMeasuresToView(measures) {
			for(measure in measures){
				var newRow = $("#measure-table .template").clone().removeClass('template');
				measureTemplate(newRow, measures[measure]).appendTo('#measure-table').fadeIn();
			}
		}
		
		function measureTemplate(row, measure) {
			row.find('.measure-uri').text(measure.uri);
			row.find('.measure-label').text(measure.label);
			row.find('.measure-type').text(measure.type);
			row.find('.measure-order').text(measure.order);
			return row;
		}
		
		function initDimensionsAndMeasuresSelection() {
			$(".selectable").click(function() {
				$(this).toggleClass("selected");
			});
		}
	},
	
	/**
	 * 
	 */
	selectDimensionsAndMeasuresButton: function() {
		numberOfSelectedDimensions = $("#dimension-table .selected").length;
		numberOfSelectedMeasures = $("#measure-table .selected").length;
		
		if( (numberOfSelectedDimensions > 0) && (numberOfSelectedMeasures > 0)) {
			
			// for each selected row of the #dimension-table
			selectedDimensions = new Array();
			dimensionsValue = $("#dimension-table .selected");
			$.each(dimensionsValue, function() {
				uri_temp = $(this).find(".dimension-uri").text();
				label_temp = $(this).find(".dimension-label").text();
				type_temp = $(this).find(".dimension-type").text();
				order_temp = $(this).find(".dimension-order").text();
				element_count_temp = $(this).find(".dimension-element-count").text();
				
				var dimension = {
					uri: uri_temp,
					label: label_temp,
					type: type_temp,
					order: order_temp,
					elementCount: element_count_temp
				};
				
				org.aksw.cubeViz.GUI.Views.selectedDimensions.push(dimension);
			});
			
			// the same for the #measure-table
			selectedMeasures = new Array();
			measuresValue = $("#measure-table .selected");
			$.each(measuresValue, function() {
				uri_temp = $(this).find(".measure-uri").text();
				label_temp = $(this).find(".measure-label").text();
				type_temp = $(this).find(".measure-type").text();
				order_temp = $(this).find(".measure-order").text();
				
				var measure = {
					uri: uri_temp,
					label: label_temp,
					type: type_temp,
					order: order_temp
				};
				
				org.aksw.cubeViz.GUI.Views.selectedMeasures.push(measure);
				
			});
			
			selectedMeasures_length = org.aksw.cubeViz.GUI.Views.selectedMeasures.length;
			while(selectedMeasures_length--) {
				text = org.aksw.cubeViz.GUI.Views.selectedMeasures[selectedMeasures_length].label;
				newRow = $("#summary-measures-box .template").clone().text(text).removeClass("template");
				$("#summary-measures-box").append(newRow);
			}
			
			// hide the dimension-measure-view
			$("#dimension-measure-view").hide("slow");
			
			/***********************
			 * Go to the next View *
			 ***********************/
			org.aksw.cubeViz.GUI.Views.getDimensionComponents(org.aksw.cubeViz.GUI.Views.selectedDimensions,
															  org.aksw.cubeViz.GUI.Views.selectedDS,
															  cubevizPath);
						
		} else {
			alert("Please, select at least one dimension and one measure.");
		}
	},
	
	/******************************************************
	 *                                                    *
	 * View #6 - Dimension Property Specification Section *
	 *                                                    *
	 ******************************************************/
	
	/**
	 * 
	 */
	getDimensionComponents: function(selectedDimensions, selectedDS, cubevizPath) {
		actionName = "getcomponentelements";
		$.ajax({
			url: cubevizPath + actionName + "/",
			data: "componentProperty="+$.toJSON(selectedDimensions)+"&dataSet="+$.toJSON(selectedDS),
			success: function(jsonObject){
				var specificDimensions = JSON.parse(jsonObject);			
				
				org.aksw.cubeViz.GUI.Views.viewSpecificDimensions(specificDimensions);
			}
		});
	},
	
	/**
	 * 
	 */
	viewSpecificDimensions: function(specificDimensions) {
		
		
		for(specificDimension in specificDimensions) {
			
			specDimObj = getDimensionByUri(org.aksw.cubeViz.GUI.Views.selectedDimensions, specificDimension);
			
			for(i=0; i < specificDimensions[specificDimension].length; i++) {
				showSpecificDimension(specificDimensions[specificDimension][i], specDimObj);
			}
		}
		
		// initialize selectable interface
		initDimensionComponentSelection();
		
		$('#specify-dimensions').show('slow');
		
		/*******************
		 * Inner functions *
		 *******************/
		
		function showSpecificDimension(specificDimension, dimObj) {
			var newRow = $("#dimension-elements-table .template").clone().removeClass('template');
			specifyDimensionsTemplate(newRow, specificDimension, dimObj).appendTo('#dimension-elements-table').fadeIn();
		}
		
		function specifyDimensionsTemplate(row, specificDimension, dimObj) {
			row.find('.dimension-label').text(dimObj.label);
			row.find('.dimension-property').text(specificDimension);
			return row;
		}
		
		function initDimensionComponentSelection() {
			$(".selectable").click(function() {
				$(this).toggleClass("selected");
			});
		}
		
		function getDimensionByUri(dimensions, uri) {
			for(dimension in dimensions) {
				if(dimensions[dimension]['uri'] == uri) {
					return dimensions[dimension];
				}
			}
			return null;
		}
	},
	
	/**
	 * 
	 */
	selectSpecificDimensionsButton: function() {
		numberOfSelectedDimensionComponents = $("#dimension-elements-table .selected").length;
	
		
		dimensionComponentsValue = $("#dimension-elements-table .selected");
		$.each(dimensionComponentsValue, function() {
			name_temp = $(this).find(".dimension-label").text();
			property_temp = $(this).find(".dimension-property").text();
			
			var dimensionComponent = {
				label: name_temp,
				property: property_temp
			};
			
			org.aksw.cubeViz.GUI.Views.selectedDimensionComponents.push(dimensionComponent);
		});
		
		selectedDimensionComponents_length = org.aksw.cubeViz.GUI.Views.selectedDimensionComponents.length;
		while(selectedDimensionComponents_length--) {
			text = org.aksw.cubeViz.GUI.Views.selectedDimensionComponents[selectedDimensionComponents_length].label + ": " +
				   org.aksw.cubeViz.GUI.Views.selectedDimensionComponents[selectedDimensionComponents_length].property;
			newRow = $("#summary-dimensions-box .template").clone().text(text).removeClass("template");
			$("#summary-dimensions-box").append(newRow);
		}
		
		$("#specify-dimensions").hide("slow");
		
		/***********************
		 * Go to the next View *
		 ***********************/
		org.aksw.cubeViz.GUI.Views.showDimensionsChartOptions();
	},
	
	/*********************
	 *                   *
	 * View #7 - Summary *
	 *                   *
	 *********************/
	
	/**
	 * 
	 */
	showSummary: function() {
		// this.sparqlEndpoint - string
		// this.selectedGraph.{label,uri} - object
		// this.selectedDSD.{label,uri} - object
		// this.selectedDS.{label,uri} - object
		// this.selectedDimensionComponents.[0]{label,property} - array() of objects
		// this.selectedDimensions.[0]{label,uri,type,order} - array() of objects
		// this.selectedMeasures.[0]{label,uri,type,order} - array() of objects
		// console.log(this);
		// $("#summary").fadeIn();
	},
	
	/***********************
	 *                     *
	 * View #8 - Permalink *
	 *                     *
	 ***********************/
	 
	/**
	 * 
	 */
	showPermalink: function() {
		
		this.selectedMeasures = {"measures": this.selectedMeasures};
		this.selectedDimensions = {"dimensions": this.selectedDimensions};
		modelUri = "http://data.lod2.eu/scoreboard/";
		
		permalink = cubevizPath;
		permalink += "/?";
		permalink += "m="+modelUri;
		permalink += "&sparqlEndpoint="+$.toJSON(this.sparqlEndpoint);
		permalink += "&selectedGraph="+$.toJSON(this.selectedGraph);
		permalink += "&selectedDSD="+$.toJSON(this.selectedDSD);
		permalink += "&selectedDS="+$.toJSON(this.selectedDS);
		permalink += "&selectedMeasures="+$.toJSON(this.selectedMeasures);
		permalink += "&selectedDimensions="+$.toJSON(this.selectedDimensions);
		permalink += "&selectedDimensionComponents="+$.toJSON(this.selectedDimensionComponents);
		
		$("#permalink-input").val(permalink);
		
		$("#permalink-section").fadeIn();
	},
	
	/**************************************
	 *                                    *
	 * View #9 - Dimensions chart options *
	 *                                    *
	 **************************************/
	 
	showDimensionsChartOptions: function() {
		appendDimensionsToView(this.selectedDimensions);
		appendMeasuresToView(this.selectedMeasures);
		// initialize selectable interface
		initChartOptionsSelection();
		// initialize the view
		$("#chart-options-section").show();
		/*******************
		 * Inner functions *
		 *******************/
		
		function appendDimensionsToView(dimensions) {
			for(dimension in dimensions){			
				//get selected elements count for particular dimension
				selectedElementsCount = countSelectedDimensionElements(dimensions[dimension].label);
				
				var newRow = $("#dimension-chart-options-table .template").clone()
							.removeClass('template').addClass('chart-options-dimension');
				dimensionTemplate(newRow, dimensions[dimension], selectedElementsCount).appendTo('#dimension-chart-options-table').fadeIn();
			}
		}
		
		function dimensionTemplate(row, dimension, selectedElements) {
			row.find('.dimension-uri').text(dimension.uri);
			row.find('.dimension-label').text(dimension.label);
			row.find('.dimension-type').text(dimension.type);
			row.find('.dimension-order').text(dimension.order);
			row.find('.dimension-element-count').text(dimension.elementCount);
			row.find('.dimension-selected-element-count').text(selectedElementsCount);
			row.find('.dimension-order-direction').text("None");
			row.find('.dimension-chart-axis').text("x");
			return row;
		}
		
		function countSelectedDimensionElements(dimensionLabel) {
			selectedDimComps = org.aksw.cubeViz.GUI.Views.selectedDimensionComponents;
			count = 0;
			for(selectedDim in selectedDimComps) {
				if(selectedDimComps[selectedDim].label == dimensionLabel) {
					count++;
				}
			}			
			return count;
		}
		
		function appendMeasuresToView(measures) {
			for(measure in measures){
				var newRow = $("#measure-chart-options-table .template").clone()
							.removeClass('template').addClass('chart-options-measure');
				measureTemplate(newRow, measures[measure]).appendTo('#measure-chart-options-table').fadeIn();
			}
		}	
		
		function measureTemplate(row, measure) {
			row.find('.measure-uri').text(measure.uri);
			row.find('.measure-label').text(measure.label);
			row.find('.measure-type').text(measure.type);
			row.find('.measure-order').text(measure.order);
			row.find('.measure-order-direction').text("None");
			row.find('.measure-aggregation-method').text("sum");
			row.find('.measure-round-values').text("no");
			return row;
		}
		
		function initChartOptionsSelection() {
			$("#dimension-chart-options-table .dimension-order-direction").click(rotateOrder);
			$("#dimension-chart-options-table .dimension-chart-axis").click(rotateAxis);
			$("#measure-chart-options-table .measure-order-direction").click(rotateOrder);
			$("#measure-chart-options-table .measure-aggregation-method").click(rotateAggregationMethod);
			$("#measure-chart-options-table .measure-round-values").click(rotateRoundValues);
		}
		
		/*
		 * Here comes stupid solution. TODO: make the code cooler 8)
		 */
		
		function rotateOrder() {
			if($(this).text() === "None") {
				$(this).text("Ascending");
			} else if($(this).text() === "Ascending") {
				$(this).text("Descending");				
			} else if($(this).text() === "Descending") {
				$(this).text("None");		
			}
		}
		
		function rotateAxis() {
			if($(this).text() === "x") {
				$(this).text("y");
			} else if($(this).text() === "y") {
				$(this).text("z");				
			} else if($(this).text() === "z") {
				$(this).text("x");		
			}
		}
		
		function rotateAggregationMethod() {
			if($(this).text() === "sum") {
				$(this).text("average");	
			} else if($(this).text() === "average") {
				$(this).text("minimum");	
			} else if($(this).text() === "minimum") {
				$(this).text("maximum");	
			} else if($(this).text() === "maximum") {
				$(this).text("sum");	
			}
		}
		
		function rotateRoundValues() {
			if($(this).text() === "yes") {
				$(this).text("no");	
			} else if($(this).text() === "no") {
				$(this).text("yes");	
			} 
		}
		
		//org.aksw.cubeViz.GUI.Views.showPermalink();
	}, 
	
	specifyChartOptionsButton: function() {
		
		org.aksw.cubeViz.GUI.Views.selectedDimensions = [];
		dimensionsValue = $("#dimension-chart-options-table .chart-options-dimension");
		$.each(dimensionsValue, function() {
			
			uri_temp = $(this).find(".dimension-uri").text();
			label_temp = $(this).find(".dimension-label").text();
			type_temp = $(this).find(".dimension-type").text();
			order_temp = $(this).find(".dimension-order").text();
			element_count_temp = $(this).find(".dimension-element-count").text();
			selected_element_count_temp = $(this).find(".dimension-selected-element-count").text();
			order_direction_temp = $(this).find(".dimension-order-direction").text();
			chart_axis_temp = $(this).find(".dimension-chart-axis").text();
			
			var dimension = {
				uri: uri_temp,
				label: label_temp,
				type: type_temp,
				order: order_temp,
				elementCount: element_count_temp,
				selectedElementCount: selected_element_count_temp,
				orderDirection: order_direction_temp,
				chartAxis: chart_axis_temp
			};
			
			org.aksw.cubeViz.GUI.Views.selectedDimensions.push(dimension);
		});
		
		org.aksw.cubeViz.GUI.Views.selectedMeasures = [];
		measuresValue = $("#measure-chart-options-table .chart-options-measure");
		$.each(measuresValue, function() {
			
			uri_temp = $(this).find(".measure-uri").text();
			label_temp = $(this).find(".measure-label").text();
			type_temp = $(this).find(".measure-type").text();
			order_temp = $(this).find(".measure-order").text();
			order_direction_temp = $(this).find(".measure-order-direction").text();
			aggregation_method_temp = $(this).find(".measure-aggregation-method").text();
			round_values_temp = $(this).find(".measure-round-values").text();
			
			var measure = {
				uri: uri_temp,
				label: label_temp,
				type: type_temp,
				order: order_temp,
				orderDirection: order_direction_temp,
				aggregationMethod: aggregation_method_temp,
				roundValues: round_values_temp
			};
			
			org.aksw.cubeViz.GUI.Views.selectedMeasures.push(measure);
		});
		
		
		
		$("#chart-options-section").hide("slow");
		
		/***********************
		 * Go to the next View *
		 ***********************/
		org.aksw.cubeViz.GUI.Views.showPermalink();
	}
	
});
