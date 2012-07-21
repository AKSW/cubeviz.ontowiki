$(document).ready(function(){
	
	/************
	 * Includes *
	 ************/
	 
	Namespacedotjs.include('org.aksw.CubeViz.Controller.Main');
    var CubeViz_Controller_Main = org.aksw.CubeViz.Controller.Main;
	 
	Namespacedotjs.include('org.aksw.CubeViz.UserInterface.IndexAction');
    var CubeViz_UserInterface_IndexAction = org.aksw.CubeViz.UserInterface.IndexAction;
    
    /******************
     * Event Handlers *
     ******************/
     
    $(body).bind("AjaxCubeVizParametersRetrieved.CubeViz", function(event, CubeViz_Link_Chosen) {
		// set parameters to global array
		var retrievedParameters = CubeViz_Controller_Main.retrievedCubeVizParameters;
        
        CubeViz_Parameters_Component.sparqlEndpoint = retrievedParameters.sparqlEndpoint;
        CubeViz_Parameters_Component.selectedGraph = retrievedParameters.selectedGraph;
        CubeViz_Parameters_Component.selectedDSD = retrievedParameters.selectedDSD;
        CubeViz_Parameters_Component.selectedDS = retrievedParameters.selectedDS;
        CubeViz_Parameters_Component.selectedMeasures = retrievedParameters.selectedMeasures;
        CubeViz_Parameters_Component.selectedDimensions = retrievedParameters.selectedDimensions;
        CubeViz_Parameters_Component.selectedDimensionComponents = retrievedParameters.selectedDimensionComponents;
        
		//get observations for the retrieved parameters
		CubeViz_Controller_Main.getResultObservations(CubeViz_Link_Chosen);
	});
	
	$(body).bind("AjaxResultObservationsRetrieved.CubeViz", function(event) {
		
		//check if there is suitable charts
		var CubeViz_multipleDimensions = CubeViz_Controller_Main.getMultipleDimensions(CubeViz_Parameters_Component);
		var CubeViz_suitableCharts = CubeViz_Controller_Main.getSuitableChartTypes(CubeViz_multipleDimensions, CubeViz_ChartConfig);
        
        // UI: update chart selection field
        CubeViz_UserInterface_IndexAction.updateChartSelection ( CubeViz_suitableCharts );
        
		var retrievedResultObservations = [];
				
        // Transform JSON object (with observations) into an array
        // Neccessary, because we need to sort this later depends on the xAxis value
        $.each ( CubeViz_Controller_Main.retrievedResultObservations, function (i, ele) {
            retrievedResultObservations.push ( ele );
        });
                
		if(CubeViz_suitableCharts.charts.length == 0) {
			return;
		} else {
			
            //pick the first suitable chart type if no chart was selected
            var useChartClass = CubeViz_Controller_Main.selectedChartClass || 
                CubeViz_suitableCharts.charts[0].class;
			
            Namespacedotjs.include(useChartClass);
            
			eval('var chart = ' + useChartClass + ';');
            
			// init chart instance
            chart.init (
                retrievedResultObservations, 
                CubeViz_Parameters_Component,
                CubeViz_multipleDimensions
            );
			
			var renderedChart = chart.getRenderResult();
			CubeViz_Controller_Main.renderChart(renderedChart);
		}	
	});
	
    /**
     * After chart selection was completely built up
     */
	$(body).bind("UserInterface.IndexAction.ChartSelectionComplete", function(event) {
		CubeViz_UserInterface_IndexAction.setupChartSelectionEvent ();
	});
        
    //init controller
    CubeViz_Controller_Main.init(CubeViz_Parameters_Component);
    //get the parameters for the link
    CubeViz_Controller_Main.getParametersFromLink(CubeViz_Link_Chosen_Component);    
});
