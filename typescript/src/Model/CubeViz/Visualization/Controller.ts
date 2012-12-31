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
    static getDimensionOrMeasureLabel (dimensions, measures, uri:string) : string 
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
            if ( className == charts [i]["class"] ) {
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
     * @return Object[]
     */
    static getMultipleDimensions ( retrievedData:Object[], selectedDimensions:Object[],
                                    measures:Object[] ) : Object [] 
    {
        // assign selected dimensions to xAxis and series (yAxis)
        var multipleDimensions:Object[] = [],
            tmp:Object[] = [];
        
        for ( var hashedUrl in selectedDimensions ) {
                        
            // Only put entry to multipleDimensions if it have at least 2 elements
            if ( 1 < selectedDimensions [hashedUrl] ["elements"]["length"] ) {
                
                multipleDimensions.push ( {
                    "label" : selectedDimensions [hashedUrl]["label"],
                    "elements" : selectedDimensions [hashedUrl] ["elements"] 
                } ); 
            }
        }
        
        return multipleDimensions;
    }
    
    /**
     * @return integer at least 0
     */
    static getNumberOfMultipleDimensions ( retrievedData:Object[], 
        selectedDimensions:Object[], measures:Object[] ) : number 
    {
        return CubeViz_Visualization_Controller.getMultipleDimensions (
            retrievedData, selectedDimensions, measures
        ).length;
    }
    
    /**
     * @return Object[]
     */
    static getOneElementDimensions ( retrievedData:Object[], selectedDimensions:Object[],
                                      measures:Object[] ) : Object [] 
    {
        // assign selected dimensions to xAxis and series (yAxis)
        var oneElementDimensions:Object[] = [],
            tmp:Object[] = [];
            
        // TODO $.each
        for ( var hashedUrl in selectedDimensions ) 
        {
            // Only put entry to multipleDimensions if it have at least 2 elements
            if ( 1 == selectedDimensions [hashedUrl] ["elements"]["length"] ) {
                oneElementDimensions.push({
                    "label" : selectedDimensions [hashedUrl]["label"],
                    "elements" : selectedDimensions [hashedUrl] ["elements"] 
                }); 
            }
        }
        
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
