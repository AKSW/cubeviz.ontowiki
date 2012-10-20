/// <reference path="..\DeclarationSourceFiles\JSON.d.ts" />
/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />
/// <reference path="..\DeclarationSourceFiles\Highcharts.d.ts" />

/**
 * Make variables accessible for TypeScript
 */
var CubeViz_Config = CubeViz_Config || {};
var CubeViz_Links_Module = CubeViz_Links_Module || {};
var cubeVizUIChartConfig = cubeVizUIChartConfig || {};

// ChartConfig.js > Array which contains chart configurations for each dimensional-case
var CubeViz_ChartConfig = CubeViz_ChartConfig || {};

// var chartSelector = chartSelector || {};

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
        
        System.out ( "CubeViz_Config" );
        System.out ( CubeViz_Config );
        
        // set label of data selection button
        $("#sidebar-left-data-selection-submitbtn").attr ( 
            "value", "Update visualization"
        );
        
        // Dynamiclly set container height (highcharts)
        var container = $("#container").offset();
        var viewPort = $(window).height();
        var containerHeight = 0; 
        
        $("#container").css ( "height", $(window).height() - container ["top"] - 5 );
        
        /**
         * Setup click event for chartSelection item's
         */
        Viz_Event.setupChartSelector ();
        
        /**
         * Load observations based on pre-configured data structure definition and data set.
         */
        Observation.loadAll ( 
            CubeViz_Links_Module ["linkCode"],
            Viz_Event.onComplete_LoadResultObservations
        );
    }
    
    /**
     * After click on an item in chartSelection, reload the chart
     */
    static onClick_ChartSelectionItem (event:any) {
        
        cubeVizUIChartConfig ["selectedChartClass"] = event ["target"]["name"];
        
        $(".chartSelector-item").removeClass("current");
        
        $(event["target"]).parent().addClass("current");
        
        /**
         * Load observations based on pre-configured data structure definition and data set.
         */
        Observation.loadAll ( 
            CubeViz_Links_Module ["linkCode"],
            Viz_Event.onComplete_LoadResultObservations
        );
    }
    
    /**
     * 
     */
    static onComplete_LoadResultObservations (entries) {
                
        // var chart = HighCharts.loadChart ( "Bar" );
            
        // init chart instance
        /*chart.init ( 
            entries, 
            CubeViz_Links_Module, 
            CubeViz_ChartConfig ["2"][0]["types"][0].config 
        );
        
        var renderedChart = chart.getRenderResult();
        
        new Highcharts.Chart(renderedChart);*/
    }
    
    /**
     * Setup click event for chartSelection item's
     */
    static setupChartSelector () {
        
        // chartSelection = new ChartSelector ();
        // console.log ( CubeViz_ChartConfig ["2"][0]["charts"][0] );
        
        Viz_Main.updateChartSelection (
            [
                CubeViz_ChartConfig ["2"][0]["charts"][0],
                CubeViz_ChartConfig ["2"][0]["charts"][0]
            ]
        );
        
        $('.chartSelectionItem').click ( Viz_Event.onClick_ChartSelectionItem );
    }
}
