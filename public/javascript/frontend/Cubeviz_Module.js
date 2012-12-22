var DataCube_DataStructureDefinition = (function () {
    function DataCube_DataStructureDefinition() { }
    DataCube_DataStructureDefinition.loadAll = function loadAll(callback) {
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "getdatastructuredefinitions/",
            data: {
                m: CubeViz_Links_Module["modelUrl"]
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            console.log("DataStructureDefinition > loadAll > error");
            console.log("response text: " + xhr["responseText"]);
            console.log("error: " + thrownError);
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
var DataCube_DataSet = (function () {
    function DataCube_DataSet() { }
    DataCube_DataSet.loadAll = function loadAll(dsdUrl, callback) {
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "getdatasets/",
            data: {
                m: CubeViz_Links_Module.modelUrl,
                dsdUrl: dsdUrl
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            console.log("DataSet > loadAll > error");
            console.log("response text: " + xhr.responseText);
            console.log("error: " + thrownError);
        }).done(function (entries) {
            DataCube_DataSet.prepareLoadedDataSets(entries, callback);
        });
    }
    DataCube_DataSet.prepareLoadedDataSets = function prepareLoadedDataSets(entries, callback) {
        entries.sort(function (a, b) {
            return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        });
        callback(entries);
    }
    return DataCube_DataSet;
})();
var DataCube_Component = (function () {
    function DataCube_Component() { }
    DataCube_Component.loadAllDimensions = function loadAllDimensions(dsdUrl, dsUrl, callback) {
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "getcomponents/",
            data: {
                m: CubeViz_Links_Module.modelUrl,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "dimension"
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            console.log("Component > loadAll > error");
            console.log("response text: " + xhr.responseText);
            console.log("error: " + thrownError);
        }).done(function (entries) {
            DataCube_Component.prepareLoadedAllDimensions(entries, callback);
        });
    }
    DataCube_Component.prepareLoadedAllDimensions = function prepareLoadedAllDimensions(entries, callback) {
        entries = JSON.parse(entries);
        entries.sort(function (a, b) {
            return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        });
        var tmpEntries = {
        };
        for(var i in entries) {
            tmpEntries[entries[i].hashedUrl] = entries[i];
        }
        callback(tmpEntries);
    }
    DataCube_Component.loadAllMeasures = function loadAllMeasures(dsdUrl, dsUrl, callback) {
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "getcomponents/",
            data: {
                m: CubeViz_Links_Module.modelUrl,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "measure"
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            console.log("Component > loadAll > error");
            console.log("response text: " + xhr.responseText);
            console.log("error: " + thrownError);
        }).done(function (entries) {
            DataCube_Component.prepareLoadedAllMeasures(entries, callback);
        });
    }
    DataCube_Component.prepareLoadedAllMeasures = function prepareLoadedAllMeasures(entries, callback) {
        entries = JSON.parse(entries);
        entries.sort(function (a, b) {
            return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        });
        var tmpEntries = {
        };
        for(var i in entries) {
            tmpEntries[entries[i].hashedUrl] = entries[i];
        }
        callback(tmpEntries);
    }
    DataCube_Component.getDefaultSelectedDimensions = function getDefaultSelectedDimensions(componentDimensions) {
        componentDimensions = $.parseJSON(JSON.stringify(componentDimensions));
        var result = {
        };
        for(var dimensionHashedUrl in componentDimensions) {
            result[dimensionHashedUrl] = componentDimensions[dimensionHashedUrl];
            result[dimensionHashedUrl]["elements"] = [
                result[dimensionHashedUrl].elements[0]
            ];
        }
        return result;
    }
    return DataCube_Component;
})();
var CubeViz_ConfigurationLink = (function () {
    function CubeViz_ConfigurationLink() { }
    CubeViz_ConfigurationLink.saveToServerFile = function saveToServerFile(cubeVizLinksModule, cubeVizUIChartConfig, callback) {
        $.ajaxSetup({
            "async": true,
            "cache": false,
            "type": "POST"
        });
        $.support.cors = true;
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "savelinktofile/",
            data: {
                "cubeVizLinksModule": cubeVizLinksModule,
                "cubeVizUIChartConfig": cubeVizUIChartConfig
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            console.log("ConfigurationLink > loadAll > error");
            console.log("response text: " + xhr.responseText);
            console.log("error: " + thrownError);
        }).done(function (result) {
            callback(JSON.parse(result));
        });
    }
    return CubeViz_ConfigurationLink;
})();
var View_Abstract = (function () {
    function View_Abstract(attachedTo) {
        this.autostart = false;
        this.attachedTo = attachedTo;
        this.id = "View_Abstract";
        this.viewManager = null;
        this.viewInstance = {
        };
        this.backboneViewContainer = null;
        this.backboneViewInstance = null;
    }
    View_Abstract.prototype.getId = function () {
        return this.id;
    };
    View_Abstract.prototype.render = function () {
    };
    View_Abstract.prototype.setViewManager = function (viewManager) {
        this.viewManager = viewManager;
    };
    return View_Abstract;
})();
var View_Manager = (function () {
    function View_Manager() {
        this._allViews = [];
        this._allViews = [];
    }
    View_Manager.prototype.add = function (view, autostart) {
        view.autostart = true == autostart ? true : false;
        view.setViewManager(this);
        if(false == this.get(view.id)) {
            this._allViews.push(view);
        } else {
            this.remove(view.id);
            this._allViews.push(view);
        }
    };
    View_Manager.prototype.get = function (id) {
        var view = null;
        for(var i = 0; i < this._allViews.length; ++i) {
            view = this._allViews[i];
            if(id == view.id) {
                return view;
            }
        }
        return false;
    };
    View_Manager.prototype.callView = function (id) {
        if(false != this.get(id)) {
            eval("this.add(new " + id + "(\"" + this.get(id).attachedTo + "\"));");
            this.get(id).render();
        }
    };
    View_Manager.prototype.remove = function (id) {
        var view = null;
        for(var i = 0; i < this._allViews.length; ++i) {
            view = this._allViews[i];
            if(id == view.id) {
                delete this._allViews[i];
                this._allViews.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    View_Manager.prototype.render = function () {
        var view = null;
        for(var i = 0; i < this._allViews.length; ++i) {
            view = this._allViews[i];
            if(true == view.autostart) {
                view.render();
            }
        }
    };
    return View_Manager;
})();
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var View_CubeVizModule_DataStructureDefintion = (function (_super) {
    __extends(View_CubeVizModule_DataStructureDefintion, _super);
    function View_CubeVizModule_DataStructureDefintion(attachedTo) {
        _super.call(this, attachedTo);
        this.id = "View_CubeVizModule_DataStructureDefintion";
    }
    View_CubeVizModule_DataStructureDefintion.prototype.onChange_list = function (event) {
        var selectedElementId = $("#cubeviz-dataStructureDefinition-list").val();
        var selectedElement = this["collection"].get(selectedElementId);
        var thisView = this["thisView"];

        thisView.setSelectedDSD([
            selectedElement.attributes
        ]);
        thisView.viewManager.callView("View_CubeVizModule_DataSet");
    };
    View_CubeVizModule_DataStructureDefintion.prototype.render = function () {
        var List = Backbone.Collection.extend({
        });
        var thisView = this;
        this.viewInstance = {
            el: $(this.attachedTo),
            events: {
                "change #cubeviz-dataStructureDefinition-list": "onChange_list"
            },
            onChange_list: this.onChange_list,
            initialize: function () {
                var self = this;
                self.thisView = thisView;
                _.bindAll(this, "render", "onChange_list");
                this.collection = new List();
                DataCube_DataStructureDefinition.loadAll(function (entries) {
                    thisView.setSelectedDSD(entries);
                    thisView.viewManager.callView("View_CubeVizModule_DataSet");
                    $(entries).each(function (i, element) {
                        element["id"] = element["hashedUrl"];
                        self.collection.add(element);
                    });
                    self.render();
                });
            },
            render: function () {
                var listTpl = $("#cubeviz-dataStructureDefinition-tpl-list").text();
                $(this.el).append(listTpl);
                var list = $("#cubeviz-dataStructureDefinition-list");
                var optionTpl = _.template($("#cubeviz-dataStructureDefinition-tpl-listOption").text());

                $(this.collection.models).each(function (i, element) {
                    element.attributes["selected"] = element.attributes["url"] == CubeViz_Links_Module.selectedDSD.url ? " selected" : "";
                    list.append(optionTpl(element.attributes));
                });
                return this;
            }
        };
        var bv = Backbone.View.extend(this.viewInstance);
        this.backboneViewContainer = bv;
        this.backboneViewInstance = new bv();
    };
    View_CubeVizModule_DataStructureDefintion.prototype.setSelectedDSD = function (entries) {
        if(0 == entries.length) {
            CubeViz_Links_Module.selectedDSD = {
            };
            console.log("onComplete_LoadDataStructureDefinitions");
            console.log("no data structure definitions were loaded");
        } else {
            CubeViz_Links_Module.selectedDSD = entries[0];
        }
    };
    return View_CubeVizModule_DataStructureDefintion;
})(View_Abstract);
var View_CubeVizModule_DataSet = (function (_super) {
    __extends(View_CubeVizModule_DataSet, _super);
    function View_CubeVizModule_DataSet(attachedTo) {
        _super.call(this, attachedTo);
        this.id = "View_CubeVizModule_DataSet";
    }
    View_CubeVizModule_DataSet.prototype.onChange_list = function () {
        var selectedElementId = $("#cubeviz-dataSet-list").val();
        var selectedElement = this["collection"].get(selectedElementId);
        var thisView = this["thisView"];

        thisView.setSelectedDS([
            selectedElement.attributes
        ]);
        thisView.viewManager.callView("View_CubeVizModule_Component");
    };
    View_CubeVizModule_DataSet.prototype.render = function () {
        var List = Backbone.Collection.extend({
        });
        var thisView = this;
        this.viewInstance = {
            el: $(this.attachedTo),
            events: {
                "change #cubeviz-dataSet-list": "onChange_list"
            },
            onChange_list: this.onChange_list,
            initialize: function () {
                var self = this;
                self.thisView = thisView;
                _.bindAll(this, "render", "onChange_list");
                this.collection = new List();
                DataCube_DataSet.loadAll(CubeViz_Links_Module.selectedDSD.url, function (entries) {
                    thisView.setSelectedDS(entries);
                    thisView.viewManager.callView("View_CubeVizModule_Component");
                    $(entries).each(function (i, element) {
                        element["id"] = element["hashedUrl"];
                        self.collection.add(element);
                    });
                    self.render();
                });
            },
            render: function () {
                $("#cubeviz-dataSet-list").remove();
                var listTpl = $("#cubeviz-dataSet-tpl-list").text();
                $(this.el).append(listTpl);
                var list = $("#cubeviz-dataSet-list");
                var optionTpl = _.template($("#cubeviz-dataSet-tpl-listOption").text());

                $(this.collection.models).each(function (i, element) {
                    element.attributes["selected"] = element.attributes["url"] == CubeViz_Links_Module.selectedDSD.url ? " selected" : "";
                    list.append(optionTpl(element.attributes));
                });
                return this;
            }
        };
        var bv = Backbone.View.extend(this.viewInstance);
        this.backboneViewContainer = bv;
        this.backboneViewInstance = new bv();
    };
    View_CubeVizModule_DataSet.prototype.setSelectedDS = function (entries) {
        if(0 == entries.length) {
            CubeViz_Links_Module.selectedDS = {
            };
            console.log("onComplete_LoadDataSets");
            console.log("no data sets were loaded");
        } else {
            CubeViz_Links_Module.selectedDS = entries[0];
        }
    };
    return View_CubeVizModule_DataSet;
})(View_Abstract);
var View_CubeVizModule_Component = (function (_super) {
    __extends(View_CubeVizModule_Component, _super);
    function View_CubeVizModule_Component(attachedTo) {
        _super.call(this, attachedTo);
        this.id = "View_CubeVizModule_Component";
    }
    View_CubeVizModule_Component.prototype.regenerateLinkCode = function () {
        CubeViz_Links_Module.linkCode = null;
        CubeViz_ConfigurationLink.saveToServerFile(CubeViz_Links_Module, CubeViz_UI_ChartConfig, function (newLinkCode) {
            CubeViz_Links_Module.linkCode = newLinkCode;
        });
    };
    View_CubeVizModule_Component.prototype.render = function () {
        var List = Backbone.Collection.extend({
        });
        var thisView = this;
        this.viewInstance = {
            el: $(this.attachedTo),
            events: {
            },
            initialize: function () {
                var self = this;
                _.bindAll(this, "render");
                this.collection = new List();
                DataCube_Component.loadAllDimensions(CubeViz_Links_Module.selectedDSD.url, CubeViz_Links_Module.selectedDS.url, function (entries) {
                    thisView.setComponentsStuff(entries);
                    var keys = _.keys(entries);
                    for(var i = 0; i < keys.length; ++i) {
                        entries[keys[i]]["id"] = entries[keys[i]]["hashedUrl"];
                        self.collection.add(entries[keys[i]]);
                    }
                    ; ;
                    self.render();
                });
            },
            render: function () {
                var dimension = null;
                var list = $("#cubviz-component-listBox");
                var optionTpl = _.template($("#cubeviz-component-tpl-listBoxItem").text());
                var tmp = null;

                list.empty();
                $(this.collection.models).each(function (i, d) {
                    dimension = d.attributes;
                    if(undefined != CubeViz_Links_Module.selectedComponents.dimensions) {
                        tmp = CubeViz_Links_Module.selectedComponents.dimensions[dimension["hashedUrl"]];
                        dimension["selectedElementCount"] = 0 < _.keys(tmp["elements"]).length ? _.keys(tmp["elements"]).length : 1;
                    } else {
                        dimension["selectedElementCount"] = 1;
                    }
                    dimension["elementCount"] = dimension.elements.length;
                    list.append(optionTpl(dimension));
                });
                return this;
            }
        };
        var bv = Backbone.View.extend(this.viewInstance);
        this.backboneViewContainer = bv;
        this.backboneViewInstance = new bv();
    };
    View_CubeVizModule_Component.prototype.setComponentsStuff = function (entries) {
        CubeViz_Links_Module.components.dimensions = entries;
        CubeViz_Links_Module.selectedComponents.dimensions = DataCube_Component.getDefaultSelectedDimensions(entries);
        this.regenerateLinkCode();
    };
    return View_CubeVizModule_Component;
})(View_Abstract);
