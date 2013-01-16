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
    static sortLiItemsByAlphabet(list:any) : any[]
    {
        var a:string = "", b:string = "",
            listItems:any[] = list.children('li'),
            resultList:any[] = [];
        
        listItems.sort(function(a, b) {
            a = $(a).text().toUpperCase();
            b = $(b).text().toUpperCase();
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        })
      
        return listItems;
    }
    
    /**
     * Sort list items by their check status of their associated checkbox.
     * @param list DOM element to sort (directly the items in the given list)
     */
    static sortLiItemsByCheckStatus(list:any) : any[]
    {
        var listItems:any[] = list.children('li'),
            notCheckedItems:any[] = [],
            resultList:any[] = [];            
        
        // empty given list
        list.empty();
        
        // go through all list items and check:
        // - if current item's checkbox is checked, add it back to the list
        // - if not, store it temporarly in notCheckedItems and add them later
        _.each(listItems, function(item){
            if($($(item).children().first()).is(":checked")){
                resultList.push(item);
            } else {
                notCheckedItems.push(item);
            }
        })
      
        // add stored not-checked items
        _.each(notCheckedItems, function(item){
            resultList.push(item); 
        });
        
        return resultList;
    }
    
    /**
     * Sort list items by the number of observations they are part of.
     * @param list DOM element to sort (directly the items in the given list)
     */
    static sortLiItemsByObservationCount(list:any, dimensionTypeUrl:string, 
        retrievedObservations:any[]) : any[]
    {
        var dimensionElementUri:string = "",
            listItems:any[] = list.children('li'),
            listItemValues:string[] = [],
            listItemsWithoutCount:any[] = [],
            observationCount:number = 0,
            resultList:any[] = [];
            
        list.empty();
        
        // extract checkbox values of given list; it contains items such as 
        // http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent 
        _.each(listItems, function(liItem){
            
            dimensionElementUri = $($(liItem).children().first()).val();
            observationCount = 0;
            
            // count observations which contains an entry for given dimension 
            // type url
            _.each(retrievedObservations, function(observation){
                if(dimensionElementUri === observation[dimensionTypeUrl][0].value) {
                    ++observationCount;
                }
            });
            
            // save count
            $(liItem).data("observationCount", observationCount);
            
            // if count is > 0, directly add the item back to the list
            if(0 < observationCount){
                resultList.push(liItem);
                
            // otherwise stored it somewhere else for later
            } else {
                listItemsWithoutCount.push(liItem);
            }
        });
        
        // sort items by observationCount
        resultList.sort(function(a, b) {
           a = $(a).data("observationCount");
           b = $(b).data("observationCount");
           return (a < b) ? 1 : (a > b) ? -1 : 0;
        });
        
        // add somewhere else stored items back the given list
        _.each(listItemsWithoutCount, function(item){
            resultList.push(item); 
        });
        
        return resultList;
    }
}
