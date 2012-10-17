/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

/**
 * Event section
 */
$(document).ready(function(){
    Viz_Event.ready ();
});

class Viz_Event {
    /**
     * After document is ready
     */
    static ready () {
        console.log ( "VIZZZZ" );
    }
}
