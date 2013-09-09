/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_ModelinfoAction_Footer extends CubeViz_View_Abstract
{
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_Modelinfo_Footer", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onStart_application",
                handler: this.onStart_application
            }
        ]);
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
    public onClick_showAnalyzeBtn() 
    {
        window.location.href = this.app._.backend.url + "analyze/";
    }
    
    /**
     *
     */
    public onClick_showVisualizationBtn() 
    {
        $("#cubeviz-footer-showVisualizationButton").click();
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
    public render() : CubeViz_View_Abstract
    {
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({
            "click #cubeviz-modelinfo-showAnalyzeBtn": 
                this.onClick_showAnalyzeBtn,
                
            "click #cubeviz-modelinfo-showVisualizationBtn": 
                this.onClick_showVisualizationBtn
        });
        
        return this;
    }
}
