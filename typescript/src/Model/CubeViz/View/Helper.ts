/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

class CubeViz_View_Helper
{
    /**
     * Attach an dialog to a div container (using jQueryUI.dialog()).
     * @param domElement jQuery element which represents the dialog
     * @param options Overrides standard values
     * @return void
     */
    static attachDialogTo(domElement:any, options?:any) : void 
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
        
        domElement.data("hasDialog", true);
    }
    
    /**
     * Close an attached dialog.
     * @param domElement jQuery element which represents the dialog
     * @return void
     */
    static closeDialog(domElement:any) : void
    {
        domElement.dialog("close");
        
        domElement.data("isDialogOpen", false);
    } 
    
    /**
     * Destroy an attached dialog
     * @param domElement jQuery element which represents the dialog
     */
    static destroyDialog(domElement:any) : void
    {
        domElement.dialog("destroy");
        
        domElement.data("isDialogOpen", false);
    } 
    
    /**
     * Open an attached dialog.
     * @param domElement jQuery element which represents the dialog
     * @return void
     */
    static openDialog(domElement:any) : void
    {
        domElement.dialog("open");
        
        domElement.data("isDialogOpen", true);
        
        // Change overlay height for the dialog
        $(".ui-widget-overlay").css("height", 2 * screen.height);
    } 
    
    /**
     * Sort list items by alphabet.
     * @param list DOM element to sort (directly the items in the given list)
     */
    static sortLiItemsByAlphabet(list:any) 
    {
        var listItems = list.children('li');
        
        var a:string = "", b:string = "";
        
        listItems.sort(function(a, b) {
           a = $(a).text().toUpperCase();
           b = $(b).text().toUpperCase();
           return (a < b) ? -1 : (a > b) ? 1 : 0;
        })
      
        _.each(listItems, function(item){
            list.append(item); 
        });
    }
}
