/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class ChartSelector {
	
    /**
     * 
     */
    static callbackOnFocus_Item = null;
	
    /**
     * 
     */
    static itemPadding:number = 2;
	
    /**
     * 
     */
    static itemBorder:number = 2;
    
    /**
     * 
     */
	static itemFocused:number = -1;
    
    /**
     * 
     */
	static status:number = 0;
	
    /**
     * Event
     */
    static onFocus_Item (nr) {}
    
    /**
     * Event
     */
    static onClick_Item (event:any) {}
    
    /**
     * 
     */
	static init (nr) {
        
        //  ChartSelector is already initialized
		/* if(0 != ChartSelector.status) {
			System.out ( "ChartSelector.init: Already initialized" );
            return;
        } */
        $(".chartSelector-options-toggle").click (function() {
			$(".chartSelector-item-options").eq ( this.itemFocused ).toggle();
			$(".chartSelector-options-toggle.shut").toggle();
			$(".chartSelector-options-toggle.copen").toggle();
		});
        
		$(".chartSelector-item").each(function(nr){
            $(this).attr("nr", nr);
            $(this).click (ChartSelector.onClick_Item);
		});
        
        // set default lastSelection to 0
        $("#chartSelection").attr ( "lastSelection", 0 );
        
		ChartSelector.status = 1;
        
		if(typeof nr == "undefined") {
			ChartSelector.itemFocused = 0;
            ChartSelector.focusItem(0);
        } else {
			ChartSelector.focusItem(nr);
        }
	}

    /**
     * Focus item which was given by its number
     */
	static focusItem (nr) {
        
        console.log ( "focusItem" );
		
        // if SliderBar is not initialized, throw exception
        if(ChartSelector.status == 0) {
			throw "ChartSelector.focusItem: Not initialized";						
        }
		
        // if nr is invalid, throw exception
        if(nr < 0) {
			throw "ChartSelector.focusItem: Invalid item nr";
        }
		
        // if no item change, quit silently
        if(ChartSelector.itemFocused == nr) {										
			return;
        }

		var containerOptions = $(".chartSelector-options");
        
        // try to find item by number
		var item = $(".chartSelector-item").eq(nr);
        
        // if item not found, throw exception
        if(!item.size()) {											
			throw "ChartSelector.focusItem: Invalid item nr";
        }

		ChartSelector.itemFocused = nr;		
        										
		var optionNumber = $(".chartSelector-item-options").eq(nr).children().size();
        
		if ( 0 < optionNumber ) {
            containerOptions.show();
        } else {
            containerOptions.hide();
        }
		
        $(".chartSelector-item-options").hide();									
		
        $(".chartSelector-options-toggle.shut").show();
        
		$(".chartSelector-options-toggle.open").hide();
		
        $(".chartSelector-item").removeClass("current").eq(nr).addClass("current");
		
        if(ChartSelector.status == 1) {
			ChartSelector.status = 2;
        }
        
		ChartSelector.onFocus_Item (nr);
	}
}
