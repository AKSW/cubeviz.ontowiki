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
    public destroy() : CubeViz_View_Abstract
    {
        super.destroy();
        
        // Question mark dialog
        $("#cubeviz-index-headerDialogBox").dialog("destroy");
        
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
        $("#cubeviz-index-headerDialogBox").dialog("open");
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
    public render() 
    {        
        $("#cubeviz-index-headerDialogBox").dialog({
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
        this.bindUserInterfaceEvents({
            "click #cubeviz-index-headerQuestionMarkHeadline": this.onClick_questionMark
        });
        
        return this;
    }
}
