/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class Module_Main {
    
    /**
     * Called by:
     * - onComplete_LoadDataStructureDefinitions
     */
    static buildDataStructureDefinitionBox ( options ) {
        var entry = null;
        
        /**
         * Fill data structure definitions selectbox 
         */
        $("#sidebar-left-data-selection-strc").empty ();
        
        for ( var i in options ) {
            entry = $("<option value=\"" + options [i].url +"\">" + options [i].label + "</option>");            
            $("#sidebar-left-data-selection-strc").append ( entry );
        }
    }
}
