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

        var keys = _.keys(obj), 
            i = keys.length - 1, 
            value;

        parents.push(obj); // add self to current path

        for (; i >= 0; --i){
            value = obj[keys[i]];
            if (value && true === _.isObject(obj)) {
                tree.push(keys[i]);
                
                if (parents.indexOf(obj) >= 0)
                    return true;
                    
                // check child nodes
                if (arguments.callee(value, parents, tree))
                    return tree.join('.');
                tree.pop();
            }
        }

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
        for ( var i in charts ) {
            if ( className == charts [i]["class"] ) {
                return charts [i];
            }
        }
        return undefined;
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
        var dim:any = {};
                
        for ( var hashedUrl in selectedComponentDimensions ) {
            
            dim = selectedComponentDimensions[hashedUrl];
            
            // Stop if the given dimension was found (by type)
            if ( dim["typeUrl"] == dimensionTypeUrl ) {
                
                for ( var i in dim["elements"] ) {
                    if ( dim["elements"][i]["property"] == propertyUrl ) {
                        return dim["elements"][i]["propertyLabel"];
                    }
                }
            }
        }
        
        // if nothing was found, simply return the given propertyUrl
        return propertyUrl;
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
        
        // for ( var hashedUrl in selectedDimensions ) {
        _.each(selectedComponentDimensions, function(selectedDimension){
                        
            if(2 > _.size(selectedDimension.elements)) {
                return;
            }
            
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
     * 
     */
    static getVisualizationType (className:string) : string {
        if ( "Visualization_CubeViz_Table" == className ) {
            return "CubeViz";
        }
        return "HighCharts";
    }
    
    /**
     * Update ChartConfig entry with new value. Required e.g. for chart selection menu.
     */
    static setChartConfigClassEntry ( className:string, charts:Object[], newValue:any ) {
        for ( var i in charts ) {
            if ( className == charts [i]["class"] ) {
                charts [i] = newValue;
            }
        }
    }
}
