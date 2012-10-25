/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />
/// <reference path="..\DeclarationSourceFiles\JSON.d.ts" />

class System {
    
    /**
     * Counts number of an given object.
     */
    static countProperties ( obj:Object ) : number {
        var keyCount = 0, k = null;
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                ++keyCount;
            }
        }
        return keyCount;
    }
    
    /**
     * Copy an given element, but renew the reference so there is no connection to the old one.
     */
    static deepCopy ( elementToCopy : Object ) : any {
        var newElement = $.parseJSON ( JSON.stringify ( elementToCopy ) );
        return newElement;
    }
    
    /**
     * Outputs only if context is "development"
     * Should prevent you running into errors if browser doesnt support console.log
     */
    static out ( output: any ) : void {
        if ( typeof console !== "undefined" 
              && typeof console.log !== "undefined" 
              && "development" == CubeViz_Config.context ) {
            
            // If your browser is IE, ...
            if( $.browser && $.browser.msie) {
                
                // output non-object directly
                if ( "object" != typeof output && "array" != typeof output ) {
                    console.log ( output );
                    
                // output objects property by property
                } else {
                    $.each ( output, function ( i, val ) {
                        if ( "object" == typeof val ) {
                            System.out ( val );
                        } else {
                            console.log ( i + ": " + val );
                        }
                    } );
                }
            
            // If your browser is modern, ...
            } else {
                console.log ( output );
            }
        }
    }
    
    /**
     * Split a given key into units, build a chain and set the given value.
     * For instance: key=foo.bar.foobar will be transformed and evaled as obj[foo][bar][foobar] = value;
     */
    static setObjectProperty ( obj:Object, key:string, separator:string, value:any ) : void {
        var keyList = key.split ( separator ),
            call = "obj ";
        for ( var i in keyList ) {
            call += '["' + keyList [i] + '"]';
            eval ( call + " = " + call + " || {};" );
        }
        eval ( call + " = value;" ); 
    }
    
    /**
     * Setup AJAX to save paperwork later on
     */
    static setupAjax () : void {
        $.ajaxSetup({
            "async": true,
            "cache": false,
            "crossDomain": true,
            "dataType": "json",
            "type": "POST"
        });
        
        $.support.cors = true;
    }
    
    /**
     * Copied from http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
     * 
     * Has return for following parameters:
            ## Parameter ##                         ## Returns ## 
            Undefined	                            undefined
            Null	                                object
            Boolean	                                boolean
            Number	                                number
            String	                                string
            Object (native and not callable)	    object
            Object (native or host and callable)	function
            Object (host and not callable)	        Implementation-defined
     */
    static toType( ele ) {
        return ({}).toString.call(ele).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }
}
