/**
 * Declaration Source Files
 */ 
/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />
/// <reference path="..\DeclarationSourceFiles\Viz_Event.d.ts" />
/// <reference path="..\DeclarationSourceFiles\Viz_Main.d.ts" />


/**
 * Make variables accessible for TypeScript
 */
var CubeViz_Config = CubeViz_Config || {};
var CubeViz_Links_Module = CubeViz_Links_Module || {};
var cubeVizUIChartConfig = cubeVizUIChartConfig || {};

// templates
var CubeViz_Dialog_Template = CubeViz_Dialog_Template || {};
var CubeViz_Dimension_Template = CubeViz_Dimension_Template || {};

// contains a list of still to check events
var tmpCubeVizLeftSidebarLeftQueue = [
    "onComplete_LoadDataStructureDefinitions",
    "onComplete_LoadDataSets",
    "onComplete_LoadAllComponentDimensions"
];

var CubeViz_Data = CubeViz_Data || {
    "retrievedObservations" : [],
    "numberOfMultipleDimensions" : 0  
};

var Viz_Main = Viz_Main || undefined;
var Viz_Event = Viz_Event || undefined;

/**
 * Event section
 */
$(document).ready(function(){
    Module_Event.ready ();
});

class Module_Event {
    /**
     * After document is ready
     */
    static ready () {
        
        System.out ( "CubeViz_Links_Module:" );
        System.out ( CubeViz_Links_Module );
        
        System.setupAjax ();
        
        /**
         * Setup User Interface
         */
         
        /**
         * Show loader to avoid that a fidgety user to click on incomplete stuff :)
         */
        Module_Main.showSidebarLoader ();
         
        /**
         * Selectbox with data set
         */
        $("#sidebar-left-data-selection-sets").change ( Module_Event.onChange_DataSetBox );
         
        /**
         * Selectbox with data structure definitions
         * Set event for onChange
         */
        DataStructureDefinition.loadAll (Module_Event.onComplete_LoadDataStructureDefinitions);
        $("#sidebar-left-data-selection-strc").change ( Module_Event.onChange_DataStructureDefinitionBox );
         
        /**
         * Button to show visualization
         */
        $("#showUpdateVisualizationButton").click (Module_Event.onClick_ShowVisualizationButton);
         
        /**
         * Button to show perma link menu
         */
        $("#permaLinkButton" ).click (Module_Event.onClick_PermaLinkButton);
    }
    
    /**
     * EVENTS
     */
     
    /**
     * Opens a dialog, filled with elements of the selected dimension
     */
    static onClick_DialogSelector () {
        
        if ( "undefined" != System.toType ( Viz_Main ) ) {
            Viz_Main.closeChartSelectionMenu ();
        }
                
        // get dimension from clicked dialog selector
        var label:string       = $(this).attr("label").toString (),
            hashedUrl:string   = $(this).attr("hashedUrl").toString (),
            typeUrl:string     = $(this).attr("typeUrl").toString (),
            url:string         = $(this).attr("url").toString ();
        
        // 
        Module_Main.buildDimensionDialog (        
            hashedUrl, // label of current dimension
            label, // hashed url of current dimension
            typeUrl, // type url of current dimension            
            url, // url of current dimension
            
            // component->dimension->elements to build a list with checkboxes to select / unselect
            CubeViz_Links_Module ["components"]["dimensions"][hashedUrl]["elements"] 
        );
        
        // if rendering is complete, fade in the dialog
        $("#dimensionDialogContainer").fadeIn (1000);
        
        /**
         * Setup dialog selector close button
         */
        $("#dialog-btn-close-" + hashedUrl).click (Module_Event.onClick_DialogSelectorCloseButton);
    }
     
