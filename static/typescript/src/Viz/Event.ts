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

var CubeViz_Data = CubeViz_Data || {
    "retrievedObservations" : [],
    "numberOfMultipleDimensions" : 0
};

// Templates
var ChartSelector_Array = ChartSelector_Array || {};

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
     * After clicking menu button, update showing chart with new configuration options.
     */
    static onClick_chartSelectionMenuButton (event:any) {
        
        var newDefaultConfig = cubeVizUIChartConfig ["selectedChartConfig"]["defaultConfig"],
            key = "",
            menuItems:Object[] = $.makeArray ( $('*[name*="chartMenuItem"]') ),
            length:number = menuItems ["length"],
            value = "";

        // start from the second item, because the first one is the template entry
        for ( var i=1; i < length; ++i ) {
            key = $(menuItems [i]).attr ( "key" );
            value = $(menuItems [i]).attr ( "value" );
            System.setObjectProperty ( 
                newDefaultConfig, key, ".", value 
            );
        }
        
        cubeVizUIChartConfig ["selectedChartConfig"]["defaultConfig"] = newDefaultConfig;
        
        HighCharts_Chart.setChartConfigClassEntry (
            cubeVizUIChartConfig ["selectedChartConfig"]["class"],
            CubeViz_ChartConfig [CubeViz_Data ["numberOfMultipleDimensions"]]["charts"],
            cubeVizUIChartConfig ["selectedChartConfig"]
        );
        
        Viz_Main.renderChart ( cubeVizUIChartConfig ["selectedChartConfig"]["class"] );
    }
    
    /**
     * After click on an item in chartSelection, reload the chart or show menu
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
            
            // cubeVizUIChartConfig ["selectedChartClass"] = $(this).attr ( "className" );
            cubeVizUIChartConfig ["selectedChartClass"] = event ["target"]["name"];;
        
            $("#chartSelection").attr ( "lastSelection", currentNr );
        
            $(".chartSelector-item").removeClass("current");
            
            // add class current to div container which surrounds clicked item
            $(event["target"]).parent().addClass("current");
            
            
            Viz_Main.closeChartSelectionMenu ();
            
        // If you clicked the same item AGAIN > show the menu
        } else {
            
            // TODO avoid reexecute this stuff again and again
            
            var className = $(event["target"]).parent ().attr ( "className" );

            // get class
            var fromChartConfig = HighCharts_Chart.getFromChartConfigByClass (
                className,
                CubeViz_ChartConfig [CubeViz_Data ["numberOfMultipleDimensions"]]["charts"]
            );    
            
            cubeVizUIChartConfig ["oldSelectedChartConfig"] = System.deepCopy (fromChartConfig);
            cubeVizUIChartConfig ["selectedChartConfig"] = fromChartConfig;
            
            
            Viz_Main.openChartSelectionMenu ( 
                fromChartConfig ["options"], 
                $(this).offset() 
            );
        }
    }
    
    /**
     * 
     */
    static onComplete_LoadResultObservations (entries:Object[]) : void {
        
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
