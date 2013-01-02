/// <reference path="..\..\..\..\declaration\libraries\CryptoJs.d.ts" />

/**
 * Provides functions to decide which visualization to load
 */
class CubeViz_Visualization_Controller {
    
    /**
     * Extract a hex color code for a given URI (using hash algorithm).
     * @param uri string
     * @return string Generated hex color code
     */
    static getColor ( uri:string ) : string 
    {
        return "#" + CryptoJS.MD5 (uri).substr((CryptoJS.MD5 (uri).length-6), 6);
    }
    
    /**
     * 
     */
    static getDimensionOrMeasureLabel (dimensions:any, measures:any, uri:string) : string 
    {
        if ( "http://www.w3.org/2000/01/rdf-schema#label" == uri ) {
            return "Label";
        }
        
        // return the first value
        // TODO $.each
        for ( var dim in dimensions ) { 
            if (uri == dimensions[dim].typeUrl) {
                return dimensions[dim].label; 
            }
        }
        
        // return the first value
        // TODO $.each
        for(var mea in measures) { 
            if ( uri == measures[mea]["typeUrl"] ) {
                return measures[mea]["label"]; 
            }
        }
        
        return uri;
    }
    
    /**
     * 
     */
    static getFromChartConfigByClass ( className:string, charts:Object[] ) : string 
    {
        for ( var i in charts ) {
            if ( className == charts [i].class ) {
                return charts [i];
            }
        }
    }    
    
    /**
     * Returns the label of the given property uri.
     */
    static getLabelForPropertyUri ( propertyUri:string, dimensionType:string, 
        selectedDimensions:Object[] ) : string 
    {
        var dim:any = {};
                
        // TODO $.each
        for ( var hashedUrl in selectedDimensions ) {
            
            dim = selectedDimensions[hashedUrl];
            
            // Stop if the given dimension was found (by type)
            if ( dim.typeUrl == dimensionType ) {
                
                for ( var i in dim["elements"] ) {
                    if ( dim.elements[i].property == propertyUri ) {
                        return dim.elements[i].propertyLabel;
                    }
                }
            }
        }
        
        // if nothing was found, simply return the given propertyUri
        return propertyUri;
    }
    
    /**
     *
     */
    static getMeasure(selectedComponentMeasures) : any
    {
        var keys = _.keys(selectedComponentMeasures);
        return selectedComponentMeasures[_.first(keys)];
    }
    
    /**
     * Extract all dimensions out of selected dimension list which have at least
     * 2 elements.
     * @param selectedDimensions Object wich selectedDimensions
     * @return any
     */
    static getMultipleDimensions(selectedComponentDimensions:any) : any[] 
    {
        var multipleDimensions:any[] = [];
        
        _.each(selectedComponentDimensions, function(selectedComponentDimension, uri){
                        
            // Only put entry to multipleDimensions if it have at least 2 elements
            if(2 <= _.size(selectedComponentDimension.elements)) {                
                multipleDimensions.push({
                    elements: selectedComponentDimension.elements,
                    label: selectedComponentDimension.label
                });
            }
        });
        
        return multipleDimensions;
    }
    
    /**
     * Count number of selected dimensions.
     * @param selectedComponentDimensions Object with selected component dimensions
     * @return number Integer, at least 0
     */
    static getNumberOfMultipleDimensions(selectedComponentDimensions:any) : number 
    {
        return _.size(CubeViz_Visualization_Controller.getMultipleDimensions(
            selectedComponentDimensions
        ));
    }
    
    /**
     * Get all dimensions which contain only one element.
     * @param selectedComponentDimensions Object containing selected dimensions
     * @return any[]
     */
    static getOneElementDimensions ( selectedComponentDimensions ) : any [] 
    {
        // assign selected dimensions to xAxis and series (yAxis)
        var oneElementDimensions:any[] = [];
            
        // for ( var hashedUrl in selectedDimensions ) 
        _.each(selectedComponentDimensions, function(selectedComponentDimension){
            
            // Only put entry to multipleDimensions if it have at least 2 elements
            if(1 == _.size(selectedComponentDimension.elements)){
                oneElementDimensions.push({
                    elements: selectedComponentDimension.elements,
                    label: selectedComponentDimension.label
                }); 
            }
        });
        
        return oneElementDimensions;
    }
    
    /**
     * 
     */
    static getVisualizationType (className:string) : string 
    {
        if ( "Visualization_CubeViz_Table" == className ) {
            return "CubeViz";
        }
        return "HighCharts";
    }
    
    /**
     * Update ChartConfig entry with new value. Required e.g. for chart selection menu.
     */
    static setChartConfigClassEntry ( className:string, charts:Object[], newValue:any ) 
    {
        // TODO $.each
        for ( var i in charts ) 
        {
            if ( className == charts [i]["class"] ) {
                charts [i] = newValue;
            }
        }
    }
}
