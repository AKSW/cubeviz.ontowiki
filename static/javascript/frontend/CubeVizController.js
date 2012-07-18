$(document).ready(function(){
	Namespacedotjs.include('org.aksw.CubeViz.Controller.Main');
    var CubeViz_Controller_Main = org.aksw.CubeViz.Controller.Main;
        
    CubeViz_Controller_Main.init(CubeViz_Parameters_Component);
    CubeViz_Controller_Main.getResultObservations(CubeViz_Link_Chosen_Component);
    var multipleDimensions = CubeViz_Controller_Main.getMultipleDimensions(CubeViz_Parameters_Component);
    var suitableCharts = CubeViz_Controller_Main.getSuitableChartTypes(multipleDimensions, CubeViz_ChartConfig);
    // TODO check if it is enabled
    // pick the first one
    
    $(body).bind("AjaxResultObservationsRetrieved.CubeViz", function(event) {
		
		//pick the first suitable chart type
		Namespacedotjs.include(suitableCharts.charts[0].class);
		eval('var chart = '+suitableCharts.charts[0].class+';');
		
		chart.init(CubeViz_Controller_Main.retrievedResultObservations, CubeViz_Parameters_Component);
		var renderedChart = chart.getRenderResult();
		CubeViz_Controller_Main.renderChart(renderedChart);
	});
});
