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
        var label = propertyUrl;
        
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
                    if ( element.property == propertyUrl ) {
                        label = element.propertyLabel;
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
                        
            if(2 > _.size(selectedDimension.elements)) { return; }
            
            // Only put entry to multipleDimensions if it have at least 2 elements    
            multipleDimensions.push ({
                elements: selectedDimension.elements,
                label: selectedDimension.label
            }); 
        });
        
        return multipleDimensions;
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
            
        for ( var hashedUrl in selectedComponentDimensions ) {
                        
            // Only put entry to multipleDimensions if it have at least 2 elements
            if ( 1 == selectedComponentDimensions [hashedUrl] ["elements"]["length"] ) {
                oneElementDimensions.push({
                    elements: selectedComponentDimensions [hashedUrl] ["elements"],
                    label: selectedComponentDimensions [hashedUrl]["label"]
                }); 
            }
        }
        
        return oneElementDimensions;
    }
    
    /**
     * Decide where the given className is related to: CubeViz itself or HighCharts.
     * @param className Class to check
     * @return string Name of the library wrapper: CubeViz or HighCharts
     */
    static getVisualizationType (className:string) : string 
    {
        var cV = new CubeViz_Visualization_CubeViz(),
            hC = new CubeViz_Visualization_HighCharts();
        
        if(true === hC.isResponsibleFor(className)) {
            return hC.getName();
        } else if(true === cV.isResponsibleFor(className)) {
            return cV.getName();
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
}
