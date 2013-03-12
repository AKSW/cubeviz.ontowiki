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
        CubeViz_View_Helper.destroyDialog(
            $("#cubeviz-index-headerDialogBox")
        );
        
        return this;
    }
    
    /**
     *
     */
    public initialize() 
    {
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
        // attach dialog which contains model information
        CubeViz_View_Helper.attachDialogTo(
            $("#cubeviz-index-headerDialogBox"),
            {closeOnEscape: true, height: "500", showCross: true, width: "50%"}
        );
        
        // render header with model label + icon, to open dialog
        this.renderHeader();
        
        // render dialog with information about the model
        this.renderDialogBox();
        
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({
            "click #cubeviz-index-headerQuestionMarkHeadline": this.onClick_questionMark
        });
        
        return this;
    }
    
    /**
     *
     */
    public renderDialogBox() 
    {
        // 
        var headerDialogHead = _.template($("#cubeviz-index-tpl-headerDialogBoxHead").text()),
            modelLabel = "";
        
        // if model label is set and not blank, use it!
        if(false === _.isUndefined(this.app._.backend.modelInformation ["http://www.w3.org/2000/01/rdf-schema#label"])
           && false === _.str.isBlank(this.app._.backend.modelInformation ["http://www.w3.org/2000/01/rdf-schema#label"])){
            modelLabel = this.app._.backend.modelInformation ["http://www.w3.org/2000/01/rdf-schema#label"].content;
        
        // if not, use modelUri instead
        } else {
            modelLabel = this.app._.backend.modelUrl;
        }
        
        $("#cubeviz-index-headerDialogBox").html(headerDialogHead({
            label: modelLabel
        }));
        
        // build list with model information
        var entryTpl = _.template($("#cubeviz-index-tpl-headerDialogBoxEntry").text());
       
        var htmlModelInformation = "";
       
        _.each(this.app._.backend.modelInformation, function(entry){
            htmlModelInformation += entryTpl({
                predicateLabel: entry.predicateLabel,
                objectContent: CubeViz_Visualization_Controller.linkify(
                    entry.content
                )
            });
        });
       
        $("#cubeviz-index-headerDialogBoxModelInformation").html(
            htmlModelInformation
        );
    }
    
    /**
     *
     */
    public renderHeader() 
    {
        var modelLabel
        
        // if model label is set and not blank, use it!
        if(false === _.isUndefined(this.app._.backend.modelInformation ["http://www.w3.org/2000/01/rdf-schema#label"])
           && false === _.str.isBlank(this.app._.backend.modelInformation ["http://www.w3.org/2000/01/rdf-schema#label"])){
            modelLabel = this.app._.backend.modelInformation ["http://www.w3.org/2000/01/rdf-schema#label"].content;
        
        // if not, use modelUri instead
        } else {
            modelLabel = this.app._.backend.modelUrl;
        }
        
        var headerTpl = _.template($("#cubeviz-index-tpl-header").text());
        
        $("#cubeviz-index-header").html(headerTpl({
            modelLabel: modelLabel
        }));
    }
}
