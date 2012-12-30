var CubeViz_ConfigurationLink = (function () {
    function CubeViz_ConfigurationLink() { }
    CubeViz_ConfigurationLink.saveToServerFile = function saveToServerFile(url, data, ui, callback) {
        var oldAjaxSetup = $.ajaxSetup();
        var oldSupportOrs = $.support.cors;

        $.ajaxSetup({
            "async": true,
            "cache": false,
            "type": "POST"
        });
        $.support.cors = true;
        $.ajax({
            "url": url + "savelinktofile/",
            "data": {
                "data": data,
                "ui": ui
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            $.ajaxSetup(oldAjaxSetup);
            $.support.cors = oldSupportOrs;
            throw new Error("saveToServerFile error: " + xhr["responseText"]);
        }).done(function (result) {
            $.ajaxSetup(oldAjaxSetup);
            $.support.cors = oldSupportOrs;
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
var CubeViz_View_Abstract = (function () {
    function CubeViz_View_Abstract(id, attachedTo, app) {
        this.app = app;
        this.attachedTo = attachedTo;
        this.autostart = false;
        this.el = $(attachedTo);
        this.collection = new CubeViz_Collection();
        this.id = id || "view";
        this.initialize();
    }
    CubeViz_View_Abstract.prototype.delegateEvents = function (events) {
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
    CubeViz_View_Abstract.prototype.destroy = function () {
        this.el.off();
        if(true === this.el.is("div")) {
            this.el.empty();
        } else {
            if(true === this.el.is("select")) {
                this.el.find("option").remove();
            }
        }
        this.collection.reset();
        return this;
    };
    CubeViz_View_Abstract.prototype.initialize = function () {
    };
    return CubeViz_View_Abstract;
})();
var CubeViz_View_Application = (function () {
    function CubeViz_View_Application() {
        this._allViews = new CubeViz_Collection();
        this._renderedViews = new CubeViz_Collection();
        this._ = {
        };
    }
    CubeViz_View_Application.prototype.add = function (id, attachedTo, autostart) {
        autostart = true == autostart ? true : false;
        this._allViews.add({
            id: id,
            attachedTo: attachedTo,
            autostart: autostart
        });
        return this;
    };
    CubeViz_View_Application.prototype.get = function (id) {
        return this._allViews.get(id);
    };
    CubeViz_View_Application.prototype.renderView = function (id) {
        var view = this.get(id);
        var renderedView = this._renderedViews.get(id);
        var alreadyRendered = undefined !== renderedView;

        if(true === _.isUndefined(view)) {
        } else {
            if(true === alreadyRendered) {
                renderedView.destroy();
                this._renderedViews.remove(id);
            }
            eval("this._renderedViews.add (new " + id + "(\"" + view.attachedTo + "\", this));");
        }
        return this;
    };
    CubeViz_View_Application.prototype.remove = function (id) {
        this._allViews.remove(id);
        this._renderedViews.remove(id);
        return this;
    };
    CubeViz_View_Application.prototype.render = function () {
        var self = this;
        $(this._allViews._).each(function (i, view) {
            if(true == view["autostart"]) {
                self.renderView(view["id"]);
            }
        });
        return this;
    };
    return CubeViz_View_Application;
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
            throw new Error("loadAll error: " + xhr["responseText"]);
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
    DataCube_DataSet.loadAll = function loadAll(url, modelUrl, dsdUrl, callback) {
        $.ajax({
            url: url + "getdatasets/",
            data: {
                m: modelUrl,
                dsdUrl: dsdUrl
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("loadAll error: " + xhr["responseText"]);
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
    DataCube_Component.loadAllDimensions = function loadAllDimensions(url, modelUrl, dsdUrl, dsUrl, callback) {
        $.ajax({
            url: url + "getcomponents/",
            data: {
                m: modelUrl,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "dimension"
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("loadAllDimensions error: " + xhr["responseText"]);
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
    DataCube_Component.loadAllMeasures = function loadAllMeasures(url, modelUrl, dsdUrl, dsUrl, callback) {
        $.ajax({
            url: url + "getcomponents/",
            data: {
                m: modelUrl,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "measure"
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("loadAllMeasures error: " + xhr["responseText"]);
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
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var View_CubeVizModule_DataStructureDefintion = (function (_super) {
    __extends(View_CubeVizModule_DataStructureDefintion, _super);
    function View_CubeVizModule_DataStructureDefintion(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_DataStructureDefintion", attachedTo, app);
    }
    View_CubeVizModule_DataStructureDefintion.prototype.initialize = function () {
        var self = this;
        DataCube_DataStructureDefinition.loadAll(this.app._.backend.url, this.app._.backend.modelUrl, function (entries) {
            self.setSelectedDSD(entries);
            self.collection.reset("hashedUrl").addList(entries);
            self.render();
            self.app.renderView("View_CubeVizModule_DataSet");
        });
    };
    View_CubeVizModule_DataStructureDefintion.prototype.onChange_list = function (event) {
        var selectedElementId = $("#cubeviz-dataStructureDefinition-list").val();
        var selectedElement = this.collection.get(selectedElementId);

        this.setSelectedDSD([
            selectedElement
        ]);
        this.app.renderView("View_CubeVizModule_DataSet");
    };
    View_CubeVizModule_DataStructureDefintion.prototype.onClick_questionmark = function () {
        $("#cubeviz-dataStructureDefinition-dialog").dialog("open");
    };
    View_CubeVizModule_DataStructureDefintion.prototype.render = function () {
        var list = $("#cubeviz-dataStructureDefinition-list");
        var optionTpl = _.template($("#cubeviz-dataStructureDefinition-tpl-listOption").text());
        var self = this;

        $(this.collection._).each(function (i, element) {
            element["selected"] = element["url"] == self.app._.data.selectedDSD.url ? " selected" : "";
            list.append(optionTpl(element));
        });
        $("#cubeviz-dataStructureDefinition-dialog").dialog({
            autoOpen: false,
            draggable: false,
            hide: "slow",
            modal: true,
            overlay: {
                "background-color": "#FFFFFF",
                opacity: 0.5
            },
            show: "slow"
        });
        this.delegateEvents({
            "change #cubeviz-dataStructureDefinition-list": this.onChange_list,
            "click #cubeviz-dataStructureDefinition-questionMark": this.onClick_questionmark
        });
        return this;
    };
    View_CubeVizModule_DataStructureDefintion.prototype.setSelectedDSD = function (entries) {
        if(0 == entries.length || undefined === entries) {
            this.app._.data.selectedDSD = {
            };
            throw new Error("View_CubeVizModule_DataStructureDefinition: No dsd's were loaded!");
        } else {
            this.app._.data.selectedDSD = entries[0];
        }
    };
    return View_CubeVizModule_DataStructureDefintion;
})(CubeViz_View_Abstract);
var View_CubeVizModule_DataSet = (function (_super) {
    __extends(View_CubeVizModule_DataSet, _super);
    function View_CubeVizModule_DataSet(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_DataSet", attachedTo, app);
    }
    View_CubeVizModule_DataSet.prototype.initialize = function () {
        var self = this;
        DataCube_DataSet.loadAll(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data.selectedDSD.url, function (entries) {
            self.setSelectedDS(entries);
            self.collection.reset("hashedUrl");
            self.collection.addList(entries);
            self.render();
            self.app.renderView("View_CubeVizModule_Component");
        });
    };
    View_CubeVizModule_DataSet.prototype.onChange_list = function () {
        var selectedElementId = $("#cubeviz-dataSet-list").val();
        var selectedElement = this["collection"].get(selectedElementId);

        this.setSelectedDS([
            selectedElement
        ]);
        this.app.renderView("View_CubeVizModule_Component");
    };
    View_CubeVizModule_DataSet.prototype.onClick_questionmark = function () {
        $("#cubeviz-dataSet-dialog").dialog("open");
    };
    View_CubeVizModule_DataSet.prototype.render = function () {
        var list = $("#cubeviz-dataSet-list");
        var optionTpl = _.template($("#cubeviz-dataSet-tpl-listOption").text());
        var self = this;

        $(this.collection._).each(function (i, element) {
            element["selected"] = element["url"] == self.app._.data.selectedDSD.url ? " selected" : "";
            list.append(optionTpl(element));
        });
        $("#cubeviz-dataSet-dialog").dialog({
            autoOpen: false,
            draggable: false,
            hide: "slow",
            modal: true,
            overlay: {
                "background-color": "#FFFFFF",
                opacity: 0.5
            },
            show: "slow"
        });
        this.delegateEvents({
            "change #cubeviz-dataSet-list": this.onChange_list,
            "click #cubeviz-dataSet-questionMark": this.onClick_questionmark
        });
        return this;
    };
    View_CubeVizModule_DataSet.prototype.setSelectedDS = function (entries) {
        if(0 === entries.length || undefined === entries) {
            this.app._.data.selectedDS = {
            };
            throw new Error("View_CubeVizModule_DataSet: No data sets were loaded!");
        } else {
            this.app._.data.selectedDS = entries[0];
        }
    };
    return View_CubeVizModule_DataSet;
})(CubeViz_View_Abstract);
var View_CubeVizModule_Component = (function (_super) {
    __extends(View_CubeVizModule_Component, _super);
    function View_CubeVizModule_Component(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_Component", attachedTo, app);
    }
    View_CubeVizModule_Component.prototype.configureSetupComponentDialog = function (component, componentBox, opener) {
        var dialogTpl = _.template($("#cubeviz-component-tpl-setupComponentDialog").text());
        var self = this;

        $("#cubeviz-component-setupDialogContainer").append(dialogTpl({
            label: component.label,
            hashedUrl: component.hashedUrl
        }));
        var div = $("#cubeviz-component-setupComponentDialog-" + component.hashedUrl);
        div.data("componentBox", componentBox).data("hashedUrl", component.hashedUrl).dialog({
            autoOpen: false,
            closeOnEscape: false,
            draggable: false,
            height: 485,
            hide: "slow",
            modal: true,
            open: function (event, ui) {
                $(".ui-dialog-titlebar-close", $(this).parent()).hide();
            },
            overlay: {
                "background-color": "#FFFFFF",
                opacity: 0.5
            },
            show: "slow",
            width: 700
        });
        $(div.find(".cubeviz-component-setupComponentDeselectButton").get(0)).data("dialogDiv", div);
        opener.data("dialogDiv", div);
        $($(div.children().last()).children().get(0)).data("dialogDiv", div);
        $($(div.children().last()).children().get(1)).data("dialogDiv", div);
        this.configureSetupComponentElements(component);
    };
    View_CubeVizModule_Component.prototype.configureSetupComponentElements = function (component) {
        var dialogDiv = $("#cubeviz-component-setupComponentDialog-" + component.hashedUrl);
        var elementList = $(dialogDiv.find(".cubeviz-component-setupComponentElements")[0]);
        var elementTpl = _.template($("#cubeviz-component-tpl-setupComponentElement").text());
        var selectedDimensions = this.app._.data.selectedComponents.dimensions[component.hashedUrl].elements;
        var setElementChecked = null;

        component.elements.sort(function (a, b) {
            return a.propertyLabel.toUpperCase().localeCompare(b.propertyLabel.toUpperCase());
        });
        $(component.elements).each(function (i, element) {
            setElementChecked = undefined !== _.find(selectedDimensions, function (dim) {
                return dim.property == element["property"];
            });
            if(true === setElementChecked) {
                element["checked"] = " checked=\"checked\"";
            } else {
                element["checked"] = "";
            }
            elementList.append(elementTpl(element));
        });
    };
    View_CubeVizModule_Component.prototype.destroy = function () {
        $(this.collection._).each(function (i, c) {
            $("#cubeviz-component-setupComponentDialog-" + c["hashedUrl"]).dialog("destroy");
            $("#cubeviz-component-setupComponentDialog-" + c["hashedUrl"]).remove();
        });
        $("#cubeviz-component-setupDialogContainer").empty();
        _super.prototype.destroy.call(this);
        $("#cubeviz-component-questionMarkDialog").dialog("destroy");
        return this;
    };
    View_CubeVizModule_Component.prototype.initialize = function () {
        var self = this;
        DataCube_Component.loadAllDimensions(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data.selectedDSD.url, this.app._.data.selectedDS.url, function (entries) {
            self.setComponentsStuff(entries);
            self.collection.reset("hashedUrl").addList(entries);
            self.render();
        });
    };
    View_CubeVizModule_Component.prototype.onClose_setupComponentDialog = function (event) {
        var dialogDiv = $(event.target);
        var elementList = dialogDiv.find(".cubeviz-component-setupComponentElements").children();
        var componentBox = dialogDiv.data("componentBox");
        var hashedUrl = dialogDiv.data("hashedUrl");
        var input = null;
        var inputLabel = null;
        var selectedElements = [];

        if(undefined === hashedUrl) {
            return;
        }
        $(elementList).each(function (i, element) {
            input = $($(element).children().get(0));
            inputLabel = $($(element).children().get(1));
            if("checked" === input.attr("checked")) {
                selectedElements.push({
                    hashedProperty: input.attr("name"),
                    property: input.val(),
                    propertyLabel: inputLabel.html()
                });
            }
        });
        if(0 == _.size(selectedElements)) {
            selectedElements = [];
            selectedElements.push(JSON.parse(JSON.stringify(this.app._.data.components.dimensions[hashedUrl].elements[0])));
            $($(dialogDiv.find(".cubeviz-component-setupComponentElements").children().get(0)).children().get(0)).attr("checked", true);
        }
        this.app._.data.selectedComponents.dimensions[hashedUrl].elements = selectedElements;
        $(componentBox.find(".cubeviz-component-selectedCount").get(0)).html(selectedElements.length);
    };
    View_CubeVizModule_Component.prototype.onClick_closeAndApply = function (event) {
        $(event.target).data("dialogDiv").dialog("close");
    };
    View_CubeVizModule_Component.prototype.onClick_closeAndUpdate = function (event) {
        $(event.target).data("dialogDiv").dialog("close");
    };
    View_CubeVizModule_Component.prototype.onClick_deselectedAllComponentElements = function (event) {
        $(event.target).data("dialogDiv").find("[type=\"checkbox\"]").attr("checked", false);
    };
    View_CubeVizModule_Component.prototype.onClick_setupComponentOpener = function (event) {
        $(event.target).data("dialogDiv").dialog("open");
    };
    View_CubeVizModule_Component.prototype.onClick_questionmark = function () {
        $("#cubeviz-component-questionMarkDialog").dialog("open");
    };
    View_CubeVizModule_Component.prototype.render = function () {
        var backendCollection = this.collection._;
        var list = $("#cubviz-component-listBox");
        var componentBox = null;
        var optionTpl = _.template($("#cubeviz-component-tpl-listBoxItem").text());
        var selectedComponentDimensions = this.app._.data.selectedComponents.dimensions;
        var selectedDimension = null;
        var self = this;
        var tmp = null;

        this.collection.reset();
        $(backendCollection).each(function (i, dimension) {
            if(undefined !== selectedComponentDimensions) {
                selectedDimension = selectedComponentDimensions[dimension["hashedUrl"]];
                dimension["selectedElementCount"] = _.keys(selectedDimension["elements"]).length;
            } else {
                dimension["selectedElementCount"] = 1;
            }
            dimension["elementCount"] = _.size(dimension["elements"]);
            componentBox = $(optionTpl(dimension));
            $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0)).data("hashedUrl", dimension["hashedUrl"]);
            list.append(componentBox);
            self.configureSetupComponentDialog(dimension, componentBox, $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0)));
            self.collection.add(dimension);
        });
        $("#cubeviz-component-questionMarkDialog").dialog({
            autoOpen: false,
            draggable: false,
            hide: "slow",
            modal: true,
            overlay: {
                "background-color": "#FFFFFF",
                opacity: 0.5
            },
            show: "slow"
        });
        this.delegateEvents({
            "click .cubeviz-component-closeAndApply": this.onClick_closeAndApply,
            "click .cubeviz-component-closeAndUpdate": this.onClick_closeAndUpdate,
            "click .cubeviz-component-setupComponentDeselectButton": this.onClick_deselectedAllComponentElements,
            "click .cubeviz-component-setupComponentOpener": this.onClick_setupComponentOpener,
            "click #cubeviz-component-questionMark": this.onClick_questionmark,
            "dialogclose .cubeviz-component-setupComponentDialog": this.onClose_setupComponentDialog
        });
        return this;
    };
    View_CubeVizModule_Component.prototype.setComponentsStuff = function (entries) {
        this.app._.data.components.dimensions = entries;
        this.app._.data.selectedComponents.dimensions = DataCube_Component.getDefaultSelectedDimensions(entries);
    };
    return View_CubeVizModule_Component;
})(CubeViz_View_Abstract);
var View_CubeVizModule_Footer = (function (_super) {
    __extends(View_CubeVizModule_Footer, _super);
    function View_CubeVizModule_Footer(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_Footer", attachedTo, app);
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
        this.render();
    };
    View_CubeVizModule_Footer.prototype.onClick_permaLinkButton = function () {
        var self = this;
        this.app._.data.linkCode = null;
        CubeViz_ConfigurationLink.saveToServerFile(this.app._.backend.url, this.app._.data, this.app._.ui, function (newLinkCode) {
            self.app._.data.linkCode = newLinkCode;
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
        var self = this;
        $("#cubeviz-footer-permaLinkButton").attr("value", label).animate({
            width: 31
        }, 450, "linear", function () {
            var position = $("#cubeviz-footer-permaLinkButton").position();
            $("#cubeviz-footer-permaLinkMenu").css("top", position.top + 2).css("left", position.left + 32);
            var link = self.app._.backend.url + "?m=" + encodeURIComponent(self.app._.backend.modelUrl) + "&lC=" + self.app._.data.linkCode;
            var url = $("<a></a>").attr("href", link).attr("target", "_self").html($("#cubeviz-footer-permaLink").html());
            $("#cubeviz-footer-permaLinkMenu").animate({
                width: 'toggle'
            }, 450);
            $("#cubeviz-footer-permaLink").show().html(url);
        });
    };
    return View_CubeVizModule_Footer;
})(CubeViz_View_Abstract);
var View_IndexAction_Visualization = (function (_super) {
    __extends(View_IndexAction_Visualization, _super);
    function View_IndexAction_Visualization(attachedTo, app) {
        _super.call(this, "View_IndexAction_Visualization", attachedTo, app);
    }
    View_IndexAction_Visualization.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        $("#cubeviz-component-questionMarkDialog").dialog("destroy");
        return this;
    };
    View_IndexAction_Visualization.prototype.initialize = function () {
        var self = this;
    };
    View_IndexAction_Visualization.prototype.render = function () {
        this.delegateEvents({
        });
        return this;
    };
    return View_IndexAction_Visualization;
})(CubeViz_View_Abstract);
