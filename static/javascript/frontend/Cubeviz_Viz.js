var ChartSelector = (function () {
    function ChartSelector() { }
    ChartSelector.callbackOnFocus_Item = null;
    ChartSelector.itemPadding = 2;
    ChartSelector.itemBorder = 2;
    ChartSelector.itemFocused = -1;
    ChartSelector.status = 0;
    ChartSelector.onFocus_Item = function onFocus_Item(nr) {
    }
    ChartSelector.onClick_Item = function onClick_Item(event) {
    }
    ChartSelector.init = function init(nr) {
        $(".chartSelector-options-toggle").click(function () {
            $(".chartSelector-item-options").eq(this.itemFocused).toggle();
            $(".chartSelector-options-toggle.shut").toggle();
            $(".chartSelector-options-toggle.copen").toggle();
        });
        $(".chartSelector-item").each(function (nr) {
            $(this).attr("nr", nr);
            $(this).click(ChartSelector.onClick_Item);
        });
        $("#chartSelection").attr("lastSelection", 0);
        ChartSelector.status = 1;
        if(typeof nr == "undefined") {
            ChartSelector.itemFocused = 0;
            ChartSelector.focusItem(0);
        } else {
            ChartSelector.focusItem(nr);
        }
    }
    ChartSelector.focusItem = function focusItem(nr) {
        console.log("focusItem");
        if(ChartSelector.status == 0) {
            throw "ChartSelector.focusItem: Not initialized";
        }
        if(nr < 0) {
            throw "ChartSelector.focusItem: Invalid item nr";
        }
        if(ChartSelector.itemFocused == nr) {
            return;
        }
        var containerOptions = $(".chartSelector-options");
        var item = $(".chartSelector-item").eq(nr);
        if(!item.size()) {
            throw "ChartSelector.focusItem: Invalid item nr";
        }
        ChartSelector.itemFocused = nr;
        var optionNumber = $(".chartSelector-item-options").eq(nr).children().size();
        if(0 < optionNumber) {
            containerOptions.show();
        } else {
            containerOptions.hide();
        }
        $(".chartSelector-item-options").hide();
        $(".chartSelector-options-toggle.shut").show();
        $(".chartSelector-options-toggle.open").hide();
        $(".chartSelector-item").removeClass("current").eq(nr).addClass("current");
        if(ChartSelector.status == 1) {
            ChartSelector.status = 2;
        }
        ChartSelector.onFocus_Item(nr);
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
        }).error(function (result) {
            System.out(result.responseText);
        }).done(function (result) {
            callback(result);
        });
    }
    return ConfigurationLink;
})();
var Observation = (function () {
    function Observation() { }
    Observation.loadAll = function loadAll(linkCode, callback) {
        $.ajax({
            url: CubeViz_Links_Module["cubevizPath"] + "getresultobservations/",
            data: {
                lC: linkCode
            }
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
    return Observation;
})();
var System = (function () {
    function System() { }
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
            console.log(output);
        }
    }
    return System;
})();
var HighCharts = (function () {
    function HighCharts() { }
    HighCharts.loadChart = function loadChart(chartName) {
        switch(chartName) {
            case 'Pie': {
                return new HighCharts_Pie();

            }
            case 'Bar': {
                return new HighCharts_Bar();

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
    HighCharts_Chart.prototype.init = function (entries, selectedComponentDimensions, measures, chartConfig) {
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
    HighCharts_Chart.groupElementsByPropertiesUri = function groupElementsByPropertiesUri(dimensionTypeUri, propertiesValueUri, entries) {
        var seriesData = [];
        for(var mainIndex in entries) {
            for(var propertyUri in entries[mainIndex]) {
                if(propertyUri == dimensionTypeUri) {
                    if(undefined === seriesData[entries[mainIndex][propertyUri][0]["value"]]) {
                        seriesData[entries[mainIndex][propertyUri][0]["value"]] = [];
                    }
                    seriesData[entries[mainIndex][propertyUri][0]["value"]].push(entries[mainIndex][propertiesValueUri][0]["value"]);
                }
            }
        }
        return seriesData;
    }
    HighCharts_Chart.getFromChartConfigByClass = function getFromChartConfigByClass(className, charts) {
        for(var i in charts) {
            if(className == charts[i]["class"]) {
                return charts[i];
            }
        }
    }
    HighCharts_Chart.getValueByDimensionProperties = function getValueByDimensionProperties(retrievedData, dimensionProperties, propertiesValueUri) {
        var currentRetrDataValue = null;
        var dimProperty = null;

        for(var i in retrievedData) {
            for(var dimensionType in retrievedData[i]) {
                for(var iDP in dimensionProperties) {
                    if(dimensionProperties[iDP]["dimension_type"] == dimensionType) {
                        dimProperty = dimensionProperties[iDP]["property"];
                        currentRetrDataValue = retrievedData[i];
                        if(dimProperty == currentRetrDataValue[dimensionType][0]["value"]) {
                            return currentRetrDataValue[propertiesValueUri][0]["value"];
                        }
                    }
                }
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
    HighCharts_Bar.prototype.init = function (entries, selectedComponentDimensions, measures, chartConfig) {
        var dimensionLabels = [
            ""
        ];
        var forXAxis = null;
        var forSeries = null;

        this.chartConfig = chartConfig;
        for(var dimensionLabel in selectedComponentDimensions) {
            if(null == forXAxis) {
                forXAxis = selectedComponentDimensions[dimensionLabel];
            } else {
                forSeries = selectedComponentDimensions[dimensionLabel];
            }
        }
        this.xAxis.categories = [];
        for(var i in forXAxis["elements"]) {
            this.xAxis.categories.push(forXAxis["elements"][i]["property_label"]);
        }
        this.xAxis.categories.sort(function (a, b) {
            return a.toString().toUpperCase().localeCompare(b.toString().toUpperCase());
        });
        this.series = [];
        var seriesData = HighCharts_Chart.groupElementsByPropertiesUri(forSeries["type"], HighCharts_Chart.extractMeasureValue(measures), entries);
        for(var i in forSeries["elements"]) {
            this.series.push({
                "name": forSeries["elements"][i]["property_label"],
                "data": seriesData[forSeries["elements"][i]["property"]]
            });
        }
    };
    HighCharts_Bar.prototype.getRenderResult = function () {
        this.chartConfig["xAxis"] = this["xAxis"];
        this.chartConfig["series"] = this["series"];
        return this.chartConfig;
    };
    return HighCharts_Bar;
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
    HighCharts_Pie.prototype.init = function (retrievedData, selectedComponentDimensions, measures, chartConfig) {
        this.chartConfig = chartConfig;
        var multipleDimensions = HighCharts_Chart.getMultipleDimensions(retrievedData, selectedComponentDimensions, measures);
        if(1 < multipleDimensions["length"]) {
            System.out("Pie chart is only suitable for one dimension!");
            System.out(multipleDimensions);
            return;
        }
        var value = 0;
        for(var i in multipleDimensions[0]["elements"]) {
            value = HighCharts_Chart.getValueByDimensionProperties(retrievedData, [
                multipleDimensions[0]["elements"][i]
            ], HighCharts_Chart.extractMeasureValue(measures));
            value = undefined !== value ? value : 0;
            this["series"][0]["data"].push([
                multipleDimensions[0]["elements"][i]["property_label"], 
                value
            ]);
        }
    };
    HighCharts_Pie.prototype.getRenderResult = function () {
        this.chartConfig["series"] = this["series"];
        return this.chartConfig;
    };
    return HighCharts_Pie;
})(HighCharts_Chart);
var CubeViz_Config = CubeViz_Config || {
};
var CubeViz_Links_Module = CubeViz_Links_Module || {
};
var cubeVizUIChartConfig = cubeVizUIChartConfig || {
};
var CubeViz_ChartConfig = CubeViz_ChartConfig || {
};
var CubeViz_Data = {
    "retrievedObservations": [],
    "numberOfMultipleDimensions": 0
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
    Viz_Event.onClick_ChartSelectionItem = function onClick_ChartSelectionItem(event) {
        var currentNr = $(event["target"]).parent().attr("nr");
        var lastUsedNr = $("#chartSelection").attr("lastSelection");
        if(null == lastUsedNr || currentNr != lastUsedNr) {
            $("#chartSelectionMenu").animate({
                "height": 0
            }, 400);
            ChartSelector.focusItem(currentNr);
            var chartName = $(this).parent().attr("className");
            var numberOfMultDims = CubeViz_Data["numberOfMultipleDimensions"];
            var charts = CubeViz_ChartConfig[numberOfMultDims]["charts"];

            var fromChartConfig = HighCharts_Chart.getFromChartConfigByClass(chartName, charts);
            var chart = HighCharts.loadChart(chartName);
            chart.init(CubeViz_Data["retrievedObservations"], CubeViz_Links_Module["selectedComponents"]["dimensions"], CubeViz_Links_Module["selectedComponents"]["measures"], fromChartConfig["defaultConfig"]);
            new Highcharts.Chart(chart.getRenderResult());
            cubeVizUIChartConfig["selectedChartClass"] = event["target"]["name"];
            $(".chartSelector-item").removeClass("current");
            $(event["target"]).parent().addClass("current");
            $("#chartSelection").attr("lastSelection", currentNr);
        } else {
            var container = $("#container").offset();
            $("#chartSelectionMenu").html("fff");
            $("#chartSelectionMenu").css("top", container["top"] - 40).css("left", event.pageX - container["left"] - 195).show().animate({
                "height": 30
            }, 400);
        }
    }
    Viz_Event.onComplete_LoadResultObservations = function onComplete_LoadResultObservations(entries) {
        CubeViz_Data["retrievedObservations"] = entries;
        var numberOfMultipleDimensions = HighCharts_Chart.getNumberOfMultipleDimensions(entries, CubeViz_Links_Module["selectedComponents"]["dimensions"], CubeViz_Links_Module["selectedComponents"]["measures"]);
        CubeViz_Data["numberOfMultipleDimensions"] = numberOfMultipleDimensions;
        var defaultChart = CubeViz_ChartConfig[numberOfMultipleDimensions]["charts"][0];
        var chart = HighCharts.loadChart(defaultChart["class"]);
        chart.init(entries, CubeViz_Links_Module["selectedComponents"]["dimensions"], CubeViz_Links_Module["selectedComponents"]["measures"], defaultChart["defaultConfig"]);
        var renderedChart = chart.getRenderResult();
        new Highcharts.Chart(renderedChart);
        Viz_Event.setupChartSelector(numberOfMultipleDimensions);
    }
    Viz_Event.setupChartSelector = function setupChartSelector(numberOfMultipleDimensions) {
        Viz_Main.updateChartSelection(CubeViz_ChartConfig[numberOfMultipleDimensions]["charts"]);
        $('.chartSelectionItem').click(Viz_Event.onClick_ChartSelectionItem);
    }
    return Viz_Event;
})();
var Viz_Main = (function () {
    function Viz_Main() { }
    Viz_Main.updateChartSelection = function updateChartSelection(suiteableCharts) {
        $("#chartSelection").html("");
        var iconPath = "";
        var name = "";
        var item = null;
        var icon = null;
        var nr = 0;

        $.each(suiteableCharts, function (index, element) {
            iconPath = CubeViz_Config["imagesPath"] + element["icon"];
            name = element["class"];
            item = $("<div></div>").addClass("chartSelector-item").attr("className", name);
            icon = $("<img/>").attr({
                "src": iconPath,
                "name": name,
                "class": "chartSelectionItem"
            }).data("nr", nr++).appendTo(item);
            item.appendTo($("#chartSelection"));
        });
        $("#chartSelection").addClass("chartSelector");
        ChartSelector.onFocus_Item = function (nr) {
        };
        ChartSelector.onClick_Item = Viz_Event.onClick_ChartSelectionItem;
        ChartSelector.init(0);
    }
    return Viz_Main;
})();
