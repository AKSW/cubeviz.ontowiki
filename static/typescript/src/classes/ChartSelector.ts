/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class ChartSelector {
	
    /**
     * 
     */
    private callbackOnSelect_Item = null;
	
    /**
     * 
     */
    private itemPadding:number = 2;
	
    /**
     * 
     */
    private itemBorder:number = 2;
    
    /**
     * 
     */
	private itemFocused:number = -1;
    
    /**
     * 
     */
	private status:number = 0;
	
    /**
     * Event
     */
    public onSelect_Item (nr){
		this.callbackOnSelect_Item ( nr );
    }
    
    /**
     * ??
     */
    public onClick_Item () {
        
        var nr = $(this).data("nr");
        console.log ("onClick_Item for " + nr);
        this.focusItem(nr);
    }
    
    /**
     * 
     */
	public init (nr) {
        
        //  ChartSelector is already initialized
		if(0 != this.status) {
			System.out ( "ChartSelector.init: Already initialized" );
            return;
        }

		$(".chartSelector-options-toggle").bind("click",function() {
			$(".chartSelector-item-options").eq ( this.itemFocused ).toggle();
			$(".chartSelector-options-toggle.shut").toggle();
			$(".chartSelector-options-toggle.copen").toggle();
		});
        
        console.log ( "ChartSelector -> init" );
		$(".chartSelector-item").each(function(nr){
            $(this)
                .data("nr", nr)
                .click (this.onClick_Item);
		});
        
		this.status = 1;
        
		if(typeof nr == "undefined") {
			this.itemFocused = 0;
            this.focusItem(0);
        } else {
			this.focusItem(nr);
        }
	}

    /**
     * Focus item which was given by its number
     */
	public focusItem (nr) {
		
        // if SliderBar is not initialized, throw exception
        if(this.status == 0) {
			throw "ChartSelector.focusItem: Not initialized";						
        }
		
        // if nr is invalid, throw exception
        if(nr < 0) {
			throw "ChartSelector.focusItem: Invalid item nr";
        }
		
        // if no item change, quit silently
        if(this.itemFocused == nr) {										
			return;
        }

		var containerOptions = $(".chartSelector-options");
        
        // try to find item by number
		var item = $(".chartSelector-item").eq(nr);
        
        // if item not found, throw exception
		/* ???
           if(!item.size()) {											
			throw "ChartSelector.focusItem: Invalid item nr";
        }*/

		this.itemFocused = nr;		
        										
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
		
        if(this.status == 1) {
			this.status = 2;
        }
        
		this.onSelect_Item (nr);
	}
    
    /**
     * 
     */
    public setOnSelect_Item (callback) {
        this.callbackOnSelect_Item = callback;
    }
}
