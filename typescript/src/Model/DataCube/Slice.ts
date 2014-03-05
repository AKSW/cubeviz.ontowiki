/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

/**
 * Represents a slice.
 */
class DataCube_Slice 
{    
    /**
     * Loads all slices.
     */
    static loadAll (url:string, serviceUrl:string, modelIri:string, dsdUrl:string, dsUrl:string, callback) 
    {
        $.ajax({
            url: url + "getslices",
            data: {
                serviceUrl: serviceUrl, 
                modelIri: modelIri, 
                dsdUrl: dsdUrl,
                dsUrl: dsUrl
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error ("DataCube_Slice > loadAll: " + xhr.responseText);
        })
        .success( function (entries) {
            // check if everything is set
            if(false === _.isUndefined(entries) 
               && false === _.isUndefined(entries.content)) {
               callback(entries.content);
            }
        });
    }
}
