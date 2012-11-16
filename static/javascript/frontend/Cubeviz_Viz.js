var ChartSelector = (function () {
    function ChartSelector() { }
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
        var element = null;
        var icon = null;
        var iconPath = "";
        var item = null;
        var name = "";
        var nr = 0;

        for(var index in suiteableCharts) {
            element = suiteableCharts[index];
            if(undefined == element) {
            } else {
                iconPath = CubeViz_Config["imagesPath"] + element["icon"];
                name = element["class"];
                item = $("<div></div>").addClass("chartSelector-item").attr("className", name);
                if(0 == nr) {
                    item.addClass("chartSelector-item-current");
                }
                icon = $("<img/>").attr({
                    "src": iconPath,
                    "name": name,
                    "class": "chartSelectionItem"
                }).data("nr", nr++).appendTo(item);
                item.appendTo($("#chartSelection"));
            }
        }
        ; ;
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
            resultList.push(elements[i]["typeUrl"]);
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

        this["_axes"][measureUri] = this["_axes"][measureUri] || {
        };
        for(var mainIndex in entries) {
            dimensionValues = {
            };
            measureObj = {
            };
            this["_axes"][measureUri][entries[mainIndex][measureUri][0]["value"]] = this["_axes"][measureUri][entries[mainIndex][measureUri][0]["value"]] || [];
            for(var i in this["_selectedDimensionUris"]) {
                selecDimUri = this["_selectedDimensionUris"][i];
                if(undefined == entries[mainIndex][selecDimUri]) {
                    console.log("Nothing found for mainIndex=" + mainIndex + " and selecDimUri=" + selecDimUri);
                    continue;
                }
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
            url: CubeViz_Links_Module["cubevizPath"] + "getobservations/",
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
        var mode = undefined == mode ? "ascending" : mode;
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
var Visualization_HighCharts = (function () {
    function Visualization_HighCharts() { }
    Visualization_HighCharts.load = function load(chartName) {
        switch(chartName) {
            case 'Visualization_HighCharts_Area': {
                return new Visualization_HighCharts_Area();

            }
            case 'Visualization_HighCharts_AreaSpline': {
                return new Visualization_HighCharts_AreaSpline();

            }
            case 'Visualization_HighCharts_Bar': {
                return new Visualization_HighCharts_Bar();

            }
            case 'Visualization_HighCharts_Column': {
                return new Visualization_HighCharts_Column();

            }
            case 'Visualization_HighCharts_Line': {
                return new Visualization_HighCharts_Line();

            }
            case 'Visualization_HighCharts_Pie': {
                return new Visualization_HighCharts_Pie();

            }
            case 'Visualization_HighCharts_Polar': {
                return new Visualization_HighCharts_Polar();

            }
            case 'Visualization_HighCharts_Spline': {
                return new Visualization_HighCharts_Spline();

            }
            default: {
                System.out("HighCharts - load");
                System.out("Invalid chartName (" + chartName + ") given!");
                return;

            }
        }
    }
    return Visualization_HighCharts;
})();
var Visualization_HighCharts_Chart = (function () {
    function Visualization_HighCharts_Chart() { }
    Visualization_HighCharts_Chart.prototype.buildChartTitle = function (cubeVizLinksModule, retrievedObservations) {
        var dsdLabel = cubeVizLinksModule["selectedDSD"]["label"];
        var dsLabel = cubeVizLinksModule["selectedDS"]["label"];
        var oneElementDimensions = Visualization_Controller.getOneElementDimensions(retrievedObservations, cubeVizLinksModule["selectedComponents"]["dimensions"], cubeVizLinksModule["selectedComponents"]["measures"]);
        var builtTitle = dsdLabel + " - " + dsLabel;

        for(var i in oneElementDimensions) {
            builtTitle += " - " + oneElementDimensions[i]["elements"][0]["propertyLabel"];
        }
        return builtTitle;
    };
    Visualization_HighCharts_Chart.prototype.init = function (entries, cubeVizLinksModule, chartConfig) {
        var forXAxis = null;
        var forSeries = null;
        var selectedComponentDimensions = cubeVizLinksModule["selectedComponents"]["dimensions"];
        var measures = cubeVizLinksModule["selectedComponents"]["measures"];
        var measureUri = Visualization_Controller.getMeasureTypeUrl();
        var multipleDimensions = Visualization_Controller.getMultipleDimensions(entries, selectedComponentDimensions, measures);
        var observation = new Observation();

        this["chartConfig"] = chartConfig;
        this["chartConfig"]["title"]["text"] = this.buildChartTitle(cubeVizLinksModule, entries);
        for(var hashedUrl in selectedComponentDimensions) {
            if(null == forXAxis) {
                forXAxis = selectedComponentDimensions[hashedUrl]["typeUrl"];
            } else {
                forSeries = selectedComponentDimensions[hashedUrl]["typeUrl"];
            }
        }
        if(true == CubeViz_Data["_highchart_switchAxes"]) {
            var tmp = forXAxis;
            forXAxis = forSeries;
            forSeries = tmp;
        }
        observation.initialize(entries, selectedComponentDimensions, measureUri);
        var xAxisElements = observation.sortAxis(forXAxis, "ascending").getAxisElements(forXAxis);
        for(var value in xAxisElements) {
            this["xAxis"]["categories"].push(Visualization_Controller.getLabelForPropertyUri(value, forXAxis, selectedComponentDimensions));
        }
        var found = false;
        var i = 0;
        var length = System.countProperties(xAxisElements);
        var obj = {
        };
        var seriesElements = observation.getAxisElements(forSeries);

        this["series"] = [];
        for(var seriesEntry in seriesElements) {
            obj = {
                "name": Visualization_Controller.getLabelForPropertyUri(seriesEntry, forSeries, selectedComponentDimensions),
                "data": [],
                "color": Visualization_Controller.getColor(seriesEntry)
            };
            for(var xAxisEntry in xAxisElements) {
                found = false;
                for(var i in xAxisElements[xAxisEntry]) {
                    for(var j in xAxisElements[xAxisEntry][i][measureUri]["ref"]) {
                        if(seriesEntry == xAxisElements[xAxisEntry][i][measureUri]["ref"][j][forSeries]["value"]) {
                            var floatValue = parseFloat(xAxisElements[xAxisEntry][i][measureUri]["value"]);
                            obj["data"].push(floatValue);
                            found = true;
                            break;
                        }
                    }
                    if(true == found) {
                        break;
                    }
                }
                if(false == found) {
                    obj["data"].push(null);
                }
            }
            this["series"].push(obj);
        }
        System.out("");
        System.out("generated series:");
        System.out(this["series"]);
    };
    Visualization_HighCharts_Chart.prototype.getRenderResult = function () {
        return {
        };
    };
    return Visualization_HighCharts_Chart;
})();
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Visualization_HighCharts_Area = (function (_super) {
    __extends(Visualization_HighCharts_Area, _super);
    function Visualization_HighCharts_Area() {
        _super.apply(this, arguments);

        this.xAxis = {
            "categories": []
        };
        this.series = [];
        this.chartConfig = {
        };
    }
    Visualization_HighCharts_Area.prototype.getRenderResult = function () {
        this.chartConfig["xAxis"] = this["xAxis"];
        this.chartConfig["series"] = this["series"];
        return this.chartConfig;
    };
    return Visualization_HighCharts_Area;
})(Visualization_HighCharts_Chart);
var Visualization_HighCharts_AreaSpline = (function (_super) {
    __extends(Visualization_HighCharts_AreaSpline, _super);
    function Visualization_HighCharts_AreaSpline() {
        _super.apply(this, arguments);

        this.xAxis = {
            "categories": []
        };
        this.series = [];
        this.chartConfig = {
        };
    }
    Visualization_HighCharts_AreaSpline.prototype.getRenderResult = function () {
        this.chartConfig["xAxis"] = this["xAxis"];
        this.chartConfig["series"] = this["series"];
        return this.chartConfig;
    };
    return Visualization_HighCharts_AreaSpline;
})(Visualization_HighCharts_Chart);
var Visualization_HighCharts_Bar = (function (_super) {
    __extends(Visualization_HighCharts_Bar, _super);
    function Visualization_HighCharts_Bar() {
        _super.apply(this, arguments);

        this.xAxis = {
            "categories": []
        };
        this.series = [];
        this.chartConfig = {
        };
    }
    Visualization_HighCharts_Bar.prototype.getRenderResult = function () {
        this["chartConfig"]["xAxis"] = this["xAxis"];
        this["chartConfig"]["series"] = this["series"];
        return this.chartConfig;
    };
    return Visualization_HighCharts_Bar;
})(Visualization_HighCharts_Chart);
var Visualization_HighCharts_Column = (function (_super) {
    __extends(Visualization_HighCharts_Column, _super);
    function Visualization_HighCharts_Column() {
        _super.apply(this, arguments);

        this.xAxis = {
            "categories": []
        };
        this.series = [];
        this.chartConfig = {
        };
    }
    Visualization_HighCharts_Column.prototype.getRenderResult = function () {
        this["chartConfig"]["xAxis"] = this["xAxis"];
        this["chartConfig"]["series"] = this["series"];
        return this.chartConfig;
    };
    return Visualization_HighCharts_Column;
})(Visualization_HighCharts_Chart);
var Visualization_HighCharts_Line = (function (_super) {
    __extends(Visualization_HighCharts_Line, _super);
    function Visualization_HighCharts_Line() {
        _super.apply(this, arguments);

        this.xAxis = {
            "categories": []
        };
        this.series = [];
        this.chartConfig = {
        };
    }
    Visualization_HighCharts_Line.prototype.getRenderResult = function () {
        this.chartConfig["xAxis"] = this["xAxis"];
        this.chartConfig["series"] = this["series"];
        return this.chartConfig;
    };
    return Visualization_HighCharts_Line;
})(Visualization_HighCharts_Chart);
var Visualization_HighCharts_Pie = (function (_super) {
    __extends(Visualization_HighCharts_Pie, _super);
    function Visualization_HighCharts_Pie() {
        _super.apply(this, arguments);

        this.series = [
            {
                "data": []
            }
        ];
        this.chartConfig = {
        };
    }
    Visualization_HighCharts_Pie.prototype.init = function (entries, cubeVizLinksModule, chartConfig) {
        var selectedComponentDimensions = cubeVizLinksModule["selectedComponents"]["dimensions"];
        var measures = cubeVizLinksModule["selectedComponents"]["measures"];
        var multipleDimensions = Visualization_Controller.getMultipleDimensions(entries, selectedComponentDimensions, measures);

        if(1 < multipleDimensions["length"]) {
            System.out("Pie chart is only suitable for one dimension!");
            System.out(multipleDimensions);
            return;
        }
        var data = [];
        var forXAxis = multipleDimensions[0]["elements"][0]["typeUrl"];
        var measureUri = Visualization_Controller.getMeasureTypeUrl();
        var observation = new Observation();

        this["chartConfig"] = chartConfig;
        this["chartConfig"]["title"]["text"] = this.buildChartTitle(cubeVizLinksModule, entries);
        observation.initialize(entries, selectedComponentDimensions, measureUri);
        var xAxisElements = observation.sortAxis(forXAxis, "ascending").getAxisElements(forXAxis);
        data.push({
            "type": "pie",
            name: this["chartConfig"]["title"]["text"],
            "data": []
        });
        this["chartConfig"]["colors"] = [];
        for(var value in xAxisElements) {
            data[0]["data"].push([
                Visualization_Controller.getLabelForPropertyUri(value, forXAxis, selectedComponentDimensions), 
                xAxisElements[value][0][measureUri]["value"]
            ]);
            this["chartConfig"]["colors"].push(Visualization_Controller.getColor(value));
        }
        this["series"] = data;
        System.out("generated series:");
        System.out(this["series"]);
    };
    Visualization_HighCharts_Pie.prototype.getRenderResult = function () {
        this.chartConfig["series"] = this["series"];
        return this.chartConfig;
    };
    return Visualization_HighCharts_Pie;
})(Visualization_HighCharts_Chart);
var Visualization_HighCharts_Polar = (function (_super) {
    __extends(Visualization_HighCharts_Polar, _super);
    function Visualization_HighCharts_Polar() {
        _super.apply(this, arguments);

        this.xAxis = {
            "categories": []
        };
        this.series = [];
        this.chartConfig = {
        };
    }
    Visualization_HighCharts_Polar.prototype.getRenderResult = function () {
        this.chartConfig["xAxis"] = this["xAxis"];
        this.chartConfig["series"] = this["series"];
        return this.chartConfig;
    };
    return Visualization_HighCharts_Polar;
})(Visualization_HighCharts_Chart);
var Visualization_HighCharts_Spline = (function (_super) {
    __extends(Visualization_HighCharts_Spline, _super);
    function Visualization_HighCharts_Spline() {
        _super.apply(this, arguments);

        this.xAxis = {
            "categories": []
        };
        this.series = [];
        this.chartConfig = {
        };
    }
    Visualization_HighCharts_Spline.prototype.getRenderResult = function () {
        this.chartConfig["xAxis"] = this["xAxis"];
        this.chartConfig["series"] = this["series"];
        return this.chartConfig;
    };
    return Visualization_HighCharts_Spline;
})(Visualization_HighCharts_Chart);
var Visualization_CubeViz = (function () {
    function Visualization_CubeViz() { }
    Visualization_CubeViz.load = function load(chartName) {
        switch(chartName) {
            case 'Visualization_CubeViz_Table': {
                return new Visualization_CubeViz_Table();

            }
            default: {
                System.out("CubeViz - load");
                System.out("Invalid chartName (" + chartName + ") given!");
                return;

            }
        }
    }
    return Visualization_CubeViz;
})();
var Visualization_CubeViz_Visualization = (function () {
    function Visualization_CubeViz_Visualization() {
        this._entries = null;
        this._cubeVizLinksModule = null;
        this._chartConfig = null;
    }
    Visualization_CubeViz_Visualization.prototype.init = function (entries, cubeVizLinksModule, chartConfig) {
        this._chartConfig = chartConfig;
        this._cubeVizLinksModule = cubeVizLinksModule;
        this._entries = entries;
    };
    Visualization_CubeViz_Visualization.prototype.render = function () {
    };
    return Visualization_CubeViz_Visualization;
})();
var Visualization_CubeViz_Table = (function (_super) {
    __extends(Visualization_CubeViz_Table, _super);
    function Visualization_CubeViz_Table() {
        _super.apply(this, arguments);

        this._generatedStructure = [];
        this._generatedStructure_Components = [];
        this._generatedObservations = [];
    }
    Visualization_CubeViz_Table.prototype.generatedObservations = function (cubeVizLinksModule, entries) {
        this["_generatedObservations"] = [];
        var elements = {
        };
        var entry = {
        };
        var link = "";
        var observation = new Observation();

        observation.initialize(entries, cubeVizLinksModule["selectedComponents"]["dimensions"], Visualization_Controller.getMeasureTypeUrl());
        var necUris = observation["_selectedDimensionUris"];
        necUris.push(Visualization_Controller.getMeasureTypeUrl());
        necUris.push("http://www.w3.org/2000/01/rdf-schema#label");
        for(var i in entries) {
            entry = {
                "entries": []
            };
            for(var uri in entries[i]) {
                if(-1 != $.inArray(uri, necUris)) {
                    entry["entries"].push("<br/><div class=\"Vis_CV_Table_ObservationsHeaderLabel\">" + "<a href=\"" + uri + "\" target=\"_blank\">" + Visualization_Controller.getDimensionOrMeasureLabel(uri) + "</a>" + "</div>");
                }
            }
            this["_generatedObservations"].push(entry);
            break;
        }
        for(i in entries) {
            entry = {
                "entries": []
            };
            for(var uri in entries[i]) {
                if(-1 != $.inArray(uri, necUris)) {
                    link = undefined != entries[i][uri][0]["label"] ? entries[i][uri][0]["label"] : entries[i][uri][0]["value"];
                    if(false == System.contains(entries[i][uri][0]["value"], "http://")) {
                        entry["entries"].push(link);
                    } else {
                        entry["entries"].push("<a href=\"" + entries[i][uri][0]["value"] + "\" target=\"_blank\">" + link + "</a>");
                    }
                }
            }
            this["_generatedObservations"].push(entry);
        }
        this["_generatedObservations"].sort(function (a, b) {
            return a["entries"][0].toUpperCase().localeCompare(b["entries"][0].toUpperCase());
        });
    };
    Visualization_CubeViz_Table.prototype.generateStructure = function (cubeVizLinksModule) {
        var link = null;
        this["_generatedStructure"] = [];
        backgroundColor = Visualization_Controller.getColor(cubeVizLinksModule["selectedDSD"]["url"]);
        link = "<span style=\"background-color:" + backgroundColor + ";width:5px !important;height:5px !important;margin-right:4px;\">&nbsp;</span>";
        link += "<a href=\"" + cubeVizLinksModule["selectedDSD"]["url"] + "\" target=\"_blank\">" + cubeVizLinksModule["selectedDSD"]["label"] + "</a>";
        this["_generatedStructure"].push(link);
        backgroundColor = Visualization_Controller.getColor(cubeVizLinksModule["selectedDS"]["url"]);
        link = "<span style=\"background-color:" + backgroundColor + ";width:5px !important;height:5px !important;margin-left:5px;margin-right:4px;\">&nbsp;</span>";
        link += "<a href=\"" + cubeVizLinksModule["selectedDS"]["url"] + "\" target=\"_blank\">" + cubeVizLinksModule["selectedDS"]["label"] + "</a>";
        this["_generatedStructure"].push(link);
        var backgroundColor = "";
        var data = "";
        var entry = {
        };

        for(var dim in cubeVizLinksModule["selectedComponents"]["dimensions"]) {
            dim = cubeVizLinksModule["selectedComponents"]["dimensions"][dim];
            entry = {
                "label": dim["label"],
                "typeUrl": dim["typeUrl"],
                "entries": []
            };
            for(var i in dim["elements"]) {
                backgroundColor = Visualization_Controller.getColor(dim["elements"][i]["property"]);
                data = "<span style=\"background-color:" + backgroundColor + ";width:5px !important;height:5px !important;margin-right:4px;\">&nbsp;</span>";
                data += "<a href=\"" + dim["elements"][i]["property"] + "\" target=\"_blank\">" + dim["elements"][i]["propertyLabel"] + "</a>";
                entry["entries"].push(data);
            }
            this["_generatedStructure_Components"].push(entry);
        }
    };
    Visualization_CubeViz_Table.prototype.init = function (entries, cubeVizLinksModule, chartConfig) {
        _super.prototype.init.call(this, entries, cubeVizLinksModule, chartConfig);
        this.generateStructure(cubeVizLinksModule);
        this.generatedObservations(cubeVizLinksModule, entries);
    };
    Visualization_CubeViz_Table.prototype.render = function () {
        var tpl = jsontemplate.Template(templateVisualization_CubeViz_Table);
        $("#container").html(tpl.expand({
            "generatedStructure": this["_generatedStructure"],
            "generatedStructure_Components": this["_generatedStructure_Components"],
            "generatedObservations": this["_generatedObservations"]
        }));
    };
    return Visualization_CubeViz_Table;
})(Visualization_CubeViz_Visualization);
var Visualization_Controller = (function () {
    function Visualization_Controller() { }
    Visualization_Controller.getColor = function getColor(uri) {
        uri = "" + CryptoJS.MD5(uri);
        return "#" + uri.substr((uri["length"] - 6), 6);
    }
    Visualization_Controller.getDimensionOrMeasureLabel = function getDimensionOrMeasureLabel(uri) {
        if("http://www.w3.org/2000/01/rdf-schema#label" == uri) {
            return "Label";
        }
        for(var dim in CubeViz_Links_Module["selectedComponents"]["dimensions"]) {
            dim = CubeViz_Links_Module["selectedComponents"]["dimensions"][dim];
            if(uri == dim["typeUrl"]) {
                return dim["label"];
            }
        }
        for(var mea in CubeViz_Links_Module["selectedComponents"]["measures"]) {
            mea = CubeViz_Links_Module["selectedComponents"]["measures"][mea];
            if(uri == mea["typeUrl"]) {
                return mea["label"];
            }
        }
        return uri;
    }
    Visualization_Controller.getFromChartConfigByClass = function getFromChartConfigByClass(className, charts) {
        for(var i in charts) {
            if(className == charts[i]["class"]) {
                return charts[i];
            }
        }
    }
    Visualization_Controller.getLabelForPropertyUri = function getLabelForPropertyUri(propertyUri, dimensionType, selectedDimensions) {
        var dim = {
        };
        for(var hashedUrl in selectedDimensions) {
            dim = selectedDimensions[hashedUrl];
            if(dim["typeUrl"] == dimensionType) {
                for(var i in dim["elements"]) {
                    if(dim["elements"][i]["property"] == propertyUri) {
                        return dim["elements"][i]["propertyLabel"];
                    }
                }
            }
        }
        return propertyUri;
    }
    Visualization_Controller.getMeasure = function getMeasure() {
        for(var hashedTypeUrl in CubeViz_Links_Module["selectedComponents"]["measures"]) {
            return CubeViz_Links_Module["selectedComponents"]["measures"][hashedTypeUrl];
        }
    }
    Visualization_Controller.getMeasureTypeUrl = function getMeasureTypeUrl() {
        var m = Visualization_Controller.getMeasure();
        return m["typeUrl"];
    }
    Visualization_Controller.getMultipleDimensions = function getMultipleDimensions(retrievedData, selectedDimensions, measures) {
        var multipleDimensions = [];
        var tmp = [];

        for(var hashedUrl in selectedDimensions) {
            if(1 < selectedDimensions[hashedUrl]["elements"]["length"]) {
                multipleDimensions.push({
                    "label": selectedDimensions[hashedUrl]["label"],
                    "elements": selectedDimensions[hashedUrl]["elements"]
                });
            }
        }
        return multipleDimensions;
    }
    Visualization_Controller.getNumberOfMultipleDimensions = function getNumberOfMultipleDimensions(retrievedData, selectedDimensions, measures) {
        var dims = Visualization_Controller.getMultipleDimensions(retrievedData, selectedDimensions, measures);
        return dims["length"];
    }
    Visualization_Controller.getOneElementDimensions = function getOneElementDimensions(retrievedData, selectedDimensions, measures) {
        var oneElementDimensions = [];
        var tmp = [];

        for(var hashedUrl in selectedDimensions) {
            if(1 == selectedDimensions[hashedUrl]["elements"]["length"]) {
                oneElementDimensions.push({
                    "label": selectedDimensions[hashedUrl]["label"],
                    "elements": selectedDimensions[hashedUrl]["elements"]
                });
            }
        }
        return oneElementDimensions;
    }
    Visualization_Controller.getVisualizationType = function getVisualizationType(className) {
        if("Visualization_CubeViz_Table" == className) {
            return "CubeViz";
        }
        return "HighCharts";
    }
    Visualization_Controller.setChartConfigClassEntry = function setChartConfigClassEntry(className, charts, newValue) {
        for(var i in charts) {
            if(className == charts[i]["class"]) {
                charts[i] = newValue;
            }
        }
    }
    return Visualization_Controller;
})();
var CubeViz_Config = CubeViz_Config || {
};
var CubeViz_Links_Module = CubeViz_Links_Module || {
};
var cubeVizUIChartConfig = cubeVizUIChartConfig || {
};
var CubeViz_ChartConfig = CubeViz_ChartConfig || {
};
var CubeViz_Data = CubeViz_Data || {
    "numberOfMultipleDimensions": 0,
    "retrievedObservations": [],
    "_highchart_switchAxes": false
};
var ChartSelector_Array = ChartSelector_Array || {
};
var templateVisualization_CubeViz_Table = templateVisualization_CubeViz_Table || {
};
$(document).ready(function () {
    Viz_Main.showLoadingNotification();
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

        Viz_Main.setMenuOptions(menuItems, newDefaultConfig);
        Visualization_Controller.setChartConfigClassEntry(cubeVizUIChartConfig["selectedChartConfig"]["class"], CubeViz_ChartConfig[CubeViz_Data["numberOfMultipleDimensions"]]["charts"], cubeVizUIChartConfig["selectedChartConfig"]);
        Viz_Main.renderChart(cubeVizUIChartConfig["selectedChartConfig"]["class"]);
    }
    Viz_Event.onClick_ChartSelectionItem = function onClick_ChartSelectionItem(event) {
        var currentNr = parseInt($(event["target"]).parent().attr("nr"));
        var lastUsedNr = parseInt($("#chartSelection").attr("lastSelection"));
        var lastSelectionAndClicked = parseInt($("#chartSelection").attr("lastSelectionAndClicked"));

        if(null == lastUsedNr || currentNr != lastUsedNr) {
            $(".chartSelector-item").removeClass("current").eq(currentNr).addClass("current");
            cubeVizUIChartConfig["selectedChartClass"] = event["target"]["name"];
            ; ;
            $("#chartSelection").attr("lastSelection", currentNr);
            $(".chartSelector-item").removeClass("chartSelector-item-current");
            $(event["target"]).parent().addClass("chartSelector-item-current");
            Viz_Main.renderChart($(this).attr("className"));
            Viz_Main.closeChartSelectionMenu();
            Viz_Main.hideMenuDongle();
            var fromChartConfig = Visualization_Controller.getFromChartConfigByClass($(event["target"]).parent().attr("className"), CubeViz_ChartConfig[CubeViz_Data["numberOfMultipleDimensions"]]["charts"]);
            if(undefined != fromChartConfig["options"] && 0 < fromChartConfig["options"]["length"]) {
                Viz_Main.showMenuDongle($(this).offset());
            }
        } else {
            if(lastUsedNr == lastSelectionAndClicked) {
                Viz_Main.closeChartSelectionMenu();
                $("#chartSelection").attr("lastSelectionAndClicked", -1);
            } else {
                Viz_Main.hideMenuDongle();
                $("#chartSelection").attr("lastSelectionAndClicked", currentNr);
                var className = $(event["target"]).parent().attr("className");
                var fromChartConfig = Visualization_Controller.getFromChartConfigByClass(className, CubeViz_ChartConfig[CubeViz_Data["numberOfMultipleDimensions"]]["charts"]);
                cubeVizUIChartConfig["oldSelectedChartConfig"] = System.deepCopy(fromChartConfig);
                cubeVizUIChartConfig["selectedChartConfig"] = fromChartConfig;
                Viz_Main.openChartSelectionMenu(fromChartConfig["options"], $(this).offset());
            }
        }
    }
    Viz_Event.onComplete_LoadResultObservations = function onComplete_LoadResultObservations(entries) {
        CubeViz_Data["retrievedObservations"] = entries;
        CubeViz_Data["numberOfMultipleDimensions"] = Visualization_Controller.getNumberOfMultipleDimensions(entries, CubeViz_Links_Module["selectedComponents"]["dimensions"], CubeViz_Links_Module["selectedComponents"]["measures"]);
        Viz_Main.renderChart(CubeViz_ChartConfig[CubeViz_Data["numberOfMultipleDimensions"]]["charts"][0]["class"]);
        ChartSelector.init(CubeViz_ChartConfig[CubeViz_Data["numberOfMultipleDimensions"]]["charts"], Viz_Event.onClick_ChartSelectionItem);
    }
    return Viz_Event;
})();
var Viz_Main = (function () {
    function Viz_Main() { }
    Viz_Main.closeChartSelectionMenu = function closeChartSelectionMenu() {
        $("#chartSelectionMenu").slideUp(500);
    }
    Viz_Main.hideMenuDongle = function hideMenuDongle() {
        $("#chartSelectionMenuDongle").hide();
    }
    Viz_Main.openChartSelectionMenu = function openChartSelectionMenu(options, offset) {
        if(0 < options["length"]) {
            var containerOffset = $("#container").offset();
            var menuWidth = parseInt($("#chartSelectionMenu").css("width"));
            var leftPosition = offset["left"] - containerOffset["left"] - menuWidth + 18;
            var topPosition = offset["top"] - 40;
            var generatedHtml = ChartSelector.buildMenu(options);
            var menuButton = $("<input type=\"button\"/>").attr("id", "chartSelectionMenuButton").attr("class", "minibutton submit").css("margin-top", "15px").attr("value", "Update chart");

            $("#chartSelectionMenuContent").html(generatedHtml).append(menuButton);
            $("#chartSelectionMenu").css("left", leftPosition).css("top", topPosition).slideDown(800);
            $("#chartSelectionMenuButton").click(Viz_Event.onClick_chartSelectionMenuButton);
            $("#chartSelectionMenuCloseCross").click(Viz_Main.closeChartSelectionMenu);
        }
    }
    Viz_Main.renderChart = function renderChart(className) {
        var charts = CubeViz_ChartConfig[CubeViz_Data["numberOfMultipleDimensions"]]["charts"];
        var fromChartConfig = Visualization_Controller.getFromChartConfigByClass(className, charts);
        switch(Visualization_Controller.getVisualizationType(className)) {
            case "CubeViz": {
                var visz = Visualization_CubeViz.load(className);
                visz.init(CubeViz_Data["retrievedObservations"], CubeViz_Links_Module, fromChartConfig["defaultConfig"]);
                visz.render();
                break;

            }
            default: {
                var chart = Visualization_HighCharts.load(className);
                chart.init(CubeViz_Data["retrievedObservations"], CubeViz_Links_Module, fromChartConfig["defaultConfig"]);
                new Highcharts.Chart(chart.getRenderResult());
                break;

            }
        }
    }
    Viz_Main.setMenuOptions = function setMenuOptions(menuItems, newDefaultConfig) {
        var key = null;
        var length = menuItems["length"];
        var value = null;

        for(var i = 1; i < length; ++i) {
            key = $(menuItems[i]).attr("key");
            value = $(menuItems[i]).attr("value");
            if("_" == key[0]) {
                switch(key) {
                    case "_highchart_switchAxes": {
                        CubeViz_Data["_highchart_switchAxes"] = "true" == value ? true : false;
                        break;

                    }
                }
            } else {
                System.setObjectProperty(newDefaultConfig, key, ".", value);
            }
        }
    }
    Viz_Main.showLoadingNotification = function showLoadingNotification() {
        var img = $("<img/>");
        img.attr("src", CubeViz_Config["imagesPath"] + "loader.gif");
        img = $("<div id=\"loadingNotification\"></div>").append(img).append("&nbsp; Loading ...");
        $("#container").html("").append(img);
    }
    Viz_Main.showMenuDongle = function showMenuDongle(offset) {
        var containerOffset = $("#container").offset();
        var menuWidth = parseInt($("#chartSelectionMenu").css("width"));
        var leftPosition = offset["left"] + 4;
        var topPosition = offset["top"] + 35;

        $("#chartSelectionMenuDongle").attr("src", CubeViz_Config["imagesPath"] + "menuDongle.png").css("left", leftPosition).css("top", topPosition).fadeIn(800);
    }
    return Viz_Main;
})();
