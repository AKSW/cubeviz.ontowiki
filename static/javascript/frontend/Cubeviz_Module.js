var Component = (function () {
    function Component() { }
    Component.loadAll = function loadAll(dsdUrl, dsUrl, callback) {
        $.ajax({
            type: "POST",
            url: CubeViz_Config.cubevizPath + "getcomponents/",
            data: {
                m: CubeViz_Config.selectedModel,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "dimension"
            }
        }).done(function (entries) {
            Component.prepareLoadedComponents(entries, callback);
        });
    }
    Component.prepareLoadedComponents = function prepareLoadedComponents(entries, callback) {
        entries = $.parseJSON(entries);
        for(var i in entries) {
            entries[i].elementCount = entries[i].elementCount || 0;
            entries[i].selectedElementCount = entries[i].elementCount || 0;
        }
        entries.sort(function (a, b) {
            return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        });
        callback(entries);
    }
    Component.updateSelectedDimensionComponents = function updateSelectedDimensionComponents(entries) {
        var tmpDimensionComponents = CubeViz_Parameters_Module.selectedDimensionComponents;
        for(var dimension in entries) {
            for(var i in tmpDimensionComponents) {
                if(dimension == tmpDimensionComponents[i]["label"]) {
                    tmpDimensionComponents[i]["elementCount"] = entries[dimension]["length"];
                }
            }
        }
        CubeViz_Parameters_Module.selectedDimensionComponents = tmpDimensionComponents;
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
        }).done(function (entries) {
            DataStructureDefinition.prepareLoadedDataStructureDefinitions(entries, callback);
        });
    }
    DataStructureDefinition.prepareLoadedDataStructureDefinitions = function prepareLoadedDataStructureDefinitions(entries, callback) {
        entries = $.parseJSON(entries);
        entries.sort(function (a, b) {
            return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        });
        callback(entries);
    }
    return DataStructureDefinition;
})();
var DataSet = (function () {
    function DataSet() { }
    DataSet.loadAll = function loadAll(dsdUrl, callback) {
        $.ajax({
            type: "POST",
            url: CubeViz_Config.cubevizPath + "getdatasets/",
            data: {
                m: CubeViz_Config.selectedModel,
                dsdUrl: dsdUrl
            }
        }).done(function (entries) {
            DataSet.prepareLoadedDataSets(entries, callback);
        });
    }
    DataSet.prepareLoadedDataSets = function prepareLoadedDataSets(entries, callback) {
        entries = $.parseJSON(entries);
        entries.sort(function (a, b) {
            return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        });
        callback(entries);
    }
    return DataSet;
})();
var Observation = (function () {
    function Observation() { }
    Observation.loadAll = function loadAll(dsUrl, dimensions, callback) {
        console.log("Observation loadAll");
        console.log({
            m: CubeViz_Config.selectedModel,
            dsUrl: dsUrl,
            dimensions: dimensions
        });
        $.ajax({
            type: "POST",
            url: CubeViz_Config.cubevizPath + "getalldimensionselements/",
            data: {
                m: CubeViz_Config.selectedModel,
                dsUrl: dsUrl,
                dimensions: dimensions
            }
        }).done(function (entries) {
            Observation.prepareLoadedObservations(entries, callback);
        });
    }
    Observation.prepareLoadedObservations = function prepareLoadedObservations(entries, callback) {
        entries = $.parseJSON(entries);
        callback(entries);
    }
    return Observation;
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
var CubeViz_Config = CubeViz_Config || {
};
var CubeViz_Link_Chosen_Module = CubeViz_Link_Chosen_Module || {
};
var CubeViz_Links_Module = CubeViz_Links_Module || {
};
var CubeViz_Parameters_Component = CubeViz_Parameters_Component || {
};
var CubeViz_Parameters_Module = CubeViz_Parameters_Module || {
};
var CubeViz_Dimension_Template = CubeViz_Dimension_Template || {
};
$(document).ready(function () {
    Module_Event.ready();
});
var Module_Event = (function () {
    function Module_Event() { }
    Module_Event.ready = function ready() {
        Module_Event.setupDataSetBox();
        Module_Event.setupDataStructureDefinitionBox();
    }
    Module_Event.onComplete_LoadComponents = function onComplete_LoadComponents(entries) {
        Module_Main.buildComponentSelection(entries);
        CubeViz_Parameters_Module.selectedDimensionComponents = entries;
        if(0 == entries.length) {
        } else {
            if(1 <= entries.length) {
                Observation.loadAll(CubeViz_Parameters_Module.selectedDS.url, CubeViz_Parameters_Module.selectedDimensionComponents, Module_Event.onComplete_LoadObservations);
            }
        }
    }
    Module_Event.onComplete_LoadObservations = function onComplete_LoadObservations(entries) {
        Component.updateSelectedDimensionComponents(entries);
        Module_Main.buildComponentSelection(CubeViz_Parameters_Module.selectedDimensionComponents);
    }
    Module_Event.onChange_DataStructureDefinitionBox = function onChange_DataStructureDefinitionBox() {
        var selectedElement = $($("#sidebar-left-data-selection-strc option:selected")[0]);
        var dsdLabel = selectedElement.text();
        var dsdUrl = selectedElement.attr("value");

        CubeViz_Parameters_Module.selectedDSD = {
            "label": dsdLabel,
            "url": dsdUrl
        };
        DataSet.loadAll(dsdUrl, Module_Event.onComplete_LoadDataSets);
    }
    Module_Event.onChange_DataSetBox = function onChange_DataSetBox() {
        var selectedElement = $($("#sidebar-left-data-selection-sets option:selected")[0]);
        var dsLabel = selectedElement.text();
        var dsUrl = selectedElement.attr("value");

        CubeViz_Parameters_Module.selectedDS = {
            "label": dsLabel,
            "url": dsUrl
        };
        Component.loadAll(CubeViz_Parameters_Module.selectedDSD.url, dsUrl, Module_Event.onComplete_LoadComponents);
    }
    Module_Event.onComplete_LoadDataSets = function onComplete_LoadDataSets(entries) {
        Module_Main.buildDataSetBox(entries);
        if(0 == entries.length) {
            CubeViz_Parameters_Module.selectedDS = {
            };
        } else {
            if(1 <= entries.length) {
                CubeViz_Parameters_Module.selectedDS = entries[0];
                Component.loadAll(CubeViz_Parameters_Module.selectedDSD.url, entries[0].url, Module_Event.onComplete_LoadComponents);
            }
        }
    }
    Module_Event.onComplete_LoadDataStructureDefinitions = function onComplete_LoadDataStructureDefinitions(entries) {
        Module_Main.buildDataStructureDefinitionBox(entries);
        if(0 == entries.length) {
            CubeViz_Parameters_Module.selectedDSD = {
            };
        } else {
            if(1 <= entries.length) {
                CubeViz_Parameters_Module.selectedDSD = entries[0];
                DataSet.loadAll(entries[0].url, Module_Event.onComplete_LoadDataSets);
            }
        }
    }
    Module_Event.setupDataStructureDefinitionBox = function setupDataStructureDefinitionBox() {
        DataStructureDefinition.loadAll(Module_Event.onComplete_LoadDataStructureDefinitions);
        $("#sidebar-left-data-selection-strc").change(Module_Event.onChange_DataStructureDefinitionBox);
    }
    Module_Event.setupDataSetBox = function setupDataSetBox() {
        $("#sidebar-left-data-selection-sets").change(Module_Event.onChange_DataSetBox);
    }
    return Module_Event;
})();
var Module_Main = (function () {
    function Module_Main() { }
    Module_Main.buildComponentSelection = function buildComponentSelection(options) {
        try  {
            options = {
                "dimensions": options
            };
            var tpl = jsontemplate.Template(CubeViz_Dimension_Template);
            $("#sidebar-left-data-selection-dims-boxes").html(tpl.expand(options));
        } catch (e) {
            System.out("buildComponentSelection error");
            System.out(e);
        }
    }
    Module_Main.buildDataSetBox = function buildDataSetBox(options) {
        var entry = null;
        $("#sidebar-left-data-selection-sets").empty();
        for(var i in options) {
            entry = $("<option value=\"" + options[i].url + "\">" + options[i].label + "</option>");
            $("#sidebar-left-data-selection-sets").append(entry);
        }
    }
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
