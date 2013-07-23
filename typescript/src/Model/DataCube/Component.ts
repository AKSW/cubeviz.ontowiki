/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

/**
 * Represents a component which can be a dimension or a measure.
 */
class DataCube_Component 
{    
    /**
     * Creates for each dimension a random set of pre-selected elements.
     * @param componentDimensions Object contain all component dimensions.
     * @return any Object containing for each dimension a random set of elements.
     */
    static getDefaultSelectedDimensions (componentDimensions:any) : any 
    {        
        var alreadyUsedIndexes:number[] = [],
            // because we change the __cv_elements field for each dimension later on,
            // we have to create a real clone to avoid changing the un-selected
            // components field in app._.data!
            componentDimensions = JSON.parse(JSON.stringify(componentDimensions)),
            i:number = 0,
            infinityBackup:number = 0,
            maxNumberOfElements:number = 0,
            numberOfElements:number = 0,
            randomElementIndex:number = 0,
            result:any = {},
            selectedElements:any = {};
    
        // go through all component dimensions
        _.each(componentDimensions, function(componentDimension, dimensionHashedUrl){            
            
            alreadyUsedIndexes = [];
            infinityBackup = 0;
            
            numberOfElements = _.keys(componentDimension.__cv_elements).length;
            
            // get one third of the component element number (but maximum of 10)
            maxNumberOfElements = 1 + Math.floor(_.keys(componentDimension.__cv_elements).length * 0.3);
            maxNumberOfElements = 10 < maxNumberOfElements 
                ? 10 : 1 > maxNumberOfElements
                       ? 1 : maxNumberOfElements;
            
            /**
             * Find a couple of random indexes
             */
            do {
                // compute index for the next random element which is
                // between i and max number of elements
                randomElementIndex = Math.floor((Math.random()*numberOfElements));
                
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
            
            _.each(componentDimension.__cv_elements, function(element, elementUri){
                if(-1 < $.inArray(i, alreadyUsedIndexes)) {
                    selectedElements[i] = element;
                }
                
                i++;
            });
            
            // save adapted component dimension + elements
            componentDimension.__cv_elements = selectedElements;
            result[dimensionHashedUrl] = componentDimension;
        });
        
        return result;
    }
    
    /**
     * @param dimensionElements any
     * @param uri string
     * @return any|null The found element or null
     */
    static findDimensionElement(dimensionElements:any, uri:string) : any
    {
        var elementToFind:any = null;
        
        _.each (dimensionElements, function(element){
            if (element.__cv_uri == uri) {
                elementToFind = element;
            }
        });
        
        return elementToFind;
    }
    
    /**
     * Loads all attributes for a given dataset.
     * @param url 
     * @param modelIri
     * @param dsdUrl
     */
    static loadAllAttributes (url:string, serviceUrl:string, modelIri:string, dsdUrl:string, dsUrl:string, callback) 
    {
        $.ajax({
            url: url + "getcomponents",
            data: {
                serviceUrl: serviceUrl,
                modelIri: modelIri, 
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                componentType: "attribute"
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error ("Attribute loadAll: " + xhr.responseText);
        })
        .success( function (entries) {
            // check if everything is set
            if(false === _.isUndefined(entries) 
               && false === _.isUndefined(entries.content)) {
               callback(entries.content);
            }
        });
    }
    
    /**
     * Loads all component dimensions, specified by model uri, data structure definition, dataset
     * and component type.
     */
    static loadAllDimensions (url:string, serviceUrl:string, modelIri:string, dsdUrl:string, dsUrl:string, callback) 
    {
        $.ajax({
            url: url + "getcomponents",
            data: {
                serviceUrl: serviceUrl,
                modelIri: modelIri, 
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                componentType: "dimension"
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error ("loadAllDimensions: " + xhr.responseText);
        })
        .success( function (entries) {
            // check if everything is set
            if(false === _.isUndefined(entries) 
               && false === _.isUndefined(entries.content)) {
               callback(entries.content);
            }
        });
    }

    /**
     * Loads all component measures, specified by model uri, data structure definition, dataset
     * and component type.
     */
    static loadAllMeasures (url:string, serviceUrl: string, modelIri:string, dsdUrl:string, dsUrl:string, callback) 
    {
        $.ajax({
            url: url + "getcomponents",
            data: {
                serviceUrl: serviceUrl,
                modelIri: modelIri, 
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                componentType: "measure"
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error ("loadAllMeasures: " + xhr.responseText);
        })
        .done( function (entries) { 
            // check if everything is set
            if(false === _.isUndefined(entries) 
               && false === _.isUndefined(entries.content)) {
                callback(entries.content);
            }
        });
    }
}
