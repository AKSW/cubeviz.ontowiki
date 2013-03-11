var CubeViz_ConfigurationLink = (function () {
    function CubeViz_ConfigurationLink() { }
    CubeViz_ConfigurationLink.save = function save(url, content, type, callback) {
        var oldAjaxSetup = $.ajaxSetup();
        var oldSupportOrs = $.support.cors;

        $.ajaxSetup({
            async: true,
            cache: false,
            type: "POST"
        });
        $.support.cors = true;
        $.ajax({
            "url": url + "savecontenttofile/",
            "data": {
                type: type,
                stringifiedContent: JSON.stringify(content)
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            $.ajaxSetup(oldAjaxSetup);
            $.support.cors = oldSupportOrs;
            throw new Error("save error: " + xhr["responseText"]);
        }).done(function (generatedHash) {
            $.ajaxSetup(oldAjaxSetup);
            $.support.cors = oldSupportOrs;
            callback(generatedHash);
        });
    }
    return CubeViz_ConfigurationLink;
})();
var CubeViz_Collection = (function () {
    function CubeViz_Collection(idKey) {
        this.reset(idKey);
    }
    CubeViz_Collection.prototype.add = function (element, option) {
        if(true === _.isUndefined(element[this.idKey])) {
            throw new Error("Key " + this.idKey + " in element not set!");
            return this;
        }
        if(undefined === this.get(element[this.idKey])) {
            this._.push(element);
        } else {
            if((undefined !== option && undefined !== option["merge"] && option["merge"] == true)) {
                this.remove(element[this.idKey]);
                this._.push(element);
            }
        }
        return this;
    };
    CubeViz_Collection.prototype.addList = function (list) {
        var self = this;
        if(true == _.isArray(list)) {
            _.each(list, function (element) {
                self.add(element);
            });
        } else {
            if(true == _.isObject(list)) {
                this.addList(_.values(list));
            }
        }
        return self;
    };
    CubeViz_Collection.prototype.each = function (func) {
        _.each(this._, func);
        return this;
    };
    CubeViz_Collection.prototype.exists = function (id) {
        return false === _.isUndefined(this.get(id));
    };
    CubeViz_Collection.prototype.get = function (id) {
        var self = this;
        var t = _.filter(this._, function (element) {
            if(element[self.idKey] == id) {
                return true;
            } else {
                return false;
            }
        });
        return 1 == t.length ? t[0] : undefined;
    };
    CubeViz_Collection.prototype.remove = function (id) {
        var self = this;
        this._ = _.reject(this._, function (element) {
            return element[self.idKey] == id;
        });
        return this;
    };
    CubeViz_Collection.prototype.reset = function (idKey) {
        this.idKey = undefined === idKey ? (undefined === this.idKey ? "id" : this.idKey) : idKey;
        this._ = [];
        return this;
    };
    CubeViz_Collection.prototype.size = function () {
        return _.size(this._);
    };
    CubeViz_Collection.prototype.sortAscendingBy = function (key) {
        var a = "";
        var b = "";
        var c = "";
        var d = "";
        var useKey = false === _.isUndefined(key) ? key : this.idKey;

        this._.sort(function (a, b) {
            try  {
                try  {
                    c = parseFloat(a[useKey]);
                    d = parseFloat(b[useKey]);
                    if(true === _.isNaN(c) || true === _.isNaN(d)) {
                        throw new Error();
                    }
                } catch (ex) {
                    c = a[useKey].toUpperCase();
                    d = b[useKey].toUpperCase();
                }
                return (c < d) ? -1 : (c > d) ? 1 : 0;
            } catch (e) {
                console.log("for useKey: " + useKey);
                console.log("a: " + a[useKey] + " and b: " + b[useKey]);
                console.log(e);
            }
        });
        return this;
    };
    CubeViz_Collection.prototype.toObject = function () {
        var i = 0;
        var obj = {
        };

        _.each(this._, function (entry) {
            obj[i++] = entry;
        });
        return obj;
    };
    return CubeViz_Collection;
})();
var CubeViz_Visualization = (function () {
    function CubeViz_Visualization() {
    }
    CubeViz_Visualization.prototype.getName = function () {
        return this.name;
    };
    CubeViz_Visualization.prototype.getSupportedClassNames = function () {
        return this.supportedClassNames;
    };
    CubeViz_Visualization.prototype.load = function (c) {
        if(true === this.isResponsibleFor(c)) {
            var chartInstance;
            eval("chartInstance = new " + c + "();");
            return chartInstance;
        }
        throw new Error("Invalid c (" + c + ") given!");
    };
    CubeViz_Visualization.prototype.isResponsibleFor = function (className) {
        return _.contains(this.getSupportedClassNames(), className);
    };
    return CubeViz_Visualization;
})();
var CubeViz_View_Abstract = (function () {
    function CubeViz_View_Abstract(id, attachedTo, app) {
        this.app = app;
        this.attachedTo = attachedTo;
        this.autostart = false;
        this.collection = new CubeViz_Collection();
        this.id = id || "view";
    }
    CubeViz_View_Abstract.prototype.bindGlobalEvents = function (events) {
        this.app.bindGlobalEvents(events, this);
        return this;
    };
    CubeViz_View_Abstract.prototype.bindUserInterfaceEvents = function (events) {
        if(true === _.isUndefined(events) || 0 == _.size(events)) {
            return;
        }
        var eventName = "";
        var selector = "";
        var self = this;

        _.each(events, function (method, key) {
            if(false === _.isFunction(method)) {
                method = self[method];
            }
            if(!method) {
                throw new Error("Method " + method + " does not exist");
            }
            eventName = key.substr(0, key.indexOf(" "));
            selector = key.substr(key.indexOf(" ") + 1);
            $(selector).on(eventName, $.proxy(method, self));
        });
    };
    CubeViz_View_Abstract.prototype.destroy = function () {
        var el = $(this.attachedTo);
        el.off();
        if(true === el.is("div")) {
            el.empty();
        } else {
            if(true === el.is("select")) {
                el.find("option").remove();
            }
        }
        this.collection.reset();
        return this;
    };
    CubeViz_View_Abstract.prototype.initialize = function () {
    };
    CubeViz_View_Abstract.prototype.triggerGlobalEvent = function (eventName, data) {
        this.app.triggerEvent(eventName, data);
        return this;
    };
    return CubeViz_View_Abstract;
})();
var CubeViz_View_Application = (function () {
    function CubeViz_View_Application() {
        this._viewInstances = new CubeViz_Collection();
        this._eventHandlers = new CubeViz_Collection();
        this._ = {
        };
    }
    CubeViz_View_Application.prototype.add = function (id, attachedTo, merge) {
        var options = true === merge ? {
            merge: true
        } : undefined;
        var viewObj = {
            alreadyRendered: false,
            attachedTo: attachedTo,
            id: id,
            instance: null
        };

        eval("viewObj.instance = new " + id + "(\"" + attachedTo + "\", this);");
        this._viewInstances.add(viewObj, options);
        return this;
    };
    CubeViz_View_Application.prototype.bindGlobalEvents = function (events, callee) {
        if(true === _.isUndefined(events) || 0 == _.size(events)) {
            return this;
        }
        var self = this;
        _.each(events, function (event) {
            $(self).on(event.name, $.proxy(event.handler, callee));
        });
        return this;
    };
    CubeViz_View_Application.prototype.destroyView = function (id) {
        this._viewInstances.get(id).instance.destroy();
        return this;
    };
    CubeViz_View_Application.prototype.get = function (id) {
        return this._viewInstances.get(id);
    };
    CubeViz_View_Application.prototype.getDataCopy = function () {
        var backup = [
            this._.generatedVisualization
        ];
        this._.generatedVisualization = undefined;
        var result = $.parseJSON(JSON.stringify(this._));
        this._.generatedVisualization = backup[1];
        return result;
    };
    CubeViz_View_Application.prototype.remove = function (id) {
        this._viewInstances.remove(id);
        return this;
    };
    CubeViz_View_Application.prototype.renderAll = function () {
        var self = this;
        _.each(this._viewInstances._, function (view) {
            self.renderView(view.id, view.attachedTo);
        });
        return this;
    };
    CubeViz_View_Application.prototype.renderView = function (id, attachedTo) {
        this.add(id, attachedTo).destroyView(id).get(id).instance.initialize();
        return this;
    };
    CubeViz_View_Application.prototype.reset = function () {
        $(this).off();
        var self = this;
        _.each(this._viewInstances._, function (view) {
            self.destroyView(view.id).add(view.id, view.attachedTo, true);
        });
        return this;
    };
    CubeViz_View_Application.prototype.restoreDataCopy = function (copy) {
        this._ = $.parseJSON(JSON.stringify(copy));
        return this;
    };
    CubeViz_View_Application.prototype.triggerEvent = function (eventName, data) {
        $(this).trigger(eventName, [
            data
        ]);
        return this;
    };
    CubeViz_View_Application.prototype.unbindEvent = function (eventName) {
        $(this).off(eventName);
        return this;
    };
    return CubeViz_View_Application;
})();
var CubeViz_View_Helper = (function () {
    function CubeViz_View_Helper() { }
    CubeViz_View_Helper.attachDialogTo = function attachDialogTo(domElement, options) {
        var defaultOptions = {
        };
        var options = options || {
        };

        defaultOptions.autoOpen = options.autoOpen || false;
        defaultOptions.closeOnEscape = options.closeOnEscape || false;
        defaultOptions.draggable = options.draggable || false;
        defaultOptions.height = options.height || "auto";
        defaultOptions.hide = options.hide || "slow";
        defaultOptions.modal = options.modal || true;
        defaultOptions.overlay = options.overlay || {
            "background-color": "#FFFFFF",
            opacity: 0.5
        };
        defaultOptions.resizable = options.resizable || false;
        defaultOptions.show = options.show || "slow";
        defaultOptions.width = options.width || "700";
        if(true === _.isUndefined(options.showCross) || false === options.showCross) {
            defaultOptions.open = function (event, ui) {
                $(".ui-dialog-titlebar-close", $(this).parent()).hide();
            };
        }
        ; ;
        domElement.dialog(defaultOptions);
        domElement.data("hasDialog", true);
    }
    CubeViz_View_Helper.closeDialog = function closeDialog(domElement) {
        domElement.dialog("close");
        domElement.data("isDialogOpen", false);
    }
    CubeViz_View_Helper.destroyDialog = function destroyDialog(domElement) {
        domElement.dialog("destroy");
        domElement.data("isDialogOpen", false);
    }
    CubeViz_View_Helper.openDialog = function openDialog(domElement) {
        domElement.dialog("open");
        domElement.data("isDialogOpen", true);
        $(".ui-widget-overlay").css("height", 2 * screen.height);
    }
    CubeViz_View_Helper.sortLiItemsByAlphabet = function sortLiItemsByAlphabet(listItems) {
        var a = "";
        var b = "";
        var data = {
        };
        var resultList = [];

        listItems.sort(function (a, b) {
            a = $(a).text().toUpperCase();
            b = $(b).text().toUpperCase();
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        });
        _.each(listItems, function (item) {
            data = $(item).data("data");
            item = $(item).clone();
            $(item).data("data", data);
            resultList.push(item);
        });
        return resultList;
    }
    CubeViz_View_Helper.sortLiItemsByCheckStatus = function sortLiItemsByCheckStatus(listItems) {
        var data = {
        };
        var notCheckedItems = [];
        var resultList = [];

        _.each(listItems, function (item) {
            if($($(item).children().first()).is(":checked")) {
                data = $(item).data("data");
                item = $(item).clone();
                $(item).data("data", data);
                resultList.push(item);
            } else {
                notCheckedItems.push(item);
            }
        });
        _.each(notCheckedItems, function (item) {
            data = $(item).data("data");
            item = $(item).clone();
            $(item).data("data", data);
            resultList.push(item);
        });
        return resultList;
    }
    CubeViz_View_Helper.sortLiItemsByObservationCount = function sortLiItemsByObservationCount(listItems, dimensionTypeUrl, retrievedObservations) {
        var dimensionElementUri = "";
        var listItemValues = [];
        var listItemsWithoutCount = [];
        var observationCount = 0;
        var resultList = [];

        _.each(listItems, function (liItem) {
            dimensionElementUri = $($(liItem).children().first()).val();
            observationCount = 0;
            _.each(retrievedObservations, function (observation) {
                if(dimensionElementUri === observation[dimensionTypeUrl][0].value) {
                    ++observationCount;
                }
            });
            $(liItem).data("observationCount", observationCount);
            if(0 < observationCount) {
                resultList.push($(liItem).clone());
            } else {
                listItemsWithoutCount.push(liItem);
            }
        });
        resultList.sort(function (a, b) {
            a = $(a).data("observationCount");
            b = $(b).data("observationCount");
            return (a < b) ? 1 : (a > b) ? -1 : 0;
        });
        _.each(listItemsWithoutCount, function (item) {
            resultList.push($(item).clone());
        });
        return resultList;
    }
    return CubeViz_View_Helper;
})();
var CubeViz_Visualization_Controller = (function () {
    function CubeViz_Visualization_Controller() { }
    CubeViz_Visualization_Controller.getColor = function getColor(variable) {
        var color = "#FFFFFF";
        if(true === _.isString(variable) || true === _.isNumber(variable)) {
            color = "" + CryptoJS.MD5(variable);
            color = "#" + color.substr((color["length"] - 6), 6);
        } else {
            if(false === _.isUndefined(variable)) {
                color = JSON.stringify(variable);
                color = "#" + color.substr((color["length"] - 6), 6);
            }
        }
        return color;
    }
    CubeViz_Visualization_Controller.getFromChartConfigByClass = function getFromChartConfigByClass(className, charts) {
        var result = undefined;
        _.each(charts, function (chart) {
            if(true === _.isUndefined(result)) {
                if(className == chart.class) {
                    result = chart;
                }
            }
        });
        return result;
    }
    CubeViz_Visualization_Controller.getMultipleDimensions = function getMultipleDimensions(selectedComponentDimensions) {
        var multipleDimensions = [];
        _.each(selectedComponentDimensions, function (selectedDimension) {
            if(2 <= _.keys(selectedDimension.__cv_elements).length) {
                multipleDimensions.push(selectedDimension);
            }
        });
        return multipleDimensions;
    }
    CubeViz_Visualization_Controller.getObjectValueByKeyString = function getObjectValueByKeyString(keyString, objToAccess) {
        var call = "objToAccess";
        var result = undefined;

        try  {
            _.each(keyString.split("."), function (key) {
                call += "." + key;
            });
            eval("result = " + call);
        } catch (ex) {
        }
        return result;
    }
    CubeViz_Visualization_Controller.getOneElementDimensions = function getOneElementDimensions(selectedComponentDimensions) {
        var oneElementDimensions = [];
        _.each(selectedComponentDimensions, function (selectedDimension) {
            if(1 == _.keys(selectedDimension.__cv_elements).length) {
                oneElementDimensions.push(selectedDimension);
            }
        });
        return oneElementDimensions;
    }
    CubeViz_Visualization_Controller.getVisualizationType = function getVisualizationType(className) {
        var hC = new CubeViz_Visualization_HighCharts();
        if(true === hC.isResponsibleFor(className)) {
            return hC.getName();
        }
        throw new Error("Unknown className " + className);
    }
    CubeViz_Visualization_Controller.setChartConfigClassEntry = function setChartConfigClassEntry(className, charts, newValue) {
        for(var i in charts) {
            if(className == charts[i].class) {
                charts[i] = newValue;
            }
        }
    }
    CubeViz_Visualization_Controller.updateVisualizationSettings = function updateVisualizationSettings(menuItemValues, visualizationSetting, chartConfigEntryDefaultConfig) {
        var call = "";
        var optionKey = "";
        var optionVal = "";
        var updatedSetting = visualizationSetting || {
        };

        if(0 === _.keys(updatedSetting).length) {
            updatedSetting = chartConfigEntryDefaultConfig;
        }
        updatedSetting = $.parseJSON(JSON.stringify(updatedSetting));
        _.each(menuItemValues, function (menuItemValue) {
            optionKey = $(menuItemValue).data("key");
            optionVal = $(menuItemValue).val();
            call = "updatedSetting";
            _.each(optionKey.split("."), function (key) {
                call += "." + key;
                eval(call + " = " + call + " || {};");
            });
            eval(call + " = optionVal;");
        });
        return updatedSetting;
    }
    return CubeViz_Visualization_Controller;
})();
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var CubeViz_Visualization_HighCharts = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts, _super);
    function CubeViz_Visualization_HighCharts() {
        _super.call(this);
        this.name = "HighCharts";
        this.supportedClassNames = [
            "CubeViz_Visualization_HighCharts_Area", 
            "CubeViz_Visualization_HighCharts_AreaSpline", 
            "CubeViz_Visualization_HighCharts_Bar", 
            "CubeViz_Visualization_HighCharts_Column", 
            "CubeViz_Visualization_HighCharts_Line", 
            "CubeViz_Visualization_HighCharts_Pie", 
            "CubeViz_Visualization_HighCharts_Polar", 
            "CubeViz_Visualization_HighCharts_Spline"
        ];
    }
    return CubeViz_Visualization_HighCharts;
})(CubeViz_Visualization);
var CubeViz_Visualization_HighCharts_Chart = (function () {
    function CubeViz_Visualization_HighCharts_Chart() { }
    CubeViz_Visualization_HighCharts_Chart.prototype.init = function (chartConfig, retrievedObservations, selectedComponentDimensions, multipleDimensions, oneElementDimensions, selectedMeasureUri) {
        var forXAxis = null;
        var forSeries = null;
        var observation = new DataCube_Observation();
        var self = this;

        this.chartConfig = chartConfig;
        this.chartConfig.series = [];
        if(true === _.isUndefined(self.chartConfig.xAxis)) {
            this.chartConfig.xAxis = {
                categories: []
            };
        } else {
            this.chartConfig.xAxis.categories = [];
        }
        this.chartConfig.title.text = "";
        _.each(selectedComponentDimensions, function (selectedDimension) {
            if(null == forXAxis) {
                forXAxis = selectedDimension["http://purl.org/linked-data/cube#dimension"];
            } else {
                forSeries = selectedDimension["http://purl.org/linked-data/cube#dimension"];
            }
        });
        this.chartConfig._cubeVizVisz = this.chartConfig._cubeVizVisz || {
        };
        if("true" == this.chartConfig._cubeVizVisz.doSwitchingAxes) {
            var tmp = forXAxis;
            forXAxis = forSeries;
            forSeries = tmp;
        }
        observation.initialize(retrievedObservations, selectedComponentDimensions, selectedMeasureUri);
        var xAxisElements = observation.getAxesElements(forXAxis);
        _.each(xAxisElements, function (xAxisElement) {
            self.chartConfig.xAxis.categories.push(xAxisElement.self.__cv_niceLabel);
        });
        var selectedDimensionPropertyUris = [];
        _.each(selectedComponentDimensions, function (dimension) {
            selectedDimensionPropertyUris.push(dimension["http://purl.org/linked-data/cube#dimension"]);
        });
        var obj = {
        };
        var seriesElements = observation.getAxesElements(forSeries);
        var uriCombination = "";
        var usedDimensionElementCombinations = {
        };

        self.chartConfig.series = [];
        _.each(seriesElements, function (seriesElement) {
            obj = {
                color: CubeViz_Visualization_Controller.getColor(seriesElement.self.__cv_uri),
                data: [],
                name: seriesElement.self.__cv_niceLabel
            };
            _.each(seriesElement.observations, function (seriesObservation) {
                uriCombination = "";
                _.each(selectedDimensionPropertyUris, function (dimensionUri) {
                    uriCombination += seriesObservation[dimensionUri];
                });
                if(true === _.isUndefined(usedDimensionElementCombinations[uriCombination])) {
                    usedDimensionElementCombinations[uriCombination] = true;
                } else {
                    return;
                }
                if(false === _.isUndefined(seriesObservation[selectedMeasureUri])) {
                    obj.data.push(parseFloat(seriesObservation[selectedMeasureUri]));
                } else {
                    obj.data.push(null);
                }
            });
            self.chartConfig.series.push(obj);
        });
        return this;
    };
    CubeViz_Visualization_HighCharts_Chart.prototype.getRenderResult = function () {
        return this.chartConfig;
    };
    return CubeViz_Visualization_HighCharts_Chart;
})();
var CubeViz_Visualization_HighCharts_Area = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Area, _super);
    function CubeViz_Visualization_HighCharts_Area() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_Area;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_AreaSpline = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_AreaSpline, _super);
    function CubeViz_Visualization_HighCharts_AreaSpline() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_AreaSpline;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_Bar = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Bar, _super);
    function CubeViz_Visualization_HighCharts_Bar() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_Bar;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_Column = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Column, _super);
    function CubeViz_Visualization_HighCharts_Column() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_Column;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_Line = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Line, _super);
    function CubeViz_Visualization_HighCharts_Line() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_Line;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_Pie = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Pie, _super);
    function CubeViz_Visualization_HighCharts_Pie() {
        _super.apply(this, arguments);

    }
    CubeViz_Visualization_HighCharts_Pie.prototype.init = function (chartConfig, retrievedObservations, selectedComponentDimensions, oneElementDimensions, multipleDimensions, selectedMeasureUri) {
        if(1 < _.size(multipleDimensions)) {
            throw new Error("Pie chart is only suitable for one dimension!");
            return;
        }
        var forXAxis = multipleDimensions[Object.keys(multipleDimensions)[0]]["http://purl.org/linked-data/cube#dimension"];
        var label = "";
        var observation = new DataCube_Observation();
        var self = this;
        var usedXAxisElements = [];
        var value = 0;

        this.chartConfig = chartConfig;
        this.chartConfig.series = [];
        this.chartConfig.colors = [];
        this.chartConfig.title.text = "";
        observation.initialize(retrievedObservations, selectedComponentDimensions, selectedMeasureUri);
        var xAxisElements = observation.sortAxis(forXAxis, "ascending").getAxesElements(forXAxis);
        this.chartConfig.series.push({
            type: "pie",
            name: this.chartConfig.title.text,
            data: []
        });
        _.each(xAxisElements, function (xAxisElement) {
            _.each(xAxisElement.observations, function (observation) {
                try  {
                    value = parseFloat(observation[selectedMeasureUri]);
                } catch (ex) {
                    return;
                }
                if(-1 == $.inArray(xAxisElement.self.__cv_niceLabel, usedXAxisElements)) {
                    self.chartConfig.series[0].data.push([
                        xAxisElement.self.__cv_niceLabel, 
                        value
                    ]);
                    self.chartConfig.colors.push(CubeViz_Visualization_Controller.getColor(xAxisElement.self.__cv_uri));
                    usedXAxisElements.push(xAxisElement.self.__cv_niceLabel);
                } else {
                    return;
                }
            });
        });
        return this;
    };
    return CubeViz_Visualization_HighCharts_Pie;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_Polar = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Polar, _super);
    function CubeViz_Visualization_HighCharts_Polar() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_Polar;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_Spline = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Spline, _super);
    function CubeViz_Visualization_HighCharts_Spline() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_Spline;
})(CubeViz_Visualization_HighCharts_Chart);
var DataCube_Component = (function () {
    function DataCube_Component() { }
    DataCube_Component.loadAllDimensions = function loadAllDimensions(url, modelIri, dsdUrl, dsUrl, callback) {
        $.ajax({
            url: url + "getcomponents",
            data: {
                modelIri: modelIri,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                componentType: "dimension"
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("loadAllDimensions: " + xhr.responseText);
        }).success(function (entries) {
            if(false === _.isUndefined(entries) && false === _.isUndefined(entries.content)) {
                callback(entries.content);
            }
        });
    }
    DataCube_Component.loadAllMeasures = function loadAllMeasures(url, modelIri, dsdUrl, dsUrl, callback) {
        $.ajax({
            url: url + "getcomponents",
            data: {
                modelIri: modelIri,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                componentType: "measure"
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("loadAllMeasures: " + xhr.responseText);
        }).done(function (entries) {
            if(false === _.isUndefined(entries) && false === _.isUndefined(entries.content)) {
                callback(entries.content);
            }
        });
    }
    DataCube_Component.getDefaultSelectedDimensions = function getDefaultSelectedDimensions(componentDimensions) {
        var alreadyUsedIndexes = [];
        var componentDimensions = JSON.parse(JSON.stringify(componentDimensions));
        var i = 0;
        var infinityBackup = 0;
        var maxNumberOfElements = 0;
        var numberOfElements = 0;
        var randomElementIndex = 0;
        var result = {
        };
        var selectedElements = {
        };

        _.each(componentDimensions, function (componentDimension, dimensionHashedUrl) {
            alreadyUsedIndexes = [];
            infinityBackup = 0;
            numberOfElements = _.keys(componentDimension.__cv_elements).length;
            maxNumberOfElements = 1 + Math.floor(_.keys(componentDimension.__cv_elements).length * 0.3);
            maxNumberOfElements = 10 < maxNumberOfElements ? 10 : 1 > maxNumberOfElements ? 1 : maxNumberOfElements;
            do {
                randomElementIndex = Math.floor((Math.random() * numberOfElements));
                if(-1 === $.inArray(randomElementIndex, alreadyUsedIndexes)) {
                    if((alreadyUsedIndexes.length + 1) <= maxNumberOfElements) {
                        alreadyUsedIndexes.push(randomElementIndex);
                    }
                    if(maxNumberOfElements == alreadyUsedIndexes.length) {
                        break;
                    }
                }
                infinityBackup++;
            }while((2 * maxNumberOfElements) > infinityBackup)
            selectedElements = {
            };
            i = 0;
            _.each(componentDimension.__cv_elements, function (element, elementUri) {
                if(-1 < $.inArray(i, alreadyUsedIndexes)) {
                    selectedElements[i] = element;
                }
                i++;
            });
            componentDimension.__cv_elements = selectedElements;
            result[dimensionHashedUrl] = componentDimension;
        });
        return result;
    }
    return DataCube_Component;
})();
var DataCube_DataSet = (function () {
    function DataCube_DataSet() { }
    DataCube_DataSet.loadAll = function loadAll(url, modelIri, dsdUrl, callback) {
        $.ajax({
            url: url + "getdatasets/",
            data: {
                dsdUrl: dsdUrl,
                modelIri: modelIri
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("loadAll error: " + xhr.responseText);
        }).success(function (entries) {
            if(false === _.isUndefined(entries) && false === _.isUndefined(entries.content)) {
                callback(entries.content);
            }
        });
    }
    return DataCube_DataSet;
})();
var DataCube_DataStructureDefinition = (function () {
    function DataCube_DataStructureDefinition() { }
    DataCube_DataStructureDefinition.loadAll = function loadAll(url, modelUrl, callback) {
        $.ajax({
            url: url + "getdatastructuredefinitions/",
            data: {
                m: modelUrl
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("loadAll error: " + xhr.responseText);
        }).done(function (entries) {
            DataCube_DataStructureDefinition.prepareLoadedDataStructureDefinitions(entries, callback);
        });
    }
    DataCube_DataStructureDefinition.prepareLoadedDataStructureDefinitions = function prepareLoadedDataStructureDefinitions(entries, callback) {
        entries = JSON.parse(entries);
        entries.sort(function (a, b) {
            return a["label"].toUpperCase().localeCompare(b["label"].toUpperCase());
        });
        callback(entries);
    }
    return DataCube_DataStructureDefinition;
})();
var DataCube_Observation = (function () {
    function DataCube_Observation() {
        this._axes = {
        };
    }
    DataCube_Observation.prototype.addAxisEntryPointsTo = function (uri, value, dimensionValues) {
        var self = this;
        _.each(dimensionValues, function (dimensionValue, dimensionUri) {
            dimensionValues[dimensionUri] = {
                "value": dimensionValue,
                "ref": self._axes[dimensionUri][dimensionValue]
            };
        });
        this._axes[uri][value].push(dimensionValues);
    };
    DataCube_Observation.prototype.getAxesElements = function (uri) {
        if(false === _.isUndefined(this._axes[uri])) {
            return this._axes[uri];
        } else {
            return {
            };
        }
    };
    DataCube_Observation.prototype.initialize = function (retrievedObservations, selectedComponentDimensions, measureUri) {
        var dimensionElementInfoObject = {
        };
        var dimensionPropertyUri = "";
        var observationDimensionProperty = {
        };
        var self = this;

        this._axes = {
        };
        _.each(retrievedObservations, function (observation) {
            _.each(selectedComponentDimensions, function (dimension) {
                dimensionPropertyUri = dimension["http://purl.org/linked-data/cube#dimension"];
                observationDimensionProperty = observation[dimensionPropertyUri];
                if(true === _.isUndefined(self._axes[dimensionPropertyUri])) {
                    self._axes[dimensionPropertyUri] = {
                    };
                }
                if(true === _.isUndefined(self._axes[dimensionPropertyUri][observationDimensionProperty])) {
                    dimensionElementInfoObject = {
                    };
                    _.each(dimension.__cv_elements, function (dimensionElement) {
                        if(dimensionElement.__cv_uri == observationDimensionProperty) {
                            dimensionElementInfoObject = dimensionElement;
                        }
                    });
                    self._axes[dimensionPropertyUri][observationDimensionProperty] = {
                        observations: {
                        },
                        self: dimensionElementInfoObject
                    };
                }
                self._axes[dimensionPropertyUri][observationDimensionProperty].observations[observation.__cv_uri] = observation;
            });
        });
        return this;
    };
    DataCube_Observation.loadAll = function loadAll(modelIri, dataHash, url, callback) {
        $.ajax({
            url: url + "getobservations/",
            data: {
                cv_dataHash: dataHash,
                modelIri: modelIri
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("Observation loadAll error: " + xhr.responseText);
        }).done(function (entries) {
            callback(entries.content);
        });
    }
    DataCube_Observation.prototype.sortAxis = function (axisUri, mode) {
        return this;
    };
    return DataCube_Observation;
})();
var View_CubeVizModule_DataStructureDefintion = (function (_super) {
    __extends(View_CubeVizModule_DataStructureDefintion, _super);
    function View_CubeVizModule_DataStructureDefintion(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_DataStructureDefintion", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CubeVizModule_DataStructureDefintion.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        CubeViz_View_Helper.destroyDialog($("#cubeviz-dataStructureDefinition-dialog"));
        return this;
    };
    View_CubeVizModule_DataStructureDefintion.prototype.initialize = function () {
        this.collection.reset("__cv_uri").addList(this.app._.data.dataStructureDefinitions);
        this.render();
    };
    View_CubeVizModule_DataStructureDefintion.prototype.onChange_list = function (event) {
        this.showSpinner();
        this.triggerGlobalEvent("onBeforeChange_selectedDSD");
        var selectedElementId = $("#cubeviz-dataStructureDefinition-list").val();
        var selectedElement = this.collection.get(selectedElementId);

        this.app._.data.selectedDSD = selectedElement;
        this.triggerGlobalEvent("onAfterChange_selectedDSD");
    };
    View_CubeVizModule_DataStructureDefintion.prototype.onClick_questionmark = function () {
        CubeViz_View_Helper.openDialog($("#cubeviz-dataStructureDefinition-dialog"));
    };
    View_CubeVizModule_DataStructureDefintion.prototype.onStart_application = function (event, data) {
        this.initialize();
    };
    View_CubeVizModule_DataStructureDefintion.prototype.render = function () {
        var list = $("#cubeviz-dataStructureDefinition-list");
        var optionTpl = _.template($("#cubeviz-dataStructureDefinition-tpl-listOption").text());
        var self = this;

        this.collection.each(function (element) {
            element["selected"] = element.__cv_uri == self.app._.data.selectedDSD.__cv_uri ? " selected" : "";
            list.append(optionTpl(element));
        });
        CubeViz_View_Helper.attachDialogTo($("#cubeviz-dataStructureDefinition-dialog"), {
            closeOnEscape: true,
            showCross: true,
            width: 500
        });
        this.bindUserInterfaceEvents({
            "change #cubeviz-dataStructureDefinition-list": this.onChange_list,
            "click #cubeviz-dataStructureDefinition-questionMark": this.onClick_questionmark
        });
        this.triggerGlobalEvent("onAfterRender_dataStructureDefinition");
        return this;
    };
    View_CubeVizModule_DataStructureDefintion.prototype.showSpinner = function () {
        $("#cubeviz-module-dataSelection").slideUp("slow", function () {
            $("#cubeviz-module-spinner").slideDown("slow");
        });
    };
    return View_CubeVizModule_DataStructureDefintion;
})(CubeViz_View_Abstract);
var View_CubeVizModule_DataSet = (function (_super) {
    __extends(View_CubeVizModule_DataSet, _super);
    function View_CubeVizModule_DataSet(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_DataSet", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onAfterChange_selectedDSD",
                handler: this.onAfterChange_selectedDSD
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CubeVizModule_DataSet.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        CubeViz_View_Helper.destroyDialog($("#cubeviz-dataSet-dialog"));
        return this;
    };
    View_CubeVizModule_DataSet.prototype.initialize = function () {
        this.collection.reset("__cv_uri");
        this.collection.addList(this.app._.data.dataSets);
        this.render();
    };
    View_CubeVizModule_DataSet.prototype.onChange_list = function () {
        this.showSpinner();
        var selectedElementId = $("#cubeviz-dataSet-list").val();
        var selectedElement = this["collection"].get(selectedElementId);

        this.app._.data.selectedDS = selectedElement;
        this.app._.backend.retrievedObservations = {
        };
        this.triggerGlobalEvent("onChange_selectedDS");
    };
    View_CubeVizModule_DataSet.prototype.onAfterChange_selectedDSD = function (event, data) {
        this.destroy();
        var self = this;
        DataCube_DataSet.loadAll(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data.selectedDSD.__cv_uri, function (entries) {
            self.app._.data.selectedDS = entries[0];
            self.app._.data.dataSets = entries;
            self.collection.reset("__cv_uri");
            self.collection.addList(entries);
            self.triggerGlobalEvent("onChange_selectedDS");
            self.render();
        });
    };
    View_CubeVizModule_DataSet.prototype.onClick_questionmark = function () {
        CubeViz_View_Helper.openDialog($("#cubeviz-dataSet-dialog"));
    };
    View_CubeVizModule_DataSet.prototype.onComplete_loadDSD = function (event, data) {
        this.onAfterChange_selectedDSD(event, data);
    };
    View_CubeVizModule_DataSet.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CubeVizModule_DataSet.prototype.render = function () {
        this.triggerGlobalEvent("onBeforeRender_dataSet");
        var list = $(this.attachedTo);
        var optionTpl = _.template($("#cubeviz-dataSet-tpl-listOption").text());
        var self = this;

        this.collection.each(function (element) {
            element.selected = element.__cv_uri == self.app._.data.selectedDS.__cv_uri ? " selected" : "";
            list.append(optionTpl(element));
        });
        CubeViz_View_Helper.attachDialogTo($("#cubeviz-dataSet-dialog"), {
            closeOnEscape: true,
            showCross: true,
            width: 500
        });
        this.bindUserInterfaceEvents({
            "change #cubeviz-dataSet-list": this.onChange_list,
            "click #cubeviz-dataSet-questionMark": this.onClick_questionmark
        });
        this.triggerGlobalEvent("onAfterRender_dataSet");
        return this;
    };
    View_CubeVizModule_DataSet.prototype.showSpinner = function () {
        $("#cubeviz-module-dataSelection").slideUp("slow", function () {
            $("#cubeviz-module-spinner").slideDown("slow");
        });
    };
    return View_CubeVizModule_DataSet;
})(CubeViz_View_Abstract);
var View_CubeVizModule_Component = (function (_super) {
    __extends(View_CubeVizModule_Component, _super);
    function View_CubeVizModule_Component(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_Component", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onChange_selectedDS",
                handler: this.onChange_selectedDS
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CubeVizModule_Component.prototype.configureSetupComponentDialog = function (component, componentBox, opener) {
        var dialogTpl = _.template($("#cubeviz-component-tpl-setupComponentDialog").text());
        var self = this;

        $("#cubeviz-component-setupDialogContainer").append(dialogTpl({
            __cv_niceLabel: component.__cv_niceLabel,
            __cv_hashedUri: component.__cv_hashedUri
        }));
        var div = $("#cubeviz-component-setupComponentDialog-" + component.__cv_hashedUri);
        div.data("componentBox", componentBox).data("component", component);
        CubeViz_View_Helper.attachDialogTo(div);
        $(div.find(".cubeviz-component-selectAllButton").get(0)).data("dialogDiv", div);
        $(div.find(".cubeviz-component-deselectButton").get(0)).data("dialogDiv", div);
        opener.data("dialogDiv", div);
        $($(div.find(".cubeviz-component-cancel")).get(0)).data("dialogDiv", div);
        $($(div.find(".cubeviz-component-closeAndUpdate")).get(0)).data("dialogDiv", div);
        $($(div.find(".cubeviz-component-sortButtons")).children().get(0)).data("dialogDiv", div).data("type", "alphabet");
        $($(div.find(".cubeviz-component-sortButtons")).children().get(1)).data("dialogDiv", div).data("type", "check status");
        $($(div.find(".cubeviz-component-sortButtons")).children().get(2)).data("dialogDiv", div).data("type", "observation count");
        this.configureSetupComponentElements(component);
    };
    View_CubeVizModule_Component.prototype.configureSetupComponentElements = function (component) {
        var dialogDiv = $("#cubeviz-component-setupComponentDialog-" + component.__cv_hashedUri);
        var elementInstance = {
        };
        var componentElements = new CubeViz_Collection("__cv_niceLabel");
        var elementList = $(dialogDiv.find(".cubeviz-component-setupComponentElements")[0]);
        var elementTpl = _.template($("#cubeviz-component-tpl-setupComponentElement").text());
        var selectedDimensions = this.app._.data.selectedComponents.dimensions[component.__cv_uri].__cv_elements;
        var setElementChecked = null;
        var wasSomethingSelected = false;

        componentElements.addList(component.__cv_elements).sortAscendingBy(componentElements.idKey).each(function (element) {
            setElementChecked = undefined !== _.find(selectedDimensions, function (dim) {
                return false === _.isUndefined(dim) ? dim.__cv_uri == element.__cv_uri : false;
            });
            if(true === setElementChecked) {
                wasSomethingSelected = true;
            }
            elementInstance = $(elementTpl({
                checked: true === setElementChecked ? " checked=\"checked\"" : "",
                hashedUri: element.__cv_hashedUri,
                __cv_niceLabel: element.__cv_niceLabel,
                __cv_uri: element.__cv_uri
            }));
            elementInstance.data("data", element);
            elementList.append(elementInstance);
        });
        if(false === wasSomethingSelected) {
            $($(elementList.find("li").first()).find("input")).attr("checked", "checked");
        }
    };
    View_CubeVizModule_Component.prototype.destroy = function () {
        _.each(this.collection._, function (component) {
            $("#cubeviz-component-setupComponentDialog-" + component.__cv_hashedUri).dialog("destroy");
            $("#cubeviz-component-setupComponentDialog-" + component.__cv_hashedUri).remove();
        });
        $("#cubeviz-component-setupDialogContainer").empty();
        _super.prototype.destroy.call(this);
        CubeViz_View_Helper.destroyDialog($("#cubeviz-component-dialog"));
        return this;
    };
    View_CubeVizModule_Component.prototype.hideCloseAndUpdateSpinner = function (dialogDiv) {
        $(dialogDiv.find(".cubeviz-component-closeUpdateSpinner").first()).hide();
    };
    View_CubeVizModule_Component.prototype.hideSpinner = function () {
        $("#cubeviz-module-spinner").slideUp("slow", function () {
            $("#cubeviz-module-dataSelection").slideDown("slow");
        });
    };
    View_CubeVizModule_Component.prototype.initialize = function () {
        this.collection.reset("__cv_hashedUri");
        this.collection.addList(this.app._.data.components.dimensions);
        this.render();
    };
    View_CubeVizModule_Component.prototype.loadComponentDimensions = function (callback) {
        var self = this;
        DataCube_Component.loadAllDimensions(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data.selectedDSD.__cv_uri, this.app._.data.selectedDS.__cv_uri, function (entries) {
            self.app._.data.components.dimensions = entries;
            self.app._.data.selectedComponents.dimensions = DataCube_Component.getDefaultSelectedDimensions(entries);
            self.collection.reset("__cv_hashedUri").addList(entries);
            callback();
        });
    };
    View_CubeVizModule_Component.prototype.loadComponentMeasures = function (callback) {
        var self = this;
        DataCube_Component.loadAllMeasures(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data.selectedDSD.__cv_uri, this.app._.data.selectedDS.__cv_uri, function (entries) {
            self.app._.data.components.measures = entries;
            self.app._.data.selectedComponents.measures = entries;
            callback();
        });
    };
    View_CubeVizModule_Component.prototype.onChange_selectedDS = function (event, data) {
        var self = this;
        this.destroy();
        this.loadComponentDimensions(function (newComponentDimensions) {
            self.loadComponentMeasures(function (newComponentMeasures) {
                CubeViz_ConfigurationLink.save(self.app._.backend.url, self.app._.data, "data", function (updatedDataHash) {
                    self.app._.backend.dataHash = updatedDataHash;
                    self.render();
                    self.hideSpinner();
                });
            });
        });
    };
    View_CubeVizModule_Component.prototype.onClick_cancel = function (event) {
        CubeViz_View_Helper.closeDialog($(event.target).data("dialogDiv"));
    };
    View_CubeVizModule_Component.prototype.onClick_closeAndUpdate = function (event) {
        var dialogDiv = $(event.target).data("dialogDiv");
        var self = this;

        this.showCloseAndUpdateSpinner(dialogDiv);
        this.readAndSaveSetupComponentDialogChanges(dialogDiv, function () {
            if(true === cubeVizApp._.backend.uiParts.index.isLoaded) {
                self.triggerGlobalEvent("onReRender_visualization");
            }
            self.triggerGlobalEvent("onUpdate_componentDimensions");
            self.hideCloseAndUpdateSpinner(dialogDiv);
            CubeViz_View_Helper.closeDialog(dialogDiv);
        });
    };
    View_CubeVizModule_Component.prototype.onClick_deselectButton = function (event) {
        $(event.target).data("dialogDiv").find("[type=\"checkbox\"]").attr("checked", false);
    };
    View_CubeVizModule_Component.prototype.onClick_selectAllButton = function (event) {
        $(event.target).data("dialogDiv").find("[type=\"checkbox\"]").attr("checked", true);
    };
    View_CubeVizModule_Component.prototype.onClick_setupComponentOpener = function (event) {
        this.triggerGlobalEvent("onClick_setupComponentOpener");
        CubeViz_View_Helper.openDialog($(event.target).data("dialogDiv"));
    };
    View_CubeVizModule_Component.prototype.onClick_sortButton = function (event) {
        var dialogDiv = $(event.target).data("dialogDiv");
        if(true === _.isUndefined(dialogDiv)) {
            return;
        }
        var dimensionTypeUrl = dialogDiv.data("dimensionTypeUrl");
        var list = $(dialogDiv.find(".cubeviz-component-setupComponentElements").first());
        var listItems = list.children('li');
        var modifiedItemList = [];

        $(event.target).data("dialogDiv").find(".cubeviz-component-sortButton").removeClass("cubeviz-component-sortButtonSelected");
        $(event.target).addClass("cubeviz-component-sortButtonSelected");
        switch($(event.target).data("type")) {
            case "alphabet": {
                modifiedItemList = CubeViz_View_Helper.sortLiItemsByAlphabet(listItems);
                break;

            }
            case "check status": {
                modifiedItemList = CubeViz_View_Helper.sortLiItemsByCheckStatus(listItems);
                break;

            }
            case "observation count": {
                modifiedItemList = CubeViz_View_Helper.sortLiItemsByObservationCount(listItems, dimensionTypeUrl, this.app._.backend.retrievedObservations);
                break;

            }
            default: {
                return;

            }
        }
        list.empty();
        _.each(modifiedItemList, function (item) {
            list.append(item);
        });
    };
    View_CubeVizModule_Component.prototype.onClick_questionmark = function () {
        CubeViz_View_Helper.openDialog($("#cubeviz-component-dialog"));
    };
    View_CubeVizModule_Component.prototype.readAndSaveSetupComponentDialogChanges = function (dialogDiv, callback) {
        var elementList = dialogDiv.find(".cubeviz-component-setupComponentElements").children();
        var componentBox = dialogDiv.data("componentBox");
        var component = dialogDiv.data("component");
        var input = null;
        var inputLabel = null;
        var selectedElements = new CubeViz_Collection("__cv_uri");
        var self = this;

        if(undefined === component) {
            return;
        }
        _.each(elementList, function (element) {
            input = $($(element).children().get(0));
            inputLabel = $($(element).children().get(1));
            if("checked" === input.attr("checked")) {
                selectedElements.add($(element).data("data"));
            }
        });
        if(0 == _.size(selectedElements)) {
            selectedElements.add(JSON.parse(JSON.stringify(this.app._.data.components.dimensions[component.__cv_uri].__cv_elements[0])));
            $($(dialogDiv.find(".cubeviz-component-setupComponentElements").children().get(0)).children().get(0)).attr("checked", true);
        }
        this.app._.data.selectedComponents.dimensions[component.__cv_uri].__cv_elements = selectedElements.toObject();
        $(componentBox.find(".cubeviz-component-selectedCount").get(0)).html(selectedElements.size());
        this.app._.data.numberOfMultipleDimensions = _.size(CubeViz_Visualization_Controller.getMultipleDimensions(this.app._.data.selectedComponents.dimensions));
        this.app._.data.numberOfOneElementDimensions = _.size(CubeViz_Visualization_Controller.getOneElementDimensions(this.app._.data.selectedComponents.dimensions));
        CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.data, "data", function (updatedDataHash) {
            DataCube_Observation.loadAll(self.app._.backend.modelUrl, updatedDataHash, self.app._.backend.url, function (newEntities) {
                self.app._.backend.retrievedObservations = newEntities;
                callback();
            });
            self.app._.backend.dataHash = updatedDataHash;
        });
    };
    View_CubeVizModule_Component.prototype.onComplete_loadDS = function (event, data) {
        this.onChange_selectedDS(event, data);
    };
    View_CubeVizModule_Component.prototype.onComplete_loadObservations = function (event, updatedRetrievedObservations) {
        this.app._.backend.retrievedObservations = updatedRetrievedObservations;
    };
    View_CubeVizModule_Component.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CubeVizModule_Component.prototype.render = function () {
        this.triggerGlobalEvent("onBeforeRender_component");
        var backendCollection = this.collection._;
        var list = $("#cubviz-component-listBox");
        var componentBox = null;
        var optionTpl = _.template($("#cubeviz-component-tpl-listBoxItem").text());
        var selectedComponentDimensions = this.app._.data.selectedComponents.dimensions;
        var selectedDimension = null;
        var self = this;
        var tmp = null;

        this.collection.reset();
        _.each(backendCollection, function (dimension) {
            if(false === _.isUndefined(selectedComponentDimensions)) {
                selectedDimension = selectedComponentDimensions[dimension.__cv_uri];
                dimension.selectedElementCount = _.keys(selectedDimension.__cv_elements).length;
            } else {
                dimension.selectedElementCount = 1;
            }
            dimension.elementCount = _.size(dimension.__cv_elements);
            componentBox = $(optionTpl(dimension));
            $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0)).data("dimension", dimension);
            list.append(componentBox);
            self.configureSetupComponentDialog(dimension, componentBox, $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0)));
            $(componentBox.find(".cubeviz-component-selectedCount").get(0)).html(dimension.selectedElementCount);
            self.collection.add(dimension);
        });
        CubeViz_View_Helper.attachDialogTo($("#cubeviz-component-dialog"), {
            closeOnEscape: true,
            showCross: true,
            width: 500
        });
        this.bindUserInterfaceEvents({
            "click .cubeviz-component-cancel": this.onClick_cancel,
            "click .cubeviz-component-closeAndUpdate": this.onClick_closeAndUpdate,
            "click .cubeviz-component-deselectButton": this.onClick_deselectButton,
            "click .cubeviz-component-selectAllButton": this.onClick_selectAllButton,
            "click .cubeviz-component-setupComponentOpener": this.onClick_setupComponentOpener,
            "click .cubeviz-component-sortButtons": this.onClick_sortButton,
            "click #cubeviz-component-questionMark": this.onClick_questionmark
        });
        this.triggerGlobalEvent("onAfterRender_component");
        this.hideSpinner();
        return this;
    };
    View_CubeVizModule_Component.prototype.showCloseAndUpdateSpinner = function (dialogDiv) {
        $(dialogDiv.find(".cubeviz-component-closeUpdateSpinner").first()).show();
    };
    return View_CubeVizModule_Component;
})(CubeViz_View_Abstract);
var View_CubeVizModule_Footer = (function (_super) {
    __extends(View_CubeVizModule_Footer, _super);
    function View_CubeVizModule_Footer(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_Footer", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onAfterChange_selectedDSD",
                handler: this.onAfterChange_selectedDSD
            }, 
            {
                name: "onBeforeClick_selectorItem",
                handler: this.onBeforeClick_selectorItem
            }, 
            {
                name: "onChange_selectedDS",
                handler: this.onChange_selectedDS
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }, 
            {
                name: "onUpdate_componentDimensions",
                handler: this.onUpdate_componentDimensions
            }
        ]);
    }
    View_CubeVizModule_Footer.prototype.changePermaLinkButton = function () {
        var value = "";
        if(true == _.isUndefined(this.collection.get("buttonVal"))) {
            this.collection.add({
                id: "buttonVal",
                value: $("#cubeviz-footer-permaLinkButton").html().toString().trim()
            });
            this.showLink("<");
        } else {
            value = this.collection.get("buttonVal").value;
            this.collection.remove("buttonVal");
            this.closeLink(value);
        }
    };
    View_CubeVizModule_Footer.prototype.closeLink = function (label) {
        $("#cubeviz-footer-permaLinkButton").fadeOut("slow");
        $("#cubeviz-footer-permaLinkMenu").fadeOut("slow", function () {
            $("#cubeviz-footer-permaLinkButton").html(label).show();
        });
    };
    View_CubeVizModule_Footer.prototype.initialize = function () {
        this.collection.add({
            id: "cubeviz-footer-permaLink",
            html: $("#cubeviz-footer-permaLink").html()
        });
        this.render();
    };
    View_CubeVizModule_Footer.prototype.onAfterChange_selectedDSD = function () {
        if(false === _.isUndefined(this.collection.get("buttonVal"))) {
            this.changePermaLinkButton();
        }
    };
    View_CubeVizModule_Footer.prototype.onBeforeClick_selectorItem = function () {
        if(true == _.isUndefined(this.collection.get("buttonVal"))) {
        } else {
            var value = this.collection.get("buttonVal").value;
            this.collection.remove("buttonVal");
            this.closeLink(value);
        }
    };
    View_CubeVizModule_Footer.prototype.onChange_selectedDS = function () {
        this.onAfterChange_selectedDSD();
    };
    View_CubeVizModule_Footer.prototype.onClick_permaLinkButton = function (event) {
        this.changePermaLinkButton();
    };
    View_CubeVizModule_Footer.prototype.onClick_showVisualization = function (event) {
        var self = this;
        if(true === cubeVizApp._.backend.uiParts.index.isLoaded) {
            this.triggerGlobalEvent("onReRender_visualization");
        } else {
            if(false === cubeVizApp._.backend.uiParts.index.isLoaded) {
                CubeViz_ConfigurationLink.save(self.app._.backend.url, self.app._.data, "data", function (updatedDataHash) {
                    window.location.href = self.app._.backend.url + "?m=" + encodeURIComponent(self.app._.backend.modelUrl) + "&cv_dataHash=" + updatedDataHash + "&cv_uiHash=" + self.app._.backend.uiHash;
                });
            } else {
                CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.data, "data", function (updatedDataHash) {
                    window.location.href = self.app._.backend.url + "?m=" + encodeURIComponent(self.app._.backend.modelUrl) + "&cv_dataHash=" + updatedDataHash + "&cv_uiHash=" + self.app._.backend.uiHash;
                });
            }
        }
    };
    View_CubeVizModule_Footer.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CubeVizModule_Footer.prototype.onUpdate_componentDimensions = function () {
        if(true == _.isUndefined(this.collection.get("buttonVal"))) {
        } else {
            var value = this.collection.get("buttonVal").value;
            this.collection.remove("buttonVal");
            this.closeLink(value);
        }
    };
    View_CubeVizModule_Footer.prototype.render = function () {
        this.bindUserInterfaceEvents({
            "click #cubeviz-footer-permaLinkButton": this.onClick_permaLinkButton,
            "click #cubeviz-footer-showVisualizationButton": this.onClick_showVisualization
        });
        return this;
    };
    View_CubeVizModule_Footer.prototype.showLink = function (label) {
        var self = this;
        $("#cubeviz-footer-permaLinkButton").fadeOut("slow", function () {
            $("#cubeviz-footer-permaLinkButton").html(label).fadeIn("slow");
            var link = self.app._.backend.url + "?m=" + encodeURIComponent(self.app._.backend.modelUrl) + "&cv_dataHash=" + self.app._.backend.dataHash + "&cv_uiHash=" + self.app._.backend.uiHash;
            var url = $("<a></a>").attr("href", link).attr("target", "_self").html(self.collection.get("cubeviz-footer-permaLink").html);
            $("#cubeviz-footer-permaLink").html(url).fadeIn("slow");
            $("#cubeviz-footer-permaLinkMenu").fadeIn("slow");
        });
    };
    return View_CubeVizModule_Footer;
})(CubeViz_View_Abstract);
var View_IndexAction_Header = (function (_super) {
    __extends(View_IndexAction_Header, _super);
    function View_IndexAction_Header(attachedTo, app) {
        _super.call(this, "View_IndexAction_Header", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_IndexAction_Header.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        CubeViz_View_Helper.destroyDialog($("#cubeviz-index-headerDialogBox"));
        return this;
    };
    View_IndexAction_Header.prototype.initialize = function () {
        this.render();
    };
    View_IndexAction_Header.prototype.onClick_questionMark = function () {
        $("#cubeviz-index-headerDialogBox").dialog("open");
    };
    View_IndexAction_Header.prototype.onStart_application = function () {
        this.initialize();
    };
    View_IndexAction_Header.prototype.render = function () {
        CubeViz_View_Helper.attachDialogTo($("#cubeviz-index-headerDialogBox"), {
            closeOnEscape: true,
            height: "500",
            showCross: true,
            width: "50%"
        });
        this.renderHeader();
        this.renderDialogBox();
        this.bindUserInterfaceEvents({
            "click #cubeviz-index-headerQuestionMarkHeadline": this.onClick_questionMark
        });
        return this;
    };
    View_IndexAction_Header.prototype.renderDialogBox = function () {
        var headerDialogHead = _.template($("#cubeviz-index-tpl-headerDialogBoxHead").text());
        var modelLabel = "";

        if(false === _.isUndefined(this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"]) && false === _.str.isBlank(this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"])) {
            modelLabel = this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"].content;
        } else {
            modelLabel = this.app._.backend.modelUrl;
        }
        $("#cubeviz-index-headerDialogBox").html(headerDialogHead({
            label: modelLabel
        }));
        var entryTpl = _.template($("#cubeviz-index-tpl-headerDialogBoxEntry").text());
        var htmlModelInformation = "";
        _.each(this.app._.backend.modelInformation, function (entry) {
            htmlModelInformation += entryTpl({
                predicateLabel: entry.predicateLabel,
                objectContent: entry.content
            });
        });
        $("#cubeviz-index-headerDialogBoxModelInformation").html(htmlModelInformation);
    };
    View_IndexAction_Header.prototype.renderHeader = function () {
        var modelLabel;
        if(false === _.isUndefined(this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"]) && false === _.str.isBlank(this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"])) {
            modelLabel = this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"].content;
        } else {
            modelLabel = this.app._.backend.modelUrl;
        }
        var headerTpl = _.template($("#cubeviz-index-tpl-header").text());
        $("#cubeviz-index-header").html(headerTpl({
            modelLabel: modelLabel
        }));
    };
    return View_IndexAction_Header;
})(CubeViz_View_Abstract);
var View_IndexAction_Legend = (function (_super) {
    __extends(View_IndexAction_Legend, _super);
    function View_IndexAction_Legend(attachedTo, app) {
        _super.call(this, "View_IndexAction_Legend", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onReRender_visualization",
                handler: this.onReRender_visualization
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_IndexAction_Legend.prototype.destroy = function () {
        $("#cubeviz-legend-btnShowRetrievedObservations").off();
        $("#cubeviz-legend-sortByTitle").off();
        $("#cubeviz-legend-sortByValue").off();
        $("#cubeviz-legend-retrievedObservations").slideUp("slow");
        $("#cubeviz-legend-selectedConfiguration").slideUp("slow");
        $("#cubeviz-legend-dataSet").html("");
        $("#cubeviz-legend-observations").html("");
        $("#cubeviz-legend-configurationList").html("");
        CubeViz_View_Helper.destroyDialog($("#cubeviz-legend-componentDimensionInfoDialog"));
        _super.prototype.destroy.call(this);
        return this;
    };
    View_IndexAction_Legend.prototype.displayDsdAndDs = function (dsdLabel, dsdUrl, dsLabel, dsUrl) {
        var dsdAndDsTpl = _.template($("#cubeviz-legend-tpl-dsdAndDs").text());
        $("#cubeviz-legend-dsdAndDs").html(dsdAndDsTpl({
            dsdLabel: dsdLabel,
            dsdUrl: dsdUrl,
            dsLabel: dsLabel,
            dsUrl: dsUrl
        }));
    };
    View_IndexAction_Legend.prototype.displayRetrievedObservations = function (list) {
        var observationInfoEntry = _.template($("#cubeviz-legend-tpl-observationInfoListEntry").text());
        var observationTpl = _.template($("#cubeviz-legend-tpl-observation").text());

        var infoList = null;
        var label = "";

        $("#cubeviz-legend-observations").html("");
        _.each(list, function (obs) {
            $("#cubeviz-legend-observations").append(observationTpl(obs));
            infoList = $($("#cubeviz-legend-observations").find(".cubeviz-legend-observationInfoList").last());
            _.each(obs.__cv_elements, function (dimensionElement) {
                infoList.append(observationInfoEntry({
                    dimensionLabel: dimensionElement.dimensionLabel,
                    fullLabel: dimensionElement.__cv_niceLabel,
                    shortLabel: _.str.prune(dimensionElement.__cv_niceLabel, 65, "..."),
                    __cv_uri: dimensionElement.__cv_uri
                }));
            });
        });
    };
    View_IndexAction_Legend.prototype.displaySelectedConfiguration = function (selectedComponentDimensions) {
        var tplComponentDimension = _.template($("#cubeviz-legend-tpl-componentDimension").text());
        var tplComponentsList = _.template($("#cubeviz-legend-tpl-componentList").text());
        var tplDimensionEntry = _.template($("#cubeviz-legend-tpl-componentDimensionEntry").text());

        var componentDimensionInfoArea = null;
        var observationIcon = null;
        var dimensionElementList = null;
        var dimensionElementsCopy = new CubeViz_Collection("__cv_uri");
        var html = "";
        var label = "";

        $("#cubeviz-legend-components").html(tplComponentsList());
        _.each(selectedComponentDimensions, function (dimension) {
            $("#cubeviz-legend-componentList").append(tplComponentDimension({
                __cv_niceLabel: dimension.__cv_niceLabel
            }));
            dimensionElementList = $($("#cubeviz-legend-componentList").find(".cubeviz-legend-componentDimensionList").last());
            html = "";
            dimensionElementsCopy.reset().addList(JSON.parse(JSON.stringify(dimension.__cv_elements))).sortAscendingBy().each(function (dimensionElement) {
                dimensionElementList.append(tplDimensionEntry({
                    fullLabel: dimensionElement.__cv_niceLabel,
                    shortLabel: _.str.prune(dimensionElement.__cv_niceLabel, 75, " ..."),
                    __cv_uri: dimensionElement.__cv_uri
                }));
                observationIcon = $(dimensionElementList.find(".cubeviz-legend-observationIcon").last());
                componentDimensionInfoArea = $(dimensionElementList.find(".cubeviz-legend-componentDimensionInfoArea").last());
                $(dimensionElementList.find(".cubeviz-legend-componentDimensionShowInfo").last()).data("componentDimensionInfoArea", componentDimensionInfoArea).data("dimension", dimension).data("dimensionElement", dimensionElement).data("observationIcon", observationIcon);
            });
        });
    };
    View_IndexAction_Legend.prototype.generateList = function (observations, selectedComponentDimensions, selectedMeasureUri) {
        var cubeDimensionUri = "http://purl.org/linked-data/cube#dimension";
        var observationLabel = "";
        var dimensionElementLabelTpl = _.template($("#cubeviz-legend-tpl-dimensionElementLabel").text());
        var dimensionElements = [];
        var label = "";
        var observationLabel = "";
        var rdfsLabelUri = "http://www.w3.org/2000/01/rdf-schema#label";
        var result = [];

        _.each(observations, function (observation) {
            dimensionElements = [];
            _.each(selectedComponentDimensions, function (dimension) {
                _.each(dimension.__cv_elements, function (dimensionElement) {
                    if(dimensionElement.__cv_uri == observation[dimension[cubeDimensionUri]]) {
                        dimensionElements.push({
                            dimensionLabel: dimension.__cv_niceLabel,
                            __cv_niceLabel: dimensionElement.__cv_niceLabel,
                            __cv_uri: dimensionElement.__cv_uri
                        });
                    }
                });
            });
            result.push({
                __cv_niceLabel: observation.__cv_niceLabel,
                __cv_value: observation[selectedMeasureUri],
                __cv_uri: observation.__cv_uri,
                __cv_elements: dimensionElements
            });
        });
        return result;
    };
    View_IndexAction_Legend.prototype.initialize = function () {
        this.render();
    };
    View_IndexAction_Legend.prototype.onClick_btnShowSelectedConfiguration = function (event) {
        event.preventDefault();
        $("#cubeviz-legend-selectedConfiguration").slideToggle('slow');
        return false;
    };
    View_IndexAction_Legend.prototype.onClick_btnShowRetrievedObservations = function (event) {
        event.preventDefault();
        $("#cubeviz-legend-retrievedObservations").slideToggle('slow');
        return false;
    };
    View_IndexAction_Legend.prototype.onClick_componentDimensionShowInfo = function (event) {
        event.preventDefault();
        var showMoreInformationBtn = $(event.target);
        var dimension = showMoreInformationBtn.data("dimension");
        var dimensionElement = showMoreInformationBtn.data("dimensionElement");
        var observationIcon = showMoreInformationBtn.data("observationIcon");

        var tplInfoHeader = _.template($("#cubeviz-legend-tpl-componentDimensionInfoHeader").text());
        var tplInfoList = _.template($("#cubeviz-legend-tpl-componentDimensionInfoList").text());
        var tplInfoListEntry = _.template($("#cubeviz-legend-tpl-componentDimensionInfoListEntry").text());

        var infoList = $(tplInfoList());
        _.each(dimensionElement, function (value, key) {
            if(false === _.str.startsWith(key, "__cv_")) {
                infoList.append(tplInfoListEntry({
                    key: key,
                    value: value
                }));
            }
        });
        $("#cubeviz-legend-componentDimensionInfoDialog").html("").append($(tplInfoHeader())).append(infoList).fadeToggle("slow");
        $("#cubeviz-legend-componentDimensionInfoDialog").dialog("open");
        return false;
    };
    View_IndexAction_Legend.prototype.onClick_sortByTitle = function () {
        this.collection.sortAscendingBy("__cv_niceLabel");
        this.displayRetrievedObservations(this.collection._);
    };
    View_IndexAction_Legend.prototype.onClick_sortByValue = function () {
        this.collection.sortAscendingBy("__cv_value");
        this.displayRetrievedObservations(this.collection._);
    };
    View_IndexAction_Legend.prototype.onReRender_visualization = function () {
        this.destroy();
        this.initialize();
    };
    View_IndexAction_Legend.prototype.onStart_application = function () {
        this.initialize();
    };
    View_IndexAction_Legend.prototype.render = function () {
        var selectedMeasureUri = this.app._.data.selectedComponents.measures[Object.keys(this.app._.data.selectedComponents.measures)[0]]["http://purl.org/linked-data/cube#measure"];
        var self = this;

        this.displayDsdAndDs(this.app._.data.selectedDSD.__cv_niceLabel, this.app._.data.selectedDSD.__cv_uri, this.app._.data.selectedDS.__cv_niceLabel, this.app._.data.selectedDS.__cv_uri);
        this.displaySelectedConfiguration(this.app._.data.selectedComponents.dimensions);
        this.collection.reset("__cv_niceLabel").addList(this.generateList(this.app._.backend.retrievedObservations, this.app._.data.selectedComponents.dimensions, selectedMeasureUri));
        this.collection.sortAscendingBy("__cv_niceLabel");
        this.displayRetrievedObservations(this.collection._);
        CubeViz_View_Helper.attachDialogTo($("#cubeviz-legend-componentDimensionInfoDialog"), {
            closeOnEscape: true,
            showCross: true,
            height: 500,
            width: 550
        });
        $("#cubeviz-legend-btnShowRetrievedObservations").off();
        $("#cubeviz-legend-btnShowSelectedConfiguration").off();
        $("#cubeviz-legend-componentDimensionShowInfo").off();
        $("#cubeviz-legend-sortByTitle").off();
        $("#cubeviz-legend-sortByValue").off();
        this.bindUserInterfaceEvents({
            "click #cubeviz-legend-btnShowSelectedConfiguration": this.onClick_btnShowSelectedConfiguration,
            "click #cubeviz-legend-btnShowRetrievedObservations": this.onClick_btnShowRetrievedObservations,
            "click .cubeviz-legend-componentDimensionShowInfo": this.onClick_componentDimensionShowInfo,
            "click #cubeviz-legend-sortByTitle": this.onClick_sortByTitle,
            "click #cubeviz-legend-sortByValue": this.onClick_sortByValue
        });
        return this;
    };
    return View_IndexAction_Legend;
})(CubeViz_View_Abstract);
var View_IndexAction_Visualization = (function (_super) {
    __extends(View_IndexAction_Visualization, _super);
    function View_IndexAction_Visualization(attachedTo, app) {
        _super.call(this, "View_IndexAction_Visualization", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onChange_visualizationClass",
                handler: this.onChange_visualizationClass
            }, 
            {
                name: "onReRender_visualization",
                handler: this.onReRender_visualization
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_IndexAction_Visualization.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        return this;
    };
    View_IndexAction_Visualization.prototype.handleException = function (thrownException) {
        if(true === _.str.include(thrownException, "Highcharts error #10")) {
            $("#cubeviz-index-visualization").html($("#cubeviz-visualization-tpl-notificationHightchartsException10").html());
        }
        if(false === _.isUndefined(console) && false === _.isUndefined(console.log)) {
            console.log(thrownException);
        }
    };
    View_IndexAction_Visualization.prototype.initialize = function () {
        this.render();
    };
    View_IndexAction_Visualization.prototype.onChange_visualizationClass = function () {
        this.renderChart();
    };
    View_IndexAction_Visualization.prototype.onClick_nothingFoundNotificationLink = function (event) {
        $("#cubeviz-visualization-nothingFoundFurtherExplanation").slideDown("slow");
    };
    View_IndexAction_Visualization.prototype.onReRender_visualization = function () {
        this.render();
    };
    View_IndexAction_Visualization.prototype.onStart_application = function () {
        this.initialize();
    };
    View_IndexAction_Visualization.prototype.render = function () {
        if(1 <= _.size(this.app._.backend.retrievedObservations)) {
            this.renderChart();
        } else {
            $("#cubeviz-index-visualization").html("").append($("#cubeviz-visualization-nothingFoundNotificationContainer").html());
            this.setVisualizationHeight();
        }
        this.bindUserInterfaceEvents({
            "click #cubeviz-visualization-nothingFoundNotificationLink": this.onClick_nothingFoundNotificationLink
        });
        return this;
    };
    View_IndexAction_Visualization.prototype.renderChart = function () {
        var fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.class, this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts);
        var selectedMeasure = this.app._.data.selectedComponents.measures[Object.keys(this.app._.data.selectedComponents.measures)[0]];
        var type = null;
        var visualizationSetting = null;

        if(true === _.isUndefined(fromChartConfig)) {
            this.app._.ui.visualization.class = this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts[0].class;
            fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.class, this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts);
        }
        visualizationSetting = CubeViz_Visualization_Controller.updateVisualizationSettings([], this.app._.ui.visualizationSettings[this.app._.ui.visualization.class], fromChartConfig.defaultConfig);
        type = CubeViz_Visualization_Controller.getVisualizationType(this.app._.ui.visualization.class);
        if(false === _.isUndefined(this.app._.generatedVisualization)) {
            try  {
                this.app._.generatedVisualization.destroy();
            } catch (ex) {
                if(false === _.isUndefined(console) && false === _.isUndefined(console.log)) {
                    console.log(ex);
                }
            }
        }
        var hC = new CubeViz_Visualization_HighCharts();
        var chart = hC.load(this.app._.ui.visualization.class);
        chart.init(visualizationSetting, this.app._.backend.retrievedObservations, this.app._.data.selectedComponents.dimensions, CubeViz_Visualization_Controller.getOneElementDimensions(this.app._.data.selectedComponents.dimensions), CubeViz_Visualization_Controller.getMultipleDimensions(this.app._.data.selectedComponents.dimensions), selectedMeasure["http://purl.org/linked-data/cube#measure"]);
        try  {
            this.setVisualizationHeight(_.size(chart.getRenderResult().xAxis.categories));
            this.app._.generatedVisualization = new Highcharts.Chart(chart.getRenderResult());
        } catch (ex) {
            this.handleException(ex);
        }
    };
    View_IndexAction_Visualization.prototype.setVisualizationHeight = function (numberOfYAxisElements) {
        if (typeof numberOfYAxisElements === "undefined") { numberOfYAxisElements = 0; }
        var offset = $(this.attachedTo).offset();
        var minHeight = $(window).height() - offset.top - 95;
        var tmp = 0;

        if(0 < numberOfYAxisElements) {
            tmp = numberOfYAxisElements * 40;
            if(tmp > minHeight) {
                minHeight = tmp;
            }
        }
        $(this.attachedTo).css("height", minHeight);
    };
    return View_IndexAction_Visualization;
})(CubeViz_View_Abstract);
var View_IndexAction_VisualizationSelector = (function (_super) {
    __extends(View_IndexAction_VisualizationSelector, _super);
    function View_IndexAction_VisualizationSelector(attachedTo, app) {
        _super.call(this, "View_IndexAction_VisualizationSelector", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onReRender_visualization",
                handler: this.onReRender_visualization
            }, 
            {
                name: "onClick_setupComponentOpener",
                handler: this.onClick_setupComponentOpener
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_IndexAction_VisualizationSelector.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        $("#cubeviz-visualizationselector-selector").empty();
        this.hideDongle();
        this.hideMenu();
        return this;
    };
    View_IndexAction_VisualizationSelector.prototype.hideDongle = function () {
        $("#cubeviz-visualizationselector-menuDongleDiv").fadeOut("slow");
        return this;
    };
    View_IndexAction_VisualizationSelector.prototype.hideMenu = function () {
        this.triggerGlobalEvent("onBeforeHide_visualizationSelectorMenu");
        $("#cubeviz-visualizationselector-menu").fadeOut("slow");
        $("#cubeviz-visualizationselector-menuItems").html("");
        this.triggerGlobalEvent("onAfterHide_visualizationSelectorMenu");
        return this;
    };
    View_IndexAction_VisualizationSelector.prototype.initialize = function () {
        this.render();
    };
    View_IndexAction_VisualizationSelector.prototype.onClick_setupComponentOpener = function () {
        this.hideMenu();
    };
    View_IndexAction_VisualizationSelector.prototype.onClick_closeMenu = function () {
        this.hideMenu();
    };
    View_IndexAction_VisualizationSelector.prototype.onClick_selectorItem = function (event) {
        this.triggerGlobalEvent("onBeforeClick_selectorItem");
        var prevClass = "";
        var selectorItemDiv = null;
        var self = this;

        if(true === _.isUndefined($(event.target).data("class"))) {
            selectorItemDiv = $($(event.target).parent());
            this.app._.ui.visualization.class = selectorItemDiv.data("class");
        } else {
            selectorItemDiv = $(event.target);
            this.app._.ui.visualization.class = selectorItemDiv.data("class");
        }
        prevClass = $($(".cubeviz-visualizationselector-selectedSelectorItem").get(0)).data("class");
        this.hideDongle();
        if(prevClass == this.app._.ui.visualization.class) {
            this.showMenu(selectorItemDiv);
        } else {
            this.hideMenu();
            $(".cubeviz-visualizationselector-selectedSelectorItem").removeClass("cubeviz-visualizationselector-selectedSelectorItem").addClass("cubeviz-visualizationselector-selectorItem");
            selectorItemDiv.removeClass("cubeviz-visualizationselector-selectorItem").addClass("cubeviz-visualizationselector-selectedSelectorItem");
            this.showMenuDongle(selectorItemDiv);
            this.triggerGlobalEvent("onChange_visualizationClass");
            CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.ui, "ui", function (updatedUiHash) {
                self.app._.backend.uiHash = updatedUiHash;
            });
        }
        this.triggerGlobalEvent("onAfterClick_selectorItem");
    };
    View_IndexAction_VisualizationSelector.prototype.onClick_updateVisz = function () {
        var fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.class, this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts);
        var self = this;

        this.app._.ui.visualizationSettings[this.app._.ui.visualization.class] = CubeViz_Visualization_Controller.updateVisualizationSettings($(".cubeviz-visualizationselector-menuItemValue"), this.app._.ui.visualizationSettings[this.app._.ui.visualization.class], fromChartConfig.defaultConfig);
        CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.ui, "ui", function (updatedUiHash) {
            self.app._.backend.uiHash = updatedUiHash;
        });
        this.triggerGlobalEvent("onReRender_visualization");
    };
    View_IndexAction_VisualizationSelector.prototype.onReRender_visualization = function () {
        this.destroy();
        if(0 < _.size(this.app._.backend.retrievedObservations)) {
            this.initialize();
        }
    };
    View_IndexAction_VisualizationSelector.prototype.onStart_application = function () {
        if(0 < _.size(this.app._.backend.retrievedObservations)) {
            this.initialize();
        }
    };
    View_IndexAction_VisualizationSelector.prototype.render = function () {
        this.triggerGlobalEvent("onBeforeRender_visualizationSelector");
        var numberOfMultDims = this.app._.data.numberOfMultipleDimensions;
        var viszItem;
        var charts = this.app._.backend.chartConfig[numberOfMultDims].charts;
        var selectorItemTpl = _.template($("#cubeviz-visualizationselector-tpl-selectorItem").text());
        var self = this;

        _.each(charts, function (chartObject) {
            viszItem = $(selectorItemTpl(chartObject));
            viszItem.data("class", chartObject.class);
            if(self.app._.ui.visualization.class == chartObject.class) {
                viszItem.addClass("cubeviz-visualizationselector-selectedSelectorItem").removeClass("cubeviz-visualizationselector-selectorItem");
                self.showMenuDongle(viszItem);
            }
            viszItem.off("click");
            viszItem.on("click", $.proxy(self.onClick_selectorItem, self));
            $("#cubeviz-visualizationselector-selector").append(viszItem);
        });
        this.bindUserInterfaceEvents({
        });
        this.triggerGlobalEvent("onAfterRender_visualizationSelector");
        return this;
    };
    View_IndexAction_VisualizationSelector.prototype.showMenu = function (selectorItemDiv) {
        this.triggerGlobalEvent("onBeforeShow_visualizationSelectorMenu");
        var alreadySetSelected = false;
        var defaultValue = "";
        var fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.class, this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts);
        var menuItem;
        var menuItemTpl = _.template($("#cubeviz-visualizationselector-tpl-menuItem").text());
        var menuItemsHtml = $("#cubeviz-visualizationselector-menuItems").html();
        var offset = selectorItemDiv.offset();
        var selectBox;
        var shortCutViszSettings = this.app._.ui.visualizationSettings[this.app._.ui.visualization.class];
        var valueOption;

        if(false === _.isUndefined(fromChartConfig.options) && 0 < _.size(fromChartConfig.options) && ("" == menuItemsHtml || null == menuItemsHtml)) {
            _.each(fromChartConfig.options, function (option) {
                alreadySetSelected = false;
                menuItem = $(menuItemTpl(option));
                selectBox = $(menuItem.find(".cubeviz-visualizationselector-menuSelectbox").get(0));
                defaultValue = CubeViz_Visualization_Controller.getObjectValueByKeyString(option.key, shortCutViszSettings);
                valueOption = $("<option/>");
                selectBox.data("key", option.key);
                if(false == _.isUndefined(defaultValue)) {
                    _.each(option.values, function (value) {
                        value.value = value.value.toString();
                        if(defaultValue.toString() == value.value && false == alreadySetSelected) {
                            valueOption = $("<option/>");
                            valueOption.text(value.label).val(value.value).attr("selected", "selected");
                            selectBox.append(valueOption);
                            alreadySetSelected = true;
                        }
                    });
                }
                _.each(option.values, function (value) {
                    value.value = value.value.toString();
                    if(false == _.isUndefined(defaultValue) && defaultValue.toString() == value.value) {
                        return;
                    }
                    valueOption = $("<option/>");
                    valueOption.text(value.label).val(value.value);
                    if(false === alreadySetSelected && false === _.isUndefined(value.isDefault) && true === value.isDefault) {
                        valueOption.attr("selected", "selected");
                        alreadySetSelected = true;
                    }
                    selectBox.append(valueOption);
                });
                $("#cubeviz-visualizationselector-menuItems").append(menuItem);
            });
            $("#cubeviz-visualizationselector-closeMenu").off("click");
            $("#cubeviz-visualizationselector-closeMenu").on("click", $.proxy(this.onClick_closeMenu, this));
            $("#cubeviz-visualizationselector-updateVisz").off("click");
            $("#cubeviz-visualizationselector-updateVisz").on("click", $.proxy(this.onClick_updateVisz, this));
            $("#cubeviz-visualizationselector-menu").css("top", offset.top - 37).css("left", offset.left - 495).fadeIn("slow");
        }
        this.triggerGlobalEvent("onAfterShow_visualizationSelectorMenu");
    };
    View_IndexAction_VisualizationSelector.prototype.showMenuDongle = function (selectorItemDiv) {
        var charts = this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts;
        var fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.class, charts);

        if(false === _.isUndefined(fromChartConfig.options) && 0 < _.size(fromChartConfig.options)) {
            var position = selectorItemDiv.position();
            $("#cubeviz-visualizationselector-menuDongleDiv").css("top", position.top + 25).css("left", position.left + 7).fadeIn("slow");
        }
    };
    return View_IndexAction_VisualizationSelector;
})(CubeViz_View_Abstract);
var cubeVizApp = new CubeViz_View_Application();
$(document).ready(function () {
    if("development" == cubeVizApp._.backend.context) {
        console.log("cubeVizApp._:");
        console.log(cubeVizApp._);
    }
    cubeVizApp.triggerEvent("onStart_application");
});
