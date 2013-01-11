/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

var cubeVizApp = new CubeViz_View_Application;

$(document).ready(function(){
    console.log("cubeVizApp._:");
    console.log(cubeVizApp._);
    cubeVizApp.triggerEvent("onStart_application");
});
