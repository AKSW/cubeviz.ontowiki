/// <reference path="..\DeclarationSourceFiles\JSON.d.ts" />
/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />
/// <reference path="..\DeclarationSourceFiles\Highcharts.d.ts" />

/**
 * Make variables accessible for TypeScript
 */
var CubeViz_Config = CubeViz_Config || {};
var CubeViz_Links_Module = CubeViz_Links_Module || {};
var cubeVizUIChartConfig = cubeVizUIChartConfig || {};

var CubeViz_ChartConfig = CubeViz_ChartConfig || {};

/**
 * Event section
 */
$(document).ready(function(){
    Viz_Event.ready ();
});

class Viz_Event {
    /**
     * After document is ready
     */
    static ready () {
        
        // set label of data selection button
        $("#sidebar-left-data-selection-submitbtn").attr ( 
            "value", "Update visualization"
        );
        
        console.log ( JSON.stringify ( CubeViz_Links_Module ) );
        console.log ( JSON.stringify ( CubeViz_Links_Module ) );
        
        /**
         * Load observations based on pre-configured data structure definition and data set.
         */
        Observation.loadAll ( 
            CubeViz_Links_Module ["modelUrl"],
            CubeViz_Links_Module ["linkCode"],
            "local", // = sparqlEndpoint
            Viz_Event.onComplete_LoadResultObservations
        );
    }
    
    /**
     * 
     */
    static onComplete_LoadResultObservations (entries) {
        
        var chart = HighCharts.loadChart ( "Bar2" );
            
        // init chart instance
        chart.init ( 
            entries, 
            CubeViz_Links_Module, 
            CubeViz_ChartConfig ["2"][0]["types"][0].config 
        );
        
        var renderedChart = chart.getRenderResult();
        
        new Highcharts.Chart(renderedChart);
    }
}
