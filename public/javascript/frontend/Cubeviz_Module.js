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
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var View_Abstract = (function (_super) {
    __extends(View_Abstract, _super);
    function View_Abstract(attachedTo, viewManager) {
        _super.call(this);
        this.attachedTo = attachedTo;
        this.autostart = false;
        this["el"] = $(attachedTo);
        this.id = "View_Abstract";
        this.collection = new Backbone.Collection();
        this.viewManager = viewManager;
    }
    return View_Abstract;
})(Backbone.View);
var View_Manager = (function () {
    function View_Manager() {
        this._allViews = [];
        this._allViews = [];
    }
    View_Manager.prototype.add = function (id, attachedTo, autostart) {
        autostart = true == autostart ? true : false;
        if(false !== this.get(id)) {
            this.remove(id);
        }
        this._allViews.push({
            id: id,
            attachedTo: attachedTo,
            autostart: autostart
        });
        return this;
    };
    View_Manager.prototype.get = function (id) {
        for(var i = 0; i < this._allViews.length; ++i) {
            if(id == this._allViews[i].id) {
                return this._allViews[i];
            }
        }
        return false;
    };
    View_Manager.prototype.renderView = function (id) {
        if(false != this.get(id)) {
            eval("new " + id + "(\"" + this.get(id).attachedTo + "\", this);");
        }
    };
    View_Manager.prototype.remove = function (id) {
        for(var i = 0; i < this._allViews.length; ++i) {
            if(id == this._allViews[i].id) {
                delete this._allViews[i];
                this._allViews.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    View_Manager.prototype.render = function () {
        for(var i = 0; i < this._allViews.length; ++i) {
            if(true == this._allViews[i].autostart) {
                this.renderView(this._allViews[i].id);
            }
        }
    };
    return View_Manager;
})();
var View_CubeVizModule_DataStructureDefintion = (function (_super) {
    __extends(View_CubeVizModule_DataStructureDefintion, _super);
    function View_CubeVizModule_DataStructureDefintion(attachedTo, viewManager) {
        _super.call(this, attachedTo, viewManager);
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
    View_CubeVizModule_DataStructureDefintion.prototype.initialize = function () {
        var self = this;
        _.bindAll(this, "render", "onChange_list");
        DataCube_DataStructureDefinition.loadAll(function (entries) {
            self.setSelectedDSD(entries);
            $(entries).each(function (i, element) {
                element["id"] = element["hashedUrl"];
                self.collection.add(element);
            });
            self.render();
            self.viewManager.renderView("View_CubeVizModule_DataSet");
        });
    };
    View_CubeVizModule_DataStructureDefintion.prototype.render = function () {
        console.log("render");
        var listTpl = $("#cubeviz-dataStructureDefinition-tpl-list").text();
        this["el"].append(listTpl);
        var list = $("#cubeviz-dataStructureDefinition-list");
        var optionTpl = _.template($("#cubeviz-dataStructureDefinition-tpl-listOption").text());

        $(this.collection.models).each(function (i, element) {
            element.attributes["selected"] = element.attributes["url"] == CubeViz_Links_Module.selectedDSD.url ? " selected" : "";
            list.append(optionTpl(element.attributes));
        });
        return this;
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
    function View_CubeVizModule_DataSet(attachedTo, viewManager) {
        _super.call(this, attachedTo, viewManager);
        this.id = "View_CubeVizModule_DataSet";
    }
    View_CubeVizModule_DataSet.prototype.initialize = function () {
        var self = this;
        _.bindAll(this, "render", "onChange_list");
        DataCube_DataSet.loadAll(CubeViz_Links_Module.selectedDSD.url, function (entries) {
            self.setSelectedDS(entries);
            $(entries).each(function (i, element) {
                element["id"] = element["hashedUrl"];
                self.collection.add(element);
            });
            self.render();
        });
    };
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
        $("#cubeviz-dataSet-list").remove();
        var listTpl = $("#cubeviz-dataSet-tpl-list").text();
        this["el"].append(listTpl);
        var list = $("#cubeviz-dataSet-list");
        var optionTpl = _.template($("#cubeviz-dataSet-tpl-listOption").text());

        $(this.collection.models).each(function (i, element) {
            element.attributes["selected"] = element.attributes["url"] == CubeViz_Links_Module.selectedDSD.url ? " selected" : "";
            list.append(optionTpl(element.attributes));
        });
        return this;
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
