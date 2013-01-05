/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

var cubeVizApp = new CubeViz_View_Application;

$(document).ready(function(){
    cubeVizApp.triggerEvent("onStart_application");
});
