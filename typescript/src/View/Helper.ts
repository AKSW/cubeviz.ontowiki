/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

class View_Helper
{
    /**
     * @param domElement jQuery container around a DOM element
     * @param options Overrides standard values
     * @return void
     */
    static attachDialog(domElement:any, options?:any) : void 
    {
        var defaultOptions:any = {}, 
            options:any = options || {};
        
        /**
         * override default settings by user given stuff
         */
        defaultOptions.autoOpen         = options.autoOpen      || false;
        defaultOptions.closeOnEscape    = options.closeOnEscape || false;
        defaultOptions.draggable        = options.draggable     || false;
        defaultOptions.height           = options.height        || "auto";
        defaultOptions.hide             = options.hide          || "slow";
        defaultOptions.modal            = options.modal         || true;
        defaultOptions.overlay          = options.overlay       || {
            "background-color": "#FFFFFF", opacity: 0.5
        };
        defaultOptions.resizable        = options.resizable     || false;
        defaultOptions.show             = options.show          || "slow";
        defaultOptions.width            = options.width         || "700";
        
        if(true === _.isUndefined(options.showCross) || false === options.showCross) {
            defaultOptions.open = function(event,ui){
                $(".ui-dialog-titlebar-close", $(this).parent()).hide();
            }
        };
        
        /**
         * attach dialog to DOM element
         */
        domElement.dialog(defaultOptions);
    }
    
    /**
     *
     */
    static closeDialog(domElement:any) : void
    {
        domElement.dialog("close");
    } 
    
    /**
     *
     */
    static openDialog(domElement:any) : void
    {
        domElement.dialog("open");
        
        // Change overlay height for the dialog
        $(".ui-widget-overlay").css(
            "height", screen.height + (screen.height*0.5)
        );
    } 
    
    /**
     *
     */
    static destroyDialog(domElement:any) : void
    {
        domElement.dialog("destroy");
    } 
}
