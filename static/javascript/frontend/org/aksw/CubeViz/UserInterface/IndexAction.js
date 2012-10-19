/**
 * 
 */
Namespacedotjs('org.aksw.CubeViz.UserInterface.IndexAction', {

	currentChart: null,
    
    /**
     * 
     */
    initUserInterfaceElements: function () {
        
        /**
         * Set height of container div
         */
         
        var container = $("#container").offset();
        var viewPort = $(window).height();
        var containerHeight = 0; 
        containerHeight = ( viewPort - container.top - 8);
         
        $("#container").css ( "height", containerHeight );
        $("#wrapper-index").css ( "height", containerHeight );
        
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
            
            CubeViz_Controller_Main.selectedChartClass = event['target']['name'];
			org.aksw.CubeViz.UserInterface.IndexAction.currentChart = event['target']['name'];
			$(".chartSelector-item").removeClass("current");
			$(event.target).parent().addClass("current");
            $(body).trigger("AjaxResultObservationsRetrieved.CubeViz");
        });
    },
    
    /**
     * 
     */
	updateChartSelection: function ( suiteableCharts ) {
		console.log(org.aksw.CubeViz.UserInterface.IndexAction.currentChart);
        $("#chartSelection").html("");
        var iconPath = "", name = "", item = "", icon = "";
        $.each(suiteableCharts.charts, function (index, element) {
            iconPath = CubeViz_Parameters_Component.cubevizImagesPath + element.icon;
            name = element ["class"];
			item = $("<div></div>").addClass("chartSelector-item");
			if(org.aksw.CubeViz.UserInterface.IndexAction.currentChart == name)
				item.addClass("current");
			icon = $("<img/>").attr({
				"src": iconPath,
				"name": name,
				"class": "chartSelectionItem"
			}).appendTo(item);
			item.appendTo($("#chartSelection"));
        });
		$("#chartSelection").addClass("chartSelector");
        Namespacedotjs.include('org.aksw.CubeViz.UserInterface.ChartSelector');
//		ChartSelector.onItemSelect = function(nr){}
//		ChartSelector.init(0);
        $(body).trigger("UserInterface.IndexAction.ChartSelectionComplete");
    }
});
