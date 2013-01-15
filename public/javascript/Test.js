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
