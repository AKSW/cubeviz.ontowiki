/// <reference path="..\..\..\..\declaration\libraries\CryptoJs.d.ts" />

/**
 * Provides functions to decide which visualization to load
 */
class CubeViz_Visualization_Controller 
{    
    /**
     * Copied and adapted from: http://stackoverflow.com/a/13619725
     * @param obj Variable to check
     * @return bool True if variable is a circular object, false otherwise
     */
    public isCircularObject(obj:any, parents?:any, tree?:any) : bool
    {
        parents = parents || [];
        tree = tree || [];

        if (!obj || false === _.isObject(obj))
            return false;

        var keys = _.keys(obj);

        parents.push(obj); // add self to current path

        // go through all keys and check each property value of the given object
        _.each(keys, function(key){
            if (obj[key] && true === _.isObject(obj)) {
                tree.push(key);
                
                if (parents.indexOf(obj) >= 0)
                    return true;
                    
                // check child nodes
                if (arguments.callee(obj[key], parents, tree))
                    return tree.join(".");
                
                tree.pop();
            }
        });

        parents.pop();
        return false;
    }
    
    /**
     * Compute a hex color code for a given variable (usally a string) using hash algorithm.
     * @param variable Variable (usally a string) to generate a color based on
     * @return string Generated hex color code
     */
    static getColor(variable:any) : string 
    {
        var color:string = "#FFFFFF";
        
        // uri is string or number
        if(true === _.isString(variable) || true === _.isNumber(variable)) {
            color = "" + CryptoJS.MD5 (variable);
            color = "#" + color.substr((color["length"]-6), 6);
            
        // uri is object (but not a circular one!)
        } else if (false === this.isCircularObject && true === _.isObject(variable)) {
            color = JSON.stringify(variable);
            color = "#" + color.substr((color["length"]-6), 6);
        } else {
            
        }
        
        return color;
    }
    
    /**
     * Returns chart config object by given class name.
     * @param className Name of the class(chart)
     * @param charts List of chart objects (must have class property)
     * @return any|undefined Chart object if found, undefined otherwise.
     */
    static getFromChartConfigByClass(className:string, charts:any[]) : any 
    {
        var result = undefined;
        
        _.each(charts, function(chart){
            if(true === _.isUndefined(result)){
                if(className == chart.class) {
                    result = chart;
                }
            }
        });
        
        return result;
    }    
    
    /**
     * Returns the label of certain element of a selected dimension.
     * @param dimensionTypeUrl Url of a certain dimension
     * @param propertyUrl Property uri of a certain dimension element
     * @param selectedComponentDimensions Object which contains selected dimensions
     * @return string Label or given propertyUrl, if nothing was found.
     */
    static getLabelForPropertyUri(dimensionTypeUrl:string, propertyUrl:string, 
        selectedComponentDimensions:any) : string 
    {
        var label = propertyUrl,
            rdfsLabel = "http://www.w3.org/2000/01/rdf-schema#label";
        
        // go through all selected component dimensions 
        _.each(selectedComponentDimensions, function(selectedComponentDimension, hashedUrl){

            // stop further execution if label was found
            if (label !== propertyUrl){
                return;
            }

            // stop if the given dimension was found (by type)
            if ( selectedComponentDimension.typeUrl == dimensionTypeUrl ) {
                
                // check each dimension element
                _.each(selectedComponentDimension.elements, function(element){
                    if(element.property == propertyUrl) {
                        label = element[rdfsLabel];
                    }
                });
            }
        });
        
        // if nothing was found, simply return the given propertyUrl
        return label;
    }
    
    /**
     * Extract the uri of the measure value
     */
    static getSelectedMeasure(selectedComponentMeasures:any) : any
    {
        // return the first value
        for ( var hashedTypeUrl in selectedComponentMeasures ) { 
            return selectedComponentMeasures[hashedTypeUrl]; 
        }
    }
    
