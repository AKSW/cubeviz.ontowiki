var Component = (function () {
    function Component() { }
    Component.loadAllDimensions = function loadAllDimensions(dsdUrl, dsUrl, callback, resetSelectedComponents) {
        if (typeof resetSelectedComponents === "undefined") { resetSelectedComponents = false; }
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "getcomponents/",
            data: {
                m: CubeViz_Links_Module.modelUrl,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "dimension"
            }
        }).done(function (entries) {
            Component.prepareLoadedAllDimensions(entries, callback, resetSelectedComponents);
        });
    }
    Component.prepareLoadedAllDimensions = function prepareLoadedAllDimensions(entries, callback, resetSelectedComponents) {
        if (typeof resetSelectedComponents === "undefined") { resetSelectedComponents = false; }
        entries.sort(function (a, b) {
            return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        });
        var tmpEntries = {
        };
        for(var i in entries) {
            tmpEntries[entries[i]["label"]] = entries[i];
        }
        callback({
            "dimensions": tmpEntries
        }, resetSelectedComponents);
    }
    Component.getDefaultSelectedDimensions = function getDefaultSelectedDimensions(componentDimensions) {
        componentDimensions = System.deepCopy(componentDimensions);
        var result = {
        };
        for(var dimensionLabel in componentDimensions) {
            result[dimensionLabel] = componentDimensions[dimensionLabel];
            result[dimensionLabel].elements = [
                result[dimensionLabel].elements[0]
            ];
        }
        return result;
    }
    return Component;
})();
var DataStructureDefinition = (function () {
    function DataStructureDefinition() { }
    DataStructureDefinition.loadAll = function loadAll(callback) {
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "getdatastructuredefinitions/",
            data: {
                m: CubeViz_Links_Module.modelUrl
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
            url: CubeViz_Links_Module.cubevizPath + "getdatasets/",
            data: {
                m: CubeViz_Links_Module.modelUrl,
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
    Observation.loadAll = function loadAll(dsdUrl, dsUrl, callback) {
        $.ajax({
            url: CubeViz_Links_Module["cubevizPath"] + "getresultobservations/",
            data: {
                m: CubeViz_Links_Module["modelUrl"],
                lC: CubeViz_Links_Module["linkCode"],
                sparqlEndpoint: "local"
            }
        }).done(function (entries) {
            Observation.prepareLoadedResultObservations(entries, callback);
        });
    }
    Observation.prepareLoadedResultObservations = function prepareLoadedResultObservations(entries, callback) {
        callback($.parseJSON(entries));
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
    System.deepCopy = function deepCopy(elementToCopy) {
        var newElement = $.parseJSON(JSON.stringify(elementToCopy));
        return newElement;
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
        System.out("CubeViz_Links_Module:");
        System.out(CubeViz_Links_Module);
        Module_Main.setupAjax();
        Module_Event.setupDataSetBox();
        Module_Event.setupDataStructureDefinitionBox();
        Module_Event.setupShowVisualizationButton();
    }
    Module_Event.onClick_DialogSelector = function onClick_DialogSelector() {
        var dimensionLabel = $(this).attr("dimensionLabel").toString();
        var dimensionType = $(this).attr("dimensionType").toString();
        var dimensionUrl = $(this).attr("dimensionUrl").toString();
        Module_Main.buildDimensionDialog(dimensionLabel, dimensionType, dimensionUrl, CubeViz_Links_Module.components["dimensions"][dimensionLabel]["elements"]);
        Module_Event.setupDialogSelectorCloseButton(dimensionLabel);
    }
    Module_Event.onClick_DialogSelectorCloseButton = function onClick_DialogSelectorCloseButton() {
        var elements = [];
        var dimensionLabel = $(this).attr("dimensionLabel").toString();
        var dimensionType = $(this).attr("dimensionType").toString();
        var dimensionUrl = $(this).attr("dimensionUrl").toString();
        var property = "";
        var propertyLabel = "";

        CubeViz_Links_Module["selectedComponents"]["dimensions"][dimensionLabel]["elements"] = [];
        $(".dialog-checkbox-" + dimensionLabel).each(function (i, ele) {
            if("checked" == $(ele).attr("checked")) {
                property = $(ele).attr("property");
                propertyLabel = $(ele).attr("propertyLabel");
                elements.push({
                    "property": property,
                    "property_label": propertyLabel,
                    "dimension_label": dimensionLabel,
                    "dimension_type": dimensionType,
                    "dimension_url": dimensionUrl
                });
            }
        });
        CubeViz_Links_Module["selectedComponents"]["dimensions"][dimensionLabel]["elements"] = elements;
        $("#dimensionDialogContainer").fadeOut(500).html("");
    }
    Module_Event.onClick_ShowVisualizationButton = function onClick_ShowVisualizationButton() {
        window.location.href = CubeViz_Links_Module["cubevizPath"];
    }
    Module_Event.onComplete_LoadAllComponentDimensions = function onComplete_LoadAllComponentDimensions(entries, resetSelectedComponents) {
        if (typeof resetSelectedComponents === "undefined") { resetSelectedComponents = false; }
        if(true == resetSelectedComponents) {
            CubeViz_Links_Module.selectedComponents.dimensions = Component.getDefaultSelectedDimensions(entries.dimensions);
        } else {
        }
        CubeViz_Links_Module.components = entries;
        Module_Main.buildComponentSelection(CubeViz_Links_Module.components, CubeViz_Links_Module.selectedComponents);
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
        CubeViz_Links_Module.selectedDS = null;
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
        Component.loadAllDimensions(CubeViz_Links_Module.selectedDSD.url, dsUrl, Module_Event.onComplete_LoadAllComponentDimensions);
    }
    Module_Event.onComplete_LoadDataSets = function onComplete_LoadDataSets(entries) {
        if(0 == entries.length) {
            System.out("onComplete_LoadDataSets");
            System.out("no data sets were loaded");
        } else {
            if(1 <= entries.length) {
                var resetSelectedComponents = false;
                if(null == CubeViz_Links_Module.selectedDS) {
                    CubeViz_Links_Module.selectedDS = entries[0];
                    resetSelectedComponents = true;
                }
                Module_Main.buildDataSetBox(entries, CubeViz_Links_Module.selectedDS.url);
                Component.loadAllDimensions(CubeViz_Links_Module.selectedDSD.url, CubeViz_Links_Module.selectedDS.url, Module_Event.onComplete_LoadAllComponentDimensions, resetSelectedComponents);
            }
        }
    }
    Module_Event.onComplete_LoadDataStructureDefinitions = function onComplete_LoadDataStructureDefinitions(entries) {
        Module_Main.buildDataStructureDefinitionBox(entries, CubeViz_Links_Module.selectedDSD.url);
        if(0 == entries.length) {
            CubeViz_Parameters_Module.selectedDSD = {
            };
            System.out("onComplete_LoadDataStructureDefinitions");
            System.out("no data structure definitions were loaded");
        } else {
            if(1 <= entries.length) {
                DataSet.loadAll(CubeViz_Links_Module["selectedDSD"]["url"], Module_Event.onComplete_LoadDataSets);
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
    Module_Event.setupDialogSelectorCloseButton = function setupDialogSelectorCloseButton(dimensionLabel) {
        $("#dialog-btn-close-" + dimensionLabel).click(Module_Event.onClick_DialogSelectorCloseButton);
    }
    Module_Event.setupShowVisualizationButton = function setupShowVisualizationButton() {
        $("#sidebar-left-data-selection-submitbtn").click(Module_Event.onClick_ShowVisualizationButton);
    }
    return Module_Event;
})();
var Module_Main = (function () {
    function Module_Main() { }
    Module_Main.buildComponentSelection = function buildComponentSelection(components, selectedComponents) {
        var selectedComLength = 1;
        var tplEntries = {
            "dimensions": []
        };

        for(var com in components["dimensions"]) {
            selectedComLength = selectedComponents["dimensions"][com]["elements"]["length"] || 1;
            com = components["dimensions"][com];
            com["selectedElementCount"] = selectedComLength;
            com["elementCount"] = com["elements"]["length"];
            tplEntries["dimensions"].push(com);
        }
        try  {
            var tpl = jsontemplate.Template(CubeViz_Dimension_Template);
            $("#sidebar-left-data-selection-dims-boxes").html(tpl.expand(tplEntries));
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
    Module_Main.buildDataStructureDefinitionBox = function buildDataStructureDefinitionBox(options, selectedDsdUrl) {
        var entry = null;
        $("#sidebar-left-data-selection-strc").empty();
        for(var i in options) {
            entry = $("<option value=\"" + options[i].url + "\">" + options[i].label + "</option>");
            if(options[i].url == selectedDsdUrl) {
                entry.attr("selected", "selected");
            }
            $("#sidebar-left-data-selection-strc").append(entry);
        }
    }
    Module_Main.buildDimensionDialog = function buildDimensionDialog(dimensionLabel, dimensionType, dimensionUrl, componentDimensionElements) {
        try  {
            var tpl = jsontemplate.Template(CubeViz_Dialog_Template);
            $("#dimensionDialogContainer").html(tpl.expand({
                "dimensionLabel": dimensionLabel,
                "dimensionType": dimensionType,
                "dimensionUrl": dimensionUrl,
                "list": componentDimensionElements
            }));
            var elements = CubeViz_Links_Module["selectedComponents"]["dimensions"][dimensionLabel]["elements"];
            var selectedDimensionUrls = [];

            for(var index in elements) {
                selectedDimensionUrls.push(elements[index].property);
            }
            $(".dialog-checkbox-" + dimensionLabel).each(function (i, ele) {
                if(0 <= $.inArray($(ele).attr("value").toString(), selectedDimensionUrls)) {
                    $(ele).attr("checked", "checked");
                }
            });
            $("#dimensionDialogContainer").fadeIn(1000);
        } catch (e) {
            System.out("buildDimensionDialog error");
            System.out(e);
        }
    }
    Module_Main.setupAjax = function setupAjax() {
        $.ajaxSetup({
            async: true,
            cache: false,
            crossDomain: true,
            dataType: "json",
            dataType: "json",
            type: "POST"
        });
    }
    return Module_Main;
})();
