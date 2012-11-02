/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />
/// <reference path="..\DeclarationSourceFiles\jsontemplate.d.ts" />

class Module_Main {
    
    /**
     * 
     */
    static addEntryFromSidebarLeftQueue (entry:string) {
        tmpCubeVizLeftSidebarLeftQueue.push ( entry );
    }
    
    /**
     * Build component selection, with jsontemplate
     */
    static buildComponentSelection ( components, selectedComponents ) {
    
        var selectedComLength:number = 1,
            tplEntries = {"dimensions":[]};
            
        for ( var com in components ["dimensions"] ) {
            
            selectedComLength = selectedComponents ["dimensions"][com]["elements"]["length"] || 1;
            
            com = components ["dimensions"][com];

            com ["selectedElementCount"] = selectedComLength;
            com ["elementCount"] = com ["elements"]["length"];
            tplEntries ["dimensions"].push (com);
        }
    
        try {
            var tpl = jsontemplate.Template(CubeViz_Dimension_Template);
            $("#sidebar-left-data-selection-dims-boxes").html ( tpl.expand(tplEntries) );
        } catch ( e ) {
            System.out ( "buildComponentSelection error" );
            System.out ( e );
        }
    }
    
    /**
     * Build selectbox for datasets
     * 
     * Called by:
     * - onComplete_LoadDataSets
     */
    static buildDataSetBox ( options, selectedDataSetUrl:string ) {
        var entry = null;
        
        $("#sidebar-left-data-selection-sets").empty ();
        
        for ( var i in options ) {
            entry = $("<option value=\"" + options [i].url +"\">" + options [i].label + "</option>");  
            
            if ( selectedDataSetUrl == options [i].url ) {
                entry.attr ( "selected", "selected" );
            }
                      
            $("#sidebar-left-data-selection-sets").append ( entry );
        }
    }
    
    /**
     * Build selectbox for data structure definitions.
     */
    static buildDataStructureDefinitionBox (options:any, selectedDsdUrl:string) {
        var entry = null;
        
        /**
         * Fill data structure definitions selectbox 
         */
        $("#sidebar-left-data-selection-strc").empty ();
        
        for ( var i in options ) {
            entry = $("<option value=\"" + options[i]["url"] +"\">" + options[i]["label"] + "</option>");            
            
            if ( options [i]["url"] == selectedDsdUrl ) {
                entry.attr ("selected", "selected");
            }
            
            $("#sidebar-left-data-selection-strc").append ( entry );
        }
    }
    
    /**
     * Build dialog to select / unselect certain elements
     */
    static buildDimensionDialog ( dimensionLabel:string, dimensionType:string, dimensionUrl:string, 
                                   componentDimensionElements:any ) {
        
        try {
                        
            // Prepare jsontemplate
            var tpl = jsontemplate.Template(CubeViz_Dialog_Template);

            // Sorting the list of to be shown elements alphabetically
            componentDimensionElements.sort(function (a, b){
                var x = a.property_label.toUpperCase();         
                var y = b.property_label.toUpperCase();         
                if(x < y) {
                    return -1;
                } else if (x > y) {
                    return 1;
                } else {
                    return 0;
                }
            });
            
            // fill template placeholders with data
            $("#dimensionDialogContainer").html ( tpl.expand({ 
                "dimensionLabel": dimensionLabel,
                "dimensionType": dimensionType,
                "dimensionUrl": dimensionUrl,
                "list": componentDimensionElements
            }));
            
            // collect urls of all selected component dimensions
            var elements = CubeViz_Links_Module ["selectedComponents"]["dimensions"] [dimensionLabel]["elements"],
                selectedDimensionUrls:string[] = []; 
            for ( var index in elements ) {
                selectedDimensionUrls.push ( elements [index].property );
            }
            
            // go through the list of checkboxes and select one if its a the previously 
            // selected component dimension
            $(".dialog-checkbox-" + dimensionLabel).each (function(i, ele) {
                if ( 0 <= $.inArray ( $(ele).attr ("value").toString (), selectedDimensionUrls ) ) {
                    $(ele).attr ("checked", "checked" );
                }
            });
            
            // if rendering is complete, fade in the dialog
            $("#dimensionDialogContainer").fadeIn (1000);
        } catch ( e ) {
            System.out ( "buildDimensionDialog error" );
            System.out ( e );
        }
    }
    
    /**
     * 
     */
    static hideSidebarLoader () {
        if ( 0 == tmpCubeVizLeftSidebarLeftQueue ["length"] ) {
            $("#sidebar-left-loader")
                .fadeOut ( 400 );
        }
    }
    
    /**
     * 
     */
    static removeEntryFromSidebarLeftQueue (entry:string) {
        var newQueue = [];
        
        for ( var index in removeEntryFromSidebarLeftQueue ) {
            if ( entry != removeEntryFromSidebarLeftQueue[index] ) {
                newQueue.push ( removeEntryFromSidebarLeftQueue[index] );
            }
        }
        
        tmpCubeVizLeftSidebarLeftQueue = newQueue;
    }
    
    /**
     * Reset all module parts, except this ones in exceptOf parameter
     */
    static resetModuleParts ( exceptOf:string[] = [] ) : void {
    
        if ( -1 == $.inArray ("selectedDSD", exceptOf) ) {
            CubeViz_Links_Module ["selectedDSD"] = null;
        }
    
        if ( -1 == $.inArray ("selectedDS", exceptOf) ) {
            CubeViz_Links_Module ["selectedDS"] = null;
        }
        
        if ( -1 == $.inArray ("linkCode", exceptOf) ) {
            CubeViz_Links_Module ["linkCode"] = null;
        }
        
        if ( -1 == $.inArray ("selectedComponents.dimensions", exceptOf) ) {
            CubeViz_Links_Module ["selectedComponents"]["dimensions"] = null;
        }
        
        /*
        Leave measure stuff untouched as long as there is only one of it
        if ( -1 == $.inArray ("selectedComponents.measures", exceptOf) ) {
            CubeViz_Links_Module ["selectedComponents"]["measures"] = null;
        }
        */
        
        if ( -1 == $.inArray ("components.dimensions", exceptOf) ) {
            CubeViz_Links_Module ["components"]["dimensions"] = null;
        }
        
        /*
        Leave measure stuff untouched as long as there is only one of it
        if ( -1 == $.inArray ("components.measures", exceptOf) ) {
            CubeViz_Links_Module ["components"]["measures"] = null;
        }*/
    }
    
    /**
     * 
     */
    static showSidebarLoader () : void {
                
        $("#sidebar-left-loader")
            .fadeIn ( 1000 )
            // set height dynamicly
            .css ( "height", ( $("#sidebar-left").css ("height") ) );
    }
}
