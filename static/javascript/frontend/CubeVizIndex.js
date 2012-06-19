$(document).ready(function(){
	    
    // Include neccessary namespaces
    Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts.BarChart');	
    
    // Instanciate objects
    var barChart = org.aksw.CubeViz.ChartTransformer.HighCharts.BarChart;
    
    barChart.init (
    
        // dimension assignment
        ["country", "indicator", "year"], 
        
        // measure assignment
        ["measure"], 
        
        // datafilter
        {},
        
        // visualization filter
        {}
    );
    
    try {
        // Generate HighChart configuration object for a BarChart
        var barChartInput = barChart.getChartInput (exampleData);
        
        // Visualize it
        var chart = new Highcharts.Chart(barChartInput);
        
    } catch ( e ) {
        alert ( e.message );
    }
});
