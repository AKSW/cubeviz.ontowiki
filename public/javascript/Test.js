QUnit.done(function (d) {
    console.log("\n-----" + "\nDone: " + d.total + " tests > " + d.failed + " failed, " + d.passed + " passed");
});
QUnit.log(function (logEntry) {
    if(false === logEntry.result) {
        console.log("#: " + $.trim(logEntry.source));
    }
});
QUnit.testStart(function (details) {
    cubeVizApp.reset();
});
QUnit.config.autostart = false;
test("a basic test example", function () {
    ok(false, "false fails");
});
