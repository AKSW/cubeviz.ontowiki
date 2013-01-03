/// <reference path="..\DeclarationSourceFiles\jsontemplate.d.ts" />
/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class ChartSelector {
		        	
    /**
     * Build menu based on jsontemplate and returns HTML
     */
    static buildMenu ( options:Object[] ) : string {
        try {
            
            var finalHtml:string = "",
                tpl:any = {},
                chartSelectorArrays:Object = {"entries":[]};
            
            // Separate different types, because each type has its own template
            for ( var index in options ) {
                switch ( options [index] ["type"] ) {
                    
                    case "array": 
                        chartSelectorArrays ["entries"].push ( options [index] );
                        break;
                    
                    default: 
                        continue;
                        break;
                }
            }
            
            /**
             * Handle type: array
             */             
            tpl = jsontemplate.Template(ChartSelector_Array);
            finalHtml += tpl.expand(chartSelectorArrays);
            
            // return generated HTML
            return finalHtml;
            
        } catch ( e ) {
            System.out ( "buildComponentSelection error" );
            System.out ( e );
        }
    }
                
    /**
     * 
     */
	static init (suiteableCharts:Object[], onClick_Function:any) : void {
        
        // Empty chartSelection div-container
        $("#chartSelection").html ( "" );
            
        // 
        var element = null,
            icon = null, 
            iconPath = "", 
            item = null, 
            name = "", 
            nr = 0;
                    
        // go through all suitableCharts
        for ( var index in suiteableCharts ) {
            element = suiteableCharts[index];
            
            if ( undefined == element ) {
                
                // element not defined, so do nothing.
                
            } else {                     
                // set values
                iconPath = CubeViz_Config ["imagesPath"] + element ["icon"];
                name = element ["class"];
                
                // create div for chart image
                item = $("<div></div>")
                    .addClass("chartSelector-item")
                    .attr ( "className", name );
                
                if ( 0 == nr ) {
                    item.addClass("chartSelector-item-current");
                }
                
                // create image and set its values, after that, append it to its own div
                icon = $("<img/>")
                    .attr({
                        "src": iconPath,
                        "name": name,
                        "class": "chartSelectionItem"
                    })
                    
                    .data ("nr", nr++)
                
                    .appendTo(item);
                   
                // in the end, append div to #chartSelection div
                item.appendTo ( $("#chartSelection") );
            }
        };
        
		$("#chartSelection").addClass("chartSelector");
                
        $(".chartSelector-options-toggle").click (function() {
			$(".chartSelector-item-options").eq ( this.itemFocused ).toggle();
			$(".chartSelector-options-toggle.shut").toggle();
			$(".chartSelector-options-toggle.copen").toggle();
		});
        
		$(".chartSelector-item").each(function(nr){
            $(this).attr("nr", nr);
            $(this).click (onClick_Function);
		});
        
        // set default lastSelection to 0
        $("#chartSelection").attr ( "lastSelection", 0 );
	}
}