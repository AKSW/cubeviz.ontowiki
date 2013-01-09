/// <reference path="..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\declaration\libraries\munit.d.ts" />
/// <reference path="..\..\declaration\libraries\Underscore.d.ts" />

declare var cubeVizApp:any;

var cubeVizAppDataCopy,
    cubeViz_testCounter = 0,
    cubeViz_testFailCounter = 0,
    cubeViz_tests:any[] = [];

/**
 * will be called before a test starts
 */
var cubeviz_setupTest = function(){
    ++cubeViz_testCounter;
        
    // Reset data
    cubeVizApp.restoreDataCopy(cubeVizAppDataCopy);
    
    // Reset whole application
    cubeVizApp.reset();
};

/**
 * will be called after a test finished
 */
var cubeviz_tearDownTest = function(){
    // Reset data
    cubeVizApp
        .restoreDataCopy(cubeVizAppDataCopy)
    // Reset whole application
        .reset()
        .triggerEvent("onStart_application");
};

// START all tests
var cubeviz_startTests = function(){
    
    // load all tests
    var testSuite = new MUNIT.Test(cubeViz_tests);
    
    // create backup of current state of application data
    cubeVizAppDataCopy = cubeVizApp.getDataCopy();
    
    // set setup and teardown functions
    testSuite.onSetup = cubeviz_setupTest;
    testSuite.onTearDown = cubeviz_tearDownTest;
    
    // run all tests
    testSuite = testSuite.runTests();
    
    // output failed results
    _.each(testSuite, function(test){
        if(MUNIT.RESULT_BOO === test.result) {
            console.log(
                "\n\n" + test.testCode + "\n> Message: " + test.message
            );
            ++cubeViz_testFailCounter;
        }
    });
    
    // output summary
    console.log( "\n-----\n" +  cubeViz_testCounter + " tests run, " + 
        cubeViz_testFailCounter + " failed");
};
