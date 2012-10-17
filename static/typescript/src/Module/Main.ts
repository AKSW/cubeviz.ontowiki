/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />
/// <reference path="..\DeclarationSourceFiles\jsontemplate.d.ts" />

class Module_Main {
    
    /**
     * Build component selection, with jsontemplate
     * 
     * Called by:
     * - onComplete_LoadDataSets
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
     * Build selectbox for data structure definitions
     * 
     * Called by:
     * - onComplete_LoadDataStructureDefinitions
     */
    static buildDataStructureDefinitionBox (options:any, selectedDsdUrl:string) {
        var entry = null;
        
        /**
         * Fill data structure definitions selectbox 
         */
        $("#sidebar-left-data-selection-strc").empty ();
        
        for ( var i in options ) {
            entry = $("<option value=\"" + options [i].url +"\">" + options [i].label + "</option>");            
            
            if ( options [i].url == selectedDsdUrl ) {
                entry.attr ("selected", "selected");
            }
            
            $("#sidebar-left-data-selection-strc").append ( entry );
        }
    }
    
    /**
     * Build dialog to select / unselect certain elements
     */
    static buildDimensionDialog ( dimension:string, componentDimensionElements:any ) {
        
        try {            
            // Prepare jsontemplate
            var tpl = jsontemplate.Template(CubeViz_Dialog_Template);
            
            // fill template placeholders with data
            $("#dimensionDialogContainer").html ( tpl.expand({ 
                "dimension": dimension,
                "label": dimension,
                "list": componentDimensionElements
            }));
            
            $("#dimensionDialogContainer").fadeIn (1000);
        } catch ( e ) {
            System.out ( "buildDimensionDialog error" );
            System.out ( e );
        }
    }
    
    /**
     * 
     */
    static setupAjax () {
        $.ajaxSetup({
            async: true,
            cache: false,
            crossDomain: true,
            dataType: "json",
            dataType: "json",
            type: "POST"
        });
    }
}
