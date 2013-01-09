/// <reference path="..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\declaration\libraries\qunit.d.ts" />

declare var cubeVizApp:any;

/**
 * will be called after all tests are done
 */
QUnit.done(function(d:any){
    console.log(
        "\n-----" +
        "\nDone: " + d.total +" tests > " + d.failed + " failed, " + d.passed + " passed"
    );
});

/**
 * Catching error messages and show them
 */
QUnit.log(function(logEntry:any){
    // If there was an error, show it
    if(false === logEntry.result){ 
        console.log("#E " + $.trim(logEntry.source));
    }
});

/**
 * will be called before a test starts
 */
QUnit.testStart(function(details){
    // Reset whole application
    cubeVizApp.reset();
});

/**
 * QUnit config
 */
QUnit.config.autostart = false;
