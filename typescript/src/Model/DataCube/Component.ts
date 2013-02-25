/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

/**
 * Represents a component which can be a dimension or a measure.
 */
class DataCube_Component {
    
    /**
     * Loads all component dimensions, specified by model uri, data structure definition, dataset
     * and component type.
     */
    static loadAllDimensions (url, modelUrl, dsdUrl:string, dsUrl:string, callback) {
        
        $.ajax({
            url: url + "getcomponents",
            data: {
                m: modelUrl, 
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "dimension" // possible: dimension, measure
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error ("loadAllDimensions: " + xhr.responseText);
        })
        .done( function (entries) { 
            DataCube_Component.prepareLoadedAllDimensions (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedAllDimensions (entries:any, callback) {
        
        entries = JSON.parse (entries);
        
        // sort objects by label, ascending
        entries.sort(function(a, b) {
           return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        })
        
        var tmpEntries = {};
        
        _.each(entries, function(component){
            // establish a new structure where the key is the label of the dimension
            tmpEntries[component.hashedUrl] = component;
        });
        
        // call callback function with prepared entries
        callback ( tmpEntries );
    }
    
    /**
     * Loads all component measures, specified by model uri, data structure definition, dataset
     * and component type.
     */
    static loadAllMeasures (url, modelUrl, dsdUrl:string, dsUrl:string, callback) {
        
        $.ajax({
            url: url + "getcomponents",
            data: {
                m: modelUrl, 
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "measure" // possible: dimension, measure
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error ("loadAllMeasures: " + xhr.responseText);
        })
        .done( function (entries) { 
            DataCube_Component.prepareLoadedAllMeasures (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedAllMeasures (entries:any, callback) {
        
        entries = JSON.parse (entries);        
                                
        // sort objects by label, ascending
        entries.sort(function(a, b) {
           return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        })
        
        var tmpEntries = {};
        
        // 
        _.each(entries, function(measure){         
            // establish a new structure where the key is the label of the dimension
            tmpEntries[measure.hashedUrl] = measure;
        });
        
        // call callback function with prepared entries
        callback ( tmpEntries );
    }
    
    /**
     * Creates for each dimension a random set of pre-selected elements.
     * @param componentDimensions Object contain all component dimensions.
     * @return any Object containing for each dimension a random set of elements.
     */
    static getDefaultSelectedDimensions ( componentDimensions ) : any 
    {        
        var alreadyUsedIndexes:number[] = [],
            i:number = 0,
            infinityBackup:number = 0,
            maxNumberOfElements:number = 0,
            numberOfElements:number = 0,
            randomElementIndex:number = 0,
            result:any = {},
            selectedElements:any = {};
        
        // create a copy
        componentDimensions = $.parseJSON(JSON.stringify (componentDimensions));
    
        // go through all component dimensions
        _.each(componentDimensions, function(componentDimension, dimensionHashedUrl){            
            
            alreadyUsedIndexes = [];
            infinityBackup = 0;
            
            numberOfElements = _.keys(componentDimension.elements).length;
            
            // get one third of the component element number (but maximum of 10)
            maxNumberOfElements = 1 + Math.floor(_.keys(componentDimension.elements).length * 0.3);
            maxNumberOfElements = 10 < maxNumberOfElements ? 10 : maxNumberOfElements;
            
            /**
             * Find a couple of random indexes
             */
            do {
                // compute index for the next random element which is
                // between i and max number of elements
                randomElementIndex = Math.floor((Math.random()*numberOfElements)+1);
                
                // if computed index is not use ...
                if (-1 === $.inArray(randomElementIndex, alreadyUsedIndexes)) {
                    
                    // ... save it
                    if ((alreadyUsedIndexes.length+1) <= maxNumberOfElements) {
                        alreadyUsedIndexes.push(randomElementIndex);
                    }
                    
                    // break after a couple of rounds
                    if (maxNumberOfElements == alreadyUsedIndexes.length) {
                        break;
                    }
                }
                
                infinityBackup++;
            } while ( (2 * maxNumberOfElements) > infinityBackup );
            
            /**
             * go through all dimension elements and save elements by random index
             */
            selectedElements = {};
            i = 0;
            
            _.each(componentDimension.elements, function(element, elementUri){
                if(-1 < $.inArray(i++, alreadyUsedIndexes)) {
                    selectedElements[elementUri] = element;
                }
            });
            
            // save adapted component dimension + elements
            componentDimension.elements = selectedElements;
            result[dimensionHashedUrl] = componentDimension;
        });
        
        return result;
    }
}