    /**
     * Get a list of all multiple (at least 2 elements) selected dimensions.
     * @param selectedComponentDimensions Object which contains all selected dimensions. 
     * @return any[] Array of found selected multiple dimensions.
     */
    static getMultipleDimensions(selectedComponentDimensions:any[]) : any [] 
    {
        // assign selected dimensions to xAxis and series (yAxis)
        var multipleDimensions:any[] = [];
        
        _.each(selectedComponentDimensions, function(selectedDimension){
                        
            // Only put entry to multipleDimensions if it have at least 2 elements    
            if(2 <= _.size(selectedDimension.elements)) {
                multipleDimensions.push (selectedDimension); 
            }
        });
        
        return multipleDimensions;
    }
    
    /**
     *
     */
    static getObjectValueByKeyString(keyString:string, objToAccess:any) 
    {
        var call = "objToAccess",
            result = undefined;        

        try {
            // split key and build access string
            // example: objToAccess.foo.bar
            _.each(keyString.split("."), function(key){
                call += "." + key;
            });
            eval ( "result = " + call );
        } catch (ex) {}
        
        return result;
    }
    
    /**
     * Get a list of all (exactly!) one element selected dimensions.
     * @param selectedComponentDimensions Object which contains all selected dimensions. 
     * @return any[] Array of found selected one element dimensions.
     */
    static getOneElementDimensions (selectedComponentDimensions:any[]) : any [] 
    {
        // assign selected dimensions to xAxis and series (yAxis)
        var oneElementDimensions:Object[] = [];
            
        // for ( var hashedUrl in selectedComponentDimensions ) {
        _.each(selectedComponentDimensions, function(selectedDimension){
                        
            // Only put entry to multipleDimensions if it have at least 2 elements
            if ( 1 == _.size(selectedDimension.elements)) {
                oneElementDimensions.push(selectedDimension); 
            }
        })
        
        return oneElementDimensions;
    }
    
    /**
     * Decide where the given className is related to: HighCharts.
     * @param className Class to check
     * @return string Name of the library wrapper: CubeViz or HighCharts
     */
    static getVisualizationType (className:string) : string 
    {
        var hC = new CubeViz_Visualization_HighCharts();
        
        if(true === hC.isResponsibleFor(className)) {
            return hC.getName();
        }
        throw new Error("Unknown className " + className);
    }
    
    /**
     * Update ChartConfig entry with new value. Required e.g. for chart selection menu.
     */
    static setChartConfigClassEntry ( className:string, charts:Object[], newValue:any ) 
    {
        for ( var i in charts ) {
            if(className == charts [i].class) {
                charts [i] = newValue;
            }
        }
    }
        
    /**
     * Generates an updated visualization setting entry based on what the user 
     * selected before in the menu.
     * @param menuItemValues List of all menu item values (usally a selectbox)
     * @param visualizationSetting Entry of visualization settings for current visz class
     * @param chartConfigEntryDefaultConfig Entry with default config for the visz class
     * @return any Updated entry
     */
    static updateVisualizationSettings(menuItemValues:any, visualizationSetting:any,
        chartConfigEntryDefaultConfig:any) : any
    {
        var call:string = "",
            optionKey:string = "", optionVal:string = "",
            updatedSetting:any = visualizationSetting || {};
            
        // visualization setting entry is an empty object, nothing was selected
        // before for the given visz class; in this case simply use default config
        // from the chartConfig
        if(0 === _.keys(updatedSetting).length){
            updatedSetting = chartConfigEntryDefaultConfig;
        }
        
        // create a clone of the given setting to avoid changing the orginally
        // one (ChartConfig.js entry) given from the server
        updatedSetting = $.parseJSON(JSON.stringify(updatedSetting));
        
        // go through all 
        _.each(menuItemValues, function(menuItemValue){
            
            // extract key and values from menu item value
            optionKey = $(menuItemValue).data("key");
            optionVal = $(menuItemValue).val();
            
            // split key and set value
            call = "updatedSetting";
            _.each(optionKey.split("."), function(key){
                call += "." + key;
                eval ( call + " = " + call + " || {};" );
            });
            eval ( call + " = optionVal;" );
        });
        
        return updatedSetting;
    }
}
