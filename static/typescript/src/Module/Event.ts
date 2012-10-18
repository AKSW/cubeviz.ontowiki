/**
 * Declaration Source Files
 */ 
/// <reference path="..\DeclarationSourceFiles\jsontemplate.d.ts" />
/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />


/**
 * Make variables accessible for TypeScript
 */
var CubeViz_Config = CubeViz_Config || {};
var CubeViz_Links_Module = CubeViz_Links_Module || {};
var cubeVizUIChartConfig = cubeVizUIChartConfig || {};

// templates
var CubeViz_Dialog_Template = CubeViz_Dialog_Template || {};
var CubeViz_Dimension_Template = CubeViz_Dimension_Template || {};


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
        
        Module_Main.setupAjax ();
        
        /**
         * Setup User Interface
         */
         
        /**
         * Selectbox with data set
         */
        Module_Event.setupDataSetBox ();
         
        /**
         * Selectbox with data structure definitions
         */
        Module_Event.setupDataStructureDefinitionBox ();
         
        /**
         * Button to show visualization
         */
        Module_Event.setupShowVisualizationButton ();
    }
    
    /**
     * EVENTS
     */
     
    /**
     * Opens a dialog, filled with elements of the selected dimension
     */
    static onClick_DialogSelector () {
                
        // get dimension from clicked dialog selector
        var dimensionLabel:string = $(this).attr ( "dimensionLabel" ).toString ();
        var dimensionType:string = $(this).attr ( "dimensionType" ).toString ();
        var dimensionUrl:string = $(this).attr ( "dimensionUrl" ).toString ();
        
        // 
        Module_Main.buildDimensionDialog (
            dimensionLabel, // label of current dimension            
            dimensionType, // type of current dimension            
            dimensionUrl, // url of current dimension
            
            // component->dimension->elements to build a list with checkboxes to select / unselect
            CubeViz_Links_Module.components ["dimensions"][dimensionLabel]["elements"] 
        );
        
        /**
         * Setup dialog selector close button ( id="dialog-btn-close-{dimension}" )
         */
        Module_Event.setupDialogSelectorCloseButton (dimensionLabel);
    }
     
    /**
     * 
     */
    static onClick_DialogSelectorCloseButton () {
        
        var elements:Object[] = [];
        
        // get dimension information from clicked close button
        // fixed
        var dimensionLabel:string = $(this).attr ( "dimensionLabel" ).toString (), 
            dimensionType:string = $(this).attr ( "dimensionType" ).toString (),
            dimensionUrl:string = $(this).attr ( "dimensionUrl" ).toString (),
            
        // dynamic
            property:string = "",
            propertyLabel:string = "";
        
        /**
         * Override existing with new checked dimension elements
         */
        
        // empty elements list of current dimension
        CubeViz_Links_Module["selectedComponents"]["dimensions"][dimensionLabel]["elements"] = [];
        
        // get dimensionUrl's over checked checkboxes
        $(".dialog-checkbox-" + dimensionLabel).each (function(i, ele) {
            if ( "checked" == $(ele).attr ("checked") ) {
                
                property = $(ele).attr ("property");
                propertyLabel = $(ele).attr ("propertyLabel");
                
                elements.push ({ 
                    "property": property,
                    "property_label": propertyLabel,
                    "dimension_label": dimensionLabel,
                    "dimension_type": dimensionType,
                    "dimension_url": dimensionUrl
                });
            }
        });
        
        // save new dimensional elements list
        CubeViz_Links_Module["selectedComponents"]["dimensions"][dimensionLabel]["elements"] = elements;
        
        // take neccessary javascript objects and put them into configuration file on the server
        ConfigurationLink.saveToServerFile ( 
            CubeViz_Links_Module,
            cubeVizUIChartConfig,
            Module_Event.onComplete_SaveConfigurationAfterChangeElements
        );
        
        // clean content of shown dialog box
        $("#dimensionDialogContainer").fadeOut (500).html ("");
    }
     
    /**
     * 
     */
    static onClick_ShowVisualizationButton () {
        
        window.location.href = CubeViz_Links_Module ["cubevizPath"];
    }
    
    /**
     * 
     */
    static onComplete_LoadAllComponentDimensions (entries, resetSelectedComponents:bool = false) {
        
        if ( true == resetSelectedComponents ) {
            
            // set default values for selected component dimensions list
            // for each componentDimension first entry will be selected
            // e.g. Year (2003), Country (Germany)
            CubeViz_Links_Module.selectedComponents.dimensions =
                Component.getDefaultSelectedDimensions ( entries.dimensions );
        } else { }
    
        // save pulled component dimensions
        CubeViz_Links_Module.components = entries;
            
        /**
         * Update component selection
         */
        Module_Main.buildComponentSelection ( 
            CubeViz_Links_Module.components, CubeViz_Links_Module.selectedComponents 
        );
        
        /**
         * Dimensions button to select / unselect elements
         */
        Module_Event.setupDialogSelector ();
    }
    
    /**
     * 
     */
    static onChange_DataStructureDefinitionBox () {
        
        // extract value and label from selected data structure definition
        var selectedElement:any = $($("#sidebar-left-data-selection-strc option:selected") [0]),
            dsdLabel:string = selectedElement.text (),
            dsdUrl:string = selectedElement.attr ("value");
        
        // set new selected data structure definition
        CubeViz_Links_Module.selectedDSD = { "label": dsdLabel, "url": dsdUrl};
        
        // reset data set
        CubeViz_Links_Module.selectedDS = null;
        
        // re-load data set box
        DataSet.loadAll ( dsdUrl, Module_Event.onComplete_LoadDataSets );
    }
     
    /**
     * 
     */
    static onChange_DataSetBox () {
        
        // extract value and label from selected data structure definition
        var selectedElement:any = $($("#sidebar-left-data-selection-sets option:selected") [0]),
            dsLabel:string = selectedElement.text (),
            dsUrl:string = selectedElement.attr ("value");
        
        // set new selected data set
        CubeViz_Links_Module.selectedDS = { "label": dsLabel, "url": dsUrl};
        
        // re-load data set box
        Component.loadAllDimensions ( 
            CubeViz_Links_Module.selectedDSD.url, dsUrl, 
            Module_Event.onComplete_LoadAllComponentDimensions 
        );
    }
     
    /**
     * 
     */
    static onComplete_LoadDataSets (entries) {
        
        // if at least one data structure definition, than load data sets for first one
        if ( 0 == entries.length ) {
            // todo: handle case that no data sets were loaded
            // CubeViz_Parameters_Module.selectedDS = {};
            System.out ( "onComplete_LoadDataSets" );
            System.out ( "no data sets were loaded" );
            
        } else if ( 1 <= entries.length ) {
            
            var resetSelectedComponents = false;
            
            if ( null == CubeViz_Links_Module.selectedDS ) {
                CubeViz_Links_Module.selectedDS = entries [0];
                
                // reset selectedComponents
                resetSelectedComponents = true;
                                
                // TODO: CubeViz_Links_Module.selectedComponents.measures = {};
            }
            
            /**
             * Build select box
             */
            Module_Main.buildDataSetBox (entries, CubeViz_Links_Module.selectedDS.url);
                        
            // will load all component dimensions for certain data structure definition and data set
            Component.loadAllDimensions ( 
                CubeViz_Links_Module.selectedDSD.url, 
                CubeViz_Links_Module.selectedDS.url, 
                Module_Event.onComplete_LoadAllComponentDimensions,
                resetSelectedComponents
            );
        }
    }
     
    /**
     * 
     */
    static onComplete_LoadDataStructureDefinitions (entries) {
        
        /**
         * Build select box
         */
        Module_Main.buildDataStructureDefinitionBox (entries, CubeViz_Links_Module.selectedDSD.url);
        
        // if at least one data structure definition, than load data sets for first one
        if ( 0 == entries.length ) {
            // todo: handle case that no data structure definition were loaded
            CubeViz_Links_Module["selectedDSD"] = {};
            System.out ( "onComplete_LoadDataStructureDefinitions" );
            System.out ( "no data structure definitions were loaded" );
            
        } else if ( 1 <= entries.length ) {
            
            // if more than one data structure definition, load for the first one its data sets
            DataSet.loadAll (CubeViz_Links_Module ["selectedDSD"]["url"], Module_Event.onComplete_LoadDataSets);
        }
    }
     
    /**
     * 
     */
    static onComplete_SaveConfigurationAfterChangeElements (result) {
        
        console.log ( "onComplete_SaveConfigurationAfterChangeElements" );
        console.log ( result );
    }
    
    /**
     * SETUP FUNCTIONS
     */
    
    /**
     * 
     */
    static setupDataStructureDefinitionBox () {
        
        DataStructureDefinition.loadAll (Module_Event.onComplete_LoadDataStructureDefinitions);
        
        // set event for onChange
        $("#sidebar-left-data-selection-strc").change ( Module_Event.onChange_DataStructureDefinitionBox );
    }
    
    /**
     * 
     */
    static setupDataSetBox () {
        
        // set event for onChange
        $("#sidebar-left-data-selection-sets").change ( Module_Event.onChange_DataSetBox );
    }
    
    /**
     * 
     */
    static setupDialogSelector () {
        
        // set event for onChange
        $(".open-dialog-selector").click (Module_Event.onClick_DialogSelector);
    }
    
    /**
     * 
     */
    static setupDialogSelectorCloseButton (dimensionLabel:string) {
        
        // set event for onChange
        $("#dialog-btn-close-" + dimensionLabel ).click (Module_Event.onClick_DialogSelectorCloseButton);
    }
    
    /**
     * 
     */
    static setupShowVisualizationButton () {
        
        // set event for onChange
        $("#sidebar-left-data-selection-submitbtn").click (Module_Event.onClick_ShowVisualizationButton);
    }
}
