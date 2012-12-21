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
var View_Abstract = (function () {
    function View_Abstract() {
        this.autostart = false;
        this.attachedTo = "";
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
        this._allViews.push(view);
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
    View_Manager.prototype.render = function () {
        var view = null;
        console.log("Rendering autostart views... ");
        for(var i = 0; i < this._allViews.length; ++i) {
            view = this._allViews[i];
            if(true == view.autostart) {
                console.log(view);
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
var DataStructureDefintionView = (function (_super) {
    __extends(DataStructureDefintionView, _super);
    function DataStructureDefintionView() {
        _super.call(this);
        this.id = "DataStructureDefintionView";
        this.attachedTo = "#cubviz-dataStructureDefinition-container";
    }
    DataStructureDefintionView.prototype.onChange_list = function () {
    };
    DataStructureDefintionView.prototype.loadDataSets = function () {
        DataCube_DataSet.loadAll(CubeViz_Links_Module.selectedDSD.url, function (elements) {
            console.log(elements);
        });
    };
    DataStructureDefintionView.prototype.setSelectedDsd = function (entries) {
        if(0 == entries.length) {
            CubeViz_Links_Module.selectedDSD = {
            };
            console.log("onComplete_LoadDataStructureDefinitions");
            console.log("no data structure definitions were loaded");
        } else {
            if(1 <= entries.length) {
                if(undefined == CubeViz_Links_Module.selectedDSD.url) {
                    CubeViz_Links_Module.selectedDSD = entries[0];
                }
            }
        }
    };
    DataStructureDefintionView.prototype.render = function () {
        var List = Backbone.Collection.extend({
        });
        var view = this;
        this.viewInstance = {
            el: $(this.attachedTo),
            events: {
                "change #cubeviz-dataStructureDefinition-list": "onChange_list"
            },
            onChange_list: this.onChange_list,
            initialize: function () {
                var self = this;
                _.bindAll(this, "render", "onChange_list");
                this.dataStructureDefinitions = new List();
                DataCube_DataStructureDefinition.loadAll(function (entries) {
                    view.setSelectedDsd(entries);
                    view.loadDataSets();
                    $(entries).each(function (i, element) {
                        element["id"] = element["hashedUrl"];
                        self.dataStructureDefinitions.add(element);
                    });
                    self.render();
                });
            },
            render: function () {
                var listTpl = $("#cubeviz-dataStructureDefinition-listTpl").text();
                $(this.el).append(listTpl);
                var list = $("#cubeviz-dataStructureDefinition-list");
                var optionTpl = _.template($("#cubeviz-dataStructureDefinition-listOptionTpl").text());

                $(this.dataStructureDefinitions.models).each(function (i, element) {
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
    return DataStructureDefintionView;
})(View_Abstract);
