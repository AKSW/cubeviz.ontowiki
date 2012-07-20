$(document).ready(function(){
	
	/************
	 * Includes *
	 ************/
	 
	Namespacedotjs.include('org.aksw.CubeViz.Controller.Main');
    var CubeViz_Controller_Main = org.aksw.CubeViz.Controller.Main;
    
    /******************
     * Event Handlers *
     ******************/
     
    $(body).bind("AjaxCubeVizParametersRetrieved.CubeViz", function(event, CubeViz_Link_Chosen) {
		
		//set parameters to global array
		CubeViz_Parameters_Component = CubeViz_Controller_Main.retrievedCubeVizParameters;
		//get observations for the retrieved parameters
		CubeViz_Controller_Main.getResultObservations(CubeViz_Link_Chosen);
	});
	
	$(body).bind("AjaxResultObservationsRetrieved.CubeViz", function(event) {
		//check if there is suitable charts
		var CubeViz_multipleDimensions = CubeViz_Controller_Main.getMultipleDimensions(CubeViz_Parameters_Component);
		var CubeViz_suitableCharts = CubeViz_Controller_Main.getSuitableChartTypes(CubeViz_multipleDimensions, CubeViz_ChartConfig);
		var CubeViz_sortedObservations = CubeViz_Controller_Main.sortObservations(CubeViz_Controller_Main.retrievedResultObservations, CubeViz_multipleDimensions);
				
		if(CubeViz_suitableCharts.charts.length == 0) {
			return;
		} else {
			//pick the first suitable chart type
			Namespacedotjs.include(CubeViz_suitableCharts.charts[0].class);
			eval('var chart = '+CubeViz_suitableCharts.charts[0].class+';');
			
			chart.init(CubeViz_sortedObservations, CubeViz_Parameters_Component, CubeViz_multipleDimensions);
			var renderedChart = chart.getRenderResult();
			CubeViz_Controller_Main.showChart(renderedChart);
		}	
	});
        
    //init controller
    CubeViz_Controller_Main.init(CubeViz_Parameters_Component);
    //get the parameters for the link
    CubeViz_Controller_Main.getParametersFromLink(CubeViz_Link_Chosen_Component);    
    
});
