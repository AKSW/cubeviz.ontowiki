/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class ChartSelector {
		    
    /**
     * 
     */
	static itemClicked:number = -1;
    	        
    /**
     * 
     */
	static init (suiteableCharts:Object[], onClick_Function:any) : void {
        
        // Empty chartSelection div-container
        $("#chartSelection").html ( "" );
            
        // 
        var iconPath = "", 
            name = "", 
            item = null, 
            icon = null, 
            nr = 0;
        
        // go through all suitableCharts
        $.each(suiteableCharts, function (index, element) {            
            // set values
            iconPath = CubeViz_Config ["imagesPath"] + element ["icon"];
            name = element ["class"];
			
            // create div for chart image
            item = $("<div></div>")
                .addClass("chartSelector-item")
                .attr ( "className", name );
			
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
        });
        
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
