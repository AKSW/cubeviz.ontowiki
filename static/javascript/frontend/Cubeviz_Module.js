var Component = (function () {
    function Component() { }
    Component.loadAll = function loadAll(dsdUrl, dsUrl, callback) {
        $.ajax({
            type: "POST",
            url: CubeViz_Config.cubevizPath + "getcomponents/",
            data: {
                m: CubeViz_Config.selectedModel,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl
            }
        }).done(callback);
    }
    return Component;
})();
var DataStructureDefinition = (function () {
    function DataStructureDefinition() { }
    DataStructureDefinition.loadAll = function loadAll(callback) {
        $.ajax({
            type: "POST",
            url: CubeViz_Config.cubevizPath + "getdatastructuredefinitions/",
            data: {
                m: CubeViz_Config.selectedModel
            }
        }).done(callback);
    }
    return DataStructureDefinition;
})();
var DataSet = (function () {
    function DataSet() { }
    DataSet.loadAll = function loadAll(dsdUrl, callback) {
        console.log(CubeViz_Config.cubevizPath + "getdatasets/");
        console.log(dsdUrl);
        $.ajax({
            type: "POST",
            url: CubeViz_Config.cubevizPath + "getdatasets/",
            data: {
                m: CubeViz_Config.selectedModel,
                dsdUrl: dsdUrl
            }
        }).done(callback);
    }
    return DataSet;
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
        System.out("");
        Module_Event.setupDataStructureDefinitionBox();
    }
    Module_Event.onComplete_LoadDataSets = function onComplete_LoadDataSets(options) {
        options = $.parseJSON(options);
        console.log(options);
        var entry = null;
        $("#sidebar-left-data-selection-sets").empty();
        for(var i in options) {
            entry = $("<option value=\"" + options[i].url + "\">" + options[i].label + "</option>");
            $("#sidebar-left-data-selection-sets").append(entry);
        }
    }
    Module_Event.onComplete_LoadDataStructureDefinitions = function onComplete_LoadDataStructureDefinitions(options) {
        options = $.parseJSON(options);
        Module_Main.buildDataStructureDefinitionBox(options);
        if(1 <= options.length) {
            DataSet.loadAll(options[0].url, Module_Event.onComplete_LoadDataSets);
        }
    }
    Module_Event.setupDataStructureDefinitionBox = function setupDataStructureDefinitionBox() {
        DataStructureDefinition.loadAll(Module_Event.onComplete_LoadDataStructureDefinitions);
    }
    return Module_Event;
})();
var Module_Main = (function () {
    function Module_Main() { }
    Module_Main.buildDataStructureDefinitionBox = function buildDataStructureDefinitionBox(options) {
        var entry = null;
        $("#sidebar-left-data-selection-strc").empty();
        for(var i in options) {
            entry = $("<option value=\"" + options[i].url + "\">" + options[i].label + "</option>");
            $("#sidebar-left-data-selection-strc").append(entry);
        }
    }
    return Module_Main;
})();
