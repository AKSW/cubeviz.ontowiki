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
            $(list).each(function (i, element) {
                self.add(element);
            });
        } else {
            if(true == _.isObject(list)) {
                this.addList(_.values(list));
            }
        }
        return self;
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
            return element[self.idKey] === id;
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
        this.el = $(attachedTo);
        this.id = "view" || id;
        this.collection = new CubeViz_Collection();
        this.viewManager = viewManager;
        this.initialize();
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
    View_Abstract.prototype.initialize = function () {
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
    }
    View_CubeVizModule_DataStructureDefintion.prototype.initialize = function () {
        var self = this;
        DataCube_DataStructureDefinition.loadAll(function (entries) {
            self.setSelectedDSD(entries);
            self.collection.reset("hashedUrl").addList(entries);
            self.render();
            self.viewManager.renderView("View_CubeVizModule_DataSet");
        });
    };
    View_CubeVizModule_DataStructureDefintion.prototype.onChange_list = function (event) {
        var selectedElementId = $("#cubeviz-dataStructureDefinition-list").val();
        var selectedElement = this.collection.get(selectedElementId);

        this.setSelectedDSD([
            selectedElement
        ]);
        this.viewManager.renderView("View_CubeVizModule_DataSet");
    };
    View_CubeVizModule_DataStructureDefintion.prototype.onClick_questionmark = function () {
        $("#cubeviz-dataStructureDefinition-dialog").dialog("open");
    };
    View_CubeVizModule_DataStructureDefintion.prototype.render = function () {
        var listTpl = $("#cubeviz-dataStructureDefinition-tpl-list").text();
        this.el.append(listTpl);
        var list = $("#cubeviz-dataStructureDefinition-list");
        var optionTpl = _.template($("#cubeviz-dataStructureDefinition-tpl-listOption").text());

        $(this.collection._).each(function (i, element) {
            element["selected"] = element["url"] == CubeViz_Links_Module.selectedDSD.url ? " selected" : "";
            list.append(optionTpl(element));
        });
        $("#cubeviz-dataStructureDefinition-dialog").dialog({
            "autoOpen": false,
            "draggable": false,
            "hide": "slow",
            "show": "slow"
        });
        this.delegateEvents({
            "change #cubeviz-dataStructureDefinition-list": this.onChange_list,
            "click #cubeviz-dataStructureDefinition-questionMark": this.onClick_questionmark
        });
        return this;
    };
    View_CubeVizModule_DataStructureDefintion.prototype.setSelectedDSD = function (entries) {
        if(0 == entries.length || undefined === entries) {
            CubeViz_Links_Module.selectedDSD = {
            };
            throw new Error("View_CubeVizModule_DataStructureDefinition: No dsd's were loaded!");
        } else {
            CubeViz_Links_Module.selectedDSD = entries[0];
        }
    };
    return View_CubeVizModule_DataStructureDefintion;
})(View_Abstract);
var View_CubeVizModule_DataSet = (function (_super) {
    __extends(View_CubeVizModule_DataSet, _super);
    function View_CubeVizModule_DataSet(attachedTo, viewManager) {
        _super.call(this, "View_CubeVizModule_DataSet", attachedTo, viewManager);
    }
    View_CubeVizModule_DataSet.prototype.initialize = function () {
        var self = this;
        DataCube_DataSet.loadAll(CubeViz_Links_Module.selectedDSD.url, function (entries) {
            self.setSelectedDS(entries);
            self.collection.reset("hashedUrl");
            self.collection.addList(entries);
            self.render();
            self.viewManager.renderView("View_CubeVizModule_Component");
        });
    };
    View_CubeVizModule_DataSet.prototype.onChange_list = function () {
        var selectedElementId = $("#cubeviz-dataSet-list").val();
        var selectedElement = this["collection"].get(selectedElementId);

        this.setSelectedDS([
            selectedElement
        ]);
        this.viewManager.renderView("View_CubeVizModule_Component");
    };
    View_CubeVizModule_DataSet.prototype.onClick_questionmark = function () {
        $("#cubeviz-dataSet-dialog").dialog("open");
    };
    View_CubeVizModule_DataSet.prototype.render = function () {
        $("#cubeviz-dataSet-list").remove();
        var listTpl = $("#cubeviz-dataSet-tpl-list").text();
        this.el.append(listTpl);
        var list = $("#cubeviz-dataSet-list");
        var optionTpl = _.template($("#cubeviz-dataSet-tpl-listOption").text());

        $(this.collection._).each(function (i, element) {
            element["selected"] = element["url"] == CubeViz_Links_Module.selectedDSD.url ? " selected" : "";
            list.append(optionTpl(element));
        });
        $("#cubeviz-dataSet-dialog").dialog({
            "autoOpen": false,
            "draggable": false,
            "hide": "slow",
            "show": "slow"
        });
        this.delegateEvents({
            "change #cubeviz-dataSet-list": this.onChange_list,
            "click #cubeviz-dataSet-questionMark": this.onClick_questionmark
        });
        return this;
    };
    View_CubeVizModule_DataSet.prototype.setSelectedDS = function (entries) {
        if(0 === entries.length || undefined === entries) {
            CubeViz_Links_Module.selectedDS = {
            };
            throw new Error("View_CubeVizModule_DataSet: No data sets were loaded!");
        } else {
            CubeViz_Links_Module.selectedDS = entries[0];
        }
    };
    return View_CubeVizModule_DataSet;
})(View_Abstract);
var View_CubeVizModule_Component = (function (_super) {
    __extends(View_CubeVizModule_Component, _super);
    function View_CubeVizModule_Component(attachedTo, viewManager) {
        _super.call(this, "View_CubeVizModule_Component", attachedTo, viewManager);
    }
    View_CubeVizModule_Component.prototype.configureSetupComponentDialog = function () {
        var backupCollection = this.collection._;
        var dialogTpl = _.template($("#cubeviz-component-tpl-setupComponentDialog").text());
        var hashedUrl = "";
        var self = this;

        this.collection.reset();
        $(backupCollection).each(function (i, component) {
            hashedUrl = component["hashedUrl"];
            $("#cubeviz-component-setupDialogContainer").append(dialogTpl({
                label: "Foo",
                hashedUrl: hashedUrl
            }));
            component["dialogReference"] = $("#cubeviz-component-setupComponentDialog-" + hashedUrl);
            component["dialogReference"].dialog({
                "autoOpen": false,
                "draggable": false,
                "height": 500,
                "hide": "slow",
                "show": "slow",
                "width": 700
            }).attr("hashedUrl", hashedUrl);
            self.configureSetupComponentElements(component);
            self.collection.add(component);
        });
    };
    View_CubeVizModule_Component.prototype.configureSetupComponentElements = function (component) {
        var dialogDiv = $("#cubeviz-component-setupComponentDialog-" + component.hashedUrl);
        var elementList = $(dialogDiv.find(".cubeviz-component-setupComponentElements")[0]);
        var elementTpl = _.template($("#cubeviz-component-tpl-setupComponentElement").text());

        $(component.elements).each(function (i, element) {
            elementList.append(elementTpl(element));
        });
    };
    View_CubeVizModule_Component.prototype.initialize = function () {
        var self = this;
        DataCube_Component.loadAllDimensions(CubeViz_Links_Module.selectedDSD.url, CubeViz_Links_Module.selectedDS.url, function (entries) {
            self.setComponentsStuff(entries);
            self.collection.reset("hashedUrl").addList(entries);
            self.render();
        });
    };
    View_CubeVizModule_Component.prototype.onClick_setupComponentOpener = function (event) {
        var component = this.collection.get($(event.target).attr("hashedUrl"));
        component.dialogReference.dialog("open");
    };
    View_CubeVizModule_Component.prototype.onClick_questionmark = function () {
        $("#cubeviz-component-questionMarkDialog").dialog("open");
    };
    View_CubeVizModule_Component.prototype.render = function () {
        var list = $("#cubviz-component-listBox");
        var optionTpl = _.template($("#cubeviz-component-tpl-listBoxItem").text());
        var selectedComponentDimensions = CubeViz_Links_Module.selectedComponents.dimensions;
        var selectedDimension = null;
        var tmp = null;

        list.empty();
        $(this.collection._).each(function (i, dimension) {
            if(undefined !== selectedComponentDimensions) {
                selectedDimension = selectedComponentDimensions[dimension["hashedUrl"]];
                dimension["selectedElementCount"] = _.keys(selectedDimension["elements"]).length;
            } else {
                dimension["selectedElementCount"] = 1;
            }
            dimension["elementCount"] = _.size(dimension["elements"]);
            list.append(optionTpl(dimension));
        });
        $("#cubeviz-component-questionMarkDialog").dialog({
            "autoOpen": false,
            "draggable": false,
            "hide": "slow",
            "show": "slow"
        });
        this.configureSetupComponentDialog();
        this.delegateEvents({
            "click .cubeviz-component-setupComponentOpener": this.onClick_setupComponentOpener,
            "click #cubeviz-component-questionMark": this.onClick_questionmark
        });
        return this;
    };
    View_CubeVizModule_Component.prototype.setComponentsStuff = function (entries) {
        CubeViz_Links_Module.components.dimensions = entries;
        CubeViz_Links_Module.selectedComponents.dimensions = DataCube_Component.getDefaultSelectedDimensions(entries);
    };
    return View_CubeVizModule_Component;
})(View_Abstract);
var View_CubeVizModule_Footer = (function (_super) {
    __extends(View_CubeVizModule_Footer, _super);
    function View_CubeVizModule_Footer(attachedTo, viewManager) {
        _super.call(this, "View_CubeVizModule_Footer", attachedTo, viewManager);
    }
    View_CubeVizModule_Footer.prototype.changePermaLinkButton = function () {
        var value = "";
        if(undefined == this.collection.get("buttonVal")) {
            this.collection.add({
                id: "buttonVal",
                value: $("#cubeviz-footer-permaLinkButton").attr("value").toString()
            });
            this.showLink(">>");
        } else {
            value = this.collection.get("buttonVal").value;
            this.collection.remove("buttonVal");
            this.closeLink(value);
        }
    };
    View_CubeVizModule_Footer.prototype.closeLink = function (label) {
        $("#cubeviz-footer-permaLinkMenu").fadeOut(450, function () {
            $("#cubeviz-footer-permaLinkButton").animate({
                width: 75
            }, 450).attr("value", label);
        });
    };
    View_CubeVizModule_Footer.prototype.initialize = function () {
        var self = this;
        this.render();
    };
    View_CubeVizModule_Footer.prototype.onClick_permaLinkButton = function () {
        var self = this;
        CubeViz_Links_Module.linkCode = null;
        CubeViz_ConfigurationLink.saveToServerFile(CubeViz_Links_Module, CubeViz_UI_ChartConfig, function (newLinkCode) {
            CubeViz_Links_Module.linkCode = newLinkCode;
            self.changePermaLinkButton();
        });
    };
    View_CubeVizModule_Footer.prototype.render = function () {
        this.delegateEvents({
            "click #cubeviz-footer-permaLinkButton": this.onClick_permaLinkButton
        });
        return this;
    };
    View_CubeVizModule_Footer.prototype.showLink = function (label) {
        $("#cubeviz-footer-permaLinkButton").attr("value", label).animate({
            width: 31
        }, 450, "linear", function () {
            var position = $("#cubeviz-footer-permaLinkButton").position();
            $("#cubeviz-footer-permaLinkMenu").css("top", position.top + 2).css("left", position.left + 32);
            var link = CubeViz_Links_Module.cubevizPath + "?m=" + encodeURIComponent(CubeViz_Links_Module.modelUrl) + "&lC=" + CubeViz_Links_Module.linkCode;
            var url = $("<a></a>").attr("href", link).attr("target", "_self").html($("#cubeviz-footer-permaLink").html());
            $("#cubeviz-footer-permaLinkMenu").animate({
                width: 'toggle'
            }, 450);
            $("#cubeviz-footer-permaLink").show().html(url);
        });
    };
    return View_CubeVizModule_Footer;
})(View_Abstract);
