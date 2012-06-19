$(document).ready(function(){
	
	//console.log(CubeViz_Parameters);
    // AJAX call to get observations
    
    // dummy data retrieval
    
    // initialize the chart.js
    
    
    // Include neccessary namespaces
    Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts.BarChart');	
    
    // Instanciate objects
    var barChart = org.aksw.CubeViz.ChartTransformer.HighCharts.BarChart;
    var barChartInput = barChart.getChartInput ();
    
    var chart = new Highcharts.Chart(barChartInput);
});
