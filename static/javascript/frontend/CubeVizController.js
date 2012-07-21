$(document).ready(function(){
	Namespacedotjs.include('org.aksw.CubeViz.Controller.Main');
    var CubeViz_Controller_Main = org.aksw.CubeViz.Controller.Main;
    
    /****************************************************************
     * On simple load - redirect from the other page or page reload *
     ****************************************************************/
        
    CubeViz_Controller_Main.init(CubeViz_Parameters_Component);
    CubeViz_Controller_Main.getResultObservations(CubeViz_Link_Chosen_Component);
    var multipleDimensions = CubeViz_Controller_Main.getMultipleDimensions(CubeViz_Parameters_Component);
    var suitableCharts = CubeViz_Controller_Main.getSuitableChartTypes(multipleDimensions, CubeViz_ChartConfig);
    // TODO check if it is enabled
    // pick the first one
    
    /*********************************
     * On "Select Data" button click *
     *********************************/
    
    $(body).bind("AjaxResultObservationsRetrieved.CubeViz", function(event) {
		
        if ( 0 < suitableCharts.charts.length) {
            
            //pick the first suitable chart type
            Namespacedotjs.include(suitableCharts.charts[0].class);
            eval('var chart = '+suitableCharts.charts[0].class+';');
            
            var CubeViz_multipleDimensions = CubeViz_Controller_Main.getMultipleDimensions(CubeViz_Parameters_Component);
            
            // init chart instance
            chart.init (
                CubeViz_Controller_Main.retrievedResultObservations, 
                CubeViz_Parameters_Component,
                CubeViz_multipleDimensions
            );
        
            var renderedChart = chart.getRenderResult();
            
            CubeViz_Controller_Main.renderChart(renderedChart);
        }
	});
});
