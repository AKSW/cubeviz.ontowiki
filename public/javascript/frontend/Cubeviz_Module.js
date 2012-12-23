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
var CubeViz_Collection = (function () {
    function CubeViz_Collection(idKey) {
        this.reset(idKey);
    }
    CubeViz_Collection.prototype.add = function (element, option) {
        if(undefined === this.get(element[this.idKey])) {
            this._.push(element);
            return true;
        } else {
            if((undefined !== option && undefined !== option["merge"] && option["merge"] == true)) {
                this.remove(element[this.idKey]);
                this._.push(element);
            }
        }
        return false;
    };
    CubeViz_Collection.prototype.addList = function (list) {
        var self = this;
        $(list).each(function (i, element) {
            self.add(element);
        });
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
        this._ = _.reject(this._, function (element) {
            return element[this.idKey] === id;
        });
    };
    CubeViz_Collection.prototype.reset = function (idKey) {
        this.idKey = undefined === idKey ? "id" : idKey;
        this._ = [];
    };
    CubeViz_Collection.prototype.size = function () {
        return _.size(this._);
    };
    return CubeViz_Collection;
})();
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
var View_Abstract = (function () {
    function View_Abstract(id, attachedTo, viewManager) {
        this.attachedTo = attachedTo;
        this.autostart = false;
        this["el"] = $(attachedTo);
        this.id = "view" || id;
        this.collection = new CubeViz_Collection();
        this.viewManager = viewManager;
    }
    View_Abstract.prototype.delegateEvents = function (events) {
        if(undefined == events) {
            return;
        }
        for(var key in events) {
            var method = events[key];
            if(!_.isFunction(method)) {
                method = this[events[key]];
            }
            if(!method) {
                throw new Error('Method "' + events[key] + '" does not exist');
            }
            var eventName = key.substr(0, key.indexOf(" "));
            var selector = key.substr(key.indexOf(" ") + 1);
            $(selector).on(eventName, $.proxy(method, this));
        }
    };
    return View_Abstract;
})();
var View_Manager = (function () {
    function View_Manager() {
        this._allViews = new CubeViz_Collection();
    }
    View_Manager.prototype.add = function (id, attachedTo, autostart) {
        autostart = true == autostart ? true : false;
        this._allViews.add({
            id: id,
            attachedTo: attachedTo,
            autostart: autostart
        });
        return this;
    };
    View_Manager.prototype.get = function (id) {
        return this._allViews.get(id);
    };
    View_Manager.prototype.renderView = function (id) {
        var view = this.get(id);
        if(undefined !== view) {
            eval("new " + id + "(\"" + view.attachedTo + "\", this);");
        }
        return this;
    };
    View_Manager.prototype.remove = function (id) {
        this._allViews.remove(id);
        return this;
    };
    View_Manager.prototype.render = function () {
        var self = this;
        $(this._allViews._).each(function (i, view) {
            if(true == view["autostart"]) {
                self.renderView(view["id"]);
            }
        });
        return this;
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
    function View_CubeVizModule_DataStructureDefintion(attachedTo, viewManager) {
        _super.call(this, "View_CubeVizModule_DataStructureDefintion", attachedTo, viewManager);
        this.initialize();
    }
    View_CubeVizModule_DataStructureDefintion.prototype.onChange_list = function (event) {
        console.log("change");
        var selectedElementId = $("#cubeviz-dataStructureDefinition-list").val();
        var selectedElement = this.collection.get(selectedElementId);

        this.setSelectedDSD([
            selectedElement
        ]);
    };
    View_CubeVizModule_DataStructureDefintion.prototype.initialize = function () {
        var self = this;
        DataCube_DataStructureDefinition.loadAll(function (entries) {
            self.setSelectedDSD(entries);
            self.collection.reset("hashedUrl");
            self.collection.addList(entries);
            console.log(self.collection._);
            self.render();
        });
    };
    View_CubeVizModule_DataStructureDefintion.prototype.render = function () {
        var listTpl = $("#cubeviz-dataStructureDefinition-tpl-list").text();
        this["el"].append(listTpl);
        var list = $("#cubeviz-dataStructureDefinition-list");
        var optionTpl = _.template($("#cubeviz-dataStructureDefinition-tpl-listOption").text());

        $(this.collection._).each(function (i, element) {
            element["selected"] = element["url"] == CubeViz_Links_Module.selectedDSD.url ? " selected" : "";
            list.append(optionTpl(element));
        });
        this.delegateEvents({
            "change #cubeviz-dataStructureDefinition-list": this.onChange_list
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
