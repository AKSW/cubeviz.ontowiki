ChartSelector = {
	itemPadding: 2,
	itemBorder: 2,
	itemFocused: -1,
	onItemSelect: function(nr){
		throw "Please implement ChartSelector.onItemSelect()";
	},
	status: 0,

	focusItem: function(nr){
		if(ChartSelector.status == 0)												//  SliderBar is not initialized
			throw "ChartSelector.focusItem: Not initialized";						//  throw exception
		if(nr < 0)																//  nr is invalid
			throw "ChartSelector.focusItem: Invalid item nr";						//  throw exception
		if(ChartSelector.itemFocused == nr)											//  no item change
			return;																//  quit silently

		var containerOptions = $(".chartSelector-options");
		var item = $(".chartSelector-item").eq(nr);								//  try to find item by number
		if(!item.size())														//  item not found
			throw "ChartSelector.focusItem: Invalid item nr";						//  throw exception

		ChartSelector.itemFocused = nr;												//  ...
		var hasOptions;
		$(".chartSelector-item-options").hide();									//  ...
		hasOptions = $(".chartSelector-item-options").eq(nr).children().size();
		hasOptions ? containerOptions.show() : containerOptions.hide();
		$(".chartSelector-options-toggle.shut").show();
		$(".chartSelector-options-toggle.open").hide();
		$(".chartSelector-item").removeClass("current").eq(nr).addClass("current");
		if(ChartSelector.status == 1)
			ChartSelector.status = 2;
		ChartSelector.onItemSelect(nr);
	},

	init: function(nr){
		if(ChartSelector.status != 0)												//  ChartSelector is already initialized
			throw "ChartSelector.init: Already initialized";						//  throw exception

		$(".chartSelector-options-toggle").bind("click",function(){
			$(".chartSelector-item-options").eq(ChartSelector.itemFocused).toggle();
			$(".chartSelector-options-toggle.shut").toggle();
			$(".chartSelector-options-toggle.copen").toggle();
		});
		$(".chartSelector-item").each(function(nr){
			$(this).data("nr", nr).bind("click",function(){
				ChartSelector.focusItem(nr);
			});
		});
		ChartSelector.status = 1;
		if(typeof nr == "undefined")											//  no initial item number given
			ChartSelector.itemFocused = 0;
		else
			ChartSelector.focusItem(nr);
	}
};
