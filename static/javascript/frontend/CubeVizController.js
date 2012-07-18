$(document).ready(function(){
	Namespacedotjs.include('org.aksw.CubeViz.Controller.Main');
    var CubeViz_Controller_Main = org.aksw.CubeViz.Controller.Main;
        
    CubeViz_Controller_Main.init(CubeViz_Parameters_Component);
    CubeViz_Controller_Main.getResultObservations(CubeViz_Link_Chosen_Component);
    
    $(body).bind("AjaxResultObservationsRetrieved.CubeViz", function() {
		
	});
});
