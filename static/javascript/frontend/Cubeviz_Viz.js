var ChartSelector = (function () {
    function ChartSelector() { }
    ChartSelector.itemClicked = -1;
    ChartSelector.buildMenu = function buildMenu(options) {
        try  {
            var finalHtml = "";
            var tpl = {
            };
            var chartSelectorArrays = {
                "entries": []
            };

            for(var index in options) {
                switch(options[index]["type"]) {
                    case "array": {
                        chartSelectorArrays["entries"].push(options[index]);
                        break;

                    }
                    default: {
                        continue;
                        break;

                    }
                }
            }
            tpl = jsontemplate.Template(ChartSelector_Array);
            finalHtml += tpl.expand(chartSelectorArrays);
            return finalHtml;
        } catch (e) {
            System.out("buildComponentSelection error");
            System.out(e);
        }
    }
    ChartSelector.init = function init(suiteableCharts, onClick_Function) {
        $("#chartSelection").html("");
        var iconPath = "";
        var name = "";
        var item = null;
        var icon = null;
        var nr = 0;

        $.each(suiteableCharts, function (index, element) {
            if(undefined == element) {
            } else {
                iconPath = CubeViz_Config["imagesPath"] + element["icon"];
                name = element["class"];
                item = $("<div></div>").addClass("chartSelector-item").attr("className", name);
                icon = $("<img/>").attr({
                    "src": iconPath,
                    "name": name,
                    "class": "chartSelectionItem"
                }).data("nr", nr++).appendTo(item);
                item.appendTo($("#chartSelection"));
            }
        });
        $("#chartSelection").addClass("chartSelector");
        $(".chartSelector-options-toggle").click(function () {
            $(".chartSelector-item-options").eq(this.itemFocused).toggle();
            $(".chartSelector-options-toggle.shut").toggle();
            $(".chartSelector-options-toggle.copen").toggle();
        });
        $(".chartSelector-item").each(function (nr) {
            $(this).attr("nr", nr);
            $(this).click(onClick_Function);
        });
        $("#chartSelection").attr("lastSelection", 0);
    }
    return ChartSelector;
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
var Observation = (function () {
    function Observation() {
        this._axes = {
        };
        this._selectedDimensionUris = [];
    }
    Observation.prototype.addAxisEntryPointsTo = function (uri, value, dimensionValues) {
        if(false == this.existsPointsToEntry(uri, value, dimensionValues)) {
            for(var dimensionUri in dimensionValues) {
                dimensionValues[dimensionUri] = {
                    "value": dimensionValues[dimensionUri],
                    "ref": this["_axes"][dimensionUri][dimensionValues[dimensionUri]]
                };
            }
            this["_axes"][uri][value].push(dimensionValues);
        }
    };
    Observation.prototype.extractSelectedDimensionUris = function (elements) {
        var resultList = [];
        for(var i in elements) {
            resultList.push(elements[i]["type"]);
        }
        return resultList;
    };
    Observation.prototype.existsPointsToEntry = function (uri, value, dimensionValues) {
        var pointsTo = null;
        var allTheSame = false;

        if(1 > this["_axes"][uri][value]["length"]) {
            return false;
        }
        for(var pointsToIndex in this["_axes"][uri][value]) {
            pointsTo = this["_axes"][uri][value][pointsToIndex];
            for(var i in pointsTo) {
                allTheSame = false;
                for(var dimensionUri in dimensionValues) {
                    if(pointsTo[i]["value"] == dimensionValues[dimensionUri]) {
                        allTheSame = true;
                    } else {
                        allTheSame = false;
                        break;
                    }
                }
                if(true == allTheSame) {
                    return true;
                }
            }
        }
        return false;
    };
    Observation.prototype.getAxisElements = function (axisUri) {
        if("undefined" != System.toType(this["_axes"][axisUri])) {
            return this["_axes"][axisUri];
        } else {
            System.out("\nNo elements found given axisUri: " + axisUri);
            return [];
        }
    };
    Observation.prototype.initialize = function (entries, selectedComponentDimensions, measureUri) {
        if("array" != System.toType(entries) || 0 == entries["length"]) {
            System.out("\nEntries is empty or not an array!");
            return;
        }
        console.log("Observation -> initialize > entries");
        console.log(entries);
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
            if("undefined" == System.toType(this["_axes"][measureUri])) {
                this["_axes"][measureUri] = {
                };
            }
            this["_axes"][measureUri] = {
            };
            this["_axes"][measureUri][entries[mainIndex][measureUri][0]["value"]] = [];
            for(var i in this["_selectedDimensionUris"]) {
                selecDimUri = this["_selectedDimensionUris"][i];
                selecDimVal = entries[mainIndex][selecDimUri][0]["value"];
                dimensionValues[selecDimUri] = selecDimVal;
                this["_axes"][selecDimUri] = {
                } || this["_axes"][selecDimUri];
                this["_axes"][selecDimUri][selecDimVal] = [] || this["_axes"][selecDimUri][selecDimVal];
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
                    $.each(output, function (i, val) {
                        if("object" == typeof val) {
                            console.log(" ");
                            console.log("subobject");
                            System.out(val);
                        } else {
                            console.log(i + ": " + val);
                        }
                    });
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
var HighCharts = (function () {
    function HighCharts() { }
    HighCharts.loadChart = function loadChart(chartName) {
        switch(chartName) {
            case 'Bar': {
                return new HighCharts_Bar();

            }
            case 'Line': {
                return new HighCharts_Line();

            }
            case 'Pie': {
                return new HighCharts_Pie();

            }
            case 'Polar': {
                return new HighCharts_Polar();

            }
            default: {
                System.out("HighCharts - loadChart");
                System.out("Invalid chartName (" + chartName + ") given!");
                return;

            }
        }
    }
    return HighCharts;
})();
var HighCharts_Chart = (function () {
    function HighCharts_Chart() { }
    HighCharts_Chart.prototype.buildChartTitle = function (cubeVizLinksModule, retrievedObservations) {
        var dsdLabel = cubeVizLinksModule["selectedDSD"]["label"];
        var dsLabel = cubeVizLinksModule["selectedDS"]["label"];
        var oneElementDimensions = HighCharts_Chart.getOneElementDimensions(retrievedObservations, cubeVizLinksModule["selectedComponents"]["dimensions"], cubeVizLinksModule["selectedComponents"]["measures"]);
        var builtTitle = dsdLabel + " - " + dsLabel;

        for(var i in oneElementDimensions) {
            builtTitle += " - " + oneElementDimensions[i]["elements"][0]["property_label"];
        }
        return builtTitle;
    };
    HighCharts_Chart.prototype.init = function (entries, cubeVizLinksModule, chartConfig) {
        var forXAxis = null;
        var forSeries = null;
        var selectedComponentDimensions = cubeVizLinksModule["selectedComponents"]["dimensions"];
        var measures = cubeVizLinksModule["selectedComponents"]["measures"];
        var measureUri = HighCharts_Chart.extractMeasureValue(measures);
        var multipleDimensions = HighCharts_Chart.getMultipleDimensions(entries, selectedComponentDimensions, measures);
        var observation = new Observation();

        this["chartConfig"] = chartConfig;
        this["chartConfig"]["title"]["text"] = this.buildChartTitle(cubeVizLinksModule, entries);
        for(var dimensionLabel in selectedComponentDimensions) {
            if(null == forXAxis) {
                forXAxis = selectedComponentDimensions[dimensionLabel]["type"];
            } else {
                forSeries = selectedComponentDimensions[dimensionLabel]["type"];
            }
        }
        observation.initialize(entries, selectedComponentDimensions, measureUri);
        var xAxisElements = observation.sortAxis(forXAxis, "ascending").getAxisElements(forXAxis);
        for(var value in xAxisElements) {
            this["xAxis"]["categories"].push(this.getLabelForPropertyUri(value, forXAxis, selectedComponentDimensions));
        }
        var seriesElements = observation.getAxisElements(forSeries);
        var obj = {
        };

        this["series"] = [];
        for(var value in seriesElements) {
            obj = {
            };
            obj["name"] = this.getLabelForPropertyUri(value, forSeries, selectedComponentDimensions);
            obj["data"] = [];
            for(var i in xAxisElements) {
                for(var j in xAxisElements[i]) {
                    if(0 == multipleDimensions["length"] || 1 == multipleDimensions["length"]) {
                        obj["data"].push(xAxisElements[i][j][measureUri]["value"]);
                    } else {
                        if("undefined" != System.toType(xAxisElements[i][j][measureUri]["ref"]) && value == xAxisElements[i][j][measureUri]["ref"][0][forSeries]["value"]) {
                            obj["data"].push(xAxisElements[i][j][measureUri]["value"]);
                        } else {
                            obj["data"].push(null);
                        }
                    }
                }
            }
            this["series"].push(obj);
        }
        System.out("generated series:");
        System.out(this["series"]);
    };
    HighCharts_Chart.prototype.getRenderResult = function () {
        return {
        };
    };
    HighCharts_Chart.extractMeasureValue = function extractMeasureValue(measures) {
        for(var label in measures) {
            return measures[label]["type"];
        }
    }
    HighCharts_Chart.getOneElementDimensions = function getOneElementDimensions(retrievedData, selectedDimensions, measures) {
        var oneElementDimensions = [];
        var tmp = [];

        for(var dimensionLabel in selectedDimensions) {
            if(1 == selectedDimensions[dimensionLabel]["elements"]["length"]) {
                oneElementDimensions.push({
                    "dimensionLabel": dimensionLabel,
                    "elements": selectedDimensions[dimensionLabel]["elements"]
                });
            }
        }
        return oneElementDimensions;
    }
    HighCharts_Chart.getMultipleDimensions = function getMultipleDimensions(retrievedData, selectedDimensions, measures) {
        var multipleDimensions = [];
        var tmp = [];

        for(var dimensionLabel in selectedDimensions) {
            if(1 < selectedDimensions[dimensionLabel]["elements"]["length"]) {
                multipleDimensions.push({
                    "dimensionLabel": dimensionLabel,
                    "elements": selectedDimensions[dimensionLabel]["elements"]
                });
            }
        }
        return multipleDimensions;
    }
    HighCharts_Chart.getNumberOfMultipleDimensions = function getNumberOfMultipleDimensions(retrievedData, selectedDimensions, measures) {
        var dims = HighCharts_Chart.getMultipleDimensions(retrievedData, selectedDimensions, measures);
        return dims["length"];
    }
    HighCharts_Chart.getFromChartConfigByClass = function getFromChartConfigByClass(className, charts) {
        for(var i in charts) {
            if(className == charts[i]["class"]) {
                return charts[i];
            }
        }
    }
    HighCharts_Chart.prototype.getLabelForPropertyUri = function (propertyUri, dimensionType, selectedDimensions) {
        var dim = {
        };
        for(var dimensionLabel in selectedDimensions) {
            dim = selectedDimensions[dimensionLabel];
            if(dim["type"] == dimensionType) {
                for(var i in dim["elements"]) {
                    if(dim["elements"][i]["property"] == propertyUri) {
                        return dim["elements"][i]["property_label"];
                    }
                }
            }
        }
        return propertyUri;
    };
    HighCharts_Chart.setChartConfigClassEntry = function setChartConfigClassEntry(className, charts, newValue) {
        for(var i in charts) {
            if(className == charts[i]["class"]) {
                charts[i] = newValue;
            }
        }
    }
    return HighCharts_Chart;
})();
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var HighCharts_Bar = (function (_super) {
    __extends(HighCharts_Bar, _super);
    function HighCharts_Bar() {
        _super.apply(this, arguments);

        this.xAxis = {
            "categories": []
        };
        this.series = [];
        this.chartConfig = {
        };
    }
    HighCharts_Bar.prototype.getRenderResult = function () {
        this["chartConfig"]["xAxis"] = this["xAxis"];
        this["chartConfig"]["series"] = this["series"];
        return this.chartConfig;
    };
    return HighCharts_Bar;
})(HighCharts_Chart);
var HighCharts_Line = (function (_super) {
    __extends(HighCharts_Line, _super);
    function HighCharts_Line() {
        _super.apply(this, arguments);

        this.xAxis = {
            "categories": []
        };
        this.series = [];
        this.chartConfig = {
        };
    }
    HighCharts_Line.prototype.getRenderResult = function () {
        this.chartConfig["xAxis"] = this["xAxis"];
        this.chartConfig["series"] = this["series"];
        return this.chartConfig;
    };
    return HighCharts_Line;
})(HighCharts_Chart);
var HighCharts_Pie = (function (_super) {
    __extends(HighCharts_Pie, _super);
    function HighCharts_Pie() {
        _super.apply(this, arguments);

        this.series = [
            {
                "data": []
            }
        ];
        this.chartConfig = {
        };
    }
    HighCharts_Pie.prototype.init = function (entries, cubeVizLinksModule, chartConfig) {
        var selectedComponentDimensions = cubeVizLinksModule["selectedComponents"]["dimensions"];
        var measures = cubeVizLinksModule["selectedComponents"]["measures"];
        var multipleDimensions = HighCharts_Chart.getMultipleDimensions(entries, selectedComponentDimensions, measures);

        if(1 < multipleDimensions["length"]) {
            System.out("Pie chart is only suitable for one dimension!");
            System.out(multipleDimensions);
            return;
        }
        var data = [];
        var forXAxis = multipleDimensions[0]["elements"][0]["dimension_type"];
        var measureUri = HighCharts_Chart.extractMeasureValue(measures);
        var observation = new Observation();

        this["chartConfig"] = chartConfig;
        this["chartConfig"]["title"]["text"] = this.buildChartTitle(cubeVizLinksModule, entries);
        observation.initialize(entries, selectedComponentDimensions, measureUri);
        var xAxisElements = observation.sortAxis(forXAxis, "ascending").getAxisElements(forXAxis);
        data.push({
            "type": "pie",
            name: "TODO",
            "data": []
        });
        for(var value in xAxisElements) {
            data[0]["data"].push([
                value, 
                xAxisElements[value][0][measureUri]["value"]
            ]);
        }
        this["series"] = data;
        System.out("generated series:");
        System.out(this["series"]);
    };
    HighCharts_Pie.prototype.getRenderResult = function () {
        this.chartConfig["series"] = this["series"];
        return this.chartConfig;
    };
    return HighCharts_Pie;
})(HighCharts_Chart);
var HighCharts_Polar = (function (_super) {
    __extends(HighCharts_Polar, _super);
    function HighCharts_Polar() {
        _super.apply(this, arguments);

        this.xAxis = {
            "categories": []
        };
        this.series = [];
        this.chartConfig = {
        };
    }
    HighCharts_Polar.prototype.getRenderResult = function () {
        this.chartConfig["xAxis"] = this["xAxis"];
        this.chartConfig["series"] = this["series"];
        return this.chartConfig;
    };
    return HighCharts_Polar;
})(HighCharts_Chart);
var CubeViz_Config = CubeViz_Config || {
};
var CubeViz_Links_Module = CubeViz_Links_Module || {
};
var cubeVizUIChartConfig = cubeVizUIChartConfig || {
};
var CubeViz_ChartConfig = CubeViz_ChartConfig || {
};
var CubeViz_Data = CubeViz_Data || {
    "retrievedObservations": [],
    "numberOfMultipleDimensions": 0
};
var ChartSelector_Array = ChartSelector_Array || {
};
$(document).ready(function () {
    Viz_Event.ready();
});
var Viz_Event = (function () {
    function Viz_Event() { }
    Viz_Event.ready = function ready() {
        System.out("CubeViz_Config");
        System.out(CubeViz_Config);
        $("#showUpdateVisualizationButton").attr("value", "Update visualization");
        var container = $("#container").offset();
        var viewPort = $(window).height();
        var containerHeight = 0;
        $("#container").css("height", $(window).height() - container["top"] - 5);
        Observation.loadAll(CubeViz_Links_Module["linkCode"], Viz_Event.onComplete_LoadResultObservations);
    }
    Viz_Event.onClick_chartSelectionMenuButton = function onClick_chartSelectionMenuButton(event) {
        var newDefaultConfig = cubeVizUIChartConfig["selectedChartConfig"]["defaultConfig"];
        var key = "";
        var menuItems = $.makeArray($('*[name*="chartMenuItem"]'));
        var length = menuItems["length"];
        var value = "";

        for(var i = 1; i < length; ++i) {
            key = $(menuItems[i]).attr("key");
            value = $(menuItems[i]).attr("value");
            System.setObjectProperty(newDefaultConfig, key, ".", value);
        }
        cubeVizUIChartConfig["selectedChartConfig"]["defaultConfig"] = newDefaultConfig;
        HighCharts_Chart.setChartConfigClassEntry(cubeVizUIChartConfig["selectedChartConfig"]["class"], CubeViz_ChartConfig[CubeViz_Data["numberOfMultipleDimensions"]]["charts"], cubeVizUIChartConfig["selectedChartConfig"]);
        Viz_Main.renderChart(cubeVizUIChartConfig["selectedChartConfig"]["class"]);
    }
    Viz_Event.onClick_ChartSelectionItem = function onClick_ChartSelectionItem(event) {
        var currentNr = parseInt($(event["target"]).parent().attr("nr"));
        var lastUsedNr = parseInt($("#chartSelection").attr("lastSelection"));
        if(null == lastUsedNr || currentNr != lastUsedNr) {
            ChartSelector.itemClicked = currentNr;
            $(".chartSelector-item").removeClass("current").eq(currentNr).addClass("current");
            Viz_Main.renderChart($(this).attr("className"));
            cubeVizUIChartConfig["selectedChartClass"] = event["target"]["name"];
            ; ;
            $("#chartSelection").attr("lastSelection", currentNr);
            $(".chartSelector-item").removeClass("current");
            $(event["target"]).parent().addClass("current");
            Viz_Main.closeChartSelectionMenu();
        } else {
            var className = $(event["target"]).parent().attr("className");
            var fromChartConfig = HighCharts_Chart.getFromChartConfigByClass(className, CubeViz_ChartConfig[CubeViz_Data["numberOfMultipleDimensions"]]["charts"]);
            cubeVizUIChartConfig["oldSelectedChartConfig"] = System.deepCopy(fromChartConfig);
            cubeVizUIChartConfig["selectedChartConfig"] = fromChartConfig;
            Viz_Main.openChartSelectionMenu(fromChartConfig["options"], $(this).offset());
        }
    }
    Viz_Event.onComplete_LoadResultObservations = function onComplete_LoadResultObservations(entries) {
        CubeViz_Data["retrievedObservations"] = entries;
        CubeViz_Data["numberOfMultipleDimensions"] = HighCharts_Chart.getNumberOfMultipleDimensions(entries, CubeViz_Links_Module["selectedComponents"]["dimensions"], CubeViz_Links_Module["selectedComponents"]["measures"]);
        Viz_Main.renderChart(CubeViz_ChartConfig[CubeViz_Data["numberOfMultipleDimensions"]]["charts"][0]["class"]);
        ChartSelector.init(CubeViz_ChartConfig[CubeViz_Data["numberOfMultipleDimensions"]]["charts"], Viz_Event.onClick_ChartSelectionItem);
    }
    return Viz_Event;
})();
var Viz_Main = (function () {
    function Viz_Main() { }
    Viz_Main.closeChartSelectionMenu = function closeChartSelectionMenu() {
        $("#chartSelectionMenu").fadeOut(500);
    }
    Viz_Main.openChartSelectionMenu = function openChartSelectionMenu(options, offset) {
        if(0 < options["length"]) {
            var containerOffset = $("#container").offset();
            var menuWidth = parseInt($("#chartSelectionMenu").css("width"));
            var leftPosition = offset["left"] - containerOffset["left"] - menuWidth + 18;
            var topPosition = offset["top"] - 40;
            var generatedHtml = ChartSelector.buildMenu(options);
            var menuButton = $("<input/>").attr("id", "chartSelectionMenuButton").attr("type", "button").attr("class", "minibutton submit").attr("type", "button").attr("value", "update chart");

            $("#chartSelectionMenu").html(generatedHtml).append(menuButton).css("left", leftPosition).css("top", topPosition).fadeIn(500);
            $("#chartSelectionMenuButton").click(Viz_Event.onClick_chartSelectionMenuButton);
        }
    }
    Viz_Main.renderChart = function renderChart(className) {
        var charts = CubeViz_ChartConfig[CubeViz_Data["numberOfMultipleDimensions"]]["charts"];
        var fromChartConfig = HighCharts_Chart.getFromChartConfigByClass(className, charts);
        var chart = HighCharts.loadChart(className);
        chart.init(CubeViz_Data["retrievedObservations"], CubeViz_Links_Module, fromChartConfig["defaultConfig"]);
        new Highcharts.Chart(chart.getRenderResult());
    }
    return Viz_Main;
})();
