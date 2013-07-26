var CubeViz_ConfigurationLink = (function () {
    function CubeViz_ConfigurationLink() { }
    CubeViz_ConfigurationLink.save = function save(url, modelIri, content, type, callback, useObservations) {
        if (typeof useObservations === "undefined") { useObservations = false; }
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
                modelIri: modelIri,
                stringifiedContent: JSON.stringify(content),
                type: type,
                useObservations: true === useObservations ? "true" : "false"
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
    CubeViz_Collection.prototype.add = function (element, option, ignoreKey) {
        if (typeof ignoreKey === "undefined") { ignoreKey = false; }
        if(false === ignoreKey) {
            if(true === _.isUndefined(element[this.idKey])) {
                throw new Error("Key " + this.idKey + " in element not set!");
                return this;
            }
            if(true === _.isUndefined(this.get(element[this.idKey]))) {
                this._.push(element);
            } else {
                if((false === _.isUndefined(option) && false === _.isUndefined(option["merge"]) && option["merge"] == true)) {
                    this.remove(element[this.idKey]);
                    this._.push(element);
                }
            }
        } else {
            this._.push(element);
        }
        return this;
    };
    CubeViz_Collection.prototype.addList = function (list) {
        var self = this;
        if(true == _.isArray(list)) {
            _.each(list, function (element) {
                self.add(element, null, true);
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
    CubeViz_Collection.prototype.getFirst = function () {
        return _.first(this._);
    };
    CubeViz_Collection.prototype.getElementsValues = function (property) {
        var list = new CubeViz_Collection();
        this.each(function (element) {
            if(false === _.isUndefined(element[property]) && false === _.isNull(element[property])) {
                list.add(element[property], null, true);
            }
        });
        return list;
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
        this.name = "CubeViz_Visualization";
        this.supportedClassNames = [];
    }
    CubeViz_Visualization.prototype.getName = function () {
        return this.name;
    };
    CubeViz_Visualization.prototype.getSupportedClassNames = function () {
        return this.supportedClassNames;
    };
    CubeViz_Visualization.prototype.isResponsibleFor = function (className) {
        return _.contains(this.getSupportedClassNames(), className);
    };
    CubeViz_Visualization.prototype.load = function (c) {
        if(true === this.isResponsibleFor(c)) {
            var chart = null;
            eval("chart = new " + c + "();");
            return chart;
        } else {
            throw new Error("Invalid c (" + c + ") given!");
        }
    };
    CubeViz_Visualization.prototype.render = function (chart) {
        return null;
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
    CubeViz_View_Helper.hideCloseAndUpdateSpinner = function hideCloseAndUpdateSpinner(dialogDiv) {
        $(dialogDiv.find(".cubeviz-dataSelectionModule-closeUpdateSpinner").first()).hide();
    }
    CubeViz_View_Helper.hideLeftSidebarSpinner = function hideLeftSidebarSpinner() {
        $("#cubeviz-dataSelectionModule-spinnerIcon").hide();
        $("#cubeviz-dataSelectionModule-spinnerText").hide();
        $("#cubeviz-dataSelectionModule-spinner").fadeOut("slow", function () {
            $("#cubeviz-dataSelectionModule-dataSelection").fadeIn("slow");
        });
    }
    CubeViz_View_Helper.openDialog = function openDialog(domElement) {
        domElement.dialog("open");
        domElement.data("isDialogOpen", true);
        $(".ui-widget-overlay").css("height", 2 * screen.height);
    }
    CubeViz_View_Helper.showCloseAndUpdateSpinner = function showCloseAndUpdateSpinner(dialogDiv) {
        $(dialogDiv.find(".cubeviz-dataSelectionModule-closeUpdateSpinner").first()).show();
    }
    CubeViz_View_Helper.showLeftSidebarSpinner = function showLeftSidebarSpinner() {
        $("#cubeviz-dataSelectionModule-spinnerIcon").show();
        $("#cubeviz-dataSelectionModule-spinnerText").show();
        $("#cubeviz-dataSelectionModule-dataSelection").fadeOut("slow", function () {
            $("#cubeviz-dataSelectionModule-spinner").fadeIn("slow").show();
        });
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
    CubeViz_View_Helper.tplReplace = function tplReplace(templateStr, contentObj) {
        if(true === _.isUndefined(contentObj)) {
            return templateStr;
        }
        var contentObjKeys = _.keys(contentObj);
        _.each(contentObjKeys, function (key) {
            templateStr = templateStr.replace("[[" + key + "]]", _.str.trim(contentObj[key]));
        });
        return _.str.trim(templateStr);
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
        var result = null;
        _.each(charts, function (chart) {
            if(true === _.isNull(result)) {
                if(className == chart.className) {
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
        var d3js = new CubeViz_Visualization_D3js();

        if(true === hC.isResponsibleFor(className)) {
            return hC.getName();
        } else {
            if(true === d3js.isResponsibleFor(className)) {
                return d3js.getName();
            } else {
                throw new Error("Unknown className " + className);
            }
        }
    }
    CubeViz_Visualization_Controller.linkify = function linkify(inputText) {
        var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        return inputText.replace(urlPattern, '<a href="$&" target="_blank">$&</a>').replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>').replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
    }
    CubeViz_Visualization_Controller.getDefaultChartConfig = function getDefaultChartConfig(chartConfig, numberOfMultipleDimensions) {
        return {
            className: chartConfig[numberOfMultipleDimensions].charts[0].className,
            chartConfig: chartConfig[numberOfMultipleDimensions].charts[0]
        };
    }
    CubeViz_Visualization_Controller.setChartConfigClassEntry = function setChartConfigClassEntry(className, charts, newValue) {
        for(var i in charts) {
            if(className == charts[i].className) {
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
            if(true === _.isUndefined(optionKey)) {
                return;
            }
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
var CubeViz_Visualization_D3js = (function (_super) {
    __extends(CubeViz_Visualization_D3js, _super);
    function CubeViz_Visualization_D3js() {
        _super.call(this);
        this.name = "D3js";
        this.supportedClassNames = [
            "CubeViz_Visualization_D3js_CirclePacking"
        ];
    }
    CubeViz_Visualization_D3js.prototype.render = function (chart) {
        chart.getRenderResult();
    };
    return CubeViz_Visualization_D3js;
})(CubeViz_Visualization);
var CubeViz_Visualization_D3js_CirclePacking = (function () {
    function CubeViz_Visualization_D3js_CirclePacking() {
        this.chartConfig = {
        };
        this.generatedData = {
            name: "",
            children: []
        };
    }
    CubeViz_Visualization_D3js_CirclePacking.prototype.computeData = function (observations, multipleDimensions, selectedMeasure) {
        var children = [];
        var circleLabel = [];
        var self = this;
        var valueToUse = null;

        _.each(observations, function (observation) {
            if(false === DataCube_Observation.isActive(observation)) {
                return;
            }
            circleLabel = [];
            children = [
                {
                    name: "",
                    size: ""
                }
            ];
            _.each(multipleDimensions, function (dimension) {
                _.each(dimension.__cv_elements, function (element) {
                    if(element.__cv_uri === observation[dimension["http://purl.org/linked-data/cube#dimension"]]) {
                        circleLabel.push(element.__cv_niceLabel);
                    }
                });
            });
            children[0].name = circleLabel.join(" - ");
            children[0].size = DataCube_Observation.parseValue(observation, selectedMeasure["http://purl.org/linked-data/cube#measure"]);
            self.generatedData.children.push({
                name: observation.__cv_niceLabel,
                children: children
            });
        });
    };
    CubeViz_Visualization_D3js_CirclePacking.prototype.init = function (chartConfig, retrievedObservations, selectedComponentDimensions, multipleDimensions, oneElementDimensions, selectedMeasure, selectedAttributeUri) {
        this.chartConfig = chartConfig;
        this.computeData(retrievedObservations, multipleDimensions, selectedMeasure);
        return this;
    };
    CubeViz_Visualization_D3js_CirclePacking.prototype.getRenderResult = function () {
        var diameter = 960;
        var pack = d3.layout.pack().size([
            diameter - 4, 
            diameter - 4
        ]).value(function (d) {
            return d.size;
        });
        var svg = d3.select("#cubeviz-index-visualization").append("svg").attr("width", diameter).attr("height", diameter).append("g").attr("transform", "translate(2,2)");
        var node = svg.datum(this.generatedData).selectAll(".node").data(pack.nodes).enter().append("g").attr("class", function (d) {
            return d.children ? "node" : "cubeviz-visualization-d3js-circleLeaf node";
        }).attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        node.append("title").text(function (d) {
            return d.name + (d.children ? "" : ": " + d.size);
        });
        node.append("circle").attr("r", function (d) {
            return d.r;
        });
        node.filter(function (d) {
            return !d.children;
        }).append("text").attr("dy", ".3em").style("fill", this.chartConfig.style.circle["fill"]).style("font-size", this.chartConfig.style.circle["font-size"]).style("font-weight", this.chartConfig.style.circle["font-weight"]).style("text-anchor", this.chartConfig.style.circle["text-anchor"]).text(function (d) {
            return d.name.substring(0, d.r * 0.3);
        });
        return svg;
    };
    return CubeViz_Visualization_D3js_CirclePacking;
})();
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
    CubeViz_Visualization_HighCharts.prototype.render = function (chart) {
        return new Highcharts.Chart(chart.getRenderResult());
    };
    return CubeViz_Visualization_HighCharts;
})(CubeViz_Visualization);
var CubeViz_Visualization_HighCharts_Chart = (function () {
    function CubeViz_Visualization_HighCharts_Chart() { }
    CubeViz_Visualization_HighCharts_Chart.prototype.handleTwoDimensionsWithAtLeastOneDimensionElement = function (selectedComponentDimensions, forXAxis, forSeries, selectedAttributeUri, selectedMeasureUri, observation) {
        var categoriesElementAssign = {
        };
        var i = 0;
        var self = this;
        var xAxisElements = observation.getAxesElements(forXAxis);

        _.each(xAxisElements, function (xAxisElement) {
            self.chartConfig.xAxis.categories.push(xAxisElement.self.__cv_niceLabel);
            categoriesElementAssign[xAxisElement.self.__cv_uri] = i++;
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
        var valueToUse = null;

        self.chartConfig.series = [];
        _.each(seriesElements, function (seriesElement) {
            obj = {
                color: CubeViz_Visualization_Controller.getColor(seriesElement.self.__cv_uri),
                data: [],
                name: seriesElement.self.__cv_niceLabel,
                __cv_uri: seriesElement.self.__cv_uri
            };
            for(i = 0; i < _.size(self.chartConfig.xAxis.categories); ++i) {
                obj.data.push(null);
            }
            _.each(seriesElement.observations, function (seriesObservation) {
                if(false === DataCube_Observation.isActive(seriesObservation)) {
                    return;
                }
                if((false === _.isNull(selectedAttributeUri) && (true === _.isNull(seriesObservation[selectedAttributeUri]) || true === _.isUndefined(seriesObservation[selectedAttributeUri]))) && selectedAttributeUri !== seriesObservation["http://purl.org/linked-data/cube#attribute"]) {
                    return;
                }
                uriCombination = "";
                _.each(selectedDimensionPropertyUris, function (dimensionUri) {
                    uriCombination += seriesObservation[dimensionUri];
                });
                if(true === _.isUndefined(usedDimensionElementCombinations[uriCombination])) {
                    usedDimensionElementCombinations[uriCombination] = true;
                } else {
                    return;
                }
                if(false === _.isUndefined(seriesObservation.__cv_temporaryNewValue)) {
                    valueToUse = seriesObservation.__cv_temporaryNewValue;
                } else {
                    valueToUse = seriesObservation[selectedMeasureUri];
                }
                if(false === _.isUndefined(seriesObservation[selectedMeasureUri])) {
                    obj.data[categoriesElementAssign[seriesObservation[forXAxis]]] = parseFloat(valueToUse);
                } else {
                    obj.data[categoriesElementAssign[seriesObservation[forXAxis]]] = null;
                }
            });
            if(0 == _.size(obj.data)) {
            } else {
                self.chartConfig.series.push(obj);
            }
        });
    };
    CubeViz_Visualization_HighCharts_Chart.prototype.handleOnlyOneElementDimension = function (forSeries, selectedAttributeUri, selectedMeasureUri, observation) {
        var self = this;
        var seriesObservation = null;
        var seriesDataList = [];
        var seriesElements = observation.getAxesElements(forSeries);
        var valueToUse = null;

        this.chartConfig.xAxis.categories = [
            "."
        ];
        _.each(seriesElements, function (seriesElement) {
            seriesObservation = seriesElement.observations[_.keys(seriesElement.observations)[0]];
            if(false === _.isNull(selectedAttributeUri) && (true === _.isNull(seriesObservation[selectedAttributeUri]) || true === _.isUndefined(seriesObservation[selectedAttributeUri]))) {
                return;
            }
            if(false === _.isUndefined(seriesObservation.__cv_temporaryNewValue)) {
                valueToUse = seriesObservation.__cv_temporaryNewValue;
            } else {
                valueToUse = seriesObservation[selectedMeasureUri];
            }
            self.chartConfig.series.push({
                name: seriesElement.self.__cv_niceLabel,
                data: [
                    valueToUse
                ]
            });
        });
    };
    CubeViz_Visualization_HighCharts_Chart.prototype.handleOnlyOneMultipleDimension = function (forXAxis, selectedAttributeUri, selectedMeasureUri, observationObj, oneElementDimensions) {
        var self = this;
        var observation = null;
        var seriesDataList = [];
        var xAxisElements = observationObj.sortAxis(forXAxis, "ascending").getAxesElements(forXAxis);
        var value = null;

        _.each(xAxisElements, function (xAxisElement) {
            _.each(xAxisElement.observations, function (observation) {
                if(false === DataCube_Observation.isActive(observation)) {
                    return;
                }
                value = DataCube_Observation.parseValue(observation, selectedMeasureUri);
                if(true === _.isNull(value)) {
                    return;
                }
                if(false === _.isNull(selectedAttributeUri) && (true === _.isNull(observation[selectedAttributeUri]) || true === _.isUndefined(observation[selectedAttributeUri]))) {
                    return;
                }
                self.chartConfig.xAxis.categories.push(xAxisElement.self.__cv_niceLabel);
                seriesDataList.push(value);
            });
        });
        var seriesName = ".";
        if(0 < _.size(oneElementDimensions)) {
            var dimensionElementLabels = [];
            _.each(oneElementDimensions, function (dimension) {
                dimensionElementLabels.push(dimension.__cv_elements[0].__cv_niceLabel);
            });
            seriesName = dimensionElementLabels.join(" - ");
        }
        this.chartConfig.series = [
            {
                name: seriesName,
                data: seriesDataList
            }
        ];
    };
    CubeViz_Visualization_HighCharts_Chart.prototype.init = function (chartConfig, retrievedObservations, selectedComponentDimensions, multipleDimensions, oneElementDimensions, selectedMeasure, selectedAttributeUri) {
        var diff = 0;
        var forXAxis = null;
        var forSeries = null;
        var i = 0;
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
        if(true === _.isUndefined(this.chartConfig.xAxis)) {
            this.chartConfig.xAxis = {
                title: {
                    text: ""
                }
            };
        }
        if(true === _.isUndefined(this.chartConfig.yAxis)) {
            this.chartConfig.yAxis = {
                title: {
                    text: ""
                }
            };
        }
        _.each(selectedComponentDimensions, function (selectedDimension) {
            if(2 > _.keys(selectedDimension.__cv_elements).length) {
                return;
            }
            if(null == forXAxis) {
                forXAxis = selectedDimension["http://purl.org/linked-data/cube#dimension"];
            } else {
                forSeries = selectedDimension["http://purl.org/linked-data/cube#dimension"];
            }
        });
        if(null == forSeries) {
            _.each(selectedComponentDimensions, function (selectedDimension) {
                if(1 == _.keys(selectedDimension.__cv_elements).length && null == forSeries) {
                    forSeries = selectedDimension["http://purl.org/linked-data/cube#dimension"];
                }
            });
        }
        this.chartConfig._cubeVizVisz = this.chartConfig._cubeVizVisz || {
        };
        if("true" == this.chartConfig._cubeVizVisz.doSwitchingAxes) {
            var tmp = forXAxis;
            forXAxis = forSeries;
            forSeries = tmp;
        }
        observation.initialize(retrievedObservations, selectedComponentDimensions, selectedMeasure["http://purl.org/linked-data/cube#measure"]);
        if(false === _.str.isBlank(forXAxis) && false === _.str.isBlank(forSeries) && 1 < _.size(multipleDimensions)) {
            this.handleTwoDimensionsWithAtLeastOneDimensionElement(selectedComponentDimensions, forXAxis, forSeries, selectedAttributeUri, selectedMeasure["http://purl.org/linked-data/cube#measure"], observation);
        } else {
            if(false === _.str.isBlank(forXAxis) || false === _.str.isBlank(forSeries)) {
                if(false === _.str.isBlank(forXAxis)) {
                    this.handleOnlyOneMultipleDimension(forXAxis, selectedAttributeUri, selectedMeasure["http://purl.org/linked-data/cube#measure"], observation, oneElementDimensions);
                } else {
                    this.handleOnlyOneElementDimension(forSeries, selectedAttributeUri, selectedMeasure["http://purl.org/linked-data/cube#measure"], observation);
                }
            }
        }
        this.setTooltip(selectedComponentDimensions[Object.keys(selectedComponentDimensions)[0]], selectedMeasure);
        return this;
    };
    CubeViz_Visualization_HighCharts_Chart.prototype.getRenderResult = function () {
        return this.chartConfig;
    };
    CubeViz_Visualization_HighCharts_Chart.prototype.setTooltip = function (xAxisDimension, selectedMeasure) {
        var self = this;
        this.chartConfig.tooltip = {
            formatter: function () {
                return xAxisDimension.__cv_niceLabel + ': <b>' + this.x + '</b> <br/> ' + selectedMeasure.__cv_niceLabel + ': ' + '<b>' + _.str.numberFormat(this.y, 4, ',', '.') + '</b>';
            }
        };
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
    CubeViz_Visualization_HighCharts_Pie.prototype.init = function (chartConfig, retrievedObservations, selectedComponentDimensions, multipleDimensions, oneElementDimensions, selectedMeasure, selectedAttributeUri) {
        if(1 < _.size(multipleDimensions)) {
            throw new Error("Pie chart is only suitable for one dimension!");
            return;
        }
        var forXAxis = multipleDimensions[_.keys(multipleDimensions)[0]]["http://purl.org/linked-data/cube#dimension"];
        var label = "";
        var observation = new DataCube_Observation();
        var self = this;
        var usedXAxisElements = [];
        var value = null;

        this.chartConfig = chartConfig;
        this.chartConfig.colors = [];
        this.chartConfig.series = [];
        this.chartConfig.title.text = "";
        if(true === _.isUndefined(this.chartConfig.xAxis)) {
            this.chartConfig.xAxis = {
                title: {
                    text: ""
                }
            };
        }
        if(true === _.isUndefined(this.chartConfig.yAxis)) {
            this.chartConfig.yAxis = {
                title: {
                    text: ""
                }
            };
        }
        observation.initialize(retrievedObservations, selectedComponentDimensions, selectedMeasure["http://purl.org/linked-data/cube#measure"]);
        var xAxisElements = observation.sortAxis(forXAxis, "ascending").getAxesElements(forXAxis);
        this.chartConfig.series.push({
            type: "pie",
            name: this.chartConfig.title.text,
            data: []
        });
        _.each(xAxisElements, function (xAxisElement) {
            _.each(xAxisElement.observations, function (observation) {
                if(false === DataCube_Observation.isActive(observation)) {
                    return;
                }
                value = DataCube_Observation.parseValue(observation, selectedMeasure["http://purl.org/linked-data/cube#measure"]);
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
var DataCube_ClusteringDataCube = (function () {
    function DataCube_ClusteringDataCube() { }
    DataCube_ClusteringDataCube.buildDataSets = function buildDataSets(dataCubeUri, clusters, numberOfClusters) {
        var lowestNumber = clusters[0][0];
        var highestNumber = clusters[numberOfClusters - 1][_.size(clusters[numberOfClusters - 1]) - 1];

        return {
            0: {
                __cv_niceLabel: "Dataset for " + numberOfClusters + " cluster with overall values between " + lowestNumber + " and " + highestNumber,
                "http://www.w3.org/2000/01/rdf-schema#label": "Dataset for " + numberOfClusters + " cluster with overall values between " + lowestNumber + " and " + highestNumber,
                __cv_uri: dataCubeUri + "dataset",
                __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "dataset") + "",
                "http://purl.org/linked-data/cube#structure": dataCubeUri + "datastructuredefinition",
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#DataSet",
                "http://purl.org/dc/terms/created": (new Date()).toString()
            }
        };
    }
    DataCube_ClusteringDataCube.buildDataStructureDefinitions = function buildDataStructureDefinitions(dataCubeUri, dimensions) {
        var dsd = {
            0: {
                __cv_niceLabel: "Artifical Data Structure Definition",
                "http://www.w3.org/2000/01/rdf-schema#label": "Artifical Data Structure Definition",
                __cv_description: "",
                __cv_uri: dataCubeUri + "dataStructureDefinition",
                __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "dataStructureDefinition") + "",
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#DataStructureDefinition",
                "http://purl.org/linked-data/cube#component": {
                    0: dataCubeUri + "measure"
                },
                "http://purl.org/dc/terms/created": (new Date()).toString()
            }
        };
        var i = 1;

        _.each(dimensions, function (dimension) {
            dsd[0]["http://purl.org/linked-data/cube#component"][i] = dimension.__cv_uri;
            ++i;
        });
        return dsd;
    }
    DataCube_ClusteringDataCube.buildDimensionElements = function buildDimensionElements(dataCubeUri, clusters, dimensionType) {
        var dimensionElements = {
        };
        var j = 0;

        if("cluster" == dimensionType) {
            _.each(clusters, function (cluster) {
                if(0 === _.size(cluster)) {
                    return;
                }
                dimensionElements[j] = {
                    __cv_niceLabel: "Cluster " + j,
                    "http://www.w3.org/2000/01/rdf-schema#label": "Cluster " + j,
                    __cv_uri: dataCubeUri + "cluster" + j,
                    __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "cluster" + j) + "",
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": dataCubeUri + "clusterDimension"
                };
                ++j;
            });
        } else {
            if("position" == dimensionType) {
                var sortedClusters = $.parseJSON(JSON.stringify(clusters));
                sortedClusters.sort(function (a, b) {
                    return _.size(a) < _.size(b);
                });
                var label = "";
                var usedPositions = [];

                _.each(sortedClusters, function (cluster, clusterIndex) {
                    if(0 == _.size(cluster)) {
                        return;
                    }
                    _.each(cluster, function (number, position) {
                        if(0 == position && -1 === $.inArray(position + " (first)", usedPositions)) {
                            label = "0 (first)";
                            usedPositions.push(label);
                            dimensionElements[j] = {
                                __cv_niceLabel: label,
                                "http://www.w3.org/2000/01/rdf-schema#label": label,
                                __cv_uri: dataCubeUri + "position" + j,
                                __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "position" + j) + "",
                                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": dataCubeUri + "positionDimension"
                            };
                            ++j;
                        } else {
                            if(_.size(cluster) == (position + 1) && -1 === $.inArray(position + " (last)", usedPositions)) {
                                label = position + " (last)";
                                usedPositions.push(label);
                                dimensionElements[j] = {
                                    __cv_niceLabel: label,
                                    "http://www.w3.org/2000/01/rdf-schema#label": label,
                                    __cv_uri: dataCubeUri + "position" + j,
                                    __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "position" + j) + "",
                                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": dataCubeUri + "positionDimension"
                                };
                                ++j;
                            } else {
                                if(0 < position && -1 === $.inArray(position + "", usedPositions)) {
                                    label = position + "";
                                    usedPositions.push(label);
                                    dimensionElements[j] = {
                                        __cv_niceLabel: label,
                                        "http://www.w3.org/2000/01/rdf-schema#label": label,
                                        __cv_uri: dataCubeUri + "position" + j,
                                        __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "position" + j) + "",
                                        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": dataCubeUri + "positionDimension"
                                    };
                                    ++j;
                                } else {
                                }
                            }
                        }
                    });
                });
            }
        }
        return dimensionElements;
    }
    DataCube_ClusteringDataCube.buildDimensionsAndTheirComponentSpecifications = function buildDimensionsAndTheirComponentSpecifications(dataCubeUri, clusters) {
        var clusterDimensionUri = dataCubeUri + "componentSpecificationClusterDimension";
        var dimensions = {
        };
        var positionDimensionUri = dataCubeUri + "componentSpecificationPositionDimension";

        dimensions[clusterDimensionUri] = {
            __cv_niceLabel: "Cluster Dimension",
            "http://www.w3.org/2000/01/rdf-schema#label": "Cluster Dimension",
            __cv_description: "",
            __cv_uri: clusterDimensionUri,
            __cv_hashedUri: CryptoJS.MD5(clusterDimensionUri) + "",
            __cv_elements: DataCube_ClusteringDataCube.buildDimensionElements(dataCubeUri, clusters, "cluster"),
            "http://purl.org/linked-data/cube#dimension": dataCubeUri + "clusterDimension",
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#ComponentSpecification",
            "http://purl.org/dc/terms/created": (new Date()).toString()
        };
        dimensions[positionDimensionUri] = {
            __cv_niceLabel: "Position Dimension",
            "http://www.w3.org/2000/01/rdf-schema#label": "Position Dimension",
            __cv_description: "",
            __cv_uri: positionDimensionUri,
            __cv_hashedUri: CryptoJS.MD5(positionDimensionUri) + "",
            __cv_elements: DataCube_ClusteringDataCube.buildDimensionElements(dataCubeUri, clusters, "position"),
            "http://purl.org/linked-data/cube#dimension": dataCubeUri + "positionDimension",
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#ComponentSpecification",
            "http://purl.org/dc/terms/created": (new Date()).toString()
        };
        return dimensions;
    }
    DataCube_ClusteringDataCube.buildMeasures = function buildMeasures(dataCubeUri) {
        return {
            0: {
                __cv_niceLabel: "Artifical Measure",
                "http://www.w3.org/2000/01/rdf-schema#label": "Artifical Measure",
                __cv_description: "",
                __cv_uri: dataCubeUri + "componentSpecificationMeasure",
                __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "componentSpecificationMeasure") + "",
                "http://purl.org/linked-data/cube#measure": dataCubeUri + "measure",
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#ComponentSpecification",
                "http://purl.org/dc/terms/created": (new Date()).toString()
            }
        };
    }
    DataCube_ClusteringDataCube.buildObservations = function buildObservations(dataCubeUri, clusters) {
        var i = 0;
        var j = 0;
        var observations = {
        };
        var sortedClusters = $.parseJSON(JSON.stringify(clusters));

        sortedClusters.sort(function (a, b) {
            return _.size(a) < _.size(b);
        });
        _.each(sortedClusters, function (cluster, clusterIndex) {
            if(0 === _.size(cluster)) {
                return;
            }
            _.each(cluster, function (number, position) {
                observations[i] = {
                    __cv_niceLabel: "Observation of cluster " + j,
                    "http://www.w3.org/2000/01/rdf-schema#label": "Observation of cluster " + j,
                    __cv_uri: dataCubeUri + "observation" + i,
                    __cv_hashedUri: "c204871025866c6178c363948246c146",
                    __cv_description: "",
                    "http://purl.org/linked-data/cube#dataSet": dataCubeUri + "dataset",
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#Observation"
                };
                observations[i][dataCubeUri + "measure"] = number;
                observations[i][dataCubeUri + "clusterDimension"] = dataCubeUri + "cluster" + j;
                observations[i][dataCubeUri + "positionDimension"] = DataCube_ClusteringDataCube.getPositionDimensionElement(dataCubeUri, clusters, clusterIndex, position, number);
                ++i;
            });
            ++j;
        });
        return observations;
    }
    DataCube_ClusteringDataCube.create = function create(clusters, backendUrl, numberOfClusters) {
        var clusteringDataCube = DataCube_DataCubeMerger.getDefaultDataCubeObject();
        var dataCubeUri = "";

        dataCubeUri = DataCube_DataCubeMerger.generateMergedDataCubeUri(backendUrl, JSON.stringify(clusters));
        clusteringDataCube.dataSets = DataCube_ClusteringDataCube.buildDataSets(dataCubeUri, clusters, numberOfClusters);
        clusteringDataCube.selectedDS = clusteringDataCube.dataSets[0];
        clusteringDataCube.components.dimensions = DataCube_ClusteringDataCube.buildDimensionsAndTheirComponentSpecifications(dataCubeUri, clusters);
        clusteringDataCube.selectedComponents.dimensions = clusteringDataCube.components.dimensions;
        clusteringDataCube.components.measures = DataCube_ClusteringDataCube.buildMeasures(dataCubeUri);
        clusteringDataCube.selectedComponents.measure = clusteringDataCube.components.measures[0];
        clusteringDataCube.dataStructureDefinitions = DataCube_ClusteringDataCube.buildDataStructureDefinitions(dataCubeUri, clusteringDataCube.selectedComponents.dimensions);
        clusteringDataCube.retrievedObservations = DataCube_ClusteringDataCube.buildObservations(dataCubeUri, clusters);
        clusteringDataCube.selectedDSD = clusteringDataCube.dataStructureDefinitions[0];
        return clusteringDataCube;
    }
    DataCube_ClusteringDataCube.getPositionDimensionElement = function getPositionDimensionElement(dataCubeUri, clusters, clusterIndexToUse, positionToUse, numberToCheck) {
        var dimensionElementToSearch = "";
        var j = 0;
        var label = "";
        var sortedClusters = $.parseJSON(JSON.stringify(clusters));
        var uri = "";
        var usedPositions = [];

        sortedClusters.sort(function (a, b) {
            return _.size(a) < _.size(b);
        });
        if(0 == positionToUse) {
            return dataCubeUri + "position0";
        }
        _.each(sortedClusters, function (cluster, clusterIndex) {
            if(0 == _.size(cluster)) {
                return;
            }
            _.each(cluster, function (number, position) {
                uri = "";
                if(0 == position && -1 === $.inArray(position + " (first)", usedPositions)) {
                    usedPositions.push("0 (first)");
                    uri = dataCubeUri + "position" + j;
                    ++j;
                } else {
                    if(_.size(cluster) == (position + 1) && -1 === $.inArray(position + " (last)", usedPositions)) {
                        usedPositions.push(position + " (last)");
                        uri = dataCubeUri + "position" + j;
                        ++j;
                    } else {
                        if(0 < position && -1 === $.inArray(position + "", usedPositions)) {
                            usedPositions.push(position + "");
                            uri = dataCubeUri + "position" + j;
                            ++j;
                        } else {
                        }
                    }
                }
                if(clusterIndexToUse == clusterIndex && number == numberToCheck) {
                    if(true === _.str.isBlank(uri)) {
                        dimensionElementToSearch = dataCubeUri + "position" + $.inArray(position + "", usedPositions);
                    } else {
                        dimensionElementToSearch = uri;
                    }
                }
            });
        });
        return dimensionElementToSearch;
    }
    return DataCube_ClusteringDataCube;
})();
var DataCube_Component = (function () {
    function DataCube_Component() { }
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
    DataCube_Component.getMeasures = function getMeasures(measureObject) {
        var measures = [];
        _.each(measureObject, function (measure) {
            measures.push(measure);
        });
        return measures;
    }
    DataCube_Component.findDimensionElement = function findDimensionElement(dimensionElements, uri) {
        var elementToFind = null;
        _.each(dimensionElements, function (element) {
            if(element.__cv_uri == uri) {
                elementToFind = element;
            }
        });
        return elementToFind;
    }
    DataCube_Component.loadAllAttributes = function loadAllAttributes(url, serviceUrl, modelIri, dsdUrl, dsUrl, callback) {
        $.ajax({
            url: url + "getcomponents",
            data: {
                serviceUrl: serviceUrl,
                modelIri: modelIri,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                componentType: "attribute"
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("Attribute loadAll: " + xhr.responseText);
        }).success(function (entries) {
            if(false === _.isUndefined(entries) && false === _.isUndefined(entries.content)) {
                callback(entries.content);
            }
        });
    }
    DataCube_Component.loadAllDimensions = function loadAllDimensions(url, serviceUrl, modelIri, dsdUrl, dsUrl, callback) {
        $.ajax({
            url: url + "getcomponents",
            data: {
                serviceUrl: serviceUrl,
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
    DataCube_Component.loadAllMeasures = function loadAllMeasures(url, serviceUrl, modelIri, dsdUrl, dsUrl, callback) {
        $.ajax({
            url: url + "getcomponents",
            data: {
                serviceUrl: serviceUrl,
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
    return DataCube_Component;
})();
var DataCube_DataCubeMerger = (function () {
    function DataCube_DataCubeMerger() { }
    DataCube_DataCubeMerger.adaptDimensionElements = function adaptDimensionElements(mergedDataCubeUri, dimensionElements, i) {
        var j = 0;
        dimensionElements = $.parseJSON(JSON.stringify(dimensionElements));
        _.each(dimensionElements, function (element) {
            element["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"] = mergedDataCubeUri + "dimension" + i;
            element["http://purl.org/dc/terms/source"] = element.__cv_uri;
            if(false === _.isUndefined(element["http://www.w3.org/2002/07/owl#sameAs"])) {
                element["http://www.w3.org/2002/07/owl#sameAs"] = [
                    element["http://www.w3.org/2002/07/owl#sameAs"], 
                    element.__cv_uri
                ];
            } else {
                element["http://www.w3.org/2002/07/owl#sameAs"] = element.__cv_uri;
            }
            element.__cv_uri = mergedDataCubeUri + "dimension" + i + "DimensionElement" + j;
            element.__cv_hashedUri = CryptoJS.MD5(element.__cv_uri) + "";
            ++j;
        });
        return dimensionElements;
    }
    DataCube_DataCubeMerger.buildDataSets = function buildDataSets(mergedDataCubeUri, dataset1, dataset2) {
        return {
            0: {
                __cv_niceLabel: "Artifical Dataset",
                "http://www.w3.org/2000/01/rdf-schema#label": "Merged DataSet",
                __cv_description: "This is an artifical data set and it consists of '" + dataset1.__cv_niceLabel + "' and '" + dataset2.__cv_niceLabel + "'",
                __cv_uri: mergedDataCubeUri + "dataset",
                __cv_hashedUri: CryptoJS.MD5(mergedDataCubeUri + "dataset") + "",
                "http://purl.org/dc/terms/source": [
                    dataset1.__cv_uri, 
                    dataset2.__cv_uri
                ],
                "http://purl.org/dc/terms/created": (new Date()).toString(),
                "http://purl.org/linked-data/cube#structure": mergedDataCubeUri + "dataStructureDefinition",
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#DataSet",
                __cv_sourceDataset: [
                    dataset1, 
                    dataset2
                ]
            }
        };
    }
    DataCube_DataCubeMerger.buildDataStructureDefinitions = function buildDataStructureDefinitions(mergedDataCubeUri, dimensions) {
        var dsd = {
            0: {
                __cv_niceLabel: "Artifical Data Structure Definition",
                "http://www.w3.org/2000/01/rdf-schema#label": "Artifical Data Structure Definition",
                __cv_description: "This is an artifical data structure definition " + "created during a data cube merge.",
                __cv_uri: mergedDataCubeUri + "dataStructureDefinition",
                __cv_hashedUri: CryptoJS.MD5(mergedDataCubeUri + "dataStructureDefinition") + "",
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#DataStructureDefinition",
                "http://purl.org/linked-data/cube#component": {
                    0: mergedDataCubeUri + "measure"
                },
                "http://purl.org/dc/terms/created": (new Date()).toString()
            }
        };
        var i = 1;

        _.each(dimensions, function (dimension) {
            dsd[0]["http://purl.org/linked-data/cube#component"][i] = dimension.__cv_uri;
            ++i;
        });
        return dsd;
    }
    DataCube_DataCubeMerger.buildDimensionsAndTheirComponentSpecifications = function buildDimensionsAndTheirComponentSpecifications(mergedDataCubeUri, equalDimensions) {
        var componentSpecification = {
        };
        var i = 0;
        var virtualDimensions = {
        };

        _.each(equalDimensions, function (dimensionPair) {
            componentSpecification = {
                __cv_niceLabel: "Merged Component Specification of '" + dimensionPair[0].__cv_niceLabel + "' and '" + dimensionPair[1].__cv_niceLabel + "'",
                "http://www.w3.org/2000/01/rdf-schema#label": "Merged Component Specification of '" + dimensionPair[0].__cv_niceLabel + "' and '" + dimensionPair[1].__cv_niceLabel + "'",
                __cv_description: "This Component Specification was merged and consists of '" + dimensionPair[0].__cv_niceLabel + "' and '" + dimensionPair[1].__cv_niceLabel + "'",
                __cv_uri: mergedDataCubeUri + "componentSpecificationDimension" + i,
                __cv_hashedUri: CryptoJS.MD5(mergedDataCubeUri + "componentSpecificationDimension" + i) + "",
                "http://www.w3.org/2002/07/owl#sameAs": [
                    dimensionPair[0].__cv_uri, 
                    dimensionPair[1].__cv_uri
                ],
                "http://purl.org/dc/terms/source": [
                    dimensionPair[0].__cv_uri, 
                    dimensionPair[1].__cv_uri
                ],
                __cv_elements: {
                },
                __cv_oldCubeDimension: [
                    dimensionPair[0]["http://purl.org/linked-data/cube#dimension"], 
                    dimensionPair[1]["http://purl.org/linked-data/cube#dimension"]
                ],
                "http://purl.org/linked-data/cube#dimension": mergedDataCubeUri + "dimension" + i,
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#ComponentSpecification",
                "http://purl.org/dc/terms/created": (new Date()).toString(),
                __cv_sourceComponentSpecification: [
                    dimensionPair[0], 
                    dimensionPair[1]
                ]
            };
            componentSpecification.__cv_elements = DataCube_DataCubeMerger.mergeDimensionElements(dimensionPair[0].__cv_elements, dimensionPair[1].__cv_elements);
            componentSpecification.__cv_elements = DataCube_DataCubeMerger.adaptDimensionElements(mergedDataCubeUri, componentSpecification.__cv_elements, i);
            virtualDimensions[componentSpecification.__cv_uri] = componentSpecification;
            ++i;
        });
        return virtualDimensions;
    }
    DataCube_DataCubeMerger.buildMeasure = function buildMeasure(mergedDataCubeUri, measure1, measure2) {
        return {
            0: {
                __cv_niceLabel: "Artifical Measure of '" + measure1.__cv_niceLabel + "' and '" + measure2.__cv_niceLabel + "'",
                "http://www.w3.org/2000/01/rdf-schema#label": "Artifical Measure of '" + measure1.__cv_niceLabel + "' and '" + measure2.__cv_niceLabel + "'",
                __cv_description: "This is an artifical measure and it consists of '" + measure1.__cv_niceLabel + "' and '" + measure2.__cv_niceLabel + "'",
                __cv_uri: mergedDataCubeUri + "componentSpecificationMeasure",
                __cv_hashedUri: CryptoJS.MD5(mergedDataCubeUri + "componentSpecificationMeasure") + "",
                __cv_oldCubeMeasure: [
                    measure1["http://purl.org/linked-data/cube#measure"], 
                    measure2["http://purl.org/linked-data/cube#measure"]
                ],
                "http://purl.org/linked-data/cube#measure": mergedDataCubeUri + "measure",
                "http://purl.org/dc/terms/source": [
                    measure1.__cv_uri, 
                    measure2.__cv_uri
                ],
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#ComponentSpecification",
                "http://purl.org/dc/terms/created": (new Date()).toString(),
                __cv_sourceMeasure: [
                    measure1, 
                    measure2
                ]
            }
        };
    }
    DataCube_DataCubeMerger.buildObservations = function buildObservations(mergedDataCubeUri, dataset1, dataset2, observations1, observations2, measure, dimensions, dimensionIndex) {
        var adaptedObservations = {
        };
        var adaptedDimensionElementUri = null;
        var observationCounter = 0;
        var tmp = {
        };
        var tmpObservations = {
        };
        var urisToIgnore = [];
        var usedUri = null;

        observations1 = $.parseJSON(JSON.stringify(observations1));
        observations2 = $.parseJSON(JSON.stringify(observations2));
        _.each(observations1, function (observation) {
            tmpObservations[observation.__cv_uri] = observation;
        });
        _.each(observations2, function (observation) {
            tmpObservations[observation.__cv_uri] = observation;
        });
        _.each(tmpObservations, function (observation) {
            observation.__cv_sourceObservation = $.parseJSON(JSON.stringify(observation));
            if(observation["http://purl.org/linked-data/cube#dataSet"] == dataset1.__cv_uri) {
                observation.__cv_sourceDataset = dataset1;
            } else {
                observation.__cv_sourceDataset = dataset2;
            }
            observation["http://www.w3.org/2002/07/owl#sameAs"] = observation.__cv_uri;
            observation["http://purl.org/dc/terms/source"] = observation.__cv_uri;
            observation.__cv_uri = mergedDataCubeUri + "observation" + observationCounter;
            observation.__cv_hashedUri = CryptoJS.MD5(observation.__cv_uri) + "";
            observation["http://purl.org/linked-data/cube#dataSet"] = mergedDataCubeUri + "dataset";
            observation["http://purl.org/dc/terms/created"] = (new Date()).toString();
            usedUri = null;
            _.each(measure.__cv_oldCubeMeasure, function (oldMeasureUri) {
                if(false === _.isUndefined(observation[oldMeasureUri])) {
                    usedUri = oldMeasureUri;
                }
            });
            if(false === _.isNull(usedUri)) {
                observation[mergedDataCubeUri + "measure"] = observation[usedUri];
                delete observation[usedUri];
                adaptedObservations[observation.__cv_uri] = observation;
                ++observationCounter;
            } else {
            }
        });
        tmpObservations = {
        };
        _.each(dimensions, function (dimension) {
            _.each(adaptedObservations, function (observation) {
                adaptedDimensionElementUri = null;
                _.each(dimension.__cv_elements, function (element) {
                    if(true === _.isArray(element["http://www.w3.org/2002/07/owl#sameAs"])) {
                        _.each(element["http://www.w3.org/2002/07/owl#sameAs"], function (sameAsObject) {
                            _.each(dimension.__cv_oldCubeDimension, function (oldDimensionUri) {
                                if(sameAsObject == observation[oldDimensionUri]) {
                                    adaptedDimensionElementUri = element.__cv_uri;
                                }
                            });
                        });
                    } else {
                        _.each(dimension.__cv_oldCubeDimension, function (oldDimensionUri) {
                            if(element["http://www.w3.org/2002/07/owl#sameAs"] == observation[oldDimensionUri]) {
                                adaptedDimensionElementUri = element.__cv_uri;
                            }
                        });
                    }
                });
                if(false === _.isNull(adaptedDimensionElementUri)) {
                    observation[mergedDataCubeUri + "dimension" + dimensionIndex] = adaptedDimensionElementUri;
                    _.each(dimension.__cv_oldCubeDimension, function (oldDimensionUri) {
                        delete observation[oldDimensionUri];
                    });
                    tmpObservations[observation.__cv_uri] = observation;
                } else {
                    urisToIgnore.push(observation.__cv_uri);
                }
            });
            ++dimensionIndex;
        });
        adaptedObservations = {
        };
        _.each(tmpObservations, function (observation) {
            if(-1 === $.inArray(observation.__cv_uri, urisToIgnore)) {
                adaptedObservations[observation.__cv_uri] = observation;
            }
        });
        return adaptedObservations;
    }
    DataCube_DataCubeMerger.createMergedDataCube = function createMergedDataCube(backendUrl, stringifiedCompareAction, dataset1, dataset2, equalDimensions, measure1, measure2, retrievedObservations1, retrievedObservations2) {
        var mergedDataCube = {
        };
        var mergedDataCubeUri = "";

        mergedDataCube = DataCube_DataCubeMerger.getDefaultDataCubeObject();
        mergedDataCubeUri = DataCube_DataCubeMerger.generateMergedDataCubeUri(backendUrl, stringifiedCompareAction);
        mergedDataCube.dataSets = DataCube_DataCubeMerger.buildDataSets(mergedDataCubeUri, dataset1, dataset2);
        mergedDataCube.selectedDS = mergedDataCube.dataSets[0];
        mergedDataCube.components.dimensions = DataCube_DataCubeMerger.buildDimensionsAndTheirComponentSpecifications(mergedDataCubeUri, equalDimensions);
        mergedDataCube.selectedComponents.dimensions = mergedDataCube.components.dimensions;
        mergedDataCube.numberOfMultipleDimensions = _.size(CubeViz_Visualization_Controller.getMultipleDimensions(mergedDataCube.components.dimensions));
        mergedDataCube.numberOfOneElementDimensions = _.size(CubeViz_Visualization_Controller.getOneElementDimensions(mergedDataCube.components.dimensions));
        mergedDataCube.components.measures = DataCube_DataCubeMerger.buildMeasure(mergedDataCubeUri, measure1, measure2);
        mergedDataCube.selectedComponents.measure = mergedDataCube.components.measures[0];
        mergedDataCube.dataStructureDefinitions = DataCube_DataCubeMerger.buildDataStructureDefinitions(mergedDataCubeUri, mergedDataCube.components.dimensions);
        mergedDataCube.selectedDSD = mergedDataCube.dataStructureDefinitions[0];
        mergedDataCube.retrievedObservations = DataCube_DataCubeMerger.buildObservations(mergedDataCubeUri, dataset1, dataset2, retrievedObservations1, retrievedObservations2, mergedDataCube.selectedComponents.measure, mergedDataCube.selectedComponents.dimensions, 0);
        mergedDataCube.originalObservations = {
        };
        _.each(retrievedObservations1, function (observation) {
            mergedDataCube.originalObservations[observation.__cv_uri] = observation;
        });
        _.each(retrievedObservations2, function (observation) {
            mergedDataCube.originalObservations[observation.__cv_uri] = observation;
        });
        return mergedDataCube;
    }
    DataCube_DataCubeMerger.generateMergedDataCubeUri = function generateMergedDataCubeUri(url, stringifiedObject) {
        return url + "go/mergeddatacube/" + (CryptoJS.MD5(stringifiedObject) + "").substring(0, 6) + "#";
    }
    DataCube_DataCubeMerger.getDefaultDataCubeObject = function getDefaultDataCubeObject() {
        return {
            components: {
                attributes: null,
                dimensions: {
                },
                measures: {
                }
            },
            dataSets: {
            },
            dataStructureDefinitions: {
            },
            numberOfMultipleDimensions: 0,
            numberOfOneElementDimensions: 0,
            originalObservations: {
            },
            retrievedObservations: {
            },
            selectedComponents: {
            },
            selectedDS: {
            },
            selectedDSD: {
            },
            selectedSlice: {
            },
            slices: {
            },
            settings: {
                synchronizeWithStore: false
            }
        };
    }
    DataCube_DataCubeMerger.mergeDimensionElements = function mergeDimensionElements(dimensionElements1, dimensionElements2) {
        var i = 0;
        var mergedDimensionElements = {
        };
        var usedElementUris = [];

        _.each(dimensionElements1, function (element) {
            mergedDimensionElements[i++] = element;
            usedElementUris.push(element.__cv_uri);
            if(false === _.isUndefined(element["http://www.w3.org/2002/07/owl#sameAs"])) {
                usedElementUris.push(element["http://www.w3.org/2002/07/owl#sameAs"]);
            }
        });
        _.each(dimensionElements2, function (element) {
            if(-1 == $.inArray(element.__cv_uri, usedElementUris)) {
                if(false === _.isUndefined(element["http://www.w3.org/2002/07/owl#sameAs"]) && -1 < $.inArray(element["http://www.w3.org/2002/07/owl#sameAs"], usedElementUris)) {
                    return;
                }
                mergedDimensionElements[i++] = element;
                usedElementUris.push(element.__cv_uri);
            }
        });
        return mergedDimensionElements;
    }
    return DataCube_DataCubeMerger;
})();
var DataCube_DataSet = (function () {
    function DataCube_DataSet() { }
    DataCube_DataSet.loadAll = function loadAll(url, serviceUrl, modelIri, dsdUrl, callback) {
        $.ajax({
            url: url + "getdatasets/",
            data: {
                serviceUrl: serviceUrl,
                modelIri: modelIri,
                dsdUrl: dsdUrl
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
    DataCube_DataStructureDefinition.loadAll = function loadAll(url, serviceUrl, modelIri, callback) {
        $.ajax({
            url: url + "getdatastructuredefinitions/",
            data: {
                serviceUrl: serviceUrl,
                modelIri: modelIri
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
    DataCube_Observation.getNumberOfActiveObservations = function getNumberOfActiveObservations(observations) {
        var activeOnes = 0;
        _.each(observations, function (observation) {
            if(true === DataCube_Observation.isActive(observation)) {
                ++activeOnes;
            }
        });
        return activeOnes;
    }
    DataCube_Observation.getUsedDimensionElementUris = function getUsedDimensionElementUris(observations, dimensionUri) {
        var usedDimensionElementUris = [];
        _.each(observations, function (observation) {
            if(-1 === $.inArray(observation[dimensionUri], usedDimensionElementUris)) {
                usedDimensionElementUris.push(observation[dimensionUri]);
            }
        });
        return usedDimensionElementUris;
    }
    DataCube_Observation.getValues = function getValues(observations, measureUri, areActive) {
        if (typeof areActive === "undefined") { areActive = false; }
        var foundInvalidNumber = false;
        var value = null;
        var values = [];

        _.each(observations, function (observation) {
            if(true === areActive && false === DataCube_Observation.isActive(observation)) {
                return;
            }
            value = DataCube_Observation.parseValue(observation, measureUri);
            if(true === _.isNull(value)) {
                foundInvalidNumber = true;
                return;
            } else {
                values.push(value);
            }
        });
        return [
            values, 
            foundInvalidNumber
        ];
    }
    DataCube_Observation.prototype.initialize = function (retrievedObservations, selectedComponentDimensions, measureUri) {
        var dimensionElementInfoObject = {
        };
        var dimensionPropertyUri = "";
        var observationDimensionProperty = {
        };
        var self = this;
        var value = 0;

        this._axes = {
        };
        _.each(retrievedObservations, function (observation) {
            if(false === DataCube_Observation.isActive(observation)) {
                return;
            }
            value = DataCube_Observation.parseValue(observation, measureUri);
            if(true === _.isNull(value)) {
                return;
            }
            _.each(selectedComponentDimensions, function (dimension) {
                dimensionPropertyUri = dimension["http://purl.org/linked-data/cube#dimension"];
                observationDimensionProperty = observation[dimensionPropertyUri];
                if(true === _.isUndefined(self._axes[dimensionPropertyUri])) {
                    self._axes[dimensionPropertyUri] = {
                    };
                }
                if(true === _.isUndefined(self._axes[dimensionPropertyUri][observationDimensionProperty])) {
                    dimensionElementInfoObject = {
                        __cv_uri: observationDimensionProperty,
                        __cv_niceLabel: observationDimensionProperty
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
    DataCube_Observation.isActive = function isActive(observation) {
        if(false === _.isUndefined(observation.__cv_active) && false === observation.__cv_active) {
            return false;
        }
        return true;
    }
    DataCube_Observation.loadAll = function loadAll(url, serviceUrl, modelIri, dataHash, datasetUri, callback) {
        $.ajax({
            url: url + "getobservations/",
            data: {
                serviceUrl: serviceUrl,
                modelIri: modelIri,
                cv_dataHash: dataHash,
                datasetUri: datasetUri
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("Observation loadAll error: " + xhr.responseText);
        }).done(function (entries) {
            callback(entries.content);
        });
    }
    DataCube_Observation.loadNumberOfObservations = function loadNumberOfObservations(url, serviceUrl, modelIri, dsUri, callback) {
        $.ajax({
            url: url + "getnumberofobservations/",
            data: {
                serviceUrl: serviceUrl,
                modelIri: modelIri,
                dsUri: dsUri
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("Observation loadNumberOfObservations error: " + xhr.responseText);
        }).done(function (entries) {
            callback(entries.content);
        });
    }
    DataCube_Observation.markActiveObservations = function markActiveObservations(observations, selectedDimensions, selectedMeasure, selectedAttribute) {
        observations = $.parseJSON(JSON.stringify(observations));
        _.each(observations, function (observation, key) {
            observation.__cv_active = false;
            observations[key] = observation;
        });
        var dimensionUri = null;
        _.each(observations, function (observation, key) {
            _.each(selectedDimensions, function (dimension) {
                dimensionUri = dimension["http://purl.org/linked-data/cube#dimension"];
                if(false === _.isNull(DataCube_Component.findDimensionElement(dimension.__cv_elements, observation[dimensionUri]))) {
                    observation.__cv_active = true;
                }
            });
        });
        return observations;
    }
    DataCube_Observation.parseValue = function parseValue(observation, measureUri) {
        var parsedValue = null;
        var value = null;

        if(false === _.isUndefined(observation.__cv_temporaryNewValue)) {
            value = observation.__cv_temporaryNewValue;
        } else {
            value = observation[measureUri];
        }
        try  {
            if(true === _.str.include(value, " ")) {
                parsedValue = parseFloat(value.replace(/ /gi, ""));
            } else {
                parsedValue = parseFloat(value);
            }
            if(false === _.isNaN(parsedValue) && _.isFinite(parsedValue) && (0 < parsedValue || 0 > parsedValue || 0 === parsedValue)) {
                return parsedValue;
            }
        } catch (ex) {
        }
        return null;
    }
    DataCube_Observation.setOriginalValue = function setOriginalValue(observation, measureUri, newValue) {
        if(false === _.isUndefined(observation.__cv_temporaryNewValue)) {
            observation.__cv_temporaryNewValue = null;
            delete observation.__cv_temporaryNewValue;
        }
        observation[measureUri] = newValue;
    }
    DataCube_Observation.prototype.sortAxis = function (axisUri, mode) {
        var axesEntries = this._axes[axisUri];
        var mode = true === _.isUndefined(mode) ? "ascending" : mode;
        var stuffToSort = [];
        var sortedObj = {
        };
        var self = this;

        _.each(axesEntries, function (entry, key) {
            stuffToSort.push({
                key: key,
                label: entry.self.__cv_niceLabel
            });
        });
        switch(mode) {
            case "descending": {
                stuffToSort.sort(function (a, b) {
                    a = String(a.label).toLowerCase();
                    b = String(b.label).toLowerCase();
                    return ((a > b) ? -1 : ((a < b) ? 1 : 0));
                });
                break;

            }
            default: {
                stuffToSort.sort(function (a, b) {
                    a = String(a.label).toLowerCase();
                    b = String(b.label).toLowerCase();
                    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
                });
                break;

            }
        }
        _.each(stuffToSort, function (entry) {
            sortedObj[entry.key] = self._axes[axisUri][entry.key];
        });
        this._axes[axisUri] = sortedObj;
        return this;
    };
    return DataCube_Observation;
})();
var DataCube_Slice = (function () {
    function DataCube_Slice() { }
    DataCube_Slice.loadAll = function loadAll(url, serviceUrl, modelIri, dsdUrl, dsUrl, callback) {
        $.ajax({
            url: url + "getslices",
            data: {
                serviceUrl: serviceUrl,
                modelIri: modelIri,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("DataCube_Slice > loadAll: " + xhr.responseText);
        }).success(function (entries) {
            if(false === _.isUndefined(entries) && false === _.isUndefined(entries.content)) {
                callback(entries.content);
            }
        });
    }
    return DataCube_Slice;
})();
var View_CompareAction_ModelSelection = (function (_super) {
    __extends(View_CompareAction_ModelSelection, _super);
    function View_CompareAction_ModelSelection(attachedTo, app) {
        _super.call(this, "View_CompareAction_ModelSelection", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CompareAction_ModelSelection.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        return this;
    };
    View_CompareAction_ModelSelection.prototype.handleModelSelectorChanges = function (modelNr) {
        var selectedModelLabel = _.str.trim($("#cubeviz-compare-modelSelector" + modelNr + " option:selected").text());
        var selectedModelUri = $("#cubeviz-compare-modelSelector" + modelNr).val();

        if('' != selectedModelUri) {
            this.app._.compareAction.models[modelNr] = {
                __cv_compareNr: modelNr,
                __cv_uri: selectedModelUri,
                __cv_niceLabel: selectedModelLabel
            };
            this.triggerGlobalEvent("onSelect_model" + modelNr);
            if('' != this.app._.compareAction.models[1] && '' != this.app._.compareAction.models[2]) {
                this.triggerGlobalEvent("onSelect_model1AndModel2");
            }
        } else {
            this.app._.compareAction.models[modelNr] = null;
            this.triggerGlobalEvent("onSelect_noModel" + modelNr);
        }
    };
    View_CompareAction_ModelSelection.prototype.initialize = function () {
        this.collection.reset("__cv_uri");
        this.render();
    };
    View_CompareAction_ModelSelection.prototype.onChange_modelSelector1 = function () {
        this.handleModelSelectorChanges("1");
    };
    View_CompareAction_ModelSelection.prototype.onChange_modelSelector2 = function () {
        this.handleModelSelectorChanges("2");
    };
    View_CompareAction_ModelSelection.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CompareAction_ModelSelection.prototype.render = function () {
        this.bindUserInterfaceEvents({
            "change #cubeviz-compare-modelSelector1": this.onChange_modelSelector1,
            "change #cubeviz-compare-modelSelector2": this.onChange_modelSelector2
        });
        return this;
    };
    return View_CompareAction_ModelSelection;
})(CubeViz_View_Abstract);
var View_CompareAction_DatasetSelection = (function (_super) {
    __extends(View_CompareAction_DatasetSelection, _super);
    function View_CompareAction_DatasetSelection(attachedTo, app) {
        _super.call(this, "View_CompareAction_DatasetSelection", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onReceive_datasets",
                handler: this.onReceive_datasets
            }, 
            {
                name: "onReceive_noDatasets",
                handler: this.onReceive_noDatasets
            }, 
            {
                name: "onSelect_model1",
                handler: this.onSelect_model1
            }, 
            {
                name: "onSelect_model2",
                handler: this.onSelect_model2
            }, 
            {
                name: "onSelect_noModel1",
                handler: this.onSelect_noModel1
            }, 
            {
                name: "onSelect_noModel2",
                handler: this.onSelect_noModel2
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CompareAction_DatasetSelection.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        return this;
    };
    View_CompareAction_DatasetSelection.prototype.fillSelectBox = function (selectId, elements) {
        var newOption = {
        };
        $(selectId).html("<option value=\"\">- please select -</option>");
        _.each(elements, function (element) {
            newOption = $('<option/>');
            newOption.attr("value", element.__cv_uri).data("self", element).text(element.__cv_niceLabel);
            $(selectId).append(newOption);
        });
    };
    View_CompareAction_DatasetSelection.prototype.initialize = function () {
        this.collection.reset("__cv_uri");
        this.render();
    };
    View_CompareAction_DatasetSelection.prototype.handleDatasetSelectorChanges = function (datasetNr, element) {
        var selectedDatasetUri = $("#cubeviz-compare-datasetSelector" + datasetNr).val();
        if(true === _.str.isBlank(selectedDatasetUri)) {
            this.app._.compareAction.datasets[datasetNr] = null;
            this.triggerGlobalEvent("onSelected_noDataset" + datasetNr);
        } else {
            element.__cv_compareNr = datasetNr;
            this.app._.compareAction.datasets[datasetNr] = element;
            this.triggerGlobalEvent("onSelected_dataset" + datasetNr);
        }
        if(false === _.isNull(this.app._.compareAction.datasets[1]) && false === _.isNull(this.app._.compareAction.datasets[2])) {
            this.triggerGlobalEvent("onSelected_dataset1AndDataset2");
        }
    };
    View_CompareAction_DatasetSelection.prototype.handleModelSelectorChanges = function (modelNr) {
        var self = this;
        $("#cubeviz-compare-datasetSelectionDiv" + modelNr).show();
        $("#cubeviz-compare-datasetSelector" + modelNr).html("<option value=\"\">please wait ... </option>");
        DataCube_DataSet.loadAll(this.app._.backend.url, "", this.app._.compareAction.models[modelNr].__cv_uri, "", function (result) {
            self.onReceive_datasets(result, modelNr);
        });
    };
    View_CompareAction_DatasetSelection.prototype.onReceive_datasets = function (result, modelNr) {
        var self = this;
        $("#cubeviz-compare-datasetSelectorWarningBox" + modelNr).hide();
        if(0 < _.size(result)) {
            self.fillSelectBox("#cubeviz-compare-datasetSelector" + modelNr, result);
        } else {
            $("#cubeviz-compare-datasetSelector" + modelNr).html("<option value=\"\">Choose another model ... </option>");
            self.triggerGlobalEvent("onReceive_noDatasets", {
                modelNr: modelNr,
                modelUri: self.app._.compareAction.models[modelNr].__cv_uri
            });
        }
    };
    View_CompareAction_DatasetSelection.prototype.onReceive_noDatasets = function (event, data) {
        $("#cubeviz-compare-datasetSelectorWarningBox" + data.modelNr).show();
    };
    View_CompareAction_DatasetSelection.prototype.onSelect_dataset1 = function (event) {
        this.handleDatasetSelectorChanges("1", $(event.target).find("option:selected").data("self"));
    };
    View_CompareAction_DatasetSelection.prototype.onSelect_dataset2 = function (event) {
        this.handleDatasetSelectorChanges("2", $(event.target).find("option:selected").data("self"));
    };
    View_CompareAction_DatasetSelection.prototype.onSelect_model1 = function (event, data) {
        this.handleModelSelectorChanges("1");
    };
    View_CompareAction_DatasetSelection.prototype.onSelect_model2 = function (event, data) {
        this.handleModelSelectorChanges("2");
    };
    View_CompareAction_DatasetSelection.prototype.onSelect_noModel1 = function () {
        $("#cubeviz-compare-datasetSelectionDiv1").hide();
    };
    View_CompareAction_DatasetSelection.prototype.onSelect_noModel2 = function () {
        $("#cubeviz-compare-datasetSelectionDiv2").hide();
    };
    View_CompareAction_DatasetSelection.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CompareAction_DatasetSelection.prototype.render = function () {
        this.bindUserInterfaceEvents({
            "change #cubeviz-compare-datasetSelector1": this.onSelect_dataset1,
            "change #cubeviz-compare-datasetSelector2": this.onSelect_dataset2
        });
        return this;
    };
    return View_CompareAction_DatasetSelection;
})(CubeViz_View_Abstract);
var View_CompareAction_GeneralDatasetInformation = (function (_super) {
    __extends(View_CompareAction_GeneralDatasetInformation, _super);
    function View_CompareAction_GeneralDatasetInformation(attachedTo, app) {
        _super.call(this, "View_CompareAction_GeneralDatasetInformation", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onReceived_attributes1AndAttributes2",
                handler: this.onReceived_attributes1AndAttributes2
            }, 
            {
                name: "onReceived_dimensions1AndDimensions2",
                handler: this.onReceived_dimensions1AndDimensions2
            }, 
            {
                name: "onReceived_measures1AndMeasures2",
                handler: this.onReceived_measures1AndMeasures2
            }, 
            {
                name: "onReceived_numbersOfObservations1AndNumbersOfObservations2",
                handler: this.onReceived_numbersOfObservations1AndNumbersOfObservations2
            }, 
            {
                name: "onReceived_slices1AndSlices2",
                handler: this.onReceived_slices1AndSlices2
            }, 
            {
                name: "onSelected_dataset1",
                handler: this.onSelected_dataset1
            }, 
            {
                name: "onSelected_dataset2",
                handler: this.onSelected_dataset2
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CompareAction_GeneralDatasetInformation.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        return this;
    };
    View_CompareAction_GeneralDatasetInformation.prototype.displayAttributesInformation1 = function () {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation1").find(".cubeviz-compare-informationPieceBox");
        $($(informationPieceBoxes.get(3)).find(".cubeviz-compare-informationPieceBoxValue").first()).html(_.size(this.app._.compareAction.components.attributes[1]));
        $("#cubeviz-compare-generalDatasetInformation1").show();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.displayAttributesInformation2 = function () {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation2").find(".cubeviz-compare-informationPieceBox");
        $($(informationPieceBoxes.get(3)).find(".cubeviz-compare-informationPieceBoxValue").first()).html(_.size(this.app._.compareAction.components.attributes[2]));
        $("#cubeviz-compare-generalDatasetInformation2").show();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.displayDimensionsInformation1 = function () {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation1").find(".cubeviz-compare-informationPieceBox");
        $($(informationPieceBoxes.get(0)).find(".cubeviz-compare-informationPieceBoxValue").first()).html(_.size(this.app._.compareAction.components.dimensions[1]));
        $("#cubeviz-compare-generalDatasetInformation1").show();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.displayDimensionsInformation2 = function () {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation2").find(".cubeviz-compare-informationPieceBox");
        $($(informationPieceBoxes.get(0)).find(".cubeviz-compare-informationPieceBoxValue").first()).html(_.size(this.app._.compareAction.components.dimensions[2]));
        $("#cubeviz-compare-generalDatasetInformation2").show();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.displayDimensionElementsInformation1 = function () {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation1").find(".cubeviz-compare-informationPieceBox");
        var numberOfDimensionElements = 0;
        var self = this;

        _.each(this.app._.compareAction.components.dimensions[1], function (dimension) {
            numberOfDimensionElements += _.size(dimension.__cv_elements);
        });
        $($(informationPieceBoxes.get(1)).find(".cubeviz-compare-informationPieceBoxValue").first()).html(numberOfDimensionElements);
        $("#cubeviz-compare-generalDatasetInformation1").show();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.displayDimensionElementsInformation2 = function () {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation2").find(".cubeviz-compare-informationPieceBox");
        var numberOfDimensionElements = 0;
        var self = this;

        _.each(this.app._.compareAction.components.dimensions[2], function (dimension) {
            _.each(dimension.__cv_elements, function (dimensionElement) {
                ++numberOfDimensionElements;
            });
        });
        $($(informationPieceBoxes.get(1)).find(".cubeviz-compare-informationPieceBoxValue").first()).html(numberOfDimensionElements);
        $("#cubeviz-compare-generalDatasetInformation1").show();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.displayMeasuresInformation1 = function () {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation1").find(".cubeviz-compare-informationPieceBox");
        $($(informationPieceBoxes.get(2)).find(".cubeviz-compare-informationPieceBoxValue").first()).html(_.size(this.app._.compareAction.components.measures[1]));
        $("#cubeviz-compare-generalDatasetInformation1").show();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.displayMeasuresInformation2 = function () {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation2").find(".cubeviz-compare-informationPieceBox");
        $($(informationPieceBoxes.get(2)).find(".cubeviz-compare-informationPieceBoxValue").first()).html(_.size(this.app._.compareAction.components.measures[2]));
        $("#cubeviz-compare-generalDatasetInformation2").show();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.displayNumberOfObservations1 = function () {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation1").find(".cubeviz-compare-informationPieceBox");
        $($(informationPieceBoxes.get(5)).find(".cubeviz-compare-informationPieceBoxValue").first()).html(this.app._.compareAction.numberOfObservations[1]);
        $("#cubeviz-compare-generalDatasetInformation1").show();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.displayNumberOfObservations2 = function () {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation2").find(".cubeviz-compare-informationPieceBox");
        $($(informationPieceBoxes.get(5)).find(".cubeviz-compare-informationPieceBoxValue").first()).html(this.app._.compareAction.numberOfObservations[2]);
        $("#cubeviz-compare-generalDatasetInformation2").show();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.displaySlicesInformation1 = function () {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation1").find(".cubeviz-compare-informationPieceBox");
        $($(informationPieceBoxes.get(4)).find(".cubeviz-compare-informationPieceBoxValue").first()).html(_.size(this.app._.compareAction.slices[1]));
        $("#cubeviz-compare-generalDatasetInformation1").show();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.displaySlicesInformation2 = function () {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation2").find(".cubeviz-compare-informationPieceBox");
        $($(informationPieceBoxes.get(4)).find(".cubeviz-compare-informationPieceBoxValue").first()).html(_.size(this.app._.compareAction.slices[2]));
        $("#cubeviz-compare-generalDatasetInformation2").show();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.initialize = function () {
        this.render();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.handleDatasetSelectorChanges = function (datasetNr) {
        var self = this;
        this.app._.compareAction.components.dimensions[datasetNr] = null;
        this.app._.compareAction.components.measures[datasetNr] = null;
        this.app._.compareAction.components.attributes[datasetNr] = null;
        DataCube_Component.loadAllDimensions(this.app._.backend.url, "", this.app._.compareAction.models[datasetNr].__cv_uri, this.app._.compareAction.datasets[datasetNr]["http://purl.org/linked-data/cube#structure"], this.app._.compareAction.datasets[datasetNr].__cv_uri, function (result) {
            self.app._.compareAction.components.dimensions[datasetNr] = result;
            self.triggerGlobalEvent("onReceived_dimensions" + datasetNr);
            if(false === _.isNull(self.app._.compareAction.components.dimensions[1]) && false === _.isNull(self.app._.compareAction.components.dimensions[2])) {
                self.triggerGlobalEvent("onReceived_dimensions1AndDimensions2");
            }
        });
        DataCube_Component.loadAllMeasures(this.app._.backend.url, "", this.app._.compareAction.models[datasetNr].__cv_uri, this.app._.compareAction.datasets[datasetNr]["http://purl.org/linked-data/cube#structure"], this.app._.compareAction.datasets[datasetNr].__cv_uri, function (result) {
            self.app._.compareAction.components.measures[datasetNr] = result;
            self.triggerGlobalEvent("onReceived_measures" + datasetNr);
            if(false === _.isNull(self.app._.compareAction.components.measures[1]) && false === _.isNull(self.app._.compareAction.components.measures[2])) {
                self.triggerGlobalEvent("onReceived_measures1AndMeasures2");
            }
        });
        DataCube_Component.loadAllAttributes(this.app._.backend.url, "", this.app._.compareAction.models[datasetNr].__cv_uri, this.app._.compareAction.datasets[datasetNr]["http://purl.org/linked-data/cube#structure"], this.app._.compareAction.datasets[datasetNr].__cv_uri, function (result) {
            self.app._.compareAction.components.attributes[datasetNr] = result;
            self.triggerGlobalEvent("onReceived_attributes" + datasetNr);
            if(false === _.isNull(self.app._.compareAction.components.measures[1]) && false === _.isNull(self.app._.compareAction.components.measures[2])) {
                self.triggerGlobalEvent("onReceived_attributes1AndAttributes2");
            }
        });
        DataCube_Slice.loadAll(this.app._.backend.url, "", this.app._.compareAction.models[datasetNr].__cv_uri, this.app._.compareAction.datasets[datasetNr]["http://purl.org/linked-data/cube#structure"], this.app._.compareAction.datasets[datasetNr].__cv_uri, function (result) {
            self.app._.compareAction.slices[datasetNr] = result;
            self.triggerGlobalEvent("onReceived_slices" + datasetNr);
            if(false === _.isNull(self.app._.compareAction.slices[1]) && false === _.isNull(self.app._.compareAction.slices[2])) {
                self.triggerGlobalEvent("onReceived_slices1AndSlices2");
            }
        });
        DataCube_Observation.loadNumberOfObservations(this.app._.backend.url, "", this.app._.compareAction.models[datasetNr].__cv_uri, this.app._.compareAction.datasets[datasetNr].__cv_uri, function (result) {
            self.app._.compareAction.numberOfObservations[datasetNr] = result;
            self.triggerGlobalEvent("onReceived_observationNumber" + datasetNr);
            if(-1 < self.app._.compareAction.numberOfObservations[1] && -1 < self.app._.compareAction.numberOfObservations[2]) {
                self.triggerGlobalEvent("onReceived_numbersOfObservations1AndNumbersOfObservations2");
            }
        });
        DataCube_Observation.loadAll(this.app._.backend.url, "", this.app._.compareAction.models[datasetNr].__cv_uri, "", this.app._.compareAction.datasets[datasetNr].__cv_uri, function (result) {
            self.app._.compareAction.originalObservations[datasetNr] = result;
            self.app._.compareAction.retrievedObservations[datasetNr] = result;
            self.triggerGlobalEvent("onReceived_observations" + datasetNr);
            if(false == _.isNull(self.app._.compareAction.originalObservations[1]) && false == _.isNull(self.app._.compareAction.originalObservations[2])) {
                self.triggerGlobalEvent("onReceived_observations1AndObservations2");
            }
        });
    };
    View_CompareAction_GeneralDatasetInformation.prototype.onSelected_dataset1 = function (event) {
        this.handleDatasetSelectorChanges("1");
    };
    View_CompareAction_GeneralDatasetInformation.prototype.onSelected_dataset2 = function (event) {
        this.handleDatasetSelectorChanges("2");
    };
    View_CompareAction_GeneralDatasetInformation.prototype.onReceived_attributes1AndAttributes2 = function () {
        this.displayAttributesInformation1();
        this.displayAttributesInformation2();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.onReceived_dimensions1AndDimensions2 = function () {
        this.displayDimensionsInformation1();
        this.displayDimensionsInformation2();
        this.displayDimensionElementsInformation1();
        this.displayDimensionElementsInformation2();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.onReceived_measures1AndMeasures2 = function () {
        this.displayMeasuresInformation1();
        this.displayMeasuresInformation2();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.onReceived_numbersOfObservations1AndNumbersOfObservations2 = function () {
        this.displayNumberOfObservations1();
        this.displayNumberOfObservations2();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.onReceived_slices1AndSlices2 = function () {
        this.displaySlicesInformation1();
        this.displaySlicesInformation2();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CompareAction_GeneralDatasetInformation.prototype.render = function () {
        this.bindUserInterfaceEvents({
        });
        return this;
    };
    return View_CompareAction_GeneralDatasetInformation;
})(CubeViz_View_Abstract);
var View_CompareAction_DimensionOverview = (function (_super) {
    __extends(View_CompareAction_DimensionOverview, _super);
    function View_CompareAction_DimensionOverview(attachedTo, app) {
        _super.call(this, "View_CompareAction_DimensionOverview", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onReceived_dimensions1AndDimensions2",
                handler: this.onReceived_dimensions1AndDimensions2
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CompareAction_DimensionOverview.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        return this;
    };
    View_CompareAction_DimensionOverview.prototype.displayEqualDimensions = function () {
        var description = "";
        var dimensionContainer = null;
        var dimensionElementContainer = null;
        var dimensionIndex = 0;
        var i = 0;
        var newWidth = 2000;
        var self = this;

        if(0 < _.size(this.app._.compareAction.equalDimensions)) {
            $("#cubeviz-compare-equalDimensions1").show();
            $("#cubeviz-compare-equalDimensions2").show();
            $("#cubeviz-compare-equalDimensionsTableContainer1").html("");
            $("#cubeviz-compare-equalDimensionsTableContainer2").html("");
            _.each(this.app._.compareAction.equalDimensions, function (dimensions) {
                description = dimensions[0].__cv_description;
                if(true === _.str.isBlank(description)) {
                    description = "no description found";
                }
                dimensionContainer = $(CubeViz_View_Helper.tplReplace($("#cubeviz-compare-tpl-equalDimension").html(), {
                    dimensionLabel: dimensions[0].__cv_niceLabel,
                    dimensionDescription: description
                }));
                if(false === _.isUndefined(dimensions[0].__cv_equalElements) && 0 < _.size(dimensions[0].__cv_equalElements)) {
                    dimensionElementContainer = $($(dimensionContainer).find(".cubeviz-compare-dimensionTitleAndElements").first());
                    dimensionElementContainer.append($("<td rowspan=\"3\" style=\"vertical-align: middle;\">" + "<div style=\"-webkit-transform:rotate(-90deg);\">Dimension Elements</div></td>"));
                    _.each(dimensions[0].__cv_equalElements, function (element) {
                        dimensionElementContainer.append($("<td rowspan=\"3\" style=\"vertical-align: middle;\">" + "<div style=\"-webkit-transform:rotate(-90deg);\">" + element.__cv_niceLabel + "</div></td>"));
                    });
                    $($(dimensionContainer).find(".cubeviz-compare-dimensionNumberOfUnequalDimensionElements").first()).html(_.size(dimensions[0].__cv_elements) - _.size(dimensions[0].__cv_equalElements));
                    $($(dimensionContainer).find(".cubeviz-compare-dimensionNumberOfEqualDimensionElements").first()).html(_.size(dimensions[0].__cv_equalElements));
                }
                $("#cubeviz-compare-equalDimensionsTableContainer1").append(dimensionContainer);
                description = dimensions[1].__cv_description;
                if(true === _.str.isBlank(description)) {
                    description = "no description found";
                }
                dimensionContainer = $(CubeViz_View_Helper.tplReplace($("#cubeviz-compare-tpl-equalDimension").html(), {
                    dimensionLabel: dimensions[1].__cv_niceLabel,
                    dimensionDescription: description
                }));
                if(false === _.isUndefined(dimensions[1].__cv_equalElements) && 0 < _.size(dimensions[1].__cv_equalElements)) {
                    dimensionElementContainer = $($(dimensionContainer).find(".cubeviz-compare-dimensionTitleAndElements").first());
                    dimensionElementContainer.append($("<td rowspan=\"3\" style=\"vertical-align: middle;\">" + "<div style=\"-webkit-transform:rotate(-90deg);\">Dimension Elements</div></td>"));
                    _.each(dimensions[1].__cv_equalElements, function (element) {
                        dimensionElementContainer.append($("<td rowspan=\"3\" style=\"vertical-align: middle;\">" + "<div style=\"-webkit-transform:rotate(-90deg);\">" + element.__cv_niceLabel + "</div></td>"));
                    });
                    $($(dimensionContainer).find(".cubeviz-compare-dimensionNumberOfUnequalDimensionElements").first()).html(_.size(dimensions[1].__cv_elements) - _.size(dimensions[1].__cv_equalElements));
                    $($(dimensionContainer).find(".cubeviz-compare-dimensionNumberOfEqualDimensionElements").first()).html(_.size(dimensions[1].__cv_equalElements));
                }
                $("#cubeviz-compare-equalDimensionsTableContainer2").append(dimensionContainer);
                newWidth += 1000;
            });
            $("#cubeviz-compare-equalDimensionsTableContainer1").width(newWidth);
            $("#cubeviz-compare-equalDimensionsTableContainer2").width(newWidth);
        }
    };
    View_CompareAction_DimensionOverview.prototype.displayUnequalDimensions = function () {
        var $container = null;
        var description = "";
        var minWidth = 0;

        $("#cubeviz-compare-unequalDimensionsTableContainer1").html("");
        if(0 < _.size(this.app._.compareAction.unequalDimensions[1]) || 0 < _.size(this.app._.compareAction.unequalDimensions[2])) {
            $("#cubeviz-compare-unequalDimensions1").show();
            $("#cubeviz-compare-unequalDimensions2").show();
        }
        _.each(this.app._.compareAction.unequalDimensions[1], function (dimension) {
            description = dimension.__cv_description;
            if(true === _.str.isBlank(description)) {
                description = "no description found";
            }
            $container = $(CubeViz_View_Helper.tplReplace($("#cubeviz-compare-tpl-unequalDimension").html(), {
                dimensionLabel: dimension.__cv_niceLabel,
                dimensionDescription: description
            }));
            $($container.find(".cubeviz-compare-numberOfDimensionElements").first()).html(_.size(dimension.__cv_elements));
            $("#cubeviz-compare-unequalDimensionsTableContainer1").append($container);
            minWidth += 220;
        });
        $(".cubeviz-compare-unequalDimensions").css("min-width", minWidth);
        _.each(this.app._.compareAction.unequalDimensions[2], function (dimension) {
            description = dimension.__cv_description;
            if(true === _.str.isBlank(description)) {
                description = "no description found";
            }
            $container = $(CubeViz_View_Helper.tplReplace($("#cubeviz-compare-tpl-unequalDimension").html(), {
                dimensionLabel: dimension.__cv_niceLabel,
                dimensionDescription: description
            }));
            $($container.find(".cubeviz-compare-numberOfDimensionElements").first()).html(_.size(dimension.__cv_elements));
            $("#cubeviz-compare-unequalDimensionsTableContainer2").append($container);
        });
    };
    View_CompareAction_DimensionOverview.prototype.findEqualDimensions = function () {
        var equalDimensionElements = null;
        var dimension1 = null;
        var self = this;
        var urisToCheck = {
        };
        var usedDatasetDimensions = [];

        self.app._.compareAction.equalDimensions = [];
        self.app._.compareAction.unequalDimensions = {
            1: [],
            2: []
        };
        _.each(this.app._.compareAction.components.dimensions[1], function (dimension) {
            urisToCheck[dimension.__cv_uri] = dimension.__cv_uri;
            if(false === _.str.isBlank(dimension["http://www.w3.org/2002/07/owl#sameAs"])) {
                urisToCheck[dimension["http://www.w3.org/2002/07/owl#sameAs"]] = dimension.__cv_uri;
            }
        });
        _.each(this.app._.compareAction.components.dimensions[2], function (dimension2) {
            if(false === _.isUndefined(urisToCheck[dimension2.__cv_uri]) || false === _.isUndefined(urisToCheck[dimension2["http://www.w3.org/2002/07/owl#sameAs"]])) {
                if(false === _.isUndefined(urisToCheck[dimension2.__cv_uri])) {
                    dimension1 = self.app._.compareAction.components.dimensions[1][urisToCheck[dimension2.__cv_uri]];
                } else {
                    dimension1 = self.app._.compareAction.components.dimensions[1][urisToCheck[dimension2["http://www.w3.org/2002/07/owl#sameAs"]]];
                }
                equalDimensionElements = self.findEqualDimensionElements(dimension1, dimension2);
                dimension1.__cv_equalElements = equalDimensionElements[1];
                dimension2.__cv_equalElements = equalDimensionElements[2];
                self.app._.compareAction.equalDimensions.push([
                    dimension1, 
                    dimension2
                ]);
                usedDatasetDimensions.push(dimension1.__cv_uri);
            } else {
                self.app._.compareAction.unequalDimensions[2].push(dimension2);
            }
        });
        _.each(this.app._.compareAction.components.dimensions[1], function (dimension) {
            if(-1 === $.inArray(dimension.__cv_uri, usedDatasetDimensions)) {
                self.app._.compareAction.unequalDimensions[1].push(dimension);
            }
        });
        if(0 < _.size(this.app._.compareAction.equalDimensions)) {
            this.triggerGlobalEvent("onFound_equalDimensions");
        }
    };
    View_CompareAction_DimensionOverview.prototype.findEqualDimensionElements = function (dimension1, dimension2) {
        var result = {
            1: [],
            2: []
        };
        var urisToCheck = {
        };

        if(0 == _.size(dimension1.__cv_elements) || 0 == _.size(dimension2.__cv_elements)) {
            return result;
        }
        _.each(dimension1.__cv_elements, function (dimensionElement) {
            urisToCheck[dimensionElement.__cv_uri] = dimensionElement;
            if(false === _.str.isBlank(dimensionElement["http://www.w3.org/2002/07/owl#sameAs"])) {
                urisToCheck[dimensionElement["http://www.w3.org/2002/07/owl#sameAs"]] = dimensionElement;
            }
        });
        _.each(dimension2.__cv_elements, function (dimensionElement) {
            if(false === _.isUndefined(urisToCheck[dimensionElement.__cv_uri])) {
                result[1].push(urisToCheck[dimensionElement.__cv_uri]);
                result[2].push(dimensionElement);
            }
            if(false === _.isUndefined(urisToCheck[dimensionElement["http://www.w3.org/2002/07/owl#sameAs"]])) {
                result[1].push(urisToCheck[dimensionElement["http://www.w3.org/2002/07/owl#sameAs"]]);
                result[2].push(dimensionElement);
            }
        });
        return result;
    };
    View_CompareAction_DimensionOverview.prototype.onReceived_dimensions1AndDimensions2 = function (event) {
        this.findEqualDimensions();
        this.displayUnequalDimensions();
        this.displayEqualDimensions();
    };
    View_CompareAction_DimensionOverview.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CompareAction_DimensionOverview.prototype.render = function () {
        this.bindUserInterfaceEvents({
        });
        return this;
    };
    return View_CompareAction_DimensionOverview;
})(CubeViz_View_Abstract);
var View_CompareAction_MeasureAndAttributeInformation = (function (_super) {
    __extends(View_CompareAction_MeasureAndAttributeInformation, _super);
    function View_CompareAction_MeasureAndAttributeInformation(attachedTo, app) {
        _super.call(this, "View_CompareAction_MeasureAndAttributeInformation", attachedTo, app);
        this._measures1And2Recveived = false;
        this._observations1And2Received = false;
        this.bindGlobalEvents([
            {
                name: "onReceived_measures1AndMeasures2",
                handler: this.onReceived_measures1AndMeasures2
            }, 
            {
                name: "onReceived_observations1AndObservations2",
                handler: this.onReceived_observations1AndObservations2
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CompareAction_MeasureAndAttributeInformation.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        return this;
    };
    View_CompareAction_MeasureAndAttributeInformation.prototype.displayMeasuresAndAttributesInformation = function (datasetNr) {
        var $container = $("#cubeviz-compare-measuresAndAttributesInformation" + datasetNr);
        var foundInvalidNumbers = false;
        var measure = this.app._.compareAction.components.measures[datasetNr][Object.keys(this.app._.compareAction.components.measures[datasetNr])[0]];
        var observationValues = null;
        var valuesResult = null;

        valuesResult = DataCube_Observation.getValues(this.app._.compareAction.retrievedObservations[datasetNr], measure["http://purl.org/linked-data/cube#measure"]);
        observationValues = valuesResult[0];
        foundInvalidNumbers = valuesResult[1];
        if(true === foundInvalidNumbers) {
            $("#cubeviz-compare-mAAInvalidNumbersFound" + datasetNr).show();
        }
        $($container.find(".cubeviz-compare-mAARangeMin").first()).html(true === foundInvalidNumbers ? "~ " + String(jsStats.min(observationValues)).substring(0, 10) : String(jsStats.min(observationValues)).substring(0, 10));
        $($container.find(".cubeviz-compare-mAARangeMax").first()).html(true === foundInvalidNumbers ? "~ " + String(jsStats.max(observationValues)).substring(0, 10) : String(jsStats.max(observationValues)).substring(0, 10));
        $($container.find(".cubeviz-compare-mAAMedian").first()).html(true === foundInvalidNumbers ? "~ " + String(jsStats.median(observationValues)).substring(0, 10) : String(jsStats.median(observationValues)).substring(0, 10));
        $($container.find(".cubeviz-compare-mAAMean").first()).html(true === foundInvalidNumbers ? "~ " + String(jsStats.mean(observationValues)).substring(0, 10) : String(jsStats.mean(observationValues)).substring(0, 10));
        $($container.find(".cubeviz-compare-mAAVariance").first()).html(true === foundInvalidNumbers ? "~ " + String(jsStats.variance(observationValues)).substring(0, 10) : String(jsStats.variance(observationValues)).substring(0, 10));
        $($container.find(".cubeviz-compare-mAAStandardDeviation").first()).html(true === foundInvalidNumbers ? "~ " + String(jsStats.standardDeviation(observationValues)).substring(0, 10) : String(jsStats.standardDeviation(observationValues)).substring(0, 10));
        $("#cubeviz-compare-measuresAndAttributesInformation" + datasetNr).show();
    };
    View_CompareAction_MeasureAndAttributeInformation.prototype.initialize = function () {
        this.collection.reset("__cv_uri");
        this.render();
    };
    View_CompareAction_MeasureAndAttributeInformation.prototype.onReceived_measures1AndMeasures2 = function () {
        this._measures1And2Recveived = true;
        if(true === this._measures1And2Recveived && true === this._observations1And2Received) {
            this.displayMeasuresAndAttributesInformation(1);
            this.displayMeasuresAndAttributesInformation(2);
        }
    };
    View_CompareAction_MeasureAndAttributeInformation.prototype.onReceived_observations1AndObservations2 = function () {
        this._observations1And2Received = true;
        if(true === this._measures1And2Recveived && true === this._observations1And2Received) {
            this.displayMeasuresAndAttributesInformation(1);
            this.displayMeasuresAndAttributesInformation(2);
        }
    };
    View_CompareAction_MeasureAndAttributeInformation.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CompareAction_MeasureAndAttributeInformation.prototype.render = function () {
        this.bindUserInterfaceEvents({
        });
        return this;
    };
    return View_CompareAction_MeasureAndAttributeInformation;
})(CubeViz_View_Abstract);
var View_CompareAction_VisualizationSetup = (function (_super) {
    __extends(View_CompareAction_VisualizationSetup, _super);
    function View_CompareAction_VisualizationSetup(attachedTo, app) {
        _super.call(this, "View_CompareAction_VisualizationSetup", attachedTo, app);
        this._equalDimensionsFound = false;
        this._measuresReceived = false;
        this._observationsReceived = false;
        this.bindGlobalEvents([
            {
                name: "onCreated_mergedDataCube",
                handler: this.onCreated_mergedDataCube
            }, 
            {
                name: "onFound_equalDimensions",
                handler: this.onFound_equalDimensions
            }, 
            {
                name: "onReceived_dimensions1AndDimensions2",
                handler: this.onReceived_dimensions1AndDimensions2
            }, 
            {
                name: "onReceived_measures1AndMeasures2",
                handler: this.onReceived_measures1AndMeasures2
            }, 
            {
                name: "onReceived_observations1AndObservations2",
                handler: this.onReceived_observations1AndObservations2
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CompareAction_VisualizationSetup.prototype.adaptObservationValues = function (datasetNr, formula, observations, measureUri) {
        try  {
            var adaptedObservations = {
            };
            var observationValue = "";
            var parser = new formulaParser();
            var specificFormula = "";

            adaptedObservations = $.parseJSON(JSON.stringify(observations));
            _.each(adaptedObservations, function (observation, key) {
                observationValue = DataCube_Observation.parseValue(observation, measureUri);
                specificFormula = formula.split("$value$").join(observationValue);
                specificFormula = specificFormula.split("$pi$").join(Math.PI + "");
                DataCube_Observation.setOriginalValue(observation, measureUri, parser.parse(specificFormula).evaluate());
                adaptedObservations[key] = observation;
            });
            return adaptedObservations;
        } catch (ex) {
        }
        return false;
    };
    View_CompareAction_VisualizationSetup.prototype.checkAndShowVisualizationSetup = function () {
        if(false === this._equalDimensionsFound || false === this._measuresReceived || false === this._observationsReceived) {
            return;
        }
        $("#cubeviz-compare-prepareAndGoToVisualizations").fadeIn();
        var mergedDataCube = null;
        var self = this;

        this.app._.compareAction.mergedDataCube = DataCube_DataCubeMerger.createMergedDataCube(this.app._.backend.url, JSON.stringify(this.app._.compareAction), this.app._.compareAction.datasets[1], this.app._.compareAction.datasets[2], this.app._.compareAction.equalDimensions, DataCube_Component.getMeasures(this.app._.compareAction.components.measures[1])[0], DataCube_Component.getMeasures(this.app._.compareAction.components.measures[2])[0], this.app._.compareAction.retrievedObservations[1], this.app._.compareAction.retrievedObservations[2]);
        CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, mergedDataCube, "data", function (dataHash) {
            self.triggerGlobalEvent("onCreated_mergedDataCube", {
                dataHash: dataHash,
                mergedDataCube: mergedDataCube
            });
        }, true);
    };
    View_CompareAction_VisualizationSetup.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        return this;
    };
    View_CompareAction_VisualizationSetup.prototype.displayAvailableVisualizations = function (charts, mergedDataCube) {
        var link = null;
        var self = this;
        var uiObject = {
            visualization: {
                className: ""
            },
            visualizationSettings: {
            }
        };
        var $newVisz = null;

        $("#cubeviz-compare-availableVisualizations").html("");
        _.each(charts, function (chart) {
            uiObject.visualization.className = chart.className;
            CubeViz_ConfigurationLink.save(self.app._.backend.url, self.app._.backend.modelUrl, uiObject, "ui", function (uiHash) {
                CubeViz_ConfigurationLink.save(self.app._.backend.url, self.app._.backend.modelUrl, mergedDataCube, "data", function (dataHash) {
                    link = self.app._.backend.url + "?";
                    $newVisz = $("<div class=\"span2\">" + "<a><img class=\"cubeviz-compare-specificVisz\" " + "src=\"" + self.app._.backend.imagesPath + chart.icon + "\"/></a>" + "</div>");
                    if(false === _.isNull(self.app._.backend.serviceUrl)) {
                        link += "serviceUrl=" + encodeURIComponent(self.app._.backend.serviceUrl) + "&";
                    }
                    if(true === _.str.isBlank(self.app._.backend.modelUrl)) {
                        link += "m=" + encodeURIComponent(self.app._.compareAction.models[1].__cv_uri);
                    } else {
                        link += "m=" + encodeURIComponent(self.app._.backend.modelUrl);
                    }
                    link += "&cv_dataHash=" + dataHash + "&cv_uiHash=" + uiHash;
                    $($newVisz.find("a").first()).attr("href", link).attr("target", "_blank");
                    $("#cubeviz-compare-availableVisualizations").append($newVisz);
                }, true);
            });
        });
    };
    View_CompareAction_VisualizationSetup.prototype.initialize = function () {
        this.render();
    };
    View_CompareAction_VisualizationSetup.prototype.onClick_useBtn1 = function () {
        var measureUri = DataCube_Component.getMeasures(this.app._.compareAction.components.measures[1])[0]["http://purl.org/linked-data/cube#measure"];
        var mergedDataCube = null;
        var self = this;

        this.app._.compareAction.retrievedObservations[1] = this.adaptObservationValues(1, $("#cubeviz-compare-confViz-datasetFormula1").val(), this.app._.compareAction.originalObservations[1], measureUri);
        if(false === this.app._.compareAction.retrievedObservations[1]) {
            return;
        }
        mergedDataCube = DataCube_DataCubeMerger.createMergedDataCube(this.app._.backend.url, JSON.stringify(this.app._.compareAction), this.app._.compareAction.datasets[1], this.app._.compareAction.datasets[2], this.app._.compareAction.equalDimensions, DataCube_Component.getMeasures(this.app._.compareAction.components.measures[1])[0], DataCube_Component.getMeasures(this.app._.compareAction.components.measures[2])[0], this.app._.compareAction.retrievedObservations[1], this.app._.compareAction.retrievedObservations[2]);
        CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, mergedDataCube, "data", function (dataHash) {
            self.triggerGlobalEvent("onCreated_mergedDataCube", {
                dataHash: dataHash,
                mergedDataCube: mergedDataCube
            });
        }, true);
    };
    View_CompareAction_VisualizationSetup.prototype.onClick_useBtn2 = function () {
        var measureUri = DataCube_Component.getMeasures(this.app._.compareAction.components.measures[2])[0]["http://purl.org/linked-data/cube#measure"];
        var mergedDataCube = null;
        var self = this;

        this.app._.compareAction.retrievedObservations[2] = this.adaptObservationValues(2, $("#cubeviz-compare-confViz-datasetFormula2").val(), this.app._.compareAction.originalObservations[2], measureUri);
        if(false === this.app._.compareAction.retrievedObservations[2]) {
            return;
        }
        this.app._.compareAction.mergedDataCube = DataCube_DataCubeMerger.createMergedDataCube(this.app._.backend.url, JSON.stringify(this.app._.compareAction), this.app._.compareAction.datasets[1], this.app._.compareAction.datasets[2], this.app._.compareAction.equalDimensions, DataCube_Component.getMeasures(this.app._.compareAction.components.measures[1])[0], DataCube_Component.getMeasures(this.app._.compareAction.components.measures[2])[0], this.app._.compareAction.retrievedObservations[1], this.app._.compareAction.retrievedObservations[2]);
        CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, mergedDataCube, "data", function (dataHash) {
            self.triggerGlobalEvent("onCreated_mergedDataCube", {
                dataHash: dataHash,
                mergedDataCube: mergedDataCube
            });
        }, true);
    };
    View_CompareAction_VisualizationSetup.prototype.onCreated_mergedDataCube = function (event, data) {
        this.displayAvailableVisualizations(this.app._.backend.chartConfig[_.size(this.app._.compareAction.equalDimensions)].charts, data.mergedDataCube);
    };
    View_CompareAction_VisualizationSetup.prototype.onFound_equalDimensions = function () {
        this._equalDimensionsFound = true;
        this.checkAndShowVisualizationSetup();
    };
    View_CompareAction_VisualizationSetup.prototype.onReceived_dimensions1AndDimensions2 = function () {
        $("#cubeviz-compare-confViz-datasetLabel1").html(_.str.prune(this.app._.compareAction.datasets[1].__cv_niceLabel, 55));
        $("#cubeviz-compare-confViz-datasetLabel2").html(_.str.prune(this.app._.compareAction.datasets[2].__cv_niceLabel, 55));
    };
    View_CompareAction_VisualizationSetup.prototype.onReceived_measures1AndMeasures2 = function () {
        this._measuresReceived = true;
        this.checkAndShowVisualizationSetup();
    };
    View_CompareAction_VisualizationSetup.prototype.onReceived_observations1AndObservations2 = function () {
        this._observationsReceived = true;
        this.checkAndShowVisualizationSetup();
    };
    View_CompareAction_VisualizationSetup.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CompareAction_VisualizationSetup.prototype.render = function () {
        this.bindUserInterfaceEvents({
            "click #cubeviz-compare-confViz-useBtn1": this.onClick_useBtn1,
            "click #cubeviz-compare-confViz-useBtn2": this.onClick_useBtn2
        });
        return this;
    };
    return View_CompareAction_VisualizationSetup;
})(CubeViz_View_Abstract);
var View_CompareAction_ClusterVisualization = (function (_super) {
    __extends(View_CompareAction_ClusterVisualization, _super);
    function View_CompareAction_ClusterVisualization(attachedTo, app) {
        _super.call(this, "View_CompareAction_ClusterVisualization", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CompareAction_ClusterVisualization.prototype.generateLink = function (numberOfClusters) {
        console.log("");
        console.log(numberOfClusters);
        var selectedMeasureUri = this.app._.compareAction.mergedDataCube.selectedComponents.measure["http://purl.org/linked-data/cube#measure"];
        var self = this;

        var clusters = this.numberClustering(DataCube_Observation.getValues(this.app._.compareAction.mergedDataCube.retrievedObservations, selectedMeasureUri, true)[0], numberOfClusters);
        var clusteringDataCube = DataCube_ClusteringDataCube.create(clusters, this.app._.backend.url, numberOfClusters);
        CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, clusteringDataCube, "data", function (dataHash) {
            console.log("");
            console.log("clusteringDataCube (" + dataHash + ")");
            console.log(clusteringDataCube);
            var $li = $("<li><a href=\"\">Visualization for maximum " + numberOfClusters + " cluster</a></li>");
            var link = self.app._.backend.url + "?";
            if(false === _.isNull(self.app._.backend.serviceUrl)) {
                link += "serviceUrl=" + encodeURIComponent(self.app._.backend.serviceUrl) + "&";
            }
            if(true === _.str.isBlank(self.app._.backend.modelUrl)) {
                link += "m=" + encodeURIComponent(self.app._.compareAction.models[1].__cv_uri);
            } else {
                link += "m=" + encodeURIComponent(self.app._.backend.modelUrl);
            }
            link += "&cv_dataHash=" + dataHash;
            $($li.find("a")).attr("href", link).attr("target", "_blank");
            $("#cubeviz-compare-clusterVisualizationLinks").append($li);
        }, true);
    };
    View_CompareAction_ClusterVisualization.prototype.initialize = function () {
        this.render();
    };
    View_CompareAction_ClusterVisualization.prototype.numberClustering = function (numberList, numberOfClusters) {
        var betterClusterIndex = 0;
        var changeHappened = true;
        var clusterCenters = [];
        var clusters = [];
        var computedDistance = 0;
        var iterations = 0;
        var numberOfElements = numberList.length;
        var maxClusterSize = Math.round(numberOfElements / numberOfClusters) + 1;
        var nearestDistance = 0;
        var sliceStart = 0;
        var sliceEnd = maxClusterSize;
        var tmpNumber = 0;

        numberList.sort(function (a, b) {
            return a - b;
        });
        for(var i = 0; i < numberOfClusters; ++i) {
            clusters[i] = numberList.slice(sliceStart, sliceEnd);
            sliceStart += maxClusterSize;
            sliceEnd += maxClusterSize;
        }
        if(sliceStart < numberOfElements) {
            var missingElements = numberList.slice(sliceStart, numberOfElements - sliceStart);
            _.each(missingElements, function (number) {
                clusters[numberOfClusters - 1].push(number);
            });
        }
        for(i = 0; i < numberOfClusters; ++i) {
            tmpNumber = 0;
            _.each(clusters[i], function (number) {
                tmpNumber += number;
            });
            clusterCenters[i] = tmpNumber / clusters[i].length;
        }
        do {
            changeHappened = false;
            for(i = 0; i < numberOfClusters; ++i) {
                _.each(clusters[i], function (number, key) {
                    nearestDistance = -1;
                    computedDistance = 0;
                    _.each(clusterCenters, function (center, clusterIndex) {
                        if(center > number) {
                            computedDistance = center - number;
                        } else {
                            computedDistance = number - center;
                        }
                        if(-1 == nearestDistance || computedDistance <= nearestDistance) {
                            nearestDistance = computedDistance;
                            betterClusterIndex = clusterIndex;
                        }
                    });
                    if(betterClusterIndex != i) {
                        clusters[betterClusterIndex].push(number);
                        clusters[i].splice(key, 1);
                        changeHappened = true;
                    }
                });
            }
        }while(true === changeHappened)
        _.each(clusters, function (cluster) {
            cluster.sort(function (a, b) {
                return a - b;
            });
        });
        return clusters;
    };
    View_CompareAction_ClusterVisualization.prototype.onClick_getLinkBtn = function () {
        this.generateLink($("#cubeviz-compare-clusterVisualizationClusterNumber").val());
    };
    View_CompareAction_ClusterVisualization.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CompareAction_ClusterVisualization.prototype.render = function () {
        this.bindUserInterfaceEvents({
            "click #cubeviz-compare-clusterVisualizationGetLinkBtn": this.onClick_getLinkBtn
        });
        return this;
    };
    return View_CompareAction_ClusterVisualization;
})(CubeViz_View_Abstract);
var View_DataselectionModule_DataSet = (function (_super) {
    __extends(View_DataselectionModule_DataSet, _super);
    function View_DataselectionModule_DataSet(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_DataSet", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_DataselectionModule_DataSet.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        CubeViz_View_Helper.destroyDialog($("#cubeviz-dataSet-dialog"));
        return this;
    };
    View_DataselectionModule_DataSet.prototype.initialize = function () {
        this.collection.reset("__cv_uri");
        this.collection.addList(this.app._.data.dataSets);
        this.render();
    };
    View_DataselectionModule_DataSet.prototype.onClick_closeAndUpdate = function (event) {
        var dialogDiv = $(event.target).data("dialogDiv");
        var dataSets = new CubeViz_Collection("__cv_uri");
        var dataSetUri = $("input[name=cubeviz-dataSelectionModule-dataSetRadio]:checked").val();
        var selectedDataSet = null;
        var self = this;

        CubeViz_View_Helper.showCloseAndUpdateSpinner(dialogDiv);
        CubeViz_View_Helper.showLeftSidebarSpinner();
        selectedDataSet = dataSets.addList(this.app._.data.dataSets).get(dataSetUri);
        this.app._.data.selectedDS = selectedDataSet;
        CubeViz_View_Helper.hideCloseAndUpdateSpinner(dialogDiv);
        CubeViz_View_Helper.closeDialog(dialogDiv);
        $("#cubeviz-dataSet-label").html(_.str.prune(selectedDataSet.__cv_niceLabel, 24, ".."));
        this.app._.data.retrievedObservations = {
        };
        _.each(this.app._.data.dataStructureDefinitions, function (dsd) {
            if(dsd.__cv_uri == selectedDataSet["http://purl.org/linked-data/cube#structure"]) {
                self.app._.data.selectedDSD = dsd;
            }
        });
        var data = {
            callback: function () {
                self.triggerGlobalEvent("onReRender_visualization");
            }
        };
        this.triggerGlobalEvent("onChange_selectedDS", data);
    };
    View_DataselectionModule_DataSet.prototype.onClick_dialogOpener = function (event) {
        var elementList = $($("#cubeviz-dataSelectionModule-dialog-dataSet").find(".cubeviz-dataSelectionModule-dialogElements").get(0)).children();
        var self = this;

        _.each(elementList, function (element) {
            if(self.app._.data.selectedDS.__cv_uri == $($(element).children().first()).val()) {
                $($(element).children().first()).attr("checked", true);
            }
        });
        CubeViz_View_Helper.openDialog($("#cubeviz-dataSelectionModule-dialog-dataSet"));
    };
    View_DataselectionModule_DataSet.prototype.onClick_questionmark = function (event) {
        $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-helpDialog").html(), {
            __cv_id: "dataSet",
            __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-dataSetHelpDialogTitle").html(),
            __cv_description: $("#cubeviz-dataSelectionModule-tra-dataSetHelpDialogDescription").html()
        }));
        var dialogDiv = $("#cubeviz-dataSelectionModule-helpDialog-dataSet");
        CubeViz_View_Helper.attachDialogTo(dialogDiv, {
            closeOnEscape: true,
            showCross: true,
            width: 500
        });
        CubeViz_View_Helper.openDialog(dialogDiv);
    };
    View_DataselectionModule_DataSet.prototype.onStart_application = function () {
        this.initialize();
    };
    View_DataselectionModule_DataSet.prototype.render = function () {
        this.triggerGlobalEvent("onBeforeRender_dataSet");
        $("#cubeviz-dataSet-label").html(_.str.prune(this.app._.data.selectedDS.__cv_niceLabel, 24, "..")).attr("title", this.app._.data.selectedDS.__cv_niceLabel);
        if(1 === _.size(this.app._.data.dataSets)) {
            $("#cubeviz-dataSet-dialogOpener").hide();
        } else {
            $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-dialog").html(), {
                __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-dataSetHelpDialogTitle").html(),
                __cv_hashedUri: "dataSet",
                __cv_description: "",
                __cv_shortDescription: $("#cubeviz-dataSelectionModule-tra-dataSetHelpDialogDescription").html(),
                __cv_title: ""
            }));
            var dialogDiv = $("#cubeviz-dataSelectionModule-dialog-dataSet");
            CubeViz_View_Helper.attachDialogTo(dialogDiv, {
                closeOnEscape: true,
                showCross: true,
                width: 650
            });
            $(dialogDiv.find(".cubeviz-dataSelectionModule-dialog-description").get(0)).hide();
            $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons").get(0)).hide();
            $(dialogDiv.find(".cubeviz-dataSelectionModule-selectAllButton").get(0)).hide();
            $(dialogDiv.find(".cubeviz-dataSelectionModule-deselectButton").get(0)).hide();
            $("#cubeviz-dataSet-dialogOpener").data("dialogDiv", dialogDiv);
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-cancelBtn")).get(0)).data("dialogDiv", dialogDiv);
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-closeAndUpdateBtn")).get(0)).data("dialogDiv", dialogDiv).on("click", $.proxy(this.onClick_closeAndUpdate, this));
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(0)).data("dialogDiv", dialogDiv).data("type", "alphabet");
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(1)).hide();
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(2)).hide();
            var componentElements = new CubeViz_Collection("__cv_uri");
            var elementContainer = null;
            var elementList = $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements")[0]);

            componentElements.addList(this.app._.data.dataSets).sortAscendingBy("__cv_niceLabel").each(function (element) {
                elementContainer = $(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-dialogRadioElement").html(), {
                    __cv_niceLabel: element.__cv_niceLabel,
                    __cv_uri: element.__cv_uri,
                    radioCSSClass: "cubeviz-dataSelectionModule-dataSetRadio",
                    radioName: "cubeviz-dataSelectionModule-dataSetRadio",
                    radioValue: element.__cv_uri
                }));
                elementList.append(elementContainer);
            });
            this.bindUserInterfaceEvents({
                "click #cubeviz-dataSet-dialogOpener": this.onClick_dialogOpener
            });
            $("#cubeviz-dataSet-dialogOpener").show();
        }
        this.triggerGlobalEvent("onAfterRender_dataSet");
        this.bindUserInterfaceEvents({
            "click #cubeviz-dataSet-questionmark": this.onClick_questionmark
        });
        return this;
    };
    return View_DataselectionModule_DataSet;
})(CubeViz_View_Abstract);
var View_DataselectionModule_Slice = (function (_super) {
    __extends(View_DataselectionModule_Slice, _super);
    function View_DataselectionModule_Slice(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_Slice", attachedTo, app);
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
    View_DataselectionModule_Slice.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        return this;
    };
    View_DataselectionModule_Slice.prototype.initialize = function () {
        this.collection.reset("__cv_uri");
        this.collection.addList(this.app._.data.slices);
        this.render();
    };
    View_DataselectionModule_Slice.prototype.onChange_selectedDS = function () {
        var self = this;
        DataCube_Slice.loadAll(this.app._.backend.url, this.app._.backend.serviceUrl, this.app._.backend.modelUrl, this.app._.data.selectedDSD.__cv_uri, this.app._.data.selectedDS.__cv_uri, function (entries) {
            self.app._.data.slices = entries;
            if(0 === _.keys(entries).length) {
            } else {
                self.app._.data.selectedSlice = {
                };
            }
        });
    };
    View_DataselectionModule_Slice.prototype.onClick_closeAndUpdate = function (event) {
        var dialogDiv = $(event.target).data("dialogDiv");
        var slices = new CubeViz_Collection("__cv_uri");
        var sliceUri = $("input[name=cubeviz-dataSelectionModule-sliceRadio]:checked").val();
        var self = this;

        CubeViz_View_Helper.showCloseAndUpdateSpinner(dialogDiv);
        if("noSlice" == sliceUri) {
            this.app._.data.selectedSlice = {
            };
            $("#cubeviz-slice-label").html(_.str.prune($("#cubeviz-dataSelectionModule-tra-sliceNoSelection").html(), 24, ".."));
        } else {
            this.app._.data.selectedSlice = slices.addList(this.app._.data.slices).get(sliceUri);
            $("#cubeviz-slice-label").html(_.str.prune(this.app._.data.selectedSlice.__cv_niceLabel, 24, ".."));
        }
        CubeViz_View_Helper.hideCloseAndUpdateSpinner(dialogDiv);
        CubeViz_View_Helper.closeDialog(dialogDiv);
        var data = {
            callback: function () {
                self.triggerGlobalEvent("onReRender_visualization");
            }
        };
        this.triggerGlobalEvent("onChange_selectedSlice", data);
    };
    View_DataselectionModule_Slice.prototype.onClick_dialogOpener = function (event) {
        CubeViz_View_Helper.openDialog($("#cubeviz-dataSelectionModule-dialog-slice"));
    };
    View_DataselectionModule_Slice.prototype.onClick_questionmark = function (event) {
        $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-helpDialog").html(), {
            __cv_id: "slice",
            __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-sliceHelpDialogTitle").html(),
            __cv_description: $("#cubeviz-dataSelectionModule-tra-sliceHelpDialogDescription").html()
        }));
        var dialogDiv = $("#cubeviz-dataSelectionModule-helpDialog-slice");
        CubeViz_View_Helper.attachDialogTo(dialogDiv, {
            closeOnEscape: true,
            showCross: true,
            width: 500
        });
        CubeViz_View_Helper.openDialog(dialogDiv);
    };
    View_DataselectionModule_Slice.prototype.onStart_application = function () {
        this.initialize();
    };
    View_DataselectionModule_Slice.prototype.render = function () {
        this.triggerGlobalEvent("onBeforeRender_slice");
        var label = "";
        var description = "";
        var self = this;

        if(0 === _.size(this.app._.data.slices)) {
            $("#cubeviz-dataSelectionModule-sliceBlock").hide();
        } else {
            $("#cubeviz-dataSelectionModule-sliceBlock").show();
            if(0 === _.keys(this.app._.data.selectedSlice).length) {
                label = $("#cubeviz-dataSelectionModule-tra-sliceNoSelection").html();
            } else {
                label = this.app._.data.selectedComponents.attribute.__cv_niceLabel;
                description = this.app._.data.selectedComponents.attribute.__cv_description;
            }
            $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-dialog").html(), {
                __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-sliceDialogTitle").html(),
                __cv_hashedUri: "slice",
                __cv_description: "",
                __cv_shortDescription: $("#cubeviz-dataSelectionModule-tra-sliceDialogDescription").html(),
                __cv_title: ""
            }));
            var dialogDiv = $("#cubeviz-dataSelectionModule-dialog-slice");
            CubeViz_View_Helper.attachDialogTo(dialogDiv, {
                closeOnEscape: true,
                showCross: true,
                width: 650
            });
            $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons").get(0)).hide();
            $(dialogDiv.find(".cubeviz-dataSelectionModule-selectAllButton").get(0)).hide();
            $(dialogDiv.find(".cubeviz-dataSelectionModule-deselectButton").get(0)).hide();
            $("#cubeviz-slice-dialogOpener").data("dialogDiv", dialogDiv);
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-cancelBtn")).get(0)).data("dialogDiv", dialogDiv);
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-closeAndUpdateBtn")).get(0)).data("dialogDiv", dialogDiv).on("click", $.proxy(this.onClick_closeAndUpdate, this));
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(0)).data("dialogDiv", dialogDiv).data("type", "alphabet");
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(1)).hide();
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(2)).hide();
            var elementContainer = null;
            var elementList = $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements")[0]);

            elementContainer = $(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-dialogRadioElement").html(), {
                __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-sliceDialogNoSliceSelectionElement").html(),
                __cv_uri: "__cv_noSlice",
                radioCSSClass: "cubeviz-dataSelectionModule-sliceRadio",
                radioName: "cubeviz-dataSelectionModule-sliceRadio",
                radioValue: "noSlice"
            }));
            if(0 === _.size(this.app._.data.selectedSlice)) {
                $(elementContainer.children().first()).attr("checked", true);
            }
            $(elementContainer.children().last()).css("font-weight", "bold");
            elementList.append(elementContainer);
            this.collection.sortAscendingBy("__cv_niceLabel").each(function (element) {
                elementContainer = $(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-dialogRadioElement").html(), {
                    __cv_niceLabel: element.__cv_niceLabel,
                    __cv_uri: element.__cv_uri,
                    radioCSSClass: "cubeviz-dataSelectionModule-sliceRadio",
                    radioName: "cubeviz-dataSelectionModule-sliceRadio",
                    radioValue: element.__cv_uri
                }));
                if(element.__cv_uri == self.app._.data.selectedSlice.__cv_uri) {
                    $(elementContainer.children().first()).attr("checked", true);
                }
                elementList.append(elementContainer);
            });
            this.bindUserInterfaceEvents({
                "click #cubeviz-slice-dialogOpener": this.onClick_dialogOpener
            });
        }
        $("#cubeviz-slice-label").html(_.str.prune(label, 24, "..")).attr("title", label);
        $("#cubeviz-slice-description").html(_.str.prune(description, 55, "..")).attr("title", description);
        this.triggerGlobalEvent("onAfterRender_slice");
        this.bindUserInterfaceEvents({
            "click #cubeviz-slice-questionmark": this.onClick_questionmark
        });
        return this;
    };
    return View_DataselectionModule_Slice;
})(CubeViz_View_Abstract);
var View_DataselectionModule_Measure = (function (_super) {
    __extends(View_DataselectionModule_Measure, _super);
    function View_DataselectionModule_Measure(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_Measure", attachedTo, app);
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
    View_DataselectionModule_Measure.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        CubeViz_View_Helper.destroyDialog($("#cubeviz-measure-dialog"));
        return this;
    };
    View_DataselectionModule_Measure.prototype.initialize = function () {
        this.collection.reset("__cv_uri");
        this.collection.addList(this.app._.data.components.measures);
        this.render();
    };
    View_DataselectionModule_Measure.prototype.onChange_selectedDS = function (event) {
        var self = this;
        DataCube_Component.loadAllMeasures(this.app._.backend.url, this.app._.backend.serviceUrl, this.app._.backend.modelUrl, this.app._.data.selectedDSD.__cv_uri, this.app._.data.selectedDS.__cv_uri, function (entries) {
            self.app._.data.components.measures = entries;
            if(0 === _.keys(entries).length) {
                throw new Error("Error: There are no measures in the selected data set!");
            } else {
                self.app._.data.selectedComponents.measure = entries[_.keys(entries)[0]];
            }
        });
    };
    View_DataselectionModule_Measure.prototype.onClick_closeAndUpdate = function (event) {
        var dialogDiv = $(event.target).data("dialogDiv");
        var measures = new CubeViz_Collection("__cv_uri");
        var measureUri = $("input[name=cubeviz-dataSelectionModule-measureRadio]:checked").val();
        var selectedMeasure = null;
        var self = this;

        CubeViz_View_Helper.showCloseAndUpdateSpinner(dialogDiv);
        CubeViz_View_Helper.showLeftSidebarSpinner();
        selectedMeasure = measures.addList(this.app._.data.components.measures).get(measureUri);
        this.app._.data.selectedComponents.measure = selectedMeasure;
        CubeViz_View_Helper.hideCloseAndUpdateSpinner(dialogDiv);
        CubeViz_View_Helper.closeDialog(dialogDiv);
        $("#cubeviz-measure-label").html(_.str.prune(selectedMeasure.__cv_niceLabel, 24, ".."));
        CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data, "data", function (updatedDataHash) {
            DataCube_Observation.loadAll(self.app._.backend.url, self.app._.backend.serviceUrl, self.app._.backend.modelUrl, updatedDataHash, "", function (newEntities) {
                self.app._.data.retrievedObservations = newEntities;
                self.triggerGlobalEvent("onChange_selectedMeasure");
                self.triggerGlobalEvent("onReRender_visualization");
                CubeViz_View_Helper.hideLeftSidebarSpinner();
            });
            self.app._.backend.dataHash = updatedDataHash;
        });
    };
    View_DataselectionModule_Measure.prototype.onClick_dialogOpener = function (event) {
        var elementList = $($("#cubeviz-dataSelectionModule-dialog-measure").find(".cubeviz-dataSelectionModule-dialogElements").get(0)).children();
        var self = this;

        if(1 == elementList.length) {
            $($(elementList.first()).children().first()).attr("checked", true);
        } else {
            _.each(elementList, function (element) {
                if(self.app._.data.selectedComponents.measure.__cv_uri == $($(element).children().first()).val()) {
                    $($(element).children().first()).attr("checked", true);
                }
            });
        }
        CubeViz_View_Helper.openDialog($("#cubeviz-dataSelectionModule-dialog-measure"));
    };
    View_DataselectionModule_Measure.prototype.onStart_application = function () {
        this.initialize();
    };
    View_DataselectionModule_Measure.prototype.render = function () {
        this.triggerGlobalEvent("onBeforeRender_measure");
        $("#cubeviz-measure-label").html(_.str.prune(this.app._.data.selectedComponents.measure.__cv_niceLabel, 24, "..")).attr("title", this.app._.data.selectedComponents.measure.__cv_niceLabel);
        $("#cubeviz-measure-description").html(_.str.prune(this.app._.data.selectedComponents.measure.__cv_description, 55, "..")).attr("title", this.app._.data.selectedComponents.measure.__cv_description);
        if(1 == _.keys(this.app._.data.components.measures).length) {
            $("#cubeviz-measure-dialogOpener").hide();
        } else {
            $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-dialog").html(), {
                __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-measureDialogTitle").html(),
                __cv_hashedUri: "measure",
                __cv_description: "",
                __cv_shortDescription: $("#cubeviz-dataSelectionModule-tra-measureDialogDescription").html(),
                __cv_title: ""
            }));
            var dialogDiv = $("#cubeviz-dataSelectionModule-dialog-measure");
            CubeViz_View_Helper.attachDialogTo(dialogDiv, {
                closeOnEscape: true,
                showCross: true,
                width: 650
            });
            $(dialogDiv.find(".cubeviz-dataSelectionModule-dialog-description").get(0)).hide();
            $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons").get(0)).hide();
            $(dialogDiv.find(".cubeviz-dataSelectionModule-selectAllButton").get(0)).hide();
            $(dialogDiv.find(".cubeviz-dataSelectionModule-deselectButton").get(0)).hide();
            $("#cubeviz-measure-dialogOpener").data("dialogDiv", dialogDiv);
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-cancelBtn")).get(0)).data("dialogDiv", dialogDiv);
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-closeAndUpdateBtn")).get(0)).data("dialogDiv", dialogDiv).on("click", $.proxy(this.onClick_closeAndUpdate, this));
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(0)).data("dialogDiv", dialogDiv).data("type", "alphabet");
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(1)).hide();
            $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(2)).hide();
            var measureElements = new CubeViz_Collection("__cv_uri");
            var elementContainer = null;
            var elementList = $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements")[0]);

            measureElements.addList(this.app._.data.components.measures).sortAscendingBy("__cv_niceLabel").each(function (element) {
                elementContainer = $(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-dialogRadioElement").html(), {
                    __cv_niceLabel: element.__cv_niceLabel,
                    __cv_uri: element.__cv_uri,
                    radioCSSClass: "cubeviz-dataSelectionModule-measureRadio",
                    radioName: "cubeviz-dataSelectionModule-measureRadio",
                    radioValue: element.__cv_uri
                }));
                elementList.append(elementContainer);
            });
            this.bindUserInterfaceEvents({
                "click #cubeviz-measure-dialogOpener": this.onClick_dialogOpener
            });
        }
        this.triggerGlobalEvent("onAfterRender_measure");
        return this;
    };
    return View_DataselectionModule_Measure;
})(CubeViz_View_Abstract);
var View_DataselectionModule_Attribute = (function (_super) {
    __extends(View_DataselectionModule_Attribute, _super);
    function View_DataselectionModule_Attribute(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_Attribute", attachedTo, app);
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
    View_DataselectionModule_Attribute.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        $("#cubeviz-attribute-dialogOpener").off();
        CubeViz_View_Helper.destroyDialog($("#cubeviz-dataSelectionModule-dialog-attribute"));
        $("#cubeviz-dataSelectionModule-dialog-attribute").remove();
        return this;
    };
    View_DataselectionModule_Attribute.prototype.initialize = function () {
        this.collection.reset("__cv_uri");
        this.collection.addList(this.app._.data.components.attributes);
        this.render();
    };
    View_DataselectionModule_Attribute.prototype.onChange_selectedDS = function (event) {
        var self = this;
        DataCube_Component.loadAllAttributes(this.app._.backend.url, this.app._.backend.serviceUrl, this.app._.backend.modelUrl, this.app._.data.selectedDSD.__cv_uri, this.app._.data.selectedDS.__cv_uri, function (entries) {
            self.app._.data.components.attributes = entries;
            if(0 === _.keys(entries).length) {
            } else {
                self.app._.data.selectedComponents.attribute = entries[_.keys(entries)[0]];
            }
            self.destroy().initialize();
        });
    };
    View_DataselectionModule_Attribute.prototype.onClick_closeAndUpdate = function (event) {
        var dialogDiv = $(event.target).data("dialogDiv");
        var attributes = new CubeViz_Collection("__cv_uri");
        var attributeUri = $("input[name=cubeviz-dataSelectionModule-attributeRadio]:checked").val();
        var selectedAttribute = null;
        var self = this;

        CubeViz_View_Helper.showCloseAndUpdateSpinner(dialogDiv);
        CubeViz_View_Helper.showLeftSidebarSpinner();
        if("noAttribute" == attributeUri) {
            this.app._.data.selectedComponents.attribute = null;
            $("#cubeviz-attribute-label").html(_.str.prune($("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectedLabel").html(), 24, "..")).attr("title", $("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectedLabel").html());
            $("#cubeviz-attribute-description").html(_.str.prune($("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectedDescription").html(), 55, "..")).attr("title", $("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectedDescription").html());
        } else {
            selectedAttribute = attributes.addList(this.app._.data.components.attributes).get(attributeUri);
            this.app._.data.selectedComponents.attribute = selectedAttribute;
            $("#cubeviz-attribute-label").html(_.str.prune(selectedAttribute.__cv_niceLabel, 24, ".."));
        }
        CubeViz_View_Helper.hideCloseAndUpdateSpinner(dialogDiv);
        CubeViz_View_Helper.closeDialog(dialogDiv);
        CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data, "data", function (updatedDataHash) {
            DataCube_Observation.loadAll(self.app._.backend.url, self.app._.backend.serviceUrl, self.app._.backend.modelUrl, updatedDataHash, "", function (newEntities) {
                self.app._.data.retrievedObservations = newEntities;
                self.triggerGlobalEvent("onChange_selectedAttribute");
                self.triggerGlobalEvent("onReRender_visualization");
                CubeViz_View_Helper.hideLeftSidebarSpinner();
            });
            self.app._.backend.dataHash = updatedDataHash;
        });
    };
    View_DataselectionModule_Attribute.prototype.onClick_dialogOpener = function (event) {
        var elementList = $($("#cubeviz-dataSelectionModule-dialog-attribute").find(".cubeviz-dataSelectionModule-dialogElements").get(0)).children();
        var self = this;

        if(false === _.isUndefined(this.app._.data.selectedComponents.attribute) && false === _.isNull(this.app._.data.selectedComponents.attribute)) {
            _.each(elementList, function (element) {
                if(self.app._.data.selectedComponents.attribute.__cv_uri == $($(element).children().first()).val()) {
                    $($(element).children().first()).attr("checked", true);
                }
            });
        }
        CubeViz_View_Helper.openDialog($("#cubeviz-dataSelectionModule-dialog-attribute"));
    };
    View_DataselectionModule_Attribute.prototype.onClick_questionmark = function (event) {
        $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-helpDialog").html(), {
            __cv_id: "attributeAndMeasure",
            __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-attributeAndMeasureHelpDialogTitle").html(),
            __cv_description: $("#cubeviz-dataSelectionModule-tra-attributeAndMeasureHelpDialogDescription").html()
        }));
        var dialogDiv = $("#cubeviz-dataSelectionModule-helpDialog-attributeAndMeasure");
        CubeViz_View_Helper.attachDialogTo(dialogDiv, {
            closeOnEscape: true,
            showCross: true,
            width: 500
        });
        CubeViz_View_Helper.openDialog(dialogDiv);
    };
    View_DataselectionModule_Attribute.prototype.onStart_application = function () {
        this.initialize();
    };
    View_DataselectionModule_Attribute.prototype.render = function () {
        this.triggerGlobalEvent("onBeforeRender_attribute");
        var noAttribute = false;
        var label = "";
        var description = "";

        if(0 === _.size(this.app._.data.components.attributes)) {
            label = "[no attribute found]";
            noAttribute = true;
            $("#cubeviz-dataSelectionModule-attributeBlock").hide();
        } else {
            if(0 < _.size(this.app._.data.components.attributes) && (true === _.isUndefined(this.app._.data.selectedComponents.attribute) || true === _.isNull(this.app._.data.selectedComponents.attribute))) {
                label = $("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectedLabel").html();
                description = $("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectedDescription").html();
            } else {
                label = this.app._.data.selectedComponents.attribute.__cv_niceLabel;
                description = this.app._.data.selectedComponents.attribute.__cv_description;
            }
        }
        $("#cubeviz-attribute-label").html(_.str.prune(label, 24, "..")).attr("title", label);
        $("#cubeviz-attribute-description").html(_.str.prune(description, 55, "..")).attr("title", description);
        if(false === noAttribute) {
            if(0 == _.size(this.app._.data.components.attributes)) {
                $("#cubeviz-attribute-dialogOpener").hide();
            } else {
                $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-dialog").html(), {
                    __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-attributeDialogTitle").html(),
                    __cv_hashedUri: "attribute",
                    __cv_description: "",
                    __cv_shortDescription: $("#cubeviz-dataSelectionModule-tra-attributeDialogDescription").html(),
                    __cv_title: ""
                }));
                var dialogDiv = $("#cubeviz-dataSelectionModule-dialog-attribute");
                CubeViz_View_Helper.attachDialogTo(dialogDiv, {
                    closeOnEscape: true,
                    showCross: true,
                    width: 650
                });
                $(dialogDiv.find(".cubeviz-dataSelectionModule-dialog-description").get(0)).hide();
                $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons").get(0)).hide();
                $(dialogDiv.find(".cubeviz-dataSelectionModule-selectAllButton").get(0)).hide();
                $(dialogDiv.find(".cubeviz-dataSelectionModule-deselectButton").get(0)).hide();
                $("#cubeviz-attribute-dialogOpener").data("dialogDiv", dialogDiv);
                $($(dialogDiv.find(".cubeviz-dataSelectionModule-cancelBtn")).get(0)).data("dialogDiv", dialogDiv);
                $($(dialogDiv.find(".cubeviz-dataSelectionModule-closeAndUpdateBtn")).get(0)).data("dialogDiv", dialogDiv).on("click", $.proxy(this.onClick_closeAndUpdate, this));
                $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(0)).data("dialogDiv", dialogDiv).data("type", "alphabet");
                $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(1)).hide();
                $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(2)).hide();
                var attributeElements = new CubeViz_Collection("__cv_uri");
                var elementContainer = null;
                var elementList = $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements")[0]);

                elementContainer = $(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-dialogRadioElement").html(), {
                    __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-sliceDialogNoSliceSelectionElement").html(),
                    __cv_uri: "__cv_noAttribute",
                    radioCSSClass: "cubeviz-dataSelectionModule-attributeRadio",
                    radioName: "cubeviz-dataSelectionModule-attributeRadio",
                    radioValue: "noAttribute"
                }));
                $(elementContainer.children().last()).css("font-weight", "bold");
                if(true === _.isUndefined(this.app._.data.selectedComponents.attribute) || true === _.isNull(this.app._.data.selectedComponents.attribute)) {
                    $(elementContainer.children().first()).attr("checked", true);
                }
                elementList.append(elementContainer);
                attributeElements.addList(this.app._.data.components.attributes).sortAscendingBy("__cv_niceLabel").each(function (element) {
                    elementContainer = $(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-dialogRadioElement").html(), {
                        __cv_niceLabel: element.__cv_niceLabel,
                        __cv_uri: element.__cv_uri,
                        radioCSSClass: "cubeviz-dataSelectionModule-attributeRadio",
                        radioName: "cubeviz-dataSelectionModule-attributeRadio",
                        radioValue: element.__cv_uri
                    }));
                    elementList.append(elementContainer);
                });
                this.bindUserInterfaceEvents({
                    "click #cubeviz-attribute-dialogOpener": this.onClick_dialogOpener
                });
                $("#cubeviz-attribute-dialogOpener").show();
            }
        } else {
            $("#cubeviz-attribute-dialogOpener").hide();
        }
        this.triggerGlobalEvent("onAfterRender_attribute");
        this.bindUserInterfaceEvents({
            "click #cubeviz-attributeAndMeasure-questionmark": this.onClick_questionmark
        });
        return this;
    };
    return View_DataselectionModule_Attribute;
})(CubeViz_View_Abstract);
var View_DataselectionModule_Component = (function (_super) {
    __extends(View_DataselectionModule_Component, _super);
    function View_DataselectionModule_Component(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_Component", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onStart_application",
                handler: this.onStart_application
            }, 
            {
                name: "onChange_selectedDS",
                handler: this.onChange_selectedDS
            }, 
            {
                name: "onChange_selectedSlice",
                handler: this.onChange_selectedSlice
            }
        ]);
    }
    View_DataselectionModule_Component.prototype.configureSetupComponentDialog = function (component, componentBox, opener) {
        var self = this;
        $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-dialog").html(), {
            __cv_niceLabel: component.__cv_niceLabel,
            __cv_hashedUri: component.__cv_hashedUri,
            __cv_description: component.__cv_description,
            __cv_shortDescription: $("#cubeviz-dataSelectionModule-tra-componentDialogDescription").html(),
            __cv_title: $("#cubeviz-dataSelectionModule-tra-componentDialogMainTitle").html()
        }));
        var dialogDiv = $("#cubeviz-dataSelectionModule-dialog-" + component.__cv_hashedUri);
        if(true == _.str.isBlank(component.__cv_description)) {
            $(dialogDiv.find(".cubeviz-dataSelectionModule-dialog-description").get(0)).hide();
        }
        dialogDiv.data("componentBox", componentBox).data("component", component);
        CubeViz_View_Helper.attachDialogTo(dialogDiv);
        $(dialogDiv.find(".cubeviz-dataSelectionModule-selectAllButton").get(0)).data("dialogDiv", dialogDiv);
        $(dialogDiv.find(".cubeviz-dataSelectionModule-deselectButton").get(0)).data("dialogDiv", dialogDiv);
        opener.data("dialogDiv", dialogDiv);
        $($(dialogDiv.find(".cubeviz-dataSelectionModule-cancelBtn")).get(0)).data("dialogDiv", dialogDiv);
        $($(dialogDiv.find(".cubeviz-dataSelectionModule-closeAndUpdateBtn")).get(0)).data("dialogDiv", dialogDiv).on("click", $.proxy(this.onClick_closeAndUpdate, this));
        $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(0)).data("dialogDiv", dialogDiv).data("type", "alphabet");
        $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(1)).data("dialogDiv", dialogDiv).data("type", "check status");
        $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(2)).data("dialogDiv", dialogDiv).data("type", "observation count");
        this.configureSetupComponentElements(component);
    };
    View_DataselectionModule_Component.prototype.configureSetupComponentElements = function (component) {
        var checkbox = null;
        var dialogDiv = $("#cubeviz-dataSelectionModule-dialog-" + component.__cv_hashedUri);
        var elementInstance = {
        };
        var componentElements = new CubeViz_Collection("__cv_uri");
        var elementList = $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements")[0]);
        var selectedDimensions = this.app._.data.selectedComponents.dimensions[component.__cv_uri].__cv_elements;
        var self = this;
        var setElementChecked = null;
        var wasSomethingSelected = false;

        componentElements.addList(component.__cv_elements).sortAscendingBy("__cv_niceLabel").each(function (element) {
            setElementChecked = undefined !== _.find(selectedDimensions, function (dim) {
                return false === _.isUndefined(dim) ? dim.__cv_uri == element.__cv_uri : false;
            });
            if(true === setElementChecked) {
                wasSomethingSelected = true;
            }
            elementInstance = $(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-dialogCheckboxElement").html(), {
                __cv_niceLabel: element.__cv_niceLabel,
                __cv_uri: element.__cv_uri,
                __cv_uri2: element.__cv_uri
            }));
            checkbox = elementInstance.children().first();
            if(true == setElementChecked) {
                checkbox.attr("checked", true);
            }
            $(checkbox).on("click", $.proxy(self.onClick_dimensionElementCheckbox, self));
            elementInstance.data("data", element).data("dialogDiv", dialogDiv);
            elementList.append(elementInstance);
        });
    };
    View_DataselectionModule_Component.prototype.destroy = function () {
        _.each(this.collection._, function (component) {
            $("#cubeviz-dataSelectionModule-dialog-" + component.__cv_hashedUri).dialog("destroy");
            $("#cubeviz-dataSelectionModule-dialog-" + component.__cv_hashedUri).remove();
        });
        _super.prototype.destroy.call(this);
        CubeViz_View_Helper.destroyDialog($("#cubeviz-component-dialog"));
        return this;
    };
    View_DataselectionModule_Component.prototype.initialize = function () {
        this.collection.reset("__cv_hashedUri");
        this.collection.addList(this.app._.data.components.dimensions);
        this.render();
    };
    View_DataselectionModule_Component.prototype.loadComponentDimensions = function (callback) {
        var self = this;
        DataCube_Component.loadAllDimensions(this.app._.backend.url, this.app._.backend.serviceUrl, this.app._.backend.modelUrl, this.app._.data.selectedDSD.__cv_uri, this.app._.data.selectedDS.__cv_uri, function (entries) {
            self.app._.data.components.dimensions = entries;
            self.app._.data.selectedComponents.dimensions = DataCube_Component.getDefaultSelectedDimensions(entries);
            self.collection.reset("__cv_hashedUri").addList(entries);
            callback();
        });
    };
    View_DataselectionModule_Component.prototype.onChange_selectedDS = function (event, data) {
        var self = this;
        this.destroy();
        this.loadComponentDimensions(function () {
            CubeViz_ConfigurationLink.save(self.app._.backend.url, self.app._.backend.modelUrl, self.app._.data, "data", function (updatedDataHash) {
                self.app._.backend.dataHash = updatedDataHash;
                self.render();
                CubeViz_ConfigurationLink.save(self.app._.backend.url, self.app._.backend.modelUrl, self.app._.data, "data", function (updatedDataHash) {
                    DataCube_Observation.loadAll(self.app._.backend.url, self.app._.backend.serviceUrl, self.app._.backend.modelUrl, updatedDataHash, "", function (newEntities) {
                        self.app._.data.retrievedObservations = newEntities;
                        CubeViz_View_Helper.hideLeftSidebarSpinner();
                        data.callback();
                    });
                    self.app._.backend.dataHash = updatedDataHash;
                });
            });
        });
    };
    View_DataselectionModule_Component.prototype.onChange_selectedSlice = function (event, data) {
        if(0 === _.size(this.app._.data.selectedSlice)) {
        } else {
            var componentBox = null;
            var dialogDiv = null;
            var dimensionRelation = "";
            var fixedDimensionElement = "";
            var self = this;

            _.each(this.app._.data.components.dimensions, function (dimension) {
                dimensionRelation = dimension["http://purl.org/linked-data/cube#dimension"];
                fixedDimensionElement = self.app._.data.selectedSlice[dimensionRelation];
                if(false === _.str.isBlank(fixedDimensionElement)) {
                    _.each(dimension.__cv_elements, function (element) {
                        if(element.__cv_uri == fixedDimensionElement) {
                            self.app._.data.selectedComponents.dimensions[dimension.__cv_uri].__cv_elements = {
                                0: element
                            };
                        }
                    });
                }
            });
            this.app._.data.numberOfMultipleDimensions = _.size(CubeViz_Visualization_Controller.getMultipleDimensions(this.app._.data.selectedComponents.dimensions));
            this.app._.data.numberOfOneElementDimensions = _.size(CubeViz_Visualization_Controller.getOneElementDimensions(this.app._.data.selectedComponents.dimensions));
            this.destroy().initialize();
            this.loadComponentDimensions(function () {
                CubeViz_ConfigurationLink.save(self.app._.backend.url, self.app._.backend.modelUrl, self.app._.data, "data", function (updatedDataHash) {
                    self.app._.backend.dataHash = updatedDataHash;
                    self.render();
                    CubeViz_ConfigurationLink.save(self.app._.backend.url, self.app._.backend.modelUrl, self.app._.data, "data", function (updatedDataHash) {
                        DataCube_Observation.loadAll(self.app._.backend.url, self.app._.backend.serviceUrl, self.app._.backend.modelUrl, updatedDataHash, "", function (newEntities) {
                            self.app._.data.retrievedObservations = newEntities;
                            CubeViz_View_Helper.hideLeftSidebarSpinner();
                            data.callback();
                        });
                        self.app._.backend.dataHash = updatedDataHash;
                    });
                });
            });
        }
    };
    View_DataselectionModule_Component.prototype.onClick_cancel = function (event) {
        CubeViz_View_Helper.closeDialog($(event.target).data("dialogDiv"));
    };
    View_DataselectionModule_Component.prototype.onClick_dimensionElementCheckbox = function (event) {
        var clickedCheckbox = $(event.target);
        var parentContainer = $($(event.target).parent());
        var dialogCheckboxList = parentContainer.data("dialogDiv").find("[type=\"checkbox\"]");
        var anythingChecked = false;
        var numberOfSelectedElements = $(parentContainer.data("dialogDiv")).data("component").__cv_selectedElementCount;

        if(1 < numberOfSelectedElements || 1 == this.app._.data.numberOfMultipleDimensions) {
            return;
        }
        _.each(dialogCheckboxList, function (checkbox) {
            if($(checkbox).attr("checked")) {
                anythingChecked = true;
            }
        });
        if(false == anythingChecked) {
            _.each(dialogCheckboxList, function (checkbox) {
                $(checkbox).attr("disabled", false);
            });
            $(parentContainer.data("dialogDiv").find(".cubeviz-dataSelectionModule-selectAllButton").get(0)).show();
            $(parentContainer.data("dialogDiv").find(".cubeviz-dataSelectionModule-deselectButton").get(0)).show();
        } else {
            _.each(dialogCheckboxList, function (checkbox) {
                if(!$(checkbox).attr("checked")) {
                    $(checkbox).attr("disabled", true);
                }
            });
            $(parentContainer.data("dialogDiv").find(".cubeviz-dataSelectionModule-selectAllButton").get(0)).hide();
            $(parentContainer.data("dialogDiv").find(".cubeviz-dataSelectionModule-deselectButton").get(0)).hide();
        }
    };
    View_DataselectionModule_Component.prototype.onClick_closeAndUpdate = function (event) {
        var dialogDiv = $(event.target).data("dialogDiv");
        var self = this;

        CubeViz_View_Helper.showCloseAndUpdateSpinner(dialogDiv);
        this.readAndSaveSetupComponentDialogChanges(dialogDiv, function () {
            if(true === cubeVizApp._.backend.uiParts.index.isLoaded) {
                self.triggerGlobalEvent("onReRender_visualization");
            }
            self.triggerGlobalEvent("onUpdate_componentDimensions");
            CubeViz_View_Helper.hideCloseAndUpdateSpinner(dialogDiv);
            CubeViz_View_Helper.closeDialog(dialogDiv);
        });
    };
    View_DataselectionModule_Component.prototype.onClick_deselectButton = function (event) {
        $(event.target).data("dialogDiv").find("[type=\"checkbox\"]").attr("checked", false);
    };
    View_DataselectionModule_Component.prototype.onClick_selectAllButton = function (event) {
        $(event.target).data("dialogDiv").find("[type=\"checkbox\"]").attr("checked", true);
    };
    View_DataselectionModule_Component.prototype.onClick_setupComponentOpener = function (event) {
        this.triggerGlobalEvent("onClick_setupComponentOpener");
        var numberOfSelectedElements = $($(event.target).data("dialogDiv")).data("component").__cv_selectedElementCount;
        var checkboxes = $(event.target).data("dialogDiv").find("[type=\"checkbox\"]");
        if(1 == numberOfSelectedElements && 2 == this.app._.data.numberOfMultipleDimensions && 2 < _.size(this.app._.data.components.dimensions)) {
            _.each(checkboxes, function (checkbox) {
                if(!$(checkbox).attr("checked")) {
                    $(checkbox).attr("disabled", true);
                }
            });
            $($(event.target).data("dialogDiv").find(".cubeviz-dataSelectionModule-selectAllButton").get(0)).hide();
            $($(event.target).data("dialogDiv").find(".cubeviz-dataSelectionModule-deselectButton").get(0)).hide();
        } else {
            _.each(checkboxes, function (checkbox) {
                $(checkbox).attr("disabled", false);
            });
            $($(event.target).data("dialogDiv").find(".cubeviz-dataSelectionModule-selectAllButton").get(0)).show();
            $($(event.target).data("dialogDiv").find(".cubeviz-dataSelectionModule-deselectButton").get(0)).show();
        }
        CubeViz_View_Helper.openDialog($(event.target).data("dialogDiv"));
    };
    View_DataselectionModule_Component.prototype.onClick_sortButton = function (event) {
        var dialogDiv = $(event.target).data("dialogDiv");
        if(true === _.isUndefined(dialogDiv)) {
            return;
        }
        var dimensionTypeUrl = dialogDiv.data("dimensionTypeUrl");
        var list = $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements").first());
        var listItems = list.children('li');
        var modifiedItemList = [];

        $(event.target).data("dialogDiv").find(".cubeviz-component-sortButton").removeClass("cubeviz-dataSelectionModule-dialogSortButtonSelected");
        $(event.target).addClass("cubeviz-dataSelectionModule-dialogSortButtonSelected");
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
                modifiedItemList = CubeViz_View_Helper.sortLiItemsByObservationCount(listItems, dimensionTypeUrl, this.app._.data.retrievedObservations);
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
    View_DataselectionModule_Component.prototype.onClick_questionmark = function (event) {
        $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace($("#cubeviz-dataSelectionModule-tpl-helpDialog").html(), {
            __cv_id: "component",
            __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-componentHelpDialogTitle").html(),
            __cv_description: $("#cubeviz-dataSelectionModule-tra-componentHelpDialogDescription").html()
        }));
        var dialogDiv = $("#cubeviz-dataSelectionModule-helpDialog-component");
        CubeViz_View_Helper.attachDialogTo(dialogDiv, {
            closeOnEscape: true,
            showCross: true,
            width: 500
        });
        CubeViz_View_Helper.openDialog(dialogDiv);
    };
    View_DataselectionModule_Component.prototype.readAndSaveSetupComponentDialogChanges = function (dialogDiv, callback) {
        var elementList = dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements").children();
        var componentBox = dialogDiv.data("componentBox");
        var component = dialogDiv.data("component");
        var input = null;
        var inputLabel = null;
        var selectedElements = new CubeViz_Collection("__cv_uri");
        var self = this;

        if(true === _.isUndefined(component)) {
            return;
        }
        _.each(elementList, function (element) {
            input = $($(element).children().get(0));
            inputLabel = $($(element).children().get(1));
            if("checked" === input.attr("checked")) {
                selectedElements.add($(element).data("data"));
            }
        });
        this.app._.data.selectedComponents.dimensions[component.__cv_uri].__cv_elements = selectedElements.toObject();
        $(componentBox.find(".cubeviz-component-selectedCount").get(0)).html(selectedElements.size());
        dialogDiv.data("component").__cv_selectedElementCount = selectedElements.size();
        this.app._.data.numberOfMultipleDimensions = _.size(CubeViz_Visualization_Controller.getMultipleDimensions(this.app._.data.selectedComponents.dimensions));
        this.app._.data.numberOfOneElementDimensions = _.size(CubeViz_Visualization_Controller.getOneElementDimensions(this.app._.data.selectedComponents.dimensions));
        if(true === _.isUndefined(this.app._.data.settings)) {
            CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data, "data", function (updatedDataHash) {
                DataCube_Observation.loadAll(self.app._.backend.url, self.app._.backend.serviceUrl, self.app._.backend.modelUrl, updatedDataHash, "", function (newEntities) {
                    self.app._.data.retrievedObservations = newEntities;
                    callback();
                });
                self.app._.backend.dataHash = updatedDataHash;
            });
        } else {
            if(false === _.isUndefined(this.app._.data.settings) && false === _.isUndefined(this.app._.data.settings.synchronizeWithStore) && false === this.app._.data.settings.synchronizeWithStore) {
                self.app._.data.retrievedObservations = DataCube_Observation.markActiveObservations(self.app._.data.retrievedObservations, this.app._.data.selectedComponents.dimensions, this.app._.data.selectedComponents.measure, this.app._.data.selectedComponents.attribute);
                CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data, "data", function (updatedDataHash) {
                    self.app._.backend.dataHash = updatedDataHash;
                    callback();
                }, true);
            }
        }
    };
    View_DataselectionModule_Component.prototype.onComplete_loadDS = function (event, data) {
        this.onChange_selectedDS(event, data);
    };
    View_DataselectionModule_Component.prototype.onComplete_loadObservations = function (event, updatedRetrievedObservations) {
        this.app._.data.retrievedObservations = updatedRetrievedObservations;
    };
    View_DataselectionModule_Component.prototype.onStart_application = function () {
        this.initialize();
    };
    View_DataselectionModule_Component.prototype.render = function () {
        this.triggerGlobalEvent("onBeforeRender_component");
        var backendCollection = this.collection._;
        var list = $("#cubviz-component-listBox");
        var componentBox = null;
        var selectedComponentDimensions = this.app._.data.selectedComponents.dimensions;
        var selectedDimension = null;
        var self = this;
        var tmp = null;

        this.collection.reset();
        _.each(backendCollection, function (dimension) {
            if(false === _.isUndefined(selectedComponentDimensions)) {
                selectedDimension = selectedComponentDimensions[dimension.__cv_uri];
                dimension.__cv_selectedElementCount = _.keys(selectedDimension.__cv_elements).length;
            } else {
                dimension.__cv_selectedElementCount = 1;
            }
            dimension.__cv_elementCount = _.size(dimension.__cv_elements);
            dimension.__cv_shortLabel = _.str.prune(dimension.__cv_niceLabel, 23, "..");
            dimension.__cv_shortDescription = _.str.prune(dimension.__cv_description, 38, "..");
            componentBox = $(CubeViz_View_Helper.tplReplace($("#cubeviz-component-tpl-listBoxItem").html(), dimension));
            if(1 === dimension.__cv_elementCount) {
                $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0)).hide();
                $(componentBox.find(".cubeviz-component-selectedElementsBlock").get(0)).hide();
            }
            $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0)).data("dimension", dimension);
            list.append(componentBox);
            self.configureSetupComponentDialog(dimension, componentBox, $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0)));
            $(componentBox.find(".cubeviz-component-selectedCount").get(0)).html(dimension.__cv_selectedElementCount);
            self.collection.add(dimension);
        });
        this.bindUserInterfaceEvents({
            "click .cubeviz-component-setupComponentOpener": this.onClick_setupComponentOpener,
            "click #cubeviz-component-questionmark": this.onClick_questionmark,
            "click .cubeviz-dataSelectionModule-cancelBtn": this.onClick_cancel,
            "click .cubeviz-dataSelectionModule-deselectButton": this.onClick_deselectButton,
            "click .cubeviz-dataSelectionModule-selectAllButton": this.onClick_selectAllButton,
            "click .cubeviz-dataSelectionModule-dialogSortButtons": this.onClick_sortButton
        });
        this.triggerGlobalEvent("onAfterRender_component");
        return this;
    };
    return View_DataselectionModule_Component;
})(CubeViz_View_Abstract);
var View_DataselectionModule_Footer = (function (_super) {
    __extends(View_DataselectionModule_Footer, _super);
    function View_DataselectionModule_Footer(attachedTo, app) {
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
    View_DataselectionModule_Footer.prototype.changePermaLinkButton = function () {
        if(true == _.isUndefined(this.collection.get("buttonVal"))) {
            this.collection.add({
                "id": "buttonVal",
                "value": $("#cubeviz-footer-permaLinkButton").html()
            });
            this.showLink();
        } else {
            this.collection.remove("buttonVal");
            this.closeLink();
        }
    };
    View_DataselectionModule_Footer.prototype.closeLink = function () {
        $("#cubeviz-footer-permaLinkMenu").fadeOut("slow");
    };
    View_DataselectionModule_Footer.prototype.initialize = function () {
        this.collection.add({
            id: "cubeviz-footer-permaLink",
            html: $("#cubeviz-footer-permaLink").html()
        });
        this.render();
    };
    View_DataselectionModule_Footer.prototype.onAfterChange_selectedDSD = function () {
        if(false === _.isUndefined(this.collection.get("buttonVal"))) {
            this.changePermaLinkButton();
        }
    };
    View_DataselectionModule_Footer.prototype.onBeforeClick_selectorItem = function () {
        if(true == _.isUndefined(this.collection.get("buttonVal"))) {
        } else {
            var value = this.collection.get("buttonVal").value;
            this.collection.remove("buttonVal");
            this.closeLink();
        }
    };
    View_DataselectionModule_Footer.prototype.onChange_selectedDS = function () {
        this.onAfterChange_selectedDSD();
    };
    View_DataselectionModule_Footer.prototype.onClick_permaLinkButton = function (event) {
        this.changePermaLinkButton();
    };
    View_DataselectionModule_Footer.prototype.onClick_showVisualization = function (event) {
        var self = this;
        if(true === cubeVizApp._.backend.uiParts.index.isLoaded) {
            CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data, "data", function (updatedDataHash) {
                DataCube_Observation.loadAll(self.app._.backend.url, self.app._.backend.serviceUrl, self.app._.backend.modelUrl, updatedDataHash, "", function (newEntities) {
                    self.app._.data.retrievedObservations = newEntities;
                    self.triggerGlobalEvent("onReRender_visualization");
                });
                self.app._.backend.dataHash = updatedDataHash;
            });
        } else {
            if(false === cubeVizApp._.backend.uiParts.index.isLoaded) {
                CubeViz_ConfigurationLink.save(self.app._.backend.url, self.app._.backend.modelUrl, self.app._.data, "data", function (updatedDataHash) {
                    window.location.href = self.app._.backend.url + "?m=" + encodeURIComponent(self.app._.backend.modelUrl) + "&cv_dataHash=" + updatedDataHash + "&cv_uiHash=" + self.app._.backend.uiHash;
                });
            } else {
                CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data, "data", function (updatedDataHash) {
                    window.location.href = self.app._.backend.url + "?m=" + encodeURIComponent(self.app._.backend.modelUrl) + "&cv_dataHash=" + updatedDataHash + "&cv_uiHash=" + self.app._.backend.uiHash;
                });
            }
        }
    };
    View_DataselectionModule_Footer.prototype.onStart_application = function () {
        this.initialize();
    };
    View_DataselectionModule_Footer.prototype.onUpdate_componentDimensions = function () {
        if(true == _.isUndefined(this.collection.get("buttonVal"))) {
        } else {
            var value = this.collection.get("buttonVal").value;
            this.collection.remove("buttonVal");
            this.closeLink();
        }
    };
    View_DataselectionModule_Footer.prototype.render = function () {
        this.bindUserInterfaceEvents({
            "click #cubeviz-footer-permaLinkButton": this.onClick_permaLinkButton,
            "click #cubeviz-footer-showVisualizationButton": this.onClick_showVisualization
        });
        return this;
    };
    View_DataselectionModule_Footer.prototype.showLink = function () {
        var self = this;
        CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data, "data", function (updatedDataHash) {
            var link = self.app._.backend.url + "?";
            if(false == _.str.isBlank(self.app._.backend.serviceUrl)) {
                link += "serviceUrl=" + encodeURIComponent(self.app._.backend.serviceUrl) + "&";
            }
            link += "m=" + encodeURIComponent(self.app._.backend.modelUrl) + "&cv_dataHash=" + updatedDataHash + "&cv_uiHash=" + self.app._.backend.uiHash;
            var url = $("<a></a>").attr("href", link).attr("target", "_self").html(self.collection.get("cubeviz-footer-permaLink").html);
            $("#cubeviz-footer-permaLink").html(url);
            var positionLinkBtn = $("#cubeviz-footer-permaLinkButton").position();
            $("#cubeviz-footer-permaLinkMenu").css("top", (positionLinkBtn.top + 30)).css("left", (positionLinkBtn.left)).fadeIn("slow");
        }, true);
    };
    return View_DataselectionModule_Footer;
})(CubeViz_View_Abstract);
var View_IndexAction_ExportArea = (function (_super) {
    __extends(View_IndexAction_ExportArea, _super);
    function View_IndexAction_ExportArea(attachedTo, app) {
        _super.call(this, "View_IndexAction_ExportArea", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onReRender_visualization",
                handler: this.onReRender_visualization
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
    View_IndexAction_ExportArea.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        return this;
    };
    View_IndexAction_ExportArea.prototype.initialize = function () {
        this.render();
    };
    View_IndexAction_ExportArea.prototype.onReRender_visualization = function () {
        this.initialize();
    };
    View_IndexAction_ExportArea.prototype.onStart_application = function () {
        this.initialize();
    };
    View_IndexAction_ExportArea.prototype.onUpdate_componentDimensions = function () {
        this.initialize();
    };
    View_IndexAction_ExportArea.prototype.render = function () {
        this.setUrlToDownload();
        return this;
    };
    View_IndexAction_ExportArea.prototype.setUrlToDownload = function () {
        var urlToDownload = this.app._.backend.url + "exportdataselection/" + "?serviceUrl=" + encodeURIComponent(this.app._.backend.serviceUrl) + "&dataHash=" + this.app._.backend.dataHash;
        $("#cubeviz-index-exportArea-btnTurtle").attr("href", urlToDownload + "&type=turtle");
        $("#cubeviz-index-exportArea-btnCsv").attr("href", urlToDownload + "&type=csv");
    };
    return View_IndexAction_ExportArea;
})(CubeViz_View_Abstract);
var View_IndexAction_Header = (function (_super) {
    __extends(View_IndexAction_Header, _super);
    function View_IndexAction_Header(attachedTo, app) {
        _super.call(this, "View_IndexAction_Header", attachedTo, app);
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
    View_IndexAction_Header.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        CubeViz_View_Helper.destroyDialog($("#cubeviz-index-headerDialogBox"));
        return this;
    };
    View_IndexAction_Header.prototype.initialize = function () {
        this.render();
    };
    View_IndexAction_Header.prototype.onChange_selectedDS = function () {
        if(false === this.app._.backend.uiSettings.useDataSetInsteadOfModel) {
            $("#cubeviz-index-headerSubheadline").html(CubeViz_View_Helper.tplReplace($("#cubeviz-index-tpl-headerSubheadline").html(), {
                selectedDataSet: this.app._.data.selectedDS.__cv_niceLabel
            }));
        } else {
            $("#cubeviz-index-header").html(CubeViz_View_Helper.tplReplace($("#cubeviz-index-tpl-headerSubheadline").html(), {
                selectedDataSet: this.app._.data.selectedDS.__cv_niceLabel
            }));
        }
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
            height: 450,
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
        var modelLabel = "";
        if(false === _.isUndefined(this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"]) && false === _.str.isBlank(this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"])) {
            modelLabel = this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"].content;
        } else {
            modelLabel = this.app._.backend.modelUrl;
        }
        $("#cubeviz-index-headerDialogBox").html(CubeViz_View_Helper.tplReplace($("#cubeviz-index-tpl-headerDialogBoxHead").html(), {
            label: modelLabel
        }));
        var headerDialogBox = $($("#cubeviz-index-headerDialogBox").children().last());
        _.each(this.app._.backend.modelInformation, function (entry) {
            headerDialogBox.append(CubeViz_View_Helper.tplReplace($("#cubeviz-index-tpl-headerDialogBoxEntry").html(), {
                predicateLabel: entry.predicateLabel,
                objectContent: CubeViz_Visualization_Controller.linkify(entry.content)
            }));
        });
    };
    View_IndexAction_Header.prototype.renderHeader = function () {
        var modelLabel;
        if(false === _.isUndefined(this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"]) && false === _.str.isBlank(this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"])) {
            modelLabel = this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"].content;
        } else {
            modelLabel = this.app._.backend.modelUrl;
        }
        if(false === this.app._.backend.uiSettings.useDataSetInsteadOfModel) {
            $("#cubeviz-index-header").html(CubeViz_View_Helper.tplReplace($("#cubeviz-index-tpl-header").html(), {
                modelLabel: modelLabel
            }));
            $("#cubeviz-index-headerSubheadline").html(CubeViz_View_Helper.tplReplace($("#cubeviz-index-tpl-headerSubheadline").html(), {
                selectedDataSet: this.app._.data.selectedDS.__cv_niceLabel
            }) + $("#cubeviz-index-tpl-headerSubheadlineButtons").html());
        } else {
            $("#cubeviz-index-header").html(CubeViz_View_Helper.tplReplace($("#cubeviz-index-tpl-headerSubheadline").html(), {
                selectedDataSet: this.app._.data.selectedDS.__cv_niceLabel
            }));
            $("#cubeviz-index-headerSubheadline").html($("#cubeviz-index-tpl-headerSubheadlineButtons").html());
        }
    };
    return View_IndexAction_Header;
})(CubeViz_View_Abstract);
var View_IndexAction_Legend = (function (_super) {
    __extends(View_IndexAction_Legend, _super);
    function View_IndexAction_Legend(attachedTo, app) {
        _super.call(this, "View_IndexAction_Legend", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onUpdate_componentDimensions",
                handler: this.onUpdate_componentDimensions
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_IndexAction_Legend.prototype.destroy = function () {
        $("#cubeviz-legend-btnShowRetrievedObservations").off();
        $("#cubeviz-legend-dataSet").html("");
        $("#cubeviz-legend-observations").html("");
        $("#cubeviz-legend-configurationList").html("");
        CubeViz_View_Helper.destroyDialog($("#cubeviz-legend-componentDimensionInfoDialog"));
        _super.prototype.destroy.call(this);
        return this;
    };
    View_IndexAction_Legend.prototype.displayDataset = function (dataset, dataStructureDefinition) {
        var self = this;
        var tmp = null;

        $("#cubeviz-legend-dsLabel").html("<a href=\"" + dataset.__cv_uri + "\" target=\"_blank\">" + dataset.__cv_niceLabel + "</a>");
        $("#cubeviz-legend-dsProperties").html("<tr class=\"info\">" + "<td><strong>Property</strong></td>" + "<td><strong>Value</strong></td>" + "</tr>");
        $("#cubeviz-legend-dsProperties").append("<tr>" + "<td>URI</td>" + "<td style=\"word-break:break-all;\">" + "<a href=\"" + dataset.__cv_uri + "\" target=\"_blank\">" + dataset.__cv_uri + "</a></td>" + "</tr>");
        _.each(dataset, function (value, property) {
            if(false === _.str.include(property, "__cv_")) {
                if("http://purl.org/linked-data/cube#structure" == property) {
                    value = "<a href=\"" + dataStructureDefinition.__cv_uri + "\"" + " target=\"_blank\">" + dataStructureDefinition.__cv_niceLabel + "</a>";
                } else {
                    if(true === _.isObject(value) || true === _.isArray(value)) {
                        var list = new CubeViz_Collection();
                        value = CubeViz_Visualization_Controller.linkify(list.addList(value)._.join(", "));
                    } else {
                        if(true === self.isValidUrl(value)) {
                            value = "<a href=\"" + value + "\" target=\"_blank\">" + _.str.prune(value, 60) + "</a>";
                        }
                    }
                }
                $("#cubeviz-legend-dsProperties").append("<tr>" + "<td>" + "<a href=\"" + property + "\" target=\"_blank\">" + property + "</a></td>" + "<td style=\"word-break:break-all;\">" + value + "</td>" + "</tr>");
            }
        });
        if(false === _.isNull(dataset.__cv_sourceDataset) && false === _.isUndefined(dataset.__cv_sourceDataset)) {
            _.each(dataset.__cv_sourceDataset, function (sourceDataset) {
                $("#cubeviz-legend-dsProperties").append("<tr><td colspan=\"2\">" + "<a name=\"" + (CryptoJS.MD5(sourceDataset.__cv_uri) + "").substring(0, 6) + "\"></a>" + "</td></tr>" + "<tr class=\"warning\">" + "<td colspan=\"2\">" + "<strong>Source Dataset: " + "<a href=\"" + sourceDataset.__cv_uri + "\" target=\"_blank\">" + sourceDataset.__cv_niceLabel + "</a></strong>" + "</td>" + "</tr>");
                $("#cubeviz-legend-dsProperties").append("<tr>" + "<td>URI</td>" + "<td style=\"word-break:break-all;\">" + "<a href=\"" + sourceDataset.__cv_uri + "\" target=\"_blank\">" + sourceDataset.__cv_uri + "</a></td>" + "</tr>");
                _.each(sourceDataset, function (value, property) {
                    if(false === _.str.include(property, "__cv_")) {
                        if(true === _.isObject(value) || true === _.isArray(value)) {
                            var list = new CubeViz_Collection();
                            value = CubeViz_Visualization_Controller.linkify(list.addList(value)._.join(", "));
                        } else {
                            if(true === self.isValidUrl(value)) {
                                value = "<a href=\"" + value + "\" target=\"_blank\">" + _.str.prune(value, 60) + "</a>";
                            }
                        }
                        $("#cubeviz-legend-dsProperties").append("<tr>" + "<td>" + "<a href=\"" + property + "\" target=\"_blank\">" + property + "</a></td>" + "<td>" + value + "</td>" + "</tr>");
                    }
                });
            });
        }
    };
    View_IndexAction_Legend.prototype.displayDataStructureDefinition = function (dataStructureDefinition) {
        var self = this;
        var tmp = null;

        $("#cubeviz-legend-dsdLabel").html("<a href=\"" + dataStructureDefinition.__cv_uri + "\" target=\"_blank\">" + dataStructureDefinition.__cv_niceLabel + "</a>");
        $("#cubeviz-legend-dsdProperties").html("<tr class=\"info\">" + "<td><strong>Property</strong></td>" + "<td><strong>Value</strong></td>" + "</tr>");
        $("#cubeviz-legend-dsdProperties").append("<tr>" + "<td>URI</td>" + "<td style=\"word-break:break-all;\">" + "<a href=\"" + dataStructureDefinition.__cv_uri + "\" target=\"_blank\">" + dataStructureDefinition.__cv_uri + "</a></td>" + "</tr>");
        _.each(dataStructureDefinition, function (value, property) {
            if(false === _.str.include(property, "__cv_")) {
                if("http://purl.org/linked-data/cube#component" == property) {
                    var labels = [];
                    var list = new CubeViz_Collection();

                    list.addList(value).each(function (element) {
                        _.each(self.app._.data.selectedComponents.dimensions, function (dimension) {
                            if(element === dimension.__cv_uri) {
                                labels.push("<i class=\"icon-anchor\" style=\"font-size: 8px;\"></i> " + "<a href=\"#" + (CryptoJS.MD5(dimension.__cv_uri) + "").substring(0, 6) + "\">" + dimension.__cv_niceLabel + "</a> ");
                            }
                        });
                    });
                    labels.push("<i class=\"icon-anchor\" style=\"font-size: 8px;\"></i> " + "<a href=\"#" + (CryptoJS.MD5(self.app._.data.selectedComponents.measure.__cv_uri) + "").substring(0, 6) + "\">" + self.app._.data.selectedComponents.measure.__cv_niceLabel + "</a>");
                    if(false === _.isNull(self.app._.data.selectedComponents.attribute) && false === _.isUndefined(self.app._.data.selectedComponents.attribute)) {
                        labels.push(self.app._.data.selectedComponents.attribute.__cv_niceLabel);
                    }
                    value = labels.join(", ");
                } else {
                    if(true === _.isObject(value) || true === _.isArray(value)) {
                        var list = new CubeViz_Collection();
                        value = CubeViz_Visualization_Controller.linkify(list.addList(value)._.join(", "));
                    } else {
                        if(true === self.isValidUrl(value)) {
                            value = "<a href=\"" + value + "\" target=\"_blank\">" + _.str.prune(value, 60) + "</a>";
                        }
                    }
                }
                $("#cubeviz-legend-dsdProperties").append("<tr>" + "<td>" + "<a href=\"" + property + "\" target=\"_blank\">" + property + "</a></td>" + "<td style=\"word-break:break-all;\">" + value + "</td>" + "</tr>");
            }
        });
    };
    View_IndexAction_Legend.prototype.displayRetrievedObservations = function (observations, selectedDimensions, selectedMeasure) {
        var html = "";
        var i = 0;
        var label = "";
        var self = this;

        $("#cubeviz-legend-retrievedObservationsTitle").html(DataCube_Observation.getNumberOfActiveObservations(observations) + " Retrieved Observations");
        $("#cubeviz-legend-observations").html("");
        html = "<tr>" + "<td></td>";
        _.each(selectedDimensions, function (dimension) {
            html += "<td>" + CubeViz_View_Helper.tplReplace($("#cubeviz-legend-tpl-observationsTableHeadEntry").html(), {
                label: dimension.__cv_niceLabel,
                uriHash: (CryptoJS.MD5(dimension.__cv_uri) + "").substring(0, 6)
            }) + "</td>";
        });
        html += "<td colspan=\"2\">" + CubeViz_View_Helper.tplReplace($("#cubeviz-legend-tpl-observationsTableHeadEntry").html(), {
            label: selectedMeasure.__cv_niceLabel,
            uriHash: (CryptoJS.MD5(selectedMeasure.__cv_uri) + "").substring(0, 6)
        }) + "</td>";
        html += "<td></td></tr>";
        $("#cubeviz-legend-observations").append(html);
        _.each(selectedDimensions, function (dimension) {
            $($("#cubeviz-legend-observations").find(".cubeviz-legend-sortAsc").get(i)).data("dimension", dimension);
            $($("#cubeviz-legend-observations").find(".cubeviz-legend-sortDesc").get(i++)).data("dimension", dimension);
        });
        $($("#cubeviz-legend-observations").find(".cubeviz-legend-sortAsc").get(i)).data("measure", selectedMeasure);
        $($("#cubeviz-legend-observations").find(".cubeviz-legend-sortDesc").get(i)).data("measure", selectedMeasure);
        var observationValues = DataCube_Observation.getValues(observations, selectedMeasure["http://purl.org/linked-data/cube#measure"], true);
        var numberOfUsedDimensionElements = 0;
        var rangeMin = "<strong>min:</strong> " + String(jsStats.min(observationValues[0])).substring(0, 10);
        var rangeMax = "<strong>max:</strong> " + String(jsStats.max(observationValues[0])).substring(0, 10);
        var value = null;

        html = "<tr class=\"info\">" + "<td></td>";
        _.each(selectedDimensions, function (dimension) {
            numberOfUsedDimensionElements = _.size(DataCube_Observation.getUsedDimensionElementUris(observations, dimension["http://purl.org/linked-data/cube#dimension"]));
            if(numberOfUsedDimensionElements < _.size(dimension.__cv_elements)) {
                html += "<td><strong>" + _.size(dimension.__cv_elements) + "</strong> " + "different dimension elements available, " + "but only <strong>" + numberOfUsedDimensionElements + "</strong> are in use</td>";
            } else {
                html += "<td><strong>" + _.size(dimension.__cv_elements) + "</strong> " + "different dimension elements are in use</td>";
            }
        });
        html += "<td>" + rangeMin + "</td>" + "<td>" + rangeMax + "</td>" + "<td></td>";
        "</tr>";
        $("#cubeviz-legend-observations").append(html);
        var i = 1;
        _.each(observations, function (observation) {
            if(false === DataCube_Observation.isActive(observation)) {
                return;
            }
            if(false === _.isNull(observation.__cv_sourceDataset) && false === _.isUndefined(observation.__cv_sourceDataset)) {
                html = "<tr>" + "<td rowspan=\"2\"><strong>" + i++ + "</strong></td>";
            } else {
                html = "<tr>" + "<td><strong>" + i++ + "</strong></td>";
            }
            _.each(selectedDimensions, function (dimension) {
                _.each(dimension.__cv_elements, function (element) {
                    if(element.__cv_uri == observation[dimension["http://purl.org/linked-data/cube#dimension"]]) {
                        label = element.__cv_niceLabel;
                    }
                });
                html += "<td class=\"cubeviz-legend-dimensionElementLabelTd\">" + "<i class=\"icon-anchor\" style=\"font-size: 8px;\"></i>" + " <a href=\"#" + (CryptoJS.MD5(dimension.__cv_uri) + "").substring(0, 6) + "\" " + "title=\"Anchor to dimension: " + dimension.__cv_niceLabel + "\">" + label + "</a>";
                html += "</td>";
            });
            value = DataCube_Observation.parseValue(observation, selectedMeasure["http://purl.org/linked-data/cube#measure"]);
            if(true === _.isNull(value)) {
                html += "<td class=\"cubeviz-legend-measureTd\" colspan=\"2\" style=\"background-color: #FFEAEA;\">" + "<em><small>no value found or type is not float</small></em>" + "</td>";
            } else {
                html += "<td class=\"cubeviz-legend-measureTd\" colspan=\"2\">" + value + "</td>";
            }
            html += "<td>" + "<a href=\"" + observation.__cv_uri + "\" target=\"_blank\">Link</a>" + "</td>";
            html += "</tr>";
            if(false === _.isNull(observation.__cv_sourceDataset) && false === _.isUndefined(observation.__cv_sourceDataset)) {
                html += "<tr>" + "<td colspan=\"" + (3 + _.size(selectedDimensions)) + "\" style=\"padding-top: 2px; padding-bottom: 10px;\">" + "<small>Source Dataset: <strong>" + "<a href=\"#" + (CryptoJS.MD5(observation.__cv_sourceDataset.__cv_uri) + "").substring(0, 6) + "\">" + observation.__cv_sourceDataset.__cv_niceLabel + "</a>" + "</strong></small><br/>" + "<small>" + "<div class=\"cubeviz-clickable cubeviz-legend-sourceObservationOpener\">" + "Show more information about source Observation " + "<i class=\"icon-chevron-down\"></i>" + "</div>" + "</small><br/>" + "<table class=\"cubeviz-legend-sourceObservation table table-bordered table-condensed table-striped responsive-utilities\"></table>" + "</td>" + "</tr>";
            }
            $("#cubeviz-legend-observations > tbody:last").append(html);
            $($("#cubeviz-legend-observations").find(".cubeviz-legend-measureTd").last()).data("observation", observation);
            if(false === _.isNull(observation.__cv_sourceObservation) && false === _.isUndefined(observation.__cv_sourceObservation)) {
                var $table = $($("#cubeviz-legend-observations").find(".cubeviz-legend-sourceObservation").last());
                $table.append("<tr>" + "<td>URI</td>" + "<td style=\"word-break:break-all;\">" + "<a href=\"" + observation.__cv_sourceObservation.__cv_uri + "\" target=\"_blank\">" + observation.__cv_sourceObservation.__cv_uri + "</a></td>" + "</tr>");
                _.each(observation.__cv_sourceObservation, function (value, property) {
                    if(false === _.str.include(property, "__cv_")) {
                        if(true === _.isObject(value) || true === _.isArray(value)) {
                            var list = new CubeViz_Collection();
                            value = CubeViz_Visualization_Controller.linkify(list.addList(value)._.join(", "));
                        } else {
                            if(true === self.isValidUrl(value)) {
                                value = "<a href=\"" + value + "\" target=\"_blank\">" + _.str.prune(value, 60) + "</a>";
                            }
                        }
                        $table.append("<tr>" + "<td>" + "<a href=\"" + property + "\" target=\"_blank\">" + property + "</a></td>" + "<td style=\"word-break:break-all;\">" + value + "</td>" + "</tr>");
                    }
                });
                $table.hide();
                $($("#cubeviz-legend-observations").find(".cubeviz-legend-sourceObservationOpener").last()).click(function () {
                    $table.fadeToggle(200);
                });
            }
        });
        this.bindUserInterfaceEvents({
            "dblclick .cubeviz-legend-measureTd": this.onDblClick_measureTd,
            "click .cubeviz-legend-sortAsc": this.onClick_sortAsc,
            "click .cubeviz-legend-sortDesc": this.onClick_sortDesc
        });
    };
    View_IndexAction_Legend.prototype.displaySelectedDimensions = function (selectedComponentDimensions) {
        var elementList = new CubeViz_Collection();
        var self = this;
        var tmpList = new CubeViz_Collection();
        var $table = null;

        $("#cubeviz-legend-componentDimensions").html("");
        _.each(selectedComponentDimensions, function (dimension) {
            $("#cubeviz-legend-componentDimensions").append($(CubeViz_View_Helper.tplReplace($("#cubeviz-legend-tpl-dimensionBlock").html(), {
                dimensionLabel: dimension.__cv_niceLabel,
                dimensionUri: dimension.__cv_uri,
                dimensionUriHash: (CryptoJS.MD5(dimension.__cv_uri) + "").substring(0, 6)
            })));
            $table = $($("#cubeviz-legend-componentDimensions").find(".table").last());
            $table.append("<tr class=\"info\">" + "<td><strong>Property</strong></td>" + "<td><strong>Value</strong></td>" + "</tr>");
            $table.append("<tr>" + "<td>URI</td>" + "<td style=\"word-break:break-all;\">" + "<a href=\"" + dimension.__cv_uri + "\" target=\"_blank\">" + dimension.__cv_uri + "</a></td>" + "</tr>");
            _.each(dimension, function (value, property) {
                if(false === _.str.include(property, "__cv_")) {
                    if(true === _.isObject(value) || true === _.isArray(value)) {
                        var list = new CubeViz_Collection();
                        value = CubeViz_Visualization_Controller.linkify(list.addList(value)._.join(", "));
                    } else {
                        if(true == self.isValidUrl(value)) {
                            value = "<a href=\"" + value + "\" target=\"_blank\">" + _.str.prune(value, 60) + "</a>";
                        }
                    }
                    $table.append("<tr>" + "<td><a href=\"" + property + "\">" + property + "</a></td>" + "<td>" + value + "</td>" + "</tr>");
                }
            });
            tmpList.reset();
            elementList.reset().addList(dimension.__cv_elements).each(function (element) {
                $table.append(tmpList.add("<a href=\"" + element.__cv_uri + "\" target=\"_blank\">" + element.__cv_niceLabel + "</a>", null, true));
            });
            $table.append("<tr><td colspan=\"2\">" + "<strong><em>" + tmpList.size() + " Dimension Elements</em></strong>" + "</td>" + "</tr><tr>" + "<td colspan=\"2\">" + tmpList._.join(", ") + "</td>" + "</tr>");
            if(false === _.isNull(dimension.__cv_sourceComponentSpecification) && false === _.isUndefined(dimension.__cv_sourceComponentSpecification)) {
                _.each(dimension.__cv_sourceComponentSpecification, function (sourceCS) {
                    $table.append("<tr><td colspan=\"2\"></td></tr>" + "<tr class=\"warning\">" + "<td colspan=\"2\">" + "<strong>Source Component Specification: " + "<a href=\"" + sourceCS.__cv_uri + "\" target=\"_blank\">" + sourceCS.__cv_niceLabel + "</a></strong>" + "</td>" + "</tr>");
                    $table.append("<tr>" + "<td>URI</td>" + "<td style=\"word-break:break-all;\">" + "<a href=\"" + sourceCS.__cv_uri + "\" target=\"_blank\">" + sourceCS.__cv_uri + "</a></td>" + "</tr>");
                    _.each(sourceCS, function (value, property) {
                        if(false === _.str.include(property, "__cv_")) {
                            if(true === _.isObject(value) || true === _.isArray(value)) {
                                var list = new CubeViz_Collection();
                                value = CubeViz_Visualization_Controller.linkify(list.addList(value)._.join(", "));
                            } else {
                                if(true === self.isValidUrl(value)) {
                                    value = "<a href=\"" + value + "\" target=\"_blank\">" + _.str.prune(value, 60) + "</a>";
                                }
                            }
                            $table.append("<tr>" + "<td>" + "<a href=\"" + property + "\" target=\"_blank\">" + property + "</a></td>" + "<td style=\"word-break:break-all;\">" + value + "</td>" + "</tr>");
                        }
                    });
                    tmpList.reset();
                    elementList.reset().addList(sourceCS.__cv_elements).each(function (element) {
                        $table.append(tmpList.add("<a href=\"" + element.__cv_uri + "\" target=\"_blank\">" + element.__cv_niceLabel + "</a>", null, true));
                    });
                    $table.append("<tr><td colspan=\"2\">" + "<em>" + tmpList.size() + " Dimension Elements</em>" + "</td>" + "</tr><tr>" + "<td colspan=\"2\">" + tmpList._.join(", ") + "</td>" + "</tr>");
                });
            }
        });
    };
    View_IndexAction_Legend.prototype.displaySelectedMeasureAndAttribute = function (selectedMeasure, selectedAttribute) {
        var self = this;
        var $table = $("#cubeviz-legend-componentMeasureProperties");

        $("#cubeviz-legend-componentMeasureLabel").html("<a name=\"" + (CryptoJS.MD5(selectedMeasure.__cv_uri) + "").substring(0, 6) + "\">" + "<a href=\"" + selectedMeasure.__cv_uri + "\">" + selectedMeasure.__cv_niceLabel + "</a>" + "</a>");
        $table.append("<tr class=\"info\">" + "<td><strong>Property</strong></td>" + "<td><strong>Value</strong></td>" + "</tr>");
        _.each(selectedMeasure, function (value, property) {
            if(false === _.str.include(property, "__cv_")) {
                if(true === _.isObject(value) || true === _.isArray(value)) {
                    var list = new CubeViz_Collection();
                    value = CubeViz_Visualization_Controller.linkify(list.addList(value)._.join(", "));
                } else {
                    if(true == self.isValidUrl(value)) {
                        value = "<a href=\"" + value + "\" target=\"_blank\">" + _.str.prune(value, 60) + "</a>";
                    }
                }
                $table.append("<tr>" + "<td><a href=\"" + property + "\">" + property + "</a></td>" + "<td>" + value + "</td>" + "</tr>");
            }
        });
        if(false === _.isNull(selectedMeasure.__cv_sourceMeasure) && false === _.isUndefined(selectedMeasure.__cv_sourceMeasure)) {
            _.each(selectedMeasure.__cv_sourceMeasure, function (sourceMeasure) {
                $table.append("<tr><td colspan=\"2\"></td></tr>" + "<tr class=\"warning\">" + "<td colspan=\"2\">" + "<strong>Source Measure: " + "<a href=\"" + sourceMeasure.__cv_uri + "\" target=\"_blank\">" + sourceMeasure.__cv_niceLabel + "</a></strong>" + "</td>" + "</tr>");
                $table.append("<tr>" + "<td>URI</td>" + "<td style=\"word-break:break-all;\">" + "<a href=\"" + sourceMeasure.__cv_uri + "\" target=\"_blank\">" + sourceMeasure.__cv_uri + "</a></td>" + "</tr>");
                _.each(sourceMeasure, function (value, property) {
                    if(false === _.str.include(property, "__cv_")) {
                        if(true === _.isObject(value) || true === _.isArray(value)) {
                            var list = new CubeViz_Collection();
                            value = CubeViz_Visualization_Controller.linkify(list.addList(value)._.join(", "));
                        } else {
                            if(true === self.isValidUrl(value)) {
                                value = "<a href=\"" + value + "\" target=\"_blank\">" + _.str.prune(value, 60) + "</a>";
                            }
                        }
                        $table.append("<tr>" + "<td>" + "<a href=\"" + property + "\" target=\"_blank\">" + property + "</a></td>" + "<td style=\"word-break:break-all;\">" + value + "</td>" + "</tr>");
                    }
                });
            });
        }
        if(true === _.isNull(selectedAttribute) || true === _.isUndefined(selectedAttribute)) {
            $("#cubeviz-legend-componentAttribute").hide();
        } else {
            $("#cubeviz-legend-componentAttributeLabel").html("<a href=\"" + selectedMeasure.__cv_uri + "\">" + selectedAttribute.__cv_niceLabel + "</a>");
            $("#cubeviz-legend-componentAttributeProperties").append("<tr class=\"info\">" + "<td><strong>Property</strong></td>" + "<td><strong>Value</strong></td>" + "</tr>");
            _.each(selectedAttribute, function (value, property) {
                if(false === _.str.include(property, "__cv_")) {
                    if(true === _.isObject(value) || true === _.isArray(value)) {
                        var list = new CubeViz_Collection();
                        value = CubeViz_Visualization_Controller.linkify(list.addList(value)._.join(", "));
                    } else {
                        if(true == self.isValidUrl(value)) {
                            value = "<a href=\"" + value + "\" target=\"_blank\">" + _.str.prune(value, 60) + "</a>";
                        }
                    }
                    $("#cubeviz-legend-componentAttributeProperties").append("<tr>" + "<td><a href=\"" + property + "\">" + property + "</a></td>" + "<td>" + value + "</td>" + "</tr>");
                }
            });
        }
    };
    View_IndexAction_Legend.prototype.initialize = function () {
        this.render();
    };
    View_IndexAction_Legend.prototype.isValidUrl = function (str) {
        return ((new RegExp('^(https?:\\/\\/)?' + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)*[a-z]{2,}|' + '((\\d{1,3}\\.){3}\\d{1,3}))' + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + '(\\?[;&a-z\\d%_.~+=-]*)?' + '(\\#[-a-z\\d_]*)?$', 'i')).test(str)) && (true === _.str.include(str, ".") || true === _.str.include(str, "/"));
    };
    View_IndexAction_Legend.prototype.onClick_adaptedMeasureValueSaveBtn = function (e) {
        var accordingObservation = $(e.target).data("observation");
        var self = this;
        var $inputField = $(e.target).data("inputField");
        var $measureTd = $(e.target).data("measureTd");
        var $saveBtn = $(e.target);

        accordingObservation.__cv_temporaryNewValue = $inputField.val();
        _.each(this.app._.data.retrievedObservations, function (observation, key) {
            if(observation.__cv_uri === accordingObservation.__cv_uri) {
                self.app._.data.retrievedObservations[key] = accordingObservation;
            }
        });
        this.restoreMeasureTd($measureTd);
        this.triggerGlobalEvent("onReRender_visualization");
    };
    View_IndexAction_Legend.prototype.onClick_btnShowRetrievedObservations = function (event) {
        event.preventDefault();
        $("#cubeviz-legend-retrievedObservations").slideToggle("slow");
        return false;
    };
    View_IndexAction_Legend.prototype.onClick_btnShowSelectedConfiguration = function (event) {
        event.preventDefault();
        $("#cubeviz-legend-selectedConfiguration").slideToggle('slow');
        return false;
    };
    View_IndexAction_Legend.prototype.onClick_componentDimensionShowInfo = function (event) {
        event.preventDefault();
        var showMoreInformationBtn = $(event.target);
        var dimension = showMoreInformationBtn.data("dimension");
        var dimensionElement = showMoreInformationBtn.data("dimensionElement");
        var observationIcon = showMoreInformationBtn.data("observationIcon");

        var infoList = $($("#cubeviz-legend-tpl-componentDimensionInfoList").html());
        _.each(dimensionElement, function (value, key) {
            if(false === _.str.startsWith(key, "__cv_")) {
                infoList.append(CubeViz_View_Helper.tplReplace($("#cubeviz-legend-tpl-componentDimensionInfoListEntry").html(), {
                    key: key,
                    value: CubeViz_Visualization_Controller.linkify(value)
                }));
            }
        });
        $("#cubeviz-legend-componentDimensionInfoDialog").html("").append(CubeViz_View_Helper.tplReplace($("#cubeviz-legend-tpl-componentDimensionInfoHeader").html(), dimensionElement)).append(infoList).fadeIn("slow");
        $("#cubeviz-legend-componentDimensionInfoDialog").dialog("open");
        return false;
    };
    View_IndexAction_Legend.prototype.onClick_sortAsc = function (e) {
        if(false === _.isUndefined($(e.target).data("dimension"))) {
            this.app._.data.retrievedObservations = this.sortDimensionsAscOrDesc($(e.target).data("dimension"), this.app._.data.retrievedObservations, -1, 1);
        } else {
            if(false === _.isUndefined($(e.target).data("measure"))) {
                this.app._.data.retrievedObservations = this.sortMeasureValuesAscOrDesc($(e.target).data("measure"), this.app._.data.retrievedObservations, -1, 1);
            } else {
                return;
            }
        }
        this.displayRetrievedObservations(this.app._.data.retrievedObservations, this.app._.data.selectedComponents.dimensions, this.app._.data.selectedComponents.measure);
    };
    View_IndexAction_Legend.prototype.onClick_sortDesc = function (e) {
        if(false === _.isUndefined($(e.target).data("dimension"))) {
            this.app._.data.retrievedObservations = this.sortDimensionsAscOrDesc($(e.target).data("dimension"), this.app._.data.retrievedObservations, 1, -1);
        } else {
            if(false === _.isUndefined($(e.target).data("measure"))) {
                this.app._.data.retrievedObservations = this.sortMeasureValuesAscOrDesc($(e.target).data("measure"), this.app._.data.retrievedObservations, 1, -1);
            } else {
                return;
            }
        }
        this.displayRetrievedObservations(this.app._.data.retrievedObservations, this.app._.data.selectedComponents.dimensions, this.app._.data.selectedComponents.measure);
    };
    View_IndexAction_Legend.prototype.onDblClick_measureTd = function (e) {
        if(true === _.isUndefined($(e.target).data("observation")) || true === _.isNull($(e.target).data("observation"))) {
            return;
        }
        var accordingObservation = $(e.target).data("observation");
        var inputValue = null;
        var selectedMeasureUri = this.app._.data.selectedComponents.measure["http://purl.org/linked-data/cube#measure"];

        if(false === _.isUndefined(accordingObservation.__cv_temporaryNewValue)) {
            inputValue = accordingObservation.__cv_temporaryNewValue;
        } else {
            inputValue = accordingObservation[selectedMeasureUri];
        }
        var $inputField = $("<input type=\"text\" value=\"" + inputValue + "\">");
        var $saveBtn = $("<div class=\"btn btn-primary\" style=\"vertical-align: top;\">Save</div>");

        $(e.target).html("").append($inputField).append($saveBtn);
        $saveBtn.data("inputField", $inputField).data("measureTd", $(e.target)).data("observation", accordingObservation).on("click", $.proxy(this.onClick_adaptedMeasureValueSaveBtn, this));
        $inputField.focus();
    };
    View_IndexAction_Legend.prototype.onUpdate_componentDimensions = function () {
        this.destroy();
        this.initialize();
    };
    View_IndexAction_Legend.prototype.onStart_application = function () {
        this.initialize();
    };
    View_IndexAction_Legend.prototype.render = function () {
        var selectedMeasureUri = this.app._.data.selectedComponents.measure["http://purl.org/linked-data/cube#measure"];
        var self = this;

        this.displayDataStructureDefinition(this.app._.data.selectedDSD);
        this.displayDataset(this.app._.data.selectedDS, this.app._.data.selectedDSD);
        this.displaySelectedDimensions(this.app._.data.selectedComponents.dimensions);
        this.displaySelectedMeasureAndAttribute(this.app._.data.selectedComponents.measure, this.app._.data.selectedComponents.attribute);
        this.displayRetrievedObservations(this.sortMeasureValuesAscOrDesc(this.app._.data.selectedComponents.measure, this.app._.data.retrievedObservations, -1, 1), this.app._.data.selectedComponents.dimensions, this.app._.data.selectedComponents.measure);
        CubeViz_View_Helper.attachDialogTo($("#cubeviz-legend-componentDimensionInfoDialog"), {
            closeOnEscape: true,
            showCross: true,
            height: 450,
            width: "50%"
        });
        $("#cubeviz-legend-btnShowRetrievedObservations").off();
        $("#cubeviz-legend-btnShowSelectedConfiguration").off();
        $(".cubeviz-legend-componentDimensionShowInfo").off();
        $("#cubeviz-legend-sortByTitle").off();
        $("#cubeviz-legend-sortByValue").off();
        this.bindUserInterfaceEvents({
            "click #cubeviz-legend-btnShowSelectedConfiguration": this.onClick_btnShowSelectedConfiguration,
            "click #cubeviz-legend-btnShowRetrievedObservations": this.onClick_btnShowRetrievedObservations,
            "click .cubeviz-legend-componentDimensionShowInfo": this.onClick_componentDimensionShowInfo
        });
        return this;
    };
    View_IndexAction_Legend.prototype.restoreMeasureTd = function ($measureTd) {
        var accordingObservation = $measureTd.data("observation");
        var selectedMeasureUri = this.app._.data.selectedComponents.measure["http://purl.org/linked-data/cube#measure"];

        $measureTd.html(accordingObservation.__cv_temporaryNewValue + " &nbsp; <small>(Original: " + accordingObservation[selectedMeasureUri] + ")");
    };
    View_IndexAction_Legend.prototype.sortDimensionsAscOrDesc = function (selectedComponent, observations, ifLower, ifHigher) {
        var accordingFieldLabel = "";
        var anotherAccordingFieldLabel = "";
        var observationList = new CubeViz_Collection("__cv_uri");
        var selectedComponentUri = selectedComponent["http://purl.org/linked-data/cube#dimension"];

        observationList.addList(observations);
        observationList._.sort(function (observation, anotherObservation) {
            accordingFieldLabel = DataCube_Component.findDimensionElement(selectedComponent.__cv_elements, observation[selectedComponentUri]).__cv_niceLabel;
            anotherAccordingFieldLabel = DataCube_Component.findDimensionElement(selectedComponent.__cv_elements, anotherObservation[selectedComponentUri]).__cv_niceLabel;
            return accordingFieldLabel < anotherAccordingFieldLabel ? ifLower : ifHigher;
        });
        return observationList.toObject();
    };
    View_IndexAction_Legend.prototype.sortMeasureValuesAscOrDesc = function (selectedComponent, observations, ifLower, ifHigher) {
        var anotherObservationValue = null;
        var observationList = new CubeViz_Collection("__cv_uri");
        var observationValue = null;
        var selectedComponentUri = selectedComponent["http://purl.org/linked-data/cube#measure"];

        observationList.addList(observations);
        observationList._.sort(function (observation, anotherObservation) {
            observationValue = DataCube_Observation.parseValue(observation, selectedComponentUri);
            anotherObservationValue = DataCube_Observation.parseValue(anotherObservation, selectedComponentUri);
            return observationValue < anotherObservationValue ? ifLower : ifHigher;
        });
        return observationList.toObject();
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
        this.setVisualizationHeight();
        if(true === _.str.include(thrownException, "Highcharts error #10")) {
            $("#cubeviz-index-visualization").html($("#cubeviz-visualization-tpl-notificationHightchartsException10").html());
        } else {
            if(true === _.str.include(thrownException, "CubeViz error no observations retrieved")) {
                $("#cubeviz-index-visualization").html($("#cubeviz-visualization-tpl-nothingFoundNotification").text());
                this.triggerGlobalEvent("onReceived_noData");
            } else {
                if(true === _.str.include(thrownException, "CubeViz error no elements to visualize")) {
                    $("#cubeviz-index-visualization").html("CubeViz error no elements to visualize");
                    this.triggerGlobalEvent("onVisualize_noElements");
                }
            }
        }
        if(false === _.isUndefined(console) && false === _.isUndefined(console.log)) {
            console.log(thrownException);
        }
    };
    View_IndexAction_Visualization.prototype.initialize = function () {
        this.render();
    };
    View_IndexAction_Visualization.prototype.onChange_visualizationClass = function () {
        this.render();
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
        if(0 == _.size(this.app._.data.retrievedObservations)) {
            this.handleException("CubeViz error no observations retrieved");
            return this;
        }
        var selectedAttributeUri = null;
        if((false === _.isNull(this.app._.data.selectedComponents.attribute) && false === _.isUndefined(this.app._.data.selectedComponents.attribute))) {
            if(false === this.app._.data.selectedComponents.attribute.__cv_inUse) {
            } else {
                selectedAttributeUri = this.app._.data.selectedComponents.attribute["http://purl.org/linked-data/cube#attribute"];
            }
        }
        var chart = null;
        var fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.className, this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts);
        var libraryInstance = null;
        var selectedMeasure = this.app._.data.selectedComponents.measure;
        var type = null;
        var visualizationSetting = null;

        if(true === _.isNull(fromChartConfig)) {
            var defaultChartConfig = CubeViz_Visualization_Controller.getDefaultChartConfig(this.app._.backend.chartConfig, this.app._.data.numberOfMultipleDimensions);
            this.app._.ui.visualization.className = defaultChartConfig.className;
            fromChartConfig = defaultChartConfig.chartConfig;
        }
        visualizationSetting = CubeViz_Visualization_Controller.updateVisualizationSettings([], this.app._.ui.visualizationSettings[this.app._.ui.visualization.className], fromChartConfig.defaultConfig);
        type = CubeViz_Visualization_Controller.getVisualizationType(this.app._.ui.visualization.className);
        switch(type) {
            case 'HighCharts': {
                if(false === _.isUndefined(this.app._.generatedVisualization)) {
                    try  {
                        this.app._.generatedVisualization.destroy();
                    } catch (ex) {
                        if(false === _.isUndefined(console) && false === _.isUndefined(console.log)) {
                            console.log(ex);
                        }
                    }
                }
                libraryInstance = new CubeViz_Visualization_HighCharts();
                chart = libraryInstance.load(this.app._.ui.visualization.className);
                break;

            }
            case 'D3js': {
                this.app._.generatedVisualization = null;
                $("#cubeviz-index-visualization").html("");
                libraryInstance = new CubeViz_Visualization_D3js();
                chart = libraryInstance.load(this.app._.ui.visualization.className);
                break;

            }
            default: {
                break;

            }
        }
        chart.init(visualizationSetting, this.app._.data.retrievedObservations, this.app._.data.selectedComponents.dimensions, CubeViz_Visualization_Controller.getMultipleDimensions(this.app._.data.selectedComponents.dimensions), CubeViz_Visualization_Controller.getOneElementDimensions(this.app._.data.selectedComponents.dimensions), selectedMeasure, selectedAttributeUri);
        try  {
            switch(type) {
                case 'HighCharts': {
                    this.setVisualizationHeight(_.size(chart.getRenderResult().xAxis.categories));
                    if(0 == _.size(chart.getRenderResult().series)) {
                        this.handleException("CubeViz error no elements to visualize");
                        return this;
                    }
                    break;

                }
            }
            this.app._.generatedVisualization = libraryInstance.render(chart);
        } catch (ex) {
            this.handleException(ex);
        }
        return this;
    };
    View_IndexAction_Visualization.prototype.setVisualizationHeight = function (numberOfYAxisElements) {
        if (typeof numberOfYAxisElements === "undefined") { numberOfYAxisElements = 0; }
        var offset = $(this.attachedTo).offset();
        var minHeight = $(window).height() - offset.top - 105;
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
                name: "onClick_setupComponentOpener",
                handler: this.onClick_setupComponentOpener
            }, 
            {
                name: "onReceived_noData",
                handler: this.onReceived_noData
            }, 
            {
                name: "onReRender_visualization",
                handler: this.onReRender_visualization
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }, 
            {
                name: "onVisualize_noElements",
                handler: this.onVisualize_noElements
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
            this.app._.ui.visualization.className = selectorItemDiv.data("class");
        } else {
            selectorItemDiv = $(event.target);
            this.app._.ui.visualization.className = selectorItemDiv.data("class");
        }
        prevClass = $($(".cubeviz-visualizationselector-selectedSelectorItem").get(0)).data("class");
        this.hideDongle();
        if(prevClass == this.app._.ui.visualization.className) {
            this.showMenu(selectorItemDiv);
        } else {
            this.hideMenu();
            $(".cubeviz-visualizationselector-selectedSelectorItem").removeClass("cubeviz-visualizationselector-selectedSelectorItem").addClass("cubeviz-visualizationselector-selectorItem");
            selectorItemDiv.removeClass("cubeviz-visualizationselector-selectorItem").addClass("cubeviz-visualizationselector-selectedSelectorItem");
            this.showMenuDongle(selectorItemDiv);
            this.triggerGlobalEvent("onChange_visualizationClass");
            CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.ui, "ui", function (updatedUiHash) {
                self.app._.backend.uiHash = updatedUiHash;
            });
        }
        this.triggerGlobalEvent("onAfterClick_selectorItem");
    };
    View_IndexAction_VisualizationSelector.prototype.onClick_updateVisz = function () {
        var fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.className, this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts);
        var self = this;

        this.app._.ui.visualizationSettings[this.app._.ui.visualization.className] = CubeViz_Visualization_Controller.updateVisualizationSettings($(".cubeviz-visualizationselector-menuItemValue"), this.app._.ui.visualizationSettings[this.app._.ui.visualization.className], fromChartConfig.defaultConfig);
        CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.ui, "ui", function (updatedUiHash) {
            self.app._.backend.uiHash = updatedUiHash;
        });
        this.triggerGlobalEvent("onReRender_visualization");
    };
    View_IndexAction_VisualizationSelector.prototype.onReceived_noData = function () {
        this.hideDongle();
    };
    View_IndexAction_VisualizationSelector.prototype.onReRender_visualization = function () {
        this.destroy();
        if(0 < _.size(this.app._.data.retrievedObservations)) {
            this.initialize();
        }
    };
    View_IndexAction_VisualizationSelector.prototype.onStart_application = function () {
        if(0 < _.size(this.app._.data.retrievedObservations)) {
            this.initialize();
        }
    };
    View_IndexAction_VisualizationSelector.prototype.onVisualize_noElements = function () {
        this.hideDongle().hideMenu();
    };
    View_IndexAction_VisualizationSelector.prototype.render = function () {
        this.triggerGlobalEvent("onBeforeRender_visualizationSelector");
        var numberOfMultDims = this.app._.data.numberOfMultipleDimensions;
        var charts = this.app._.backend.chartConfig[numberOfMultDims].charts;
        var firstViszItem;
        var self = this;
        var viszItem;

        this.hideDongle();
        _.each(charts, function (chartObject) {
            viszItem = $(CubeViz_View_Helper.tplReplace($("#cubeviz-visualizationselector-tpl-selectorItem").html()));
            $(viszItem.find(".cubeviz-icon-small").first()).attr("src", self.app._.backend.imagesPath + chartObject.icon);
            viszItem.data("class", chartObject.className);
            viszItem.off("click");
            viszItem.on("click", $.proxy(self.onClick_selectorItem, self));
            if(self.app._.ui.visualization.className == chartObject.className) {
                viszItem.addClass("cubeviz-visualizationselector-selectedSelectorItem").removeClass("cubeviz-visualizationselector-selectorItem");
            }
            $("#cubeviz-visualizationselector-selector").append(viszItem);
        });
        this.showMenuDongle($($("#cubeviz-visualizationselector-selector").find(".cubeviz-visualizationselector-selectedSelectorItem").first()));
        this.bindUserInterfaceEvents({
        });
        this.triggerGlobalEvent("onAfterRender_visualizationSelector");
        return this;
    };
    View_IndexAction_VisualizationSelector.prototype.showMenu = function (selectorItemDiv) {
        this.triggerGlobalEvent("onBeforeShow_visualizationSelectorMenu");
        var alreadySetSelected = false;
        var defaultValue = "";
        var fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.className, this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts);
        var menuItem;
        var menuItemsHtml = $("#cubeviz-visualizationselector-menuItems").html();
        var position = selectorItemDiv.position();
        var selectBox;
        var shortCutViszSettings = this.app._.ui.visualizationSettings[this.app._.ui.visualization.className];
        var valueOption;

        if(false === _.isUndefined(fromChartConfig.options) && 0 < _.size(fromChartConfig.options) && ("" == menuItemsHtml || null == menuItemsHtml)) {
            _.each(fromChartConfig.options, function (option) {
                alreadySetSelected = false;
                menuItem = $(CubeViz_View_Helper.tplReplace($("#cubeviz-visualizationselector-tpl-menuItem").html(), option));
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
            $("#cubeviz-visualizationselector-menu").css("top", position.top + 37).css("left", position.left - 192).fadeIn("slow");
        }
        this.triggerGlobalEvent("onAfterShow_visualizationSelectorMenu");
    };
    View_IndexAction_VisualizationSelector.prototype.showMenuDongle = function (selectorItemDiv) {
        var charts = this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts;
        var fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.className, charts);

        if(false === _.isUndefined(fromChartConfig.options) && 0 < _.size(fromChartConfig.options)) {
            var position = selectorItemDiv.position();
            $("#cubeviz-visualizationselector-menuDongleDiv").css("top", position.top + 25).css("left", position.left + 14).fadeIn("slow");
        }
    };
    return View_IndexAction_VisualizationSelector;
})(CubeViz_View_Abstract);
var View_ModelinfoAction_Footer = (function (_super) {
    __extends(View_ModelinfoAction_Footer, _super);
    function View_ModelinfoAction_Footer(attachedTo, app) {
        _super.call(this, "View_Modelinfo_Footer", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_ModelinfoAction_Footer.prototype.initialize = function () {
        this.render();
    };
    View_ModelinfoAction_Footer.prototype.onClick_showAnalyzeBtn = function () {
        window.location.href = this.app._.backend.url + "analyze/";
    };
    View_ModelinfoAction_Footer.prototype.onClick_showVisualizationBtn = function () {
        $("#cubeviz-footer-showVisualizationButton").click();
    };
    View_ModelinfoAction_Footer.prototype.onStart_application = function () {
        this.initialize();
    };
    View_ModelinfoAction_Footer.prototype.render = function () {
        this.bindUserInterfaceEvents({
            "click #cubeviz-modelinfo-showAnalyzeBtn": this.onClick_showAnalyzeBtn,
            "click #cubeviz-modelinfo-showVisualizationBtn": this.onClick_showVisualizationBtn
        });
        return this;
    };
    return View_ModelinfoAction_Footer;
})(CubeViz_View_Abstract);
var cubeVizApp = new CubeViz_View_Application();
$(document).ready(function () {
    if(0 < _.size(cubeVizApp._) && "development" == cubeVizApp._.backend.context) {
        console.log("CubeViz - Development Information:");
        console.log(cubeVizApp._);
    }
    cubeVizApp.triggerEvent("onStart_application");
});
