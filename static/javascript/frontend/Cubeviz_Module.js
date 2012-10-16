var Data = (function () {
    function Data() { }
    Data.loadDataStructureDefinitions = function loadDataStructureDefinitions(callback) {
        System.out(CubeViz_Config.cubevizPath + "getdatastructuredefinitions/");
        $.ajax({
            type: "POST",
            url: CubeViz_Config.cubevizPath + "getdatastructuredefinitions/",
            data: {
                m: CubeViz_Config.selectedModel
            }
        }).done(callback);
    }
    return Data;
})();
var System = (function () {
    function System() { }
    System.out = function out(output) {
        if(typeof console !== "undefined" && typeof console.log !== "undefined" && "development" == CubeViz_Config.context) {
            console.log(output);
        }
    }
    System.call = function call(f, param) {
        if(typeof f !== "undefined") {
            if(typeof param !== "undefined") {
                eval("f (param);");
            } else {
                f();
            }
        }
    }
    System.rand = function rand() {
        return Math.floor(Math.random() * (2147483647 + 1));
    }
    return System;
})();
var CubeViz_Parameters_Component = CubeViz_Parameters_Component || {
};
var CubeViz_Link_Chosen_Module = CubeViz_Link_Chosen_Module || {
};
var CubeViz_Links_Module = CubeViz_Links_Module || {
};
var CubeViz_Config = CubeViz_Config || {
};
$(document).ready(function () {
    Module_Event.ready();
});
var Module_Event = (function () {
    function Module_Event() { }
    Module_Event.ready = function ready() {
        System.out("");
        System.out("CubeViz_Parameters_Component:");
        System.out(CubeViz_Parameters_Component);
        System.out("");
        System.out("CubeViz_Links_Module:");
        System.out(CubeViz_Links_Module);
        System.out("");
        System.out("CubeViz_Link_Chosen_Module:");
        System.out(CubeViz_Link_Chosen_Module);
        Data.loadDataStructureDefinitions(Module_Event.onComplete_DataStructureDefinitions);
    }
    Module_Event.onComplete_DataStructureDefinitions = function onComplete_DataStructureDefinitions(response) {
        System.out(response);
    }
    return Module_Event;
})();
var Module_Main = (function () {
    function Module_Main() { }
    return Module_Main;
})();
