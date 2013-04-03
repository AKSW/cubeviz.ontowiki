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
     * Hide spinner
     * @return void
     */
    static hideCloseAndUpdateSpinner(dialogDiv) : void
    {        
        $(dialogDiv.find(".cubeviz-dataSelectionModule-closeUpdateSpinner").first())
            .hide();
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
     * Show a spinner to let the user know that something is working.
     * @return void
     */
    static showCloseAndUpdateSpinner(dialogDiv) : void
    {        
        $(dialogDiv.find(".cubeviz-dataSelectionModule-closeUpdateSpinner").first())
            .show();
    }
    
    /**
     * Sort list items by alphabet.
     * @param list DOM element to sort (directly the items in the given list)
     */
    static sortLiItemsByAlphabet(listItems:any) : any[]
    {
        var a:string = "", b:string = "",
            data:any = {},
            resultList:any[] = [];
        
        listItems.sort(function(a, b) {
            a = $(a).text().toUpperCase();
            b = $(b).text().toUpperCase();
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        });
        
        _.each(listItems, function(item){
            
            // rescue attached data
            data = $(item).data("data");
            item = $(item).clone();
            $(item).data("data", data);
            
            resultList.push(item);
        });
      
        return resultList;
    }
    
    /**
     * Sort list items by their check status of their associated checkbox.
     * @param list DOM element to sort (directly the items in the given list)
     */
    static sortLiItemsByCheckStatus(listItems:any[]) : any[]
    {
        var data:any = {},
            notCheckedItems:any[] = [],
            resultList:any[] = [];
            
        // go through all list items and check:
        // - if current item's checkbox is checked, add it back to the list
        // - if not, store it temporarly in notCheckedItems and add them later
        _.each(listItems, function(item){
            
            if($($(item).children().first()).is(":checked")){
            
                // rescue attached data
                data = $(item).data("data");
                item = $(item).clone();
                $(item).data("data", data);
            
                resultList.push(item);
            } else {
                notCheckedItems.push(item);
            }
        });
      
        // add stored not-checked items
        _.each(notCheckedItems, function(item){
            
            // rescue attached data
            data = $(item).data("data");
            item = $(item).clone();
            $(item).data("data", data);
            
            resultList.push(item);
        });
        
        return resultList;
    }
    
    /**
     * Sort list items by the number of observations they are part of.
     * @param list DOM element to sort (directly the items in the given list)
     */
    static sortLiItemsByObservationCount(listItems:any[], dimensionTypeUrl:string, 
        retrievedObservations:any[]) : any[]
    {
        var dimensionElementUri:string = "",
            listItemValues:string[] = [],
            listItemsWithoutCount:any[] = [],
            observationCount:number = 0,
            resultList:any[] = [];
            
        // extract checkbox values of given list; it contains items such as 
        // http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent 
        _.each(listItems, function(liItem){
            
            dimensionElementUri = $($(liItem).children().first()).val();
            observationCount = 0;
            
            // count observations which refers to given dimension type url
            _.each(retrievedObservations, function(observation){
                if(dimensionElementUri === observation[dimensionTypeUrl][0].value) {
                    ++observationCount;
                }
            });
            
            // save count
            $(liItem).data("observationCount", observationCount);
            
            // if count is > 0, directly add the item back to the list
            if(0 < observationCount){
                resultList.push($(liItem).clone());
                
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
            resultList.push($(item).clone());
        });
        
        return resultList;
    }
    
    /**
     * Ultra simple template engine. Replaces all occurrencs of the keys of the
     * given object located in the templateStr with the associated object content.
     * @param templateStr String represents the template
     * @param contentObj Object with alphanumeric keys and content used to 
     *                   fill the placeholders
     * @return string Adapted given template string
     */
    static tplReplace(templateStr:string, contentObj?:any) : string
    {    
        if(true === _.isUndefined(contentObj)) {
            return templateStr;
        }
        
        // get keys of given object because keys are representing placeholders
        // in the given template string and will be replaced later on
        var contentObjKeys = _.keys(contentObj);
        
        // replace placeholders according the keys of contentObj
        _.each(contentObjKeys, function(key){
            templateStr = templateStr.replace (
                "[[" + key + "]]", 
                _.str.trim(contentObj[key])
            );
        });
        
        return _.str.trim(templateStr);
    }
}
