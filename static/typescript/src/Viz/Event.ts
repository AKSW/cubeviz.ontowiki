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
                
        var currentNr:number = parseInt ( $(event["target"]).parent ().attr ( "nr" ) );
        var lastUsedNr:number = parseInt ( $("#chartSelection").attr ( "lastSelection" ) );
        
        // If nothing was set or you clicked on another item as before
        if ( null == lastUsedNr || currentNr != lastUsedNr ) {
            
            ChartSelector.itemClicked = currentNr;		
                        
            $(".chartSelector-item")
                .removeClass("current")
                .eq(currentNr)
                .addClass("current");
            
            /**
             * Render chart for given class name
             */
            Viz_Main.renderChart ( 
                $(this).attr ( "className" )
            );
            
            cubeVizUIChartConfig ["selectedChartClass"] = event ["target"]["name"];
        
            $("#chartSelection").attr ( "lastSelection", currentNr );
        
            $(".chartSelector-item").removeClass("current");
            
            // add class current to div container which surrounds clicked item
            $(event["target"]).parent().addClass("current");
            
            $("#chartSelectionMenu")
                .fadeOut ( 500 );
            
        // If you clicked the same item AGAIN
        } else {
            
            var offset = $(this).offset();
            var containerOffset = $("#container").offset ();
            var menuWidth = parseInt ( $("#chartSelectionMenu").css ("width") );
            var leftPosition = offset["left"] - containerOffset ["left"] - menuWidth + 30;
            var topPosition = offset["top"] - 40;

            // fill #chartSelectionMenu
            $("#chartSelectionMenu").html ( "fff" );
        
            $("#chartSelectionMenu")
                .css ( "left", leftPosition ).css ( "top", topPosition )
                .fadeIn ( 500 );
                
        }
    }
    
    /**
     * 
     */
    static onComplete_LoadResultObservations (entries) {
        
        CubeViz_Data ["retrievedObservations"] = entries;
        
        // get number of multiple dimensions
        CubeViz_Data ["numberOfMultipleDimensions"] = HighCharts_Chart.getNumberOfMultipleDimensions (
            entries, 
            CubeViz_Links_Module ["selectedComponents"]["dimensions"],
            CubeViz_Links_Module ["selectedComponents"]["measures"]
        ); 
        
        /**
         * Render chart with the given data
         */
        Viz_Main.renderChart ( 
            CubeViz_ChartConfig [CubeViz_Data ["numberOfMultipleDimensions"]]["charts"][0]["class"] 
        );
        
        /**
         * Setup click event for chartSelection item's
         */
        ChartSelector.init ( 
            CubeViz_ChartConfig [CubeViz_Data ["numberOfMultipleDimensions"]]["charts"],
            Viz_Event.onClick_ChartSelectionItem
        );
    }
}
