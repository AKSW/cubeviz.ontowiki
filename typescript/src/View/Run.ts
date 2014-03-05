/// <reference path="..\..\declaration\libraries\jquery.d.ts" />

var cubeVizApp = new CubeViz_View_Application;

$(document).ready(function(){    
    
    // show intern data only if context is development
    if(0 < _.size(cubeVizApp._) && "development" == cubeVizApp._.backend.context) {
        console.log("CubeViz - Development Information:");
        console.log(cubeVizApp._);
    }
    
    // trigger event that application has to start
    cubeVizApp.triggerEvent("onStart_application");
});
