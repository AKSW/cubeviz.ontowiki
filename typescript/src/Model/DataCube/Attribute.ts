/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

/**
 * Represents an attribute.
 */
class DataCube_Attribute 
{
    /**
     * Loads all attributes depending on the selectedDSD.
     * @param url 
     * @param modelIri
     * @param dsdUrl
     */
    static loadAll (url:string, modelIri:string, dsdUrl:string, callback) 
    {
        $.ajax({
            url: url + "getattributes",
            data: {
                modelIri: modelIri, 
                dsdUrl: dsdUrl
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
}
