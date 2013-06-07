/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_IndexAction_ExportArea extends CubeViz_View_Abstract
{
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_IndexAction_ExportArea", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onReRender_visualization",
                handler: this.onReRender_visualization
            },
            {
                name:    "onStart_application",
                handler: this.onStart_application
            },
            {
                name:    "onUpdate_componentDimensions",
                handler: this.onUpdate_componentDimensions
            }
        ]);
    }
    
    /**
     *
     */
    public destroy() : CubeViz_View_Abstract
    {
        super.destroy();
        return this;
    }
    
    /**
     * 
     */
    public initialize() : void
    {
        this.render();
    }
    
    /**
     *
     */
    public onReRender_visualization() 
    {
        this.initialize();
    }
        
    /**
     *
     */
    public onStart_application() 
    {
        this.initialize();
    }
    
    /**
     *
     */
    public onUpdate_componentDimensions() 
    {
        this.initialize();
    }
    
    /**
     *
     */
    public render() : CubeViz_View_Abstract
    {
        this.setUrlToDownload();
        
        return this;
    }
    
    /**
     *
     */
    public setUrlToDownload() : void
    {
        // set download path
        var urlToDownload = this.app._.backend.url + "exportdataselection/?";
        urlToDownload += "dataHash=" + this.app._.backend.dataHash;
        
        // update a-href's
        $("#cubeviz-index-exportArea-btnTurtle").attr ("href", urlToDownload + "&type=turtle");
        $("#cubeviz-index-exportArea-btnCsv").attr ("href", urlToDownload + "&type=csv");
    }
}