    /**
     * 
     */
    static onClick_DialogSelectorCloseButton () {
        
        // show loader
        Module_Main.showSidebarLoader ();
        Module_Main.addEntryFromSidebarLeftQueue ( "onClick_DialogSelectorCloseButton" );
        
        var elements:Object[] = [];
        
        // get dimension information from clicked close button
        // fixed
        var hashedUrl:string   = $(this).attr("hashedUrl").toString (),
            label:string       = $(this).attr("label").toString (), 
            typeUrl:string        = $(this).attr("typeUrl").toString (),
            url:string         = $(this).attr("url").toString (),
            
        // dynamic
            property:string = "",
            propertyLabel:string = "";
        
        /**
         * Override existing with new checked dimension elements
         */
        
        // empty elements list of current dimension
        CubeViz_Links_Module["selectedComponents"]["dimensions"][hashedUrl]["elements"] = [];
        
        // get dimensionUrl's over checked checkboxes
        $(".dialog-checkbox-" + hashedUrl).each (function(i, ele) {
            if ( "checked" == $(ele).attr ("checked") ) {
                
                property = $(ele).attr ("property");
                propertyLabel = $(ele).attr ("propertyLabel");
                
                elements.push ({ 
                    "property": property, "propertyLabel": propertyLabel,
                    "hashedUrl": hashedUrl, "label": label, "typeUrl": typeUrl, "url": url
                });
            }
        });
        
        // save new dimensional elements list
        CubeViz_Links_Module["selectedComponents"]["dimensions"][hashedUrl]["elements"] = elements;
        
        // take neccessary javascript objects and put them into configuration file on the server
        ConfigurationLink.saveToServerFile ( 
            CubeViz_Links_Module,
            cubeVizUIChartConfig,
            Module_Event.onComplete_SaveConfigurationAfterChangeElements
        );
        
        // clean content of shown dialog box
        $("#dimensionDialogContainer").fadeOut (500).html ("");
        
        // Reload component selection (with dimensions and measures)
        Module_Main.buildComponentSelection (
            CubeViz_Links_Module ["components"], CubeViz_Links_Module ["selectedComponents"]
        );        
        
        // Dimensions button to select / unselect elements for each component
        Module_Event.setupDialogSelector ();
    }
     
    /**
     * 
     */
    static onClick_PermaLinkButton () {
        
        // Open perma link menu and show link
        if ( undefined == $("#permaLinkButton").data ( "oldValue" ) ) {
            
            $("#permaLinkButton")
                .data ( "oldValue", $("#permaLinkButton").attr ("value").toString() )
                .attr ( "value", ">>")
                .animate(
                    { width: 24 }, 
                    400, 
                    "linear",
                    function() {                        
                        var position = $("#permaLinkButton").position();
                
                        $("#permaLinkMenu")
                            .css ( "top", position.top + 2 )
                            .css ( "left", position.left + 32 );
                            
                        // build link to show later on
                        var link = CubeViz_Links_Module ["cubevizPath"] 
                                   + "?m=" + encodeURIComponent (CubeViz_Links_Module ["modelUrl"])
                                   + "&lC=" + CubeViz_Links_Module ["linkCode"];
                            
                        var url = $("<a></a>")
                            .attr ( "href", link )
                            .attr ( "target", "_self" )
                            .html ( $("#permaLink").html () );
                            
                        $("#permaLinkMenu").animate({width:'toggle'},400);
                        
                        $("#permaLink").html ( url );
                    }
                );        
        
        // Close perma link menu
        } else {
            
            $("#permaLinkMenu").fadeOut ( 
                400,
                function () {
                    $("#permaLinkButton")
                        .animate({width:59}, 400)
                        .attr ( "value", $("#permaLinkButton").data ("oldValue").toString())
                        .data ( "oldValue", null );
                }
            );
        }
    }
     
    /**
     * 
     */
    static onClick_ShowVisualizationButton () {
        
        // Case 1: Only CubeViz module was loaded
        if ( "undefined" == typeof Viz_Event ) {
           // refresh page and show visualization for the latest linkCode
            window.location.href = CubeViz_Links_Module ["cubevizPath"] + "?lC=" + CubeViz_Links_Module ["linkCode"];
        
        // Case 2: CubeViz module and visualization part was loaded
        // Load observations based on pre-configured data structure definition and data set.
        } else {
            
            if ( "undefined" != System.toType ( Viz_Main ) ) {
                Viz_Main.closeChartSelectionMenu ();
            }
            
            Observation.loadAll ( 
                CubeViz_Links_Module ["linkCode"],
                
                // Call an event of the visualization part
                Viz_Event.onComplete_LoadResultObservations
            );
        }
    }
    
