/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />
/// <reference path="..\DeclarationSourceFiles\Highcharts.d.ts" />

/**
 * Make variables accessible for TypeScript
 */
var CubeViz_Config = CubeViz_Config || {};
var CubeViz_Link_Chosen_Module = CubeViz_Link_Chosen_Module || {};
var CubeViz_Links_Module = CubeViz_Links_Module || {};
var CubeViz_Parameters_Component = CubeViz_Parameters_Component || {};
var CubeViz_Parameters_Module = CubeViz_Parameters_Module || {};

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
        Observation.loadAll ( 
            CubeViz_Links_Module.selectedDSD.url, 
            CubeViz_Links_Module.selectedDS.url, 
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
