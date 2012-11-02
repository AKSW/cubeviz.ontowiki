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
        }).error(function (xhr, ajaxOptions, thrownError) {
            System.out("Component > loadAll > error");
            System.out("response text: " + xhr.responseText);
            System.out("error: " + thrownError);
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
var ConfigurationLink = (function () {
    function ConfigurationLink() { }
    ConfigurationLink.saveToServerFile = function saveToServerFile(cubeVizLinksModule, cubeVizUIChartConfig, callback) {
        $.ajax({
            url: CubeViz_Links_Module["cubevizPath"] + "savelinktofile/",
            data: {
                "cubeVizLinksModule": cubeVizLinksModule,
                "cubeVizUIChartConfig": cubeVizUIChartConfig
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            System.out("ConfigurationLink > loadAll > error");
            System.out("response text: " + xhr.responseText);
            System.out("error: " + thrownError);
        }).done(function (result) {
            callback(result);
        });
    }
    return ConfigurationLink;
})();
var DataStructureDefinition = (function () {
    function DataStructureDefinition() { }
    DataStructureDefinition.loadAll = function loadAll(callback) {
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "getdatastructuredefinitions/",
            data: {
                m: CubeViz_Links_Module["modelUrl"]
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            System.out("DataStructureDefinition > loadAll > error");
            System.out("response text: " + xhr["responseText"]);
            System.out("error: " + thrownError);
        }).done(function (entries) {
            DataStructureDefinition.prepareLoadedDataStructureDefinitions(entries, callback);
        });
    }
    DataStructureDefinition.prepareLoadedDataStructureDefinitions = function prepareLoadedDataStructureDefinitions(entries, callback) {
        entries.sort(function (a, b) {
            return a["label"].toUpperCase().localeCompare(b["label"].toUpperCase());
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
        }).error(function (xhr, ajaxOptions, thrownError) {
            System.out("DataSet > loadAll > error");
            System.out("response text: " + xhr.responseText);
            System.out("error: " + thrownError);
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
    function Observation() {
        this._axes = {
        };
        this._selectedDimensionUris = [];
    }
    Observation.prototype.addAxisEntryPointsTo = function (uri, value, dimensionValues) {
        for(var dimensionUri in dimensionValues) {
            dimensionValues[dimensionUri] = {
                "value": dimensionValues[dimensionUri],
                "ref": this["_axes"][dimensionUri][dimensionValues[dimensionUri]]
            };
        }
        this["_axes"][uri][value].push(dimensionValues);
    };
    Observation.prototype.extractSelectedDimensionUris = function (elements) {
        var resultList = [];
        for(var i in elements) {
            resultList.push(elements[i]["type"]);
        }
        return resultList;
    };
    Observation.prototype.getAxisElements = function (axisUri) {
        if("undefined" != System.toType(this["_axes"][axisUri])) {
            return this["_axes"][axisUri];
        } else {
            System.out("\nNo elements found given axisUri: " + axisUri);
            return {
            };
        }
    };
    Observation.prototype.initialize = function (entries, selectedComponentDimensions, measureUri) {
        if("array" != System.toType(entries) || 0 == entries["length"]) {
            System.out("\nEntries is empty or not an array!");
            return;
        }
        this["_selectedDimensionUris"] = this.extractSelectedDimensionUris(selectedComponentDimensions);
        var dimensionValues = {
        };
        var measureObj = {
        };
        var selecDimUri = "";
        var selecDimVal = "";

        for(var mainIndex in entries) {
            dimensionValues = {
            };
            measureObj = {
            };
            this["_axes"][measureUri] = this["_axes"][measureUri] || {
            };
            this["_axes"][measureUri][entries[mainIndex][measureUri][0]["value"]] = this["_axes"][measureUri][entries[mainIndex][measureUri][0]["value"]] || [];
            for(var i in this["_selectedDimensionUris"]) {
                selecDimUri = this["_selectedDimensionUris"][i];
                selecDimVal = entries[mainIndex][selecDimUri][0]["value"];
                dimensionValues[selecDimUri] = selecDimVal;
                if(undefined == this["_axes"][selecDimUri]) {
                    this["_axes"][selecDimUri] = {
                    };
                }
                if(undefined == this["_axes"][selecDimUri][selecDimVal]) {
                    this["_axes"][selecDimUri][selecDimVal] = [];
                }
                measureObj[measureUri] = entries[mainIndex][measureUri][0]["value"];
                this.addAxisEntryPointsTo(this["_selectedDimensionUris"][i], selecDimVal, measureObj);
            }
            this.addAxisEntryPointsTo(measureUri, entries[mainIndex][measureUri][0]["value"], dimensionValues);
        }
        return this;
    };
    Observation.loadAll = function loadAll(linkCode, callback) {
        $.ajax({
            url: CubeViz_Links_Module["cubevizPath"] + "getresultobservations/",
            data: {
                lC: linkCode
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            System.out("Observation > loadAll > error");
            System.out("response text: " + xhr.responseText);
            System.out("error: " + thrownError);
        }).done(function (entries) {
            Observation.prepareLoadedResultObservations(entries, callback);
        });
    }
    Observation.prepareLoadedResultObservations = function prepareLoadedResultObservations(entries, callback) {
        var parse = $.parseJSON(entries);
        if(null == parse) {
            callback(entries);
        } else {
            callback(parse);
        }
    }
    Observation.prototype.sortAxis = function (axisUri, mode) {
        var mode = "undefined" == System.toType(mode) ? "ascending" : mode;
        var sortedKeys = [];
        var sortedObj = {
        };

        for(var i in this["_axes"][axisUri]) {
            sortedKeys.push(i);
        }
        switch(mode) {
            case "descending": {
                sortedKeys.sort(function (a, b) {
                    a = a.toString().toLowerCase();
                    b = b.toString().toLowerCase();
                    return ((a > b) ? -1 : ((a < b) ? 1 : 0));
                });
                break;

            }
            default: {
                sortedKeys.sort(function (a, b) {
                    a = a.toString().toLowerCase();
                    b = b.toString().toLowerCase();
                    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
                });
                break;

            }
        }
        for(var i in sortedKeys) {
            sortedObj[sortedKeys[i]] = this["_axes"][axisUri][sortedKeys[i]];
        }
        this["_axes"][axisUri] = sortedObj;
        return this;
    };
    return Observation;
})();
var System = (function () {
    function System() { }
    System.contains = function contains(haystack, needle) {
        return -1 === System.strpos(haystack, needle) ? false : true;
    }
    System.countProperties = function countProperties(obj) {
        var keyCount = 0;
        var k = null;

        for(k in obj) {
            if(Object.prototype.hasOwnProperty.call(obj, k)) {
                ++keyCount;
            }
        }
        return keyCount;
    }
    System.deepCopy = function deepCopy(elementToCopy) {
        var newElement = $.parseJSON(JSON.stringify(elementToCopy));
        return newElement;
    }
    System.out = function out(output) {
        if(typeof console !== "undefined" && typeof console.log !== "undefined" && "development" == CubeViz_Config.context) {
            if($.browser && $.browser.msie) {
                if("object" != typeof output && "array" != typeof output) {
                    console.log(output);
                } else {
                    console.log(" ");
                    var val = null;
                    for(var i in output) {
                        val = output[i];
                        if("object" == typeof val) {
                            console.log(" ");
                            console.log("subobject");
                            System.out(val);
                        } else {
                            console.log(i + ": " + val);
                        }
                    }
                    ; ;
                }
            } else {
                console.log(output);
            }
        }
    }
    System.setObjectProperty = function setObjectProperty(obj, key, separator, value) {
        var keyList = key.split(separator);
        var call = "obj ";

        for(var i in keyList) {
            call += '["' + keyList[i] + '"]';
            eval(call + " = " + call + " || {};");
        }
        eval(call + " = value;");
    }
    System.setupAjax = function setupAjax() {
        $.ajaxSetup({
            "async": true,
            "cache": false,
            "crossDomain": true,
            "dataType": "json",
            "type": "POST"
        });
        $.support.cors = true;
    }
    System.strpos = function strpos(haystack, needle) {
        return (haystack + '').indexOf(needle, 0);
    }
    System.toType = function toType(ele) {
        return ({
        }).toString.call(ele).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }
    return System;
})();
var CubeViz_Config = CubeViz_Config || {
};
var CubeViz_Links_Module = CubeViz_Links_Module || {
};
var cubeVizUIChartConfig = cubeVizUIChartConfig || {
};
var CubeViz_Dialog_Template = CubeViz_Dialog_Template || {
};
var CubeViz_Dimension_Template = CubeViz_Dimension_Template || {
};
var tmpCubeVizLeftSidebarLeftQueue = [
    "onComplete_LoadDataStructureDefinitions", 
    "onComplete_LoadDataSets", 
    "onComplete_LoadAllComponentDimensions"
];
var CubeViz_Data = CubeViz_Data || {
    "retrievedObservations": [],
    "numberOfMultipleDimensions": 0
};
var Viz_Main = Viz_Main || undefined;
var Viz_Event = Viz_Event || undefined;
$(document).ready(function () {
    Module_Event.ready();
});
var Module_Event = (function () {
    function Module_Event() { }
    Module_Event.ready = function ready() {
        System.out("CubeViz_Links_Module:");
        System.out(CubeViz_Links_Module);
        System.setupAjax();
        Module_Main.showSidebarLoader();
        $("#sidebar-left-data-selection-sets").change(Module_Event.onChange_DataSetBox);
        DataStructureDefinition.loadAll(Module_Event.onComplete_LoadDataStructureDefinitions);
        $("#sidebar-left-data-selection-strc").change(Module_Event.onChange_DataStructureDefinitionBox);
        $("#showUpdateVisualizationButton").click(Module_Event.onClick_ShowVisualizationButton);
        $("#permaLinkButton").click(Module_Event.onClick_PermaLinkButton);
    }
    Module_Event.onClick_DialogSelector = function onClick_DialogSelector() {
        if("undefined" != System.toType(Viz_Main)) {
            Viz_Main.closeChartSelectionMenu();
        }
        var dimensionLabel = $(this).attr("dimensionLabel").toString();
        var dimensionType = $(this).attr("dimensionType").toString();
        var dimensionUrl = $(this).attr("dimensionUrl").toString();
        Module_Main.buildDimensionDialog(dimensionLabel, dimensionType, dimensionUrl, CubeViz_Links_Module.components["dimensions"][dimensionLabel]["elements"]);
        Module_Event.setupDialogSelectorCloseButton(dimensionLabel);
    }
    Module_Event.onClick_DialogSelectorCloseButton = function onClick_DialogSelectorCloseButton() {
        Module_Main.showSidebarLoader();
        Module_Main.addEntryFromSidebarLeftQueue("onClick_DialogSelectorCloseButton");
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
        ConfigurationLink.saveToServerFile(CubeViz_Links_Module, cubeVizUIChartConfig, Module_Event.onComplete_SaveConfigurationAfterChangeElements);
        $("#dimensionDialogContainer").fadeOut(500).html("");
        Module_Main.buildComponentSelection(CubeViz_Links_Module["components"], CubeViz_Links_Module["selectedComponents"]);
        Module_Event.setupDialogSelector();
    }
    Module_Event.onClick_PermaLinkButton = function onClick_PermaLinkButton() {
        if(undefined == $("#permaLinkButton").data("oldValue")) {
            $("#permaLinkButton").data("oldValue", $("#permaLinkButton").attr("value").toString()).attr("value", ">>").animate({
                width: 24
            }, 400, "linear", function () {
                var position = $("#permaLinkButton").position();
                $("#permaLinkMenu").css("top", position.top + 2).css("left", position.left + 32);
                var url = $("<a></a>").attr("href", CubeViz_Links_Module["cubevizPath"] + "?lC=" + CubeViz_Links_Module["linkCode"]).attr("target", "_self").html($("#permaLink").html());
                $("#permaLinkMenu").animate({
                    width: 'toggle'
                }, 400);
                $("#permaLink").html(url);
            });
        } else {
            $("#permaLinkMenu").fadeOut(400, function () {
                $("#permaLinkButton").animate({
                    width: 59
                }, 400).attr("value", $("#permaLinkButton").data("oldValue").toString()).data("oldValue", null);
            });
        }
    }
    Module_Event.onClick_ShowVisualizationButton = function onClick_ShowVisualizationButton() {
        if("undefined" == typeof Viz_Event) {
            window.location.href = CubeViz_Links_Module["cubevizPath"] + "?lC=" + CubeViz_Links_Module["linkCode"];
        } else {
            if("undefined" != System.toType(Viz_Main)) {
                Viz_Main.closeChartSelectionMenu();
            }
            Observation.loadAll(CubeViz_Links_Module["linkCode"], Viz_Event.onComplete_LoadResultObservations);
        }
    }
    Module_Event.onComplete_LoadAllComponentDimensions = function onComplete_LoadAllComponentDimensions(compDimensions) {
        var regenerateLinkCode = false;
        CubeViz_Links_Module["components"] = compDimensions;
        if(null == CubeViz_Links_Module["selectedComponents"]["dimensions"]) {
            CubeViz_Links_Module["selectedComponents"]["dimensions"] = Component.getDefaultSelectedDimensions(compDimensions["dimensions"]);
            regenerateLinkCode = true;
        }
        Module_Main.buildComponentSelection(CubeViz_Links_Module["components"], CubeViz_Links_Module["selectedComponents"]);
        if(true == regenerateLinkCode) {
            CubeViz_Links_Module["linkCode"] = null;
            console.log("lets generate a new link code for: ");
            console.log(CubeViz_Links_Module);
            ConfigurationLink.saveToServerFile(CubeViz_Links_Module, cubeVizUIChartConfig, function (newLinkCode) {
                CubeViz_Links_Module["linkCode"] = newLinkCode;
            });
        }
        Module_Event.setupDialogSelector();
        Module_Main.removeEntryFromSidebarLeftQueue("onComplete_LoadAllComponentDimensions");
        Module_Main.hideSidebarLoader();
    }
    Module_Event.onChange_DataStructureDefinitionBox = function onChange_DataStructureDefinitionBox() {
        var selectedElement = $($("#sidebar-left-data-selection-strc option:selected")[0]);
        var dsdLabel = selectedElement.text();
        var dsdUrl = selectedElement.attr("value");

        Module_Main.resetModuleParts();
        CubeViz_Links_Module["selectedDSD"] = {
            "label": dsdLabel,
            "url": dsdUrl
        };
        DataSet.loadAll(dsdUrl, Module_Event.onComplete_LoadDataSets);
        if("undefined" != System.toType(Viz_Main)) {
            Viz_Main.closeChartSelectionMenu();
        }
    }
    Module_Event.onChange_DataSetBox = function onChange_DataSetBox() {
        var selectedElement = $($("#sidebar-left-data-selection-sets option:selected")[0]);
        var dsLabel = selectedElement.text();
        var dsUrl = selectedElement.attr("value");

        Module_Main.resetModuleParts([
            "selectedDSD"
        ]);
        CubeViz_Links_Module["selectedDS"] = {
            "label": dsLabel,
            "url": dsUrl
        };
        Component.loadAllDimensions(CubeViz_Links_Module["selectedDSD"]["url"], dsUrl, Module_Event.onComplete_LoadAllComponentDimensions);
        if("undefined" != System.toType(Viz_Main)) {
            Viz_Main.closeChartSelectionMenu();
        }
    }
    Module_Event.onComplete_LoadDataSets = function onComplete_LoadDataSets(entries) {
        if(0 == entries["length"]) {
            System.out("onComplete_LoadDataSets");
            System.out("no data sets were loaded");
        } else {
            if(1 <= entries["length"]) {
                var resetSelectedComponents = false;
                if(null == CubeViz_Links_Module["selectedDS"]) {
                    CubeViz_Links_Module["selectedDS"] = entries[0];
                } else {
                }
                Module_Main.buildDataSetBox(entries, CubeViz_Links_Module["selectedDS"]["url"]);
                Component.loadAllDimensions(CubeViz_Links_Module["selectedDSD"]["url"], CubeViz_Links_Module["selectedDS"]["url"], Module_Event.onComplete_LoadAllComponentDimensions, resetSelectedComponents);
                Module_Main.removeEntryFromSidebarLeftQueue("onComplete_LoadDataSets");
            }
        }
    }
    Module_Event.onComplete_LoadDataStructureDefinitions = function onComplete_LoadDataStructureDefinitions(dataStructureDefinitions) {
        Module_Main.buildDataStructureDefinitionBox(dataStructureDefinitions, CubeViz_Links_Module["selectedDSD"]["url"]);
        if(0 == dataStructureDefinitions["length"]) {
            CubeViz_Links_Module["selectedDSD"] = {
            };
            System.out("onComplete_LoadDataStructureDefinitions");
            System.out("no data structure definitions were loaded");
        } else {
            if(1 <= dataStructureDefinitions["length"]) {
                Module_Main.removeEntryFromSidebarLeftQueue("onComplete_LoadDataStructureDefinitions");
                DataSet.loadAll(CubeViz_Links_Module["selectedDSD"]["url"], Module_Event.onComplete_LoadDataSets);
            }
        }
    }
    Module_Event.onComplete_SaveConfigurationAfterChangeElements = function onComplete_SaveConfigurationAfterChangeElements(result) {
        CubeViz_Links_Module["linkCode"] = result;
        Module_Main.removeEntryFromSidebarLeftQueue("onClick_DialogSelectorCloseButton");
        Module_Main.hideSidebarLoader();
    }
    Module_Event.setupDialogSelector = function setupDialogSelector() {
        $(".open-dialog-selector").click(Module_Event.onClick_DialogSelector);
    }
    Module_Event.setupDialogSelectorCloseButton = function setupDialogSelectorCloseButton(dimensionLabel) {
        $("#dialog-btn-close-" + dimensionLabel).click(Module_Event.onClick_DialogSelectorCloseButton);
    }
    return Module_Event;
})();
var Module_Main = (function () {
    function Module_Main() { }
    Module_Main.addEntryFromSidebarLeftQueue = function addEntryFromSidebarLeftQueue(entry) {
        tmpCubeVizLeftSidebarLeftQueue.push(entry);
    }
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
            entry = $("<option value=\"" + options[i]["url"] + "\">" + options[i]["label"] + "</option>");
            if(options[i]["url"] == selectedDsdUrl) {
                entry.attr("selected", "selected");
            }
            $("#sidebar-left-data-selection-strc").append(entry);
        }
    }
    Module_Main.buildDimensionDialog = function buildDimensionDialog(dimensionLabel, dimensionType, dimensionUrl, componentDimensionElements) {
        try  {
            var tpl = jsontemplate.Template(CubeViz_Dialog_Template);
            componentDimensionElements.sort(function (a, b) {
                a = a["property_label"].toUpperCase();
                b = b["property_label"].toUpperCase();
                return a < b ? -1 : (a > b ? 1 : 0);
            });
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
    Module_Main.hideSidebarLoader = function hideSidebarLoader() {
        if(0 == tmpCubeVizLeftSidebarLeftQueue["length"]) {
            $("#sidebar-left-loader").fadeOut(400);
        }
    }
    Module_Main.removeEntryFromSidebarLeftQueue = function removeEntryFromSidebarLeftQueue(entry) {
        var newQueue = [];
        for(var index in Module_Main.removeEntryFromSidebarLeftQueue) {
            if(entry != Module_Main.removeEntryFromSidebarLeftQueue[index]) {
                newQueue.push(Module_Main.removeEntryFromSidebarLeftQueue[index]);
            }
        }
        tmpCubeVizLeftSidebarLeftQueue = newQueue;
    }
    Module_Main.resetModuleParts = function resetModuleParts(exceptOf) {
        if (typeof exceptOf === "undefined") { exceptOf = []; }
        if(-1 == $.inArray("selectedDSD", exceptOf)) {
            CubeViz_Links_Module["selectedDSD"] = null;
        }
        if(-1 == $.inArray("selectedDS", exceptOf)) {
            CubeViz_Links_Module["selectedDS"] = null;
        }
        if(-1 == $.inArray("linkCode", exceptOf)) {
            CubeViz_Links_Module["linkCode"] = null;
        }
        if(-1 == $.inArray("selectedComponents.dimensions", exceptOf)) {
            CubeViz_Links_Module["selectedComponents"]["dimensions"] = null;
        }
        if(-1 == $.inArray("components.dimensions", exceptOf)) {
            CubeViz_Links_Module["components"]["dimensions"] = null;
        }
    }
    Module_Main.showSidebarLoader = function showSidebarLoader() {
        $("#sidebar-left-loader").fadeIn(1000).css("height", ($("#sidebar-left").css("height")));
    }
    return Module_Main;
})();
