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

var CubeViz_Data = {
  "retrievedObservations" : [],
  "numberOfMultipleDimensions" : 0  
};

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
        $("#showUpdateVisualizationButton").attr ( 
            "value", "Update visualization"
        );
        
        
        // Dynamiclly set container height (highcharts)
        var container = $("#container").offset();
        var viewPort = $(window).height();
        var containerHeight = 0; 
        
        $("#container").css ( "height", $(window).height() - container ["top"] - 5 );
        
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
                
        var currentNr = $(event["target"]).parent ().attr ( "nr" );
        var lastUsedNr = $("#chartSelection").attr ( "lastSelection" );
        
        // If nothing was set or you clicked on another item as before
        if ( null == lastUsedNr || currentNr != lastUsedNr ) {
            
            $("#chartSelectionMenu").animate ( { "height": 0 }, 400 );
            
            // focus clicked item => neccessary?
            ChartSelector.focusItem( currentNr );
            
            // get chart name
            var chartName        = $(this).parent ().attr ( "className" ),
                numberOfMultDims = CubeViz_Data ["numberOfMultipleDimensions"],
                charts           = CubeViz_ChartConfig [numberOfMultDims]["charts"];
            
            // get class
            var fromChartConfig = HighCharts_Chart.getFromChartConfigByClass (
                chartName, charts
            );
            
            var chart = HighCharts.loadChart ( chartName );
                
            // init chart instance
            chart.init ( 
                CubeViz_Data ["retrievedObservations"], 
                CubeViz_Links_Module ["selectedComponents"]["dimensions"], 
                CubeViz_Links_Module ["selectedComponents"]["measures"], 
                fromChartConfig ["defaultConfig"]
            );
            
            // show chart
            new Highcharts.Chart(chart.getRenderResult());
            
            cubeVizUIChartConfig ["selectedChartClass"] = event ["target"]["name"];
        
            $(".chartSelector-item").removeClass("current");
            
            // add class current to div container which surrounds clicked item
            $(event["target"]).parent().addClass("current");
            
            $("#chartSelection").attr ( "lastSelection", currentNr );
            
        // If you clicked the same item AGAIN
        } else {
            var container = $("#container").offset();
        
            // fill #chartSelectionMenu
            $("#chartSelectionMenu").html ( "fff" );
        
            $("#chartSelectionMenu")
                .css ( "top", container ["top"] - 40 )
                .css ( "left", event.pageX - container ["left"] - 195 )
                .show ()
                .animate ( { "height": 30 }, 400 );
                
        }
    }
    
    /**
     * 
     */
    static onComplete_LoadResultObservations (entries) {
        
        CubeViz_Data ["retrievedObservations"] = entries;
        
        // get number of multiple dimensions
        var numberOfMultipleDimensions = HighCharts_Chart.getNumberOfMultipleDimensions (
            entries, 
            CubeViz_Links_Module ["selectedComponents"]["dimensions"],
            CubeViz_Links_Module ["selectedComponents"]["measures"]
        ); 
        
        CubeViz_Data ["numberOfMultipleDimensions"] = numberOfMultipleDimensions;
        
        // select first chart as default, based on multiple dimensions
        var defaultChart = CubeViz_ChartConfig [numberOfMultipleDimensions]["charts"][0];
                
        // instantiate default chart
        var chart = HighCharts.loadChart ( defaultChart ["class"] );
            
        // init chart instance
        chart.init ( 
            entries, 
            CubeViz_Links_Module ["selectedComponents"]["dimensions"], 
            CubeViz_Links_Module ["selectedComponents"]["measures"], 
            defaultChart ["defaultConfig"]
        );
        
        // get render result
        var renderedChart = chart.getRenderResult();
        
        // show chart
        new Highcharts.Chart(renderedChart);
        
        /**
         * Setup click event for chartSelection item's
         */
        Viz_Event.setupChartSelector (numberOfMultipleDimensions);
    }
    
    /**
     * Setup click event for chartSelection item's
     */
    static setupChartSelector (numberOfMultipleDimensions:number) : void {
        
        // setup chart selection with given ChartConfig
        Viz_Main.updateChartSelection (
            CubeViz_ChartConfig [numberOfMultipleDimensions]["charts"]
        );
        
        $('.chartSelectionItem').click ( Viz_Event.onClick_ChartSelectionItem );
    }
}
