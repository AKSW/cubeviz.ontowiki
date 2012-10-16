var Component = (function () {
    function Component() { }
    Component.loadAll = function loadAll(dsdUrl, dsUrl, callback) {
        $.ajax({
            url: CubeViz_Parameters_Module.cubevizPath + "getcomponents/",
            data: {
                m: CubeViz_Parameters_Module.modelUrl,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "dimension"
            }
        }).done(function (entries) {
            Component.prepareLoadedComponents(entries, callback);
        });
    }
    Component.prepareLoadedComponents = function prepareLoadedComponents(entries, callback) {
        console.log(entries);
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
            url: CubeViz_Parameters_Module.cubevizPath + "getdatastructuredefinitions/",
            data: {
                m: CubeViz_Parameters_Module.modelUrl
            }
        }).done(function (entries) {
            DataStructureDefinition.prepareLoadedDataStructureDefinitions(entries, callback);
        });
    }
    DataStructureDefinition.prepareLoadedDataStructureDefinitions = function prepareLoadedDataStructureDefinitions(entries, callback) {
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
            url: CubeViz_Parameters_Module.cubevizPath + "getdatasets/",
            data: {
                m: CubeViz_Parameters_Module.modelUrl,
                dsdUrl: dsdUrl
            }
        }).done(function (entries) {
            DataSet.prepareLoadedDataSets(entries, callback);
        });
    }
    DataSet.prepareLoadedDataSets = function prepareLoadedDataSets(entries, callback) {
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
        $.ajax({
            url: CubeViz_Parameters_Module.cubevizPath + "getalldimensionselements/",
            data: {
                m: CubeViz_Parameters_Module.modelUrl,
                dsUrl: dsUrl,
                dimensions: dimensions
            }
        }).done(function (entries) {
            Observation.prepareLoadedObservations(entries, callback);
        });
    }
    Observation.prepareLoadedObservations = function prepareLoadedObservations(entries, callback) {
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
var CubeViz_Dialog_Template = CubeViz_Dialog_Template || {
};
var CubeViz_Dimension_Template = CubeViz_Dimension_Template || {
};
$(document).ready(function () {
    Module_Event.ready();
});
var Module_Event = (function () {
    function Module_Event() { }
    Module_Event.ready = function ready() {
        Module_Main.setupAjax();
        Module_Event.setupDataSetBox();
        Module_Event.setupDataStructureDefinitionBox();
    }
    Module_Event.onClick_DialogSelector = function onClick_DialogSelector() {
        var dimension = $(this).attr("dimension").toString();
        Module_Main.buildDimensionDialog(dimension, CubeViz_Parameters_Module.loadedObservations);
        Module_Event.setupDialogSelectorCloseButton(dimension);
    }
    Module_Event.onClick_DialogSelectorCloseButton = function onClick_DialogSelectorCloseButton() {
        var dimension = $(this).attr("dimension").toString();
        $("#dimensionDialogContainer").fadeOut(500).html("");
    }
    Module_Event.onComplete_LoadComponents = function onComplete_LoadComponents(entries) {
        Module_Main.buildComponentSelection(entries);
        CubeViz_Parameters_Module.selectedDimensionComponents = entries;
        if(0 == entries.length) {
        } else {
            if(1 <= entries.length) {
                Observation.loadAll(CubeViz_Links_Module.selectedDS.url, CubeViz_Parameters_Module.selectedDimensionComponents, Module_Event.onComplete_LoadObservations);
            }
        }
    }
    Module_Event.onComplete_LoadObservations = function onComplete_LoadObservations(entries) {
        CubeViz_Parameters_Module.loadedObservations = entries;
        Component.updateSelectedDimensionComponents(entries);
        Module_Main.buildComponentSelection(CubeViz_Parameters_Module.selectedDimensionComponents);
        Module_Event.setupDialogSelector();
    }
    Module_Event.onChange_DataStructureDefinitionBox = function onChange_DataStructureDefinitionBox() {
        var selectedElement = $($("#sidebar-left-data-selection-strc option:selected")[0]);
        var dsdLabel = selectedElement.text();
        var dsdUrl = selectedElement.attr("value");

        CubeViz_Links_Module.selectedDSD = {
            "label": dsdLabel,
            "url": dsdUrl
        };
        DataSet.loadAll(dsdUrl, Module_Event.onComplete_LoadDataSets);
    }
    Module_Event.onChange_DataSetBox = function onChange_DataSetBox() {
        var selectedElement = $($("#sidebar-left-data-selection-sets option:selected")[0]);
        var dsLabel = selectedElement.text();
        var dsUrl = selectedElement.attr("value");

        CubeViz_Links_Module.selectedDS = {
            "label": dsLabel,
            "url": dsUrl
        };
        Component.loadAll(CubeViz_Links_Module.selectedDSD.url, dsUrl, Module_Event.onComplete_LoadComponents);
    }
    Module_Event.onComplete_LoadDataSets = function onComplete_LoadDataSets(entries) {
        Module_Main.buildDataSetBox(entries, CubeViz_Links_Module.selectedDS.url);
        if(0 == entries.length) {
            CubeViz_Parameters_Module.selectedDS = {
            };
        } else {
            if(1 <= entries.length) {
                Component.loadAll(CubeViz_Links_Module.selectedDSD.url, CubeViz_Links_Module.selectedDS.url, Module_Event.onComplete_LoadComponents);
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
                DataSet.loadAll(CubeViz_Links_Module.selectedDSD.url, Module_Event.onComplete_LoadDataSets);
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
    Module_Event.setupDialogSelector = function setupDialogSelector() {
        $(".open-dialog-selector").click(Module_Event.onClick_DialogSelector);
    }
    Module_Event.setupDialogSelectorCloseButton = function setupDialogSelectorCloseButton(dimension) {
        $("#dialog-btn-close-" + dimension).click(Module_Event.onClick_DialogSelectorCloseButton);
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
    Module_Main.buildDataSetBox = function buildDataSetBox(options, selectedDataSetUrl) {
        var entry = null;
        $("#sidebar-left-data-selection-sets").empty();
        for(var i in options) {
            entry = $("<option value=\"" + options[i].url + "\">" + options[i].label + "</option>");
            if(selectedDataSetUrl == options[i].url) {
                entry.attr("selected", "selected");
            }
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
    Module_Main.buildDimensionDialog = function buildDimensionDialog(dimension, loadedObservations) {
        try  {
            var tpl = jsontemplate.Template(CubeViz_Dialog_Template);
            $("#dimensionDialogContainer").html(tpl.expand({
                "dimension": dimension,
                "label": dimension,
                "list": loadedObservations[dimension]
            }));
            $("#dimensionDialogContainer").fadeIn(1000);
        } catch (e) {
            System.out("buildDimensionDialog1 error");
            System.out(e);
        }
    }
    Module_Main.setupAjax = function setupAjax() {
        $.ajaxSetup({
            async: true,
            cache: false,
            crossDomain: true,
            dataType: "json",
            type: "POST"
        });
    }
    return Module_Main;
})();
