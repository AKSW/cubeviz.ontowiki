/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

class DataCube_DataSet 
{    
    /**
     * 
     */
    static loadAll (url, modelUrl, dsdUrl, callback) : void
    {
        $.ajax({
            url: url + "getdatasets/",
            data: { m: modelUrl, dsdUrl: dsdUrl }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error( "loadAll error: " + xhr.responseText );
        })
        .done(function(entries){ 
            DataCube_DataSet.prepareLoadedDataSets (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedDataSets ( entries, callback ) : void
    {
        // set standard values
        // nothing yet
        
        // sort objects by label, ascending
        entries.sort(function(a, b){
           return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        });
        
        // call callback function with prepared entries
        callback ( entries );
    }
}
