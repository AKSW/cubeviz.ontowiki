$(document).ready(function(){
    
    Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts');
    
    var highCharts = org.aksw.CubeViz.ChartTransformer.HighCharts;
    
    // Get all graph names which are suitable for the given data
    var suitableGraphs = highCharts.getSuitableGraphs (rawData, dimensions, measures);
    
    if (0 == suitableGraphs.length) {
    
        console.log ("No suitable Graph found!");
    
    } else {
        
        var chart = null,
            chartName = null;
        
        if (1 < suitableGraphs.length && 0 < CubeViz_Parameters_Index.chartType.length) {
            chartName = CubeViz_Parameters_Index.chartType.charAt(0).toUpperCase() 
                        + CubeViz_Parameters_Index.chartType.slice(1) + "Chart";
        } else {
            chartName = suitableGraphs [0].charAt(0).toUpperCase() + suitableGraphs [0].slice(1) + "Chart";
        }
    
        // Instantiate the given graph
        switch (chartName) {
            case "BarChart": 
                Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts.' + chartName);
                
                chart = org.aksw.CubeViz.ChartTransformer.HighCharts[chartName];
        
                chart.init (
                
                    // the sparql result
                    rawData,
                    
                    // render chart to
                    "container",
                
                    // dimension assignment
                    dimensions, 
                    
                    // measure assignment
                    measures, 
                    
                    // x axis assignment
                    "measure",
                    
                    // y axis assignment
                    "multipleDimension",
                    
                    // caption entry separator
                    ", "
                );
                
                break;
                
            case "PieChart": 
                Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts.' + chartName);
                
                chart = org.aksw.CubeViz.ChartTransformer.HighCharts [chartName];
        
                chart.init (
                
                    // the sparql result
                    rawData,
                    
                    // render chart to
                    "container",
                
                    // dimension assignment
                    dimensions, 
                    
                    // measure assignment
                    measures, 
                    
                    // caption entry separator
                    ", "
                );
                
                break;
                
            default: break;
        }
        
        console.log ( chartName );
        
        
        // Generate HighChart configuration object for a chart
        var chartInput = chart.getChartInput ();
            
        // Visualize it
        new Highcharts.Chart(chartInput);
    
    } 
    
    if (0 < suitableGraphs.length) {
    
        /**
         * Rebuild right chart selection field
         */ 
        $("#chart-selection").html ("");
    
        for ( var suitableGraph in suitableGraphs ) {
            suitableGraph = suitableGraphs [suitableGraph];
            
            $("#chart-selection").append (
                '<a href="?chartType=' + suitableGraph + '">' + 
                    '<img src="' + CubeViz_Parameters_Index.cubevizImagesPath + suitableGraph + '.png">' + 
                '</a>'
            );
        }
    }
});
