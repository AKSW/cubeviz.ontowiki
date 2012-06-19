$(document).ready(function(){
	    
    // Include neccessary namespaces
    Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts.BarChart');	
    
    // Instanciate objects
    var barChart = org.aksw.CubeViz.ChartTransformer.HighCharts.BarChart;
    
    barChart.init (
    
        // the sparql result
        exampleData,
        
        // render chart to
        "container",
    
        // dimension assignment
        ["country", "indicator", "year"], 
        
        // measure assignment
        ["measure"], 
        
        // x axis assignment
        "measure",
        
        // y axis assignment
        "multipleDimension"
    );
    
    try {
        // Generate HighChart configuration object for a BarChart
        var barChartInput = barChart.getChartInput ();
        
        console.log (barChartInput);
        
        // Visualize it
        var chart = new Highcharts.Chart(barChartInput);
        
    } catch ( e ) {
        console.log ( e );
        throw e;
    }
});