    /**
     * 
     */
    static onComplete_LoadAllComponentDimensions (dimensions) {
        
        var regenerateLinkCode:bool = false;
        
        // save pulled component dimensions
        CubeViz_Links_Module ["components"]["dimensions"] = dimensions;
        
        // reset the existing component configuration
        if ( undefined == CubeViz_Links_Module["selectedComponents"]["dimensions"] || 
             0 == System.countProperties (CubeViz_Links_Module["selectedComponents"]["dimensions"]) ) {
            
            // set default values for selected component dimensions list
            // for each componentDimension first entry will be selected
            // e.g. Year (2003), Country (Germany)
            CubeViz_Links_Module["selectedComponents"]["dimensions"] =
                Component.getDefaultSelectedDimensions ( dimensions );
                
            regenerateLinkCode = true;
        }
        
        // Loading all component measures
        Component.loadAllMeasures (
            CubeViz_Links_Module["selectedDSD"]["url"], 
            CubeViz_Links_Module["selectedDS"]["url"], 
            Module_Event.onComplete_LoadAllComponentMeasures
        );
            
        /**
         * Update component selection
         */
        Module_Main.buildComponentSelection ( 
            CubeViz_Links_Module ["components"], CubeViz_Links_Module ["selectedComponents"]
        );
        
        // if selectedComponents.dimension was null, there must be an change event
        // for DSD or DS, so force recreation of a new linkcode
        if ( true == regenerateLinkCode ) {
            
            CubeViz_Links_Module ["linkCode"] = null;
            
            ConfigurationLink.saveToServerFile ( 
                CubeViz_Links_Module,
                cubeVizUIChartConfig,
                function ( newLinkCode ) {
                    // Save new generated linkCode
                    CubeViz_Links_Module ["linkCode"] = newLinkCode;
                }
            );            
        }
        
        /**
         * Dimensions button to select / unselect elements
         */
        Module_Event.setupDialogSelector ();
        
        /**
         * Remove this event entry from sidebar left queue
         */
        Module_Main.removeEntryFromSidebarLeftQueue ( "onComplete_LoadAllComponentDimensions" );
        
        /**
         * 
         */
        Module_Main.hideSidebarLoader ();
    }
    
    /**
     * 
     */
    static onComplete_LoadAllComponentMeasures (compMeasures) {
        CubeViz_Links_Module ["components"]["measures"] = compMeasures;
        CubeViz_Links_Module ["selectedComponents"]["measures"] = compMeasures;
        
        if ( undefined != Viz_Event ) {
            Viz_Event.ready ();
        }
    }
    
    /**
     * 
     */
    static onChange_DataStructureDefinitionBox () {
        
        // extract value and label from selected data structure definition
        var selectedElement:any = $($("#sidebar-left-data-selection-strc option:selected") [0]),
            dsdLabel:string = selectedElement.text (),
            dsdUrl:string = selectedElement.attr ("value");
        
        // TODO: remember previous selection
        
        // reset all module parts, such as dataset etc., because the data structure 
        // definition was changed, so you have to reload all the stuff again
        Module_Main.resetModuleParts ();
        
        // set new selected data structure definition
        CubeViz_Links_Module ["selectedDSD"] = {"label": dsdLabel, "url": dsdUrl};
        
        // re-load data set box
        DataSet.loadAll ( dsdUrl, Module_Event.onComplete_LoadDataSets );
        
        if ( "undefined" != System.toType ( Viz_Main ) ) {
            Viz_Main.closeChartSelectionMenu ();
        }
    }
     
