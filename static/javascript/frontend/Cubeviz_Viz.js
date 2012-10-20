var ChartSelector = (function () {
    function ChartSelector() {
        this.callbackOnSelect_Item = null;
        this.itemPadding = 2;
        this.itemBorder = 2;
        this.itemFocused = -1;
        this.status = 0;
    }
    ChartSelector.prototype.onSelect_Item = function (nr) {
        this.callbackOnSelect_Item(nr);
    };
    ChartSelector.prototype.onClick_Item = function () {
        var nr = $(this).data("nr");
        console.log("onClick_Item for " + nr);
        this.focusItem(nr);
    };
    ChartSelector.prototype.init = function (nr) {
        if(0 != this.status) {
            System.out("ChartSelector.init: Already initialized");
            return;
        }
        $(".chartSelector-options-toggle").bind("click", function () {
            $(".chartSelector-item-options").eq(this.itemFocused).toggle();
            $(".chartSelector-options-toggle.shut").toggle();
            $(".chartSelector-options-toggle.copen").toggle();
        });
        console.log("ChartSelector -> init");
        $(".chartSelector-item").each(function (nr) {
            $(this).data("nr", nr).click(this.onClick_Item);
        });
        this.status = 1;
        if(typeof nr == "undefined") {
            this.itemFocused = 0;
            this.focusItem(0);
        } else {
            this.focusItem(nr);
        }
    };
    ChartSelector.prototype.focusItem = function (nr) {
        if(this.status == 0) {
            throw "ChartSelector.focusItem: Not initialized";
        }
        if(nr < 0) {
            throw "ChartSelector.focusItem: Invalid item nr";
        }
        if(this.itemFocused == nr) {
            return;
        }
        var containerOptions = $(".chartSelector-options");
        var item = $(".chartSelector-item").eq(nr);
        this.itemFocused = nr;
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
        if(this.status == 1) {
            this.status = 2;
        }
        this.onSelect_Item(nr);
    };
    ChartSelector.prototype.setOnSelect_Item = function (callback) {
        this.callbackOnSelect_Item = callback;
    };
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
var HighCharts = (function () {
    function HighCharts() { }
    HighCharts.loadChart = function loadChart(chartName) {
        switch(chartName) {
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
    HighCharts_Chart.prototype.init = function (entries, cubeVizConfig, chartConfig) {
    };
    HighCharts_Chart.prototype.getRenderResult = function () {
        return {
        };
    };
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
    HighCharts_Bar.prototype.init = function (entries, cubeVizConfig, chartConfig) {
        var dimensionLabels = [
            ""
        ];
        var forXAxis = null;
        var forSeries = null;
        this.chartConfig = chartConfig;
        for(var dimensionLabel in cubeVizConfig["selectedComponents"]["dimensions"]) {
            if(null == forXAxis) {
                forXAxis = cubeVizConfig["selectedComponents"]["dimensions"][dimensionLabel];
            } else {
                forSeries = cubeVizConfig["selectedComponents"]["dimensions"][dimensionLabel];
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
        var seriesData = this.structureEntries(forSeries, this.extractMeasureValue(cubeVizConfig), entries);
        for(var i in forSeries["elements"]) {
            this.series.push({
                "name": forSeries["elements"][i]["property_label"],
                "data": seriesData[forSeries["elements"][i]["property"]]
            });
        }
    };
    HighCharts_Bar.prototype.getRenderResult = function () {
        this.chartConfig["xAxis"] = this.xAxis;
        this.chartConfig["series"] = this.series;
        return this.chartConfig;
    };
    HighCharts_Bar.prototype.extractMeasureValue = function (cubeVizConfig) {
        for(var label in cubeVizConfig.selectedComponents.measures) {
            return cubeVizConfig["selectedComponents"]["measures"][label]["type"];
        }
    };
    HighCharts_Bar.prototype.structureEntries = function (forSeries, propertiesValueUri, entries) {
        var seriesData = {
        };
        var dimensionType = forSeries.type;
        for(var mainIndex in entries) {
            for(var propertyUri in entries[mainIndex]) {
                if(propertyUri == dimensionType) {
                    if("undefined" == typeof seriesData[entries[mainIndex][propertyUri][0]["value"]]) {
                        seriesData[entries[mainIndex][propertyUri][0]["value"]] = [];
                    }
                    seriesData[entries[mainIndex][propertyUri][0]["value"]].push(entries[mainIndex][propertiesValueUri][0]["value"]);
                }
            }
        }
        return seriesData;
    };
    return HighCharts_Bar;
})(HighCharts_Chart);
var CubeViz_Config = CubeViz_Config || {
};
var CubeViz_Links_Module = CubeViz_Links_Module || {
};
var cubeVizUIChartConfig = cubeVizUIChartConfig || {
};
var CubeViz_ChartConfig = CubeViz_ChartConfig || {
};
$(document).ready(function () {
    Viz_Event.ready();
});
var Viz_Event = (function () {
    function Viz_Event() { }
    Viz_Event.ready = function ready() {
        System.out("CubeViz_Config");
        System.out(CubeViz_Config);
        $("#sidebar-left-data-selection-submitbtn").attr("value", "Update visualization");
        var container = $("#container").offset();
        var viewPort = $(window).height();
        var containerHeight = 0;
        $("#container").css("height", $(window).height() - container["top"] - 5);
        Viz_Event.setupChartSelector();
        Observation.loadAll(CubeViz_Links_Module["linkCode"], Viz_Event.onComplete_LoadResultObservations);
    }
    Viz_Event.onClick_ChartSelectionItem = function onClick_ChartSelectionItem(event) {
        cubeVizUIChartConfig["selectedChartClass"] = event["target"]["name"];
        $(".chartSelector-item").removeClass("current");
        $(event["target"]).parent().addClass("current");
        Observation.loadAll(CubeViz_Links_Module["linkCode"], Viz_Event.onComplete_LoadResultObservations);
    }
    Viz_Event.onComplete_LoadResultObservations = function onComplete_LoadResultObservations(entries) {
    }
    Viz_Event.setupChartSelector = function setupChartSelector() {
        Viz_Main.updateChartSelection([
            CubeViz_ChartConfig["2"][0]["charts"][0], 
            CubeViz_ChartConfig["2"][0]["charts"][0]
        ]);
        $('.chartSelectionItem').click(Viz_Event.onClick_ChartSelectionItem);
    }
    return Viz_Event;
})();
var Viz_Main = (function () {
    function Viz_Main() { }
    Viz_Main.updateChartSelection = function updateChartSelection(suiteableCharts) {
        var iconPath = "";
        var name = "";
        var item = null;
        var icon = null;

        $.each(suiteableCharts, function (index, element) {
            iconPath = CubeViz_Config["imagesPath"] + element["icon"];
            name = element["class"];
            item = $("<div></div>").addClass("chartSelector-item");
            icon = $("<img/>").attr({
                "src": iconPath,
                "name": name,
                "class": "chartSelectionItem"
            }).appendTo(item);
            item.appendTo($("#chartSelection"));
        });
        $("#chartSelection").addClass("chartSelector");
        var chartSelector = new ChartSelector();
        chartSelector.setOnSelect_Item(function (nr) {
            console.log("onSelect_Item");
        });
        chartSelector.init(0);
    }
    return Viz_Main;
})();
