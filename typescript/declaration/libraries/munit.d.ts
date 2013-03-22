// Typing for the munit.js

interface MUNIT { 
    Test (tests:any[]): any;
    RESULT_BOO: string;
    RESULT_YAY: string;
    runTests (): any;
}
declare var MUNIT: MUNIT;

interface stacktrace { 
    (): string;
}
declare var stacktrace: stacktrace;
