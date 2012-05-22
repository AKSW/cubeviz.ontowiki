$(function() {
	/************************************************
	 * Include org.aksw.cubeViz.GUI.Views namespace *
	 ************************************************/
	 
	Namespace.include('org.aksw.cubeViz.GUI.Views');	
	
	/******************************
	 * Bind events to the buttons *
	 ******************************/
	
	// SparqlEndpoint selection button
	$("#select-sparql-endpoint-button").click(org.aksw.cubeViz.GUI.Views.selectSparqlEndpointButton);
	
	// Graph selection button
	$("#select-graph-button").click(org.aksw.cubeViz.GUI.Views.selectGraphButton);
	
	// DataStructure Selection button
	$("#select-datastructure-button").click(org.aksw.cubeViz.GUI.Views.selectDataStructureButton);
	
	// DataSet selection button
	$("#select-dataset-button").click(org.aksw.cubeViz.GUI.Views.selectDataSetButton);
	
	// Measure and Dimension selection button
	$("#select-dimension-measure-button").click(org.aksw.cubeViz.GUI.Views.selectDimensionsAndMeasuresButton);
	
	//specify dimension button
	$("#specify-dimension-button").click(org.aksw.cubeViz.GUI.Views.selectSpecificDimensionsButton);	
	
	//chart options button
	$("#specify-chart-options-button").click(org.aksw.cubeViz.GUI.Views.specifyChartOptionsButton);
	
	/*************************************
	 * Starting point of the application *
	 *************************************/
	
	// if backend is virtuoso - proceed to the graph view
	$("#summary").show("slow");
	if(backend == "virtuoso") {
		$("#summary-sparql-endpoint").text(backend);
		org.aksw.cubeViz.GUI.Views.sparqlEndpoint = backend;
		org.aksw.cubeViz.GUI.Views.getGraphNamesFor("virtuoso", cubevizPath);
	} else {
		$("#sparql-endpoint-view").show("slow");
	}
	
});
