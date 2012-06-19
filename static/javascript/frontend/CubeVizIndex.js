$(document).ready(function(){
    
    var bar = {};
    
    // Instanciate objects
    switch (chartType) {
        case "bar": 
            Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts.BarChart');
            
            chart = org.aksw.CubeViz.ChartTransformer.HighCharts.BarChart;
    
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
    
    try {
        // Generate HighChart configuration object for a chart
        var chartInput = chart.getChartInput ();
        
        console.log (chartInput);
        
        // Visualize it
        var chart = new Highcharts.Chart(chartInput);
        
    } catch ( e ) {
        console.log ( e );
        throw e;
    }
});
