/// <reference path="..\DeclarationSourceFiles\CryptoJs.d.ts" />
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
    "numberOfMultipleDimensions" : 0,
    "retrievedObservations" : [],
    "_highchart_switchAxes": false // TODO create a simple solution for intern chart configuration 
                                         // (use for instance cubeVizUIChartConfig )
};

// Templates
var ChartSelector_Array = ChartSelector_Array || {};
var templateVisualization_CubeViz_Table = templateVisualization_CubeViz_Table || {};

/**
 * Event section
 */
$(document).ready(function(){
    Viz_Main.showLoadingNotification ();
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
     * After clicking menu button, update showing chart with new configuration options.
     */
    static onClick_chartSelectionMenuButton (event:any) {
        
        // collect and save necessary information
        var newDefaultConfig = cubeVizUIChartConfig ["selectedChartConfig"]["defaultConfig"],
            key = "",
            menuItems:Object[] = $.makeArray ( $('*[name*="chartMenuItem"]') ),
            length:number = menuItems ["length"],
            value = "";

        // Go through the given menu items and set the values by given key (specific or intern)
        Viz_Main.setMenuOptions (menuItems, newDefaultConfig);
    
        Visualization_Controller.setChartConfigClassEntry (
            cubeVizUIChartConfig ["selectedChartConfig"]["class"],
            CubeViz_ChartConfig [CubeViz_Data ["numberOfMultipleDimensions"]]["charts"],
            cubeVizUIChartConfig ["selectedChartConfig"]
        );
    
        // Re-render the chart with new configuration
        Viz_Main.renderChart ( cubeVizUIChartConfig ["selectedChartConfig"]["class"] );
    }
    
    /**
     * After click on an item in chartSelection, reload the chart or show menu
     */
    static onClick_ChartSelectionItem (event:any) {
                
        var currentNr:number = parseInt ( $(event["target"]).parent ().attr ( "nr" ) ),
            lastUsedNr:number = parseInt ( $("#chartSelection").attr ( "lastSelection" ) ),
            lastSelectionAndClicked:number = parseInt ( 
                $("#chartSelection").attr("lastSelectionAndClicked") 
            );
            
        if ( undefined == $(event["target"]).parent ().attr("className") ) {
            return;
        }
        
        // If nothing was set or you clicked on another item as before
        if ( null == lastUsedNr || currentNr != lastUsedNr ) {
                        
            $(".chartSelector-item")
                .removeClass("current")
                .eq(currentNr)
                .addClass("current");
            
            cubeVizUIChartConfig ["selectedChartClass"] = event ["target"]["name"];;
        
            $("#chartSelection").attr ( "lastSelection", currentNr );
        
            $(".chartSelector-item").removeClass("chartSelector-item-current");
            
            // add class current to div container which surrounds clicked item
            $(event["target"]).parent().addClass("chartSelector-item-current");
            
            /**
             * Render chart for given class name
             */
            Viz_Main.renderChart ( 
                $(this).attr ( "className" )
            );
            
            /**
             * Close chart selection menu, if it is still open
             */
            Viz_Main.closeChartSelectionMenu ();
            
            Viz_Main.hideMenuDongle ();
            
            /**
             * If there menu entries available, show a dongle under the current selected item!
             */
            var fromChartConfig = Visualization_Controller.getFromChartConfigByClass (
                $(event["target"]).parent ().attr("className"),
                CubeViz_ChartConfig [CubeViz_Data["numberOfMultipleDimensions"]]["charts"]
            );             
            
            if ( undefined != fromChartConfig["options"] && 
                 0 < fromChartConfig["options"]["length"] ) {
                                
                Viz_Main.showMenuDongle (
                    $(this).offset() 
                );
            }
            
        // If you clicked the same item AGAIN > show the menu (but only once)
        } else {
            
            // check if clicked item was clicked before
            if (lastUsedNr == lastSelectionAndClicked) {
                // close the opened menu from before
                Viz_Main.closeChartSelectionMenu ();
                
                // reset control variables
                $("#chartSelection").attr("lastSelectionAndClicked", -1);
            } 
            
            // if not, show menu
            else {
                
                Viz_Main.hideMenuDongle ();
                
                $("#chartSelection").attr ( "lastSelectionAndClicked", currentNr );
            
                var className = $(event["target"]).parent ().attr ( "className" );

                // get class
                var fromChartConfig = Visualization_Controller.getFromChartConfigByClass (
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
    }
    
    /**
     * 
     */
    static onComplete_LoadResultObservations (entries:Object[]) : void {
        
        CubeViz_Data ["retrievedObservations"] = entries;
        
        // get number of multiple dimensions
        CubeViz_Data ["numberOfMultipleDimensions"] = Visualization_Controller.getNumberOfMultipleDimensions (
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
