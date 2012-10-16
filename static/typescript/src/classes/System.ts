class System {
    static out ( output: any ) : void {
        if ( typeof console !== "undefined" 
              && typeof console.log !== "undefined" 
              && "development" == CubeViz_Config.context ) {
            console.log ( output );
        }
    }
    
    /**
     * Calls a function f with any parameters
     */
    static call ( f, param? ) {
        if ( typeof f !== "undefined" ) {
            if ( typeof param !== "undefined" ) {
                eval ( "f (param);" );
            } else {
                f ();
            }
        }
    }
    
    /**
     * http://phpjs.org/functions/rand/
     */
    static rand () {
        return Math.floor(Math.random() * (2147483647 + 1));
    }
}
