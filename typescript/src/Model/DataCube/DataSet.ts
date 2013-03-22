/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

class DataCube_DataSet 
{    
    /**
     * 
     */
    static loadAll (url:string, modelIri:string, dsdUrl:string, callback) : void
    {
        $.ajax({
            url: url + "getdatasets/",
            data: { 
                dsdUrl: dsdUrl,
                modelIri: modelIri
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error( "loadAll error: " + xhr.responseText );
        })
        .success(function(entries){
            // check if everything is set
            if(false === _.isUndefined(entries) 
               && false === _.isUndefined(entries.content)) {
                callback (entries.content); 
            }
        });
    }
}
