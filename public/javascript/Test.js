var cubeVizAppDataCopy;
var cubeViz_testCounter = 0;
var cubeViz_testFailCounter = 0;
var cubeViz_tests = [];

var cubeviz_setupTest = function () {
    ++cubeViz_testCounter;
    cubeVizApp.restoreDataCopy(cubeVizAppDataCopy);
    cubeVizApp.reset();
};
var cubeviz_tearDownTest = function () {
};
var cubeviz_startTests = function () {
    var testSuite = new MUNIT.Test(cubeViz_tests);
    cubeVizAppDataCopy = cubeVizApp.getDataCopy();
    testSuite.onSetup = cubeviz_setupTest;
    testSuite.onTearDown = cubeviz_tearDownTest;
    testSuite = testSuite.runTests();
    _.each(testSuite, function (test) {
        if(MUNIT.RESULT_BOO === test.result) {
            console.log("\n\n" + test.testCode + "\n> Message: " + test.message);
            ++cubeViz_testFailCounter;
        }
    });
    console.log("\n-----\n" + cubeViz_testCounter + " tests run, " + cubeViz_testFailCounter + " failed");
};
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
    CubeViz_View_Helper.sortLiItemsByAlphabet = function sortLiItemsByAlphabet(list) {
        var a = "";
        var b = "";
        var listItems = list.children('li');
        var resultList = [];

        listItems.sort(function (a, b) {
            a = $(a).text().toUpperCase();
            b = $(b).text().toUpperCase();
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        });
        return listItems;
    }
    CubeViz_View_Helper.sortLiItemsByCheckStatus = function sortLiItemsByCheckStatus(list) {
        var listItems = list.children('li');
        var notCheckedItems = [];
        var resultList = [];

        list.empty();
        _.each(listItems, function (item) {
            if($($(item).children().first()).is(":checked")) {
                resultList.push(item);
            } else {
                notCheckedItems.push(item);
            }
        });
        _.each(notCheckedItems, function (item) {
            resultList.push(item);
        });
        return resultList;
    }
    CubeViz_View_Helper.sortLiItemsByObservationCount = function sortLiItemsByObservationCount(list, dimensionTypeUrl, retrievedObservations) {
        var dimensionElementUri = "";
        var listItems = list.children('li');
        var listItemValues = [];
        var listItemsWithoutCount = [];
        var observationCount = 0;
        var resultList = [];

        list.empty();
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
                resultList.push(liItem);
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
            resultList.push(item);
        });
        return resultList;
    }
    return CubeViz_View_Helper;
})();
cubeViz_tests.push(function () {
    var t = function () {
        var div = $("<div></div>");
        var hasDialog = div.data("hasDialog");

        this.assertTrue(true !== hasDialog, "true !== " + hasDialog);
        CubeViz_View_Helper.attachDialogTo(div);
        hasDialog = div.data("hasDialog");
        this.assertTrue(true === hasDialog, "true === " + hasDialog);
        CubeViz_View_Helper.openDialog(div);
        hasDialog = div.data("hasDialog");
        this.assertTrue(true === hasDialog, "true === " + hasDialog);
        CubeViz_View_Helper.closeDialog(div);
        hasDialog = div.data("hasDialog");
        this.assertTrue(true === hasDialog, "true === " + hasDialog);
        CubeViz_View_Helper.destroyDialog(div);
        hasDialog = div.data("hasDialog");
        this.assertTrue(true === hasDialog, "true === " + hasDialog);
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onStart_application",
            handler: $.proxy(t, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    var t = function () {
        var div = $("<div></div>");
        CubeViz_View_Helper.attachDialogTo(div);
        var isDialogOpen = div.data("isDialogOpen");
        this.assertTrue(true !== isDialogOpen, "false === " + isDialogOpen);
        CubeViz_View_Helper.openDialog(div);
        var isDialogOpen = div.data("isDialogOpen");
        this.assertTrue(true === isDialogOpen, "true === " + isDialogOpen);
        CubeViz_View_Helper.closeDialog(div);
        isDialogOpen = div.data("isDialogOpen");
        this.assertTrue(false === isDialogOpen, "false === " + isDialogOpen);
        CubeViz_View_Helper.destroyDialog(div);
        isDialogOpen = div.data("isDialogOpen");
        this.assertTrue(false === isDialogOpen, "false === " + isDialogOpen);
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onStart_application",
            handler: $.proxy(t, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    var t = function () {
        var div = $("<div></div>");
        CubeViz_View_Helper.attachDialogTo(div);
        CubeViz_View_Helper.openDialog(div);
        var currentOverlayHeight = $(".ui-widget-overlay").css("height");
        var doubleScreenHeight = (2 * screen.height) + "px";

        this.assertTrue(currentOverlayHeight === doubleScreenHeight, currentOverlayHeight + " === " + doubleScreenHeight);
        CubeViz_View_Helper.closeDialog(div);
        CubeViz_View_Helper.destroyDialog(div);
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onStart_application",
            handler: $.proxy(t, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    var t = function () {
        var listEntries = $("#cubeviz-dataStructureDefinition-list").children();
        var givenDSDs = _.keys(cubeVizApp._.data.dataStructureDefinitions);

        this.assertTrue(listEntries.length == givenDSDs.length, listEntries.length + " == " + givenDSDs.length);
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onStart_application",
            handler: $.proxy(t, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    var t_dialogIsClosed = function () {
        var hasDialog = $("#cubeviz-dataStructureDefinition-dialog").data("hasDialog");
        var isDialogOpen = $("#cubeviz-dataStructureDefinition-dialog").data("isDialogOpen");

        this.assertTrue(hasDialog === true, "DSD: hasDialog: " + hasDialog);
        this.assertTrue(isDialogOpen !== true, "DSD: isDialogOpen: " + isDialogOpen);
        $("#cubeviz-dataStructureDefinition-questionMark").click($.proxy(t_dialogIsOpen, this));
        $("#cubeviz-dataStructureDefinition-questionMark").click();
    };
    var t_dialogIsOpen = function () {
        var isDialogOpen = $("#cubeviz-dataStructureDefinition-dialog").data("isDialogOpen");
        this.assertTrue(isDialogOpen === true, "DSD: isDialogOpen: " + isDialogOpen);
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onAfterRender_dataStructureDefinition",
            handler: $.proxy(t_dialogIsClosed, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    var t = function () {
        var listEntries = $("#cubeviz-dataSet-list").children();
        var givenDSs = _.keys(cubeVizApp._.data.dataSets);

        this.assertTrue(listEntries.length == givenDSs.length, listEntries.length + " == " + givenDSs.length);
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onStart_application",
            handler: $.proxy(t, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    var t_dialogIsClosed = function () {
        var hasDialog = $("#cubeviz-dataSet-dialog").data("hasDialog");
        var isDialogOpen = $("#cubeviz-dataSet-dialog").data("isDialogOpen");

        this.assertTrue(hasDialog === true, "DS: hasDialog: " + hasDialog);
        this.assertTrue(isDialogOpen !== true, "DS: isDialogOpen: " + isDialogOpen);
        $("#cubeviz-dataSet-questionMark").click($.proxy(t_dialogIsOpen, this));
        $("#cubeviz-dataSet-questionMark").click();
    };
    var t_dialogIsOpen = function () {
        var isDialogOpen = $("#cubeviz-dataSet-dialog").data("isDialogOpen");
        this.assertTrue(isDialogOpen === true, "DS: isDialogOpen: " + isDialogOpen);
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onAfterRender_dataSet",
            handler: $.proxy(t_dialogIsClosed, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    var t = function () {
        var listEntries = $("#cubviz-component-listBox").children();
        var givenComponentDimensions = _.keys(cubeVizApp._.data.components.dimensions);

        this.assertTrue(listEntries.length == givenComponentDimensions.length, listEntries.length + " == " + givenComponentDimensions.length);
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onStart_application",
            handler: $.proxy(t, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    var t_dialogIsClosed = function () {
        var hasDialog = $("#cubeviz-component-dialog").data("hasDialog");
        var isDialogOpen = $("#cubeviz-component-dialog").data("isDialogOpen");

        this.assertTrue(hasDialog === true, "Component: hasDialog: " + hasDialog);
        this.assertTrue(isDialogOpen !== true, "Component: isDialogOpen: " + isDialogOpen);
        $("#cubeviz-component-questionMark").click($.proxy(t_dialogIsOpen, this));
        $("#cubeviz-component-questionMark").click();
    };
    var t_dialogIsOpen = function () {
        var isDialogOpen = $("#cubeviz-component-dialog").data("isDialogOpen");
        this.assertTrue(isDialogOpen === true, "Component: isDialogOpen: " + isDialogOpen);
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onAfterRender_component",
            handler: $.proxy(t_dialogIsClosed, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    var t = function () {
        var givenComponentDimensionKeys = _.keys(cubeVizApp._.data.components.dimensions);
        var firstComponentHashedUrl = givenComponentDimensionKeys[0];
        var setupComponentDialogId = "#cubeviz-component-setupComponentDialog-" + givenComponentDimensionKeys[0];
        var listDOMElement = $(setupComponentDialogId).find(".cubeviz-component-setupComponentElements").first();
        var listEntries = $(listDOMElement).children();

        var checkbox;
        var checkboxName;
        var checkboxValue;
        var checkboxChecked;
        var dimensionToCheck;
        var label;
        var self = this;

        _.each(listEntries, function (listEntry) {
            checkbox = $($(listEntry).children().first());
            checkboxName = checkbox.attr("name");
            checkboxValue = checkbox.val();
            checkboxChecked = true == checkbox.is(":checked") ? " checked=\"checked\"" : "";
            label = $($(listEntry).children().last()).html();
            dimensionToCheck = cubeVizApp._.data.components.dimensions[firstComponentHashedUrl];
            self.assertTrue(true === _.isObject(_.find(dimensionToCheck.elements, function (ele) {
                return checkboxName == ele.hashedProperty;
            })));
            self.assertTrue(true === _.isObject(_.find(dimensionToCheck.elements, function (ele) {
                return checkboxValue == ele.property;
            })));
            self.assertTrue(true === _.isObject(_.find(dimensionToCheck.elements, function (ele) {
                return checkboxChecked == ele.checked;
            })));
            self.assertTrue(true === _.isObject(_.find(dimensionToCheck.elements, function (ele) {
                return label == ele.propertyLabel;
            })));
        });
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onAfterRender_component",
            handler: $.proxy(t, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    var t = function () {
        var givenComponentDimensionKeys = _.keys(cubeVizApp._.data.components.dimensions);
        var firstComponentHashedUrl = givenComponentDimensionKeys[0];
        var firstComponent = cubeVizApp._.data.components.dimensions[firstComponentHashedUrl];
        var setupComponentDialogId = "#cubeviz-component-setupComponentDialog-" + givenComponentDimensionKeys[0];
        var listDOMElement = $(setupComponentDialogId).find(".cubeviz-component-setupComponentElements").first();
        var listEntries = $(listDOMElement).children();

        this.assertTrue(0 < listEntries.length && listEntries.length === _.keys(firstComponent.elements).length, "listEntries.length === _.keys(firstComponent.elements).length");
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onAfterRender_component",
            handler: $.proxy(t, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    var t = function () {
        var givenComponentDimensionKeys = _.keys(cubeVizApp._.data.components.dimensions);
        var firstComponentHashedUrl = givenComponentDimensionKeys[0];
        var firstComponent = cubeVizApp._.data.components.dimensions[firstComponentHashedUrl];
        var setupComponentDialogId = "#cubeviz-component-setupComponentDialog-" + givenComponentDimensionKeys[0];
        var listDOMElement = $(setupComponentDialogId).find(".cubeviz-component-setupComponentElements").first();
        var listEntries = $(listDOMElement).children();

        this.assertTrue(0 < listEntries.length && listEntries.length === _.keys(firstComponent.elements).length, "listEntries.length === _.keys(firstComponent.elements).length");
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onAfterRender_component",
            handler: $.proxy(t, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    var t = function () {
        var numberOfMultDims = cubeVizApp._.data.numberOfMultipleDimensions;
        var expectItems = cubeVizApp._.backend.chartConfig[numberOfMultDims].charts;
        var foundItems = $("#cubeviz-visualizationselector-selector").children();

        this.assertTrue(expectItems.length == foundItems.length);
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onAfterRender_visualizationSelector",
            handler: $.proxy(t, this)
        }
    ]).triggerEvent("onStart_application");
});
cubeViz_tests.push(function () {
    cubeVizApp.triggerEvent("onStart_application");
    var viszClassBeforeItemClick = cubeVizApp._.ui.visualization.class;
    var items = $("#cubeviz-visualizationselector-selector").children();
    var secondItem = $(items[1]);
    var secondItemsClass = $(secondItem).data("class");

    $(secondItem).click();
    var t = function () {
        this.assertTrue(secondItemsClass == viszClassBeforeItemClick);
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onAfterClick_selectorItem",
            handler: $.proxy(t, this)
        }
    ]);
});
cubeViz_tests.push(function () {
    cubeVizApp.triggerEvent("onStart_application");
    var isSecondClick = false;
    var items = $("#cubeviz-visualizationselector-selector").children();
    var secondItem = $(items[1]);
    var menuItems = $("#cubeviz-visualizationselector-menuItems").children();

    var t = function () {
        if(true == isSecondClick) {
            this.assertTrue(menuItems.length < $("#cubeviz-visualizationselector-menuItems").children().length);
        }
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onAfterClick_selectorItem",
            handler: $.proxy(t, this)
        }
    ]);
    $(secondItem).click();
    isSecondClick = true;
    $(secondItem).click();
});
cubeViz_tests.push(function () {
    cubeVizApp.triggerEvent("onStart_application");
    var isThirdClick = false;
    var items = $("#cubeviz-visualizationselector-selector").children();
    var firstItem = $(items[0]);
    var secondItem = $(items[1]);
    var menuItems = $("#cubeviz-visualizationselector-menuItems").children();

    var t = function () {
        if(true == isThirdClick) {
            this.assertTrue(0 == menuItems.length);
        }
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onAfterClick_selectorItem",
            handler: $.proxy(t, this)
        }
    ]);
    $(secondItem).click();
    $(secondItem).click();
    isThirdClick = true;
    $(firstItem).click();
});
cubeViz_tests.push(function () {
    cubeVizApp.triggerEvent("onStart_application");
    var items = $("#cubeviz-visualizationselector-selector").children();
    var secondItem = $(items[1]);
    var menuReadyToClose = false;

    var t_afterHideMenu = function () {
        if(true === menuReadyToClose) {
            var menuItems = $("#cubeviz-visualizationselector-menuItems").children();
            this.assertEquals(0, menuItems.length, "menuItems.length: " + menuItems.length);
        }
    };
    cubeVizApp.bindGlobalEvents([
        {
            name: "onAfterHide_visualizationSelectorMenu",
            handler: $.proxy(t_afterHideMenu, this)
        }
    ]);
    $(secondItem).click();
    menuReadyToClose = true;
    $(secondItem).click();
});