    /**
     * 
     */
    static onChange_DataSetBox () {
        
        // extract value and label from selected data structure definition
        var selectedElement:any = $($("#sidebar-left-data-selection-sets option:selected") [0]),
            dsLabel:string = selectedElement.text (),
            dsUrl:string = selectedElement.attr ("value");
        
        // TODO: remember previous selection
        
        // 
        Module_Main.resetModuleParts ( ["selectedDSD"] );
        
        // set new selected data set
        CubeViz_Links_Module["selectedDS"] = { "label": dsLabel, "url": dsUrl};
        
        // re-load data set box
        Component.loadAllDimensions ( 
            CubeViz_Links_Module["selectedDSD"]["url"], dsUrl, 
            Module_Event.onComplete_LoadAllComponentDimensions
        );
        
        if ( "undefined" != System.toType ( Viz_Main ) ) {
            Viz_Main.closeChartSelectionMenu ();
        }
    }
     
    /**
     * 
     */
    static onComplete_LoadDataSets (dataSets) {
        
        // if at least one data structure definition, than load data sets for first one
        if ( 0 == dataSets["length"] ) {
            // todo: handle case that no data sets were loaded
            // CubeViz_Parameters_Module.selectedDS = {};
            System.out ( "onComplete_LoadDataSets" );
            System.out ( "no data sets were loaded" );
            
        } else if ( 1 <= dataSets["length"] ) {
            
            // if selected data set url is not set, than use the first element of the previously loaded 
            // entries instead
            if ( undefined == CubeViz_Links_Module ["selectedDS"] || 
                 undefined == CubeViz_Links_Module ["selectedDS"]["url"] ) {
                CubeViz_Links_Module["selectedDS"] = dataSets [0];
            }
            
            /**
             * Build select box
             */
            Module_Main.buildDataSetBox (dataSets, CubeViz_Links_Module ["selectedDS"]["url"]);
                       
            // load all component dimensions
            Component.loadAllDimensions ( 
                CubeViz_Links_Module["selectedDSD"]["url"], 
                CubeViz_Links_Module["selectedDS"]["url"], 
                Module_Event.onComplete_LoadAllComponentDimensions
            );   
            
            /**
             * Remove this event entry from sidebar left queue
             */
            Module_Main.removeEntryFromSidebarLeftQueue ( "onComplete_LoadDataSets" );
        }
    }
     
    /**
     * 
     */
    static onComplete_LoadDataStructureDefinitions (dataStructureDefinitions) {
        
        /**
         * Build select box
         */
        Module_Main.buildDataStructureDefinitionBox (
            dataStructureDefinitions, 
            CubeViz_Links_Module["selectedDSD"]["url"]
        );
        
        // if at least one data structure definition, than load data sets for first one
        if ( 0 == dataStructureDefinitions["length"] ) {
            // todo: handle case that no data structure definition were loaded
            CubeViz_Links_Module["selectedDSD"] = {};
            System.out ( "onComplete_LoadDataStructureDefinitions" );
            System.out ( "no data structure definitions were loaded" );
            
        } else if ( 1 <= dataStructureDefinitions["length"] ) {
            
            // if selected data structure defintion url is not set, than use the first element of the 
            // previously loaded entries instead
            if ( undefined == CubeViz_Links_Module ["selectedDSD"]["url"] ) {
                CubeViz_Links_Module ["selectedDSD"] = dataStructureDefinitions [0];
            }
            
            /**
             * Remove this event entry from sidebar left queue
             */
            Module_Main.removeEntryFromSidebarLeftQueue ( "onComplete_LoadDataStructureDefinitions" );
            
            // if more than one data structure definition, load for the first one its data sets
            DataSet.loadAll (
                CubeViz_Links_Module ["selectedDSD"]["url"], 
                Module_Event.onComplete_LoadDataSets
            );
        }
    }
     
    /**
     * 
     */
    static onComplete_SaveConfigurationAfterChangeElements (result) {
        // Save new generated linkCode
        CubeViz_Links_Module ["linkCode"] = result;
        
        // hide loader after configuration was saved/changed
        Module_Main.removeEntryFromSidebarLeftQueue ( "onClick_DialogSelectorCloseButton" );
        Module_Main.hideSidebarLoader ();
    }
    
    /**
     * 
     */
    static setupDialogSelector () {
        
        // set event for onChange
        $(".open-dialog-selector").click (Module_Event.onClick_DialogSelector);
    }
}
