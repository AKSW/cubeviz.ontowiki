/**
 * 
 */
Namespacedotjs('org.aksw.CubeViz.UserInterface.IndexAction', {
    
    /**
     * 
     */
    initUserInterfaceElements: function () {
        
        /**
         * Set height of container div
         */
        $("#container").css ( "height", ( screen.height - 205 ) );
        $("#wrapper-index").css ( "height", ( screen.height - 205 ) );
        
        $('.tabs').html ("");
    },
    
    /**
     * 
     */
    setupChartSelectionEvent: function () {
        // After click on an item in chartSelection, reload the chart
        $('.chartSelectionItem').click (function(event) {
            Namespacedotjs.include('org.aksw.CubeViz.Controller.Main');
            var CubeViz_Controller_Main = org.aksw.CubeViz.Controller.Main;
            
            CubeViz_Controller_Main.selectedChartClass = event.target.name;
			$(".chartSelector-item").removeClass("current");
			$(event.target).parent().addClass("current");
            $(body).trigger("AjaxResultObservationsRetrieved.CubeViz");
        });
    },
    
    /**
     * 
     */
	updateChartSelection: function ( suiteableCharts ) {
        if($("#chartSelection").html())
			return;
        var iconPath = "", name = "", item = "", icon = "";
        $.each(suiteableCharts.charts, function (index, element) {
            iconPath = CubeViz_Parameters_Component.cubevizImagesPath + element.icon;
            name = element ["class"];
			item = $("<div></div>").addClass("chartSelector-item");
			icon = $("<img/>").attr({
				"src": iconPath,
				"name": name,
				"class": "chartSelectionItem"
			}).appendTo(item);
			item.appendTo($("#chartSelection"));
        });
		$("#chartSelection").addClass("chartSelector");
        Namespacedotjs.include('org.aksw.CubeViz.UserInterface.ChartSelector');
		ChartSelector.onItemSelect = function(nr){}
		ChartSelector.init(0);
        $(body).trigger("UserInterface.IndexAction.ChartSelectionComplete");
    }
});
