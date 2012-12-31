/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_IndexAction_Header extends CubeViz_View_Abstract 
{
    /**
     * 
     */    
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_IndexAction_Header", attachedTo, app);
    }
    
    /**
     *
     */
    public destroy() : CubeViz_View_Abstract
    {
        super.destroy();
        
        // Question mark dialog
        $("#cubeviz-header-dialogBox").dialog("destroy");
        
        return this;
    }
    
    /**
     *
     */
    public initialize() 
    {        
        var self = this;
        
        this.render();
    }

    /**
     *
     */
    public onClick_questionMark() 
    {
        $("#cubeviz-header-dialogBox").dialog("open");
    }

    /**
     *
     */
    public render() 
    {        
        $("#cubeviz-header-dialogBox").dialog({
            autoOpen: false,
            draggable: false,
            height: "auto",
            hide: "slow",
            modal: true,
            overlay: {
                "background-color": "#FFFFFF",
                opacity: 0.5
            },
            show: "slow",
            width: 400
        });
        
        /**
         * Delegate events to new items of the template
         */
        this.delegateEvents({
            "click #cubeviz-header-questionMarkHeadline": this.onClick_questionMark
        });
        
        return this;
    }
}
