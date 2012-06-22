$(document).ready(function(){
    
    Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts');
    
    var highCharts = org.aksw.CubeViz.ChartTransformer.HighCharts;
    
    // Get all graph names which are suitable for the given data
    var suitableGraphs = highCharts.getSuitableGraphs (exampleData, ["country", "indicator", "year"], ["measure"]);
    
    if (0 == suitableGraphs.length) {
    
        console.log ("No suitable Graph found!");
    
    } else if (1 == suitableGraphs.length) {
    
        // Instantiate the given graph
        switch (suitableGraphs [0]) {
            case "BarChart": 
                Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts.' + suitableGraphs [0]);
                
                chart = org.aksw.CubeViz.ChartTransformer.HighCharts[suitableGraphs [0]];
        
                chart.init (
                
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
                    "multipleDimension",
                    
                    // caption entry separator
                    ", "
                );
                
                break;
                
            case "pie": 
                Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts.PieChart');
                
                chart = org.aksw.CubeViz.ChartTransformer.HighCharts.PieChart;
        
                chart.init (
                
                    // the sparql result
                    exampleData,
                    
                    // render chart to
                    "container",
                
                    // dimension assignment
                    ["country", "indicator", "year"], 
                    
                    // measure assignment
                    ["measure"], 
                    
                    // caption entry separator
                    ", "
                );
                
                break;
                
            default: break;
        }
    }
    
    // Instanciate objects    
    try {
        // Generate HighChart configuration object for a chart
        var chartInput = chart.getChartInput ();
        
        console.log (chartInput);
        
        // Visualize it
        var chart = new Highcharts.Chart(chartInput);
        
    } catch ( e ) {
        console.error ( e );
    }
});
