/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class Viz_Main {
    static renderChart (className:string) : void {
        
        // get chart name
        var charts = CubeViz_ChartConfig [CubeViz_Data ["numberOfMultipleDimensions"]]["charts"];
        
        // get class
        var fromChartConfig = HighCharts_Chart.getFromChartConfigByClass (
            className, charts
        );
        
        var chart = HighCharts.loadChart ( className );
                    
        // init chart instance
        chart.init ( 
            CubeViz_Data ["retrievedObservations"], 
            CubeViz_Links_Module ["selectedComponents"]["dimensions"], 
            CubeViz_Links_Module ["selectedComponents"]["measures"], 
            fromChartConfig ["defaultConfig"]
        );
        
        // show chart
        new Highcharts.Chart(chart.getRenderResult());
    }
}
