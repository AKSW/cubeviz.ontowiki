/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_IndexAction_Visualization extends CubeViz_View_Abstract 
{
    /**
     * 
     */    
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_IndexAction_Visualization", attachedTo, app);
    }
    
    /**
     *
     */
    public destroy() : CubeViz_View_Abstract
    {
        super.destroy();
        
        // Question mark dialog
        $("#cubeviz-component-questionMarkDialog").dialog("destroy");
        
        return this;
    }
    
    /**
     *
     */
    public initialize() 
    {        
        var self = this;
        
        
    }

    /**
     *
     */
    public render() 
    {        
        /**
         * Delegate events to new items of the template
         */
        this.delegateEvents({
        });
        
        return this;
    }
}
