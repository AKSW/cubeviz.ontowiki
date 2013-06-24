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
                name:    "onChange_selectedDS",
                handler: this.onChange_selectedDS
            },
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
    public onChange_selectedDS() 
    {
        // update data set title
        if (false === this.app._.backend.uiSettings.useDataSetInsteadOfModel) {            
            $("#cubeviz-index-headerSubheadline").html(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-index-tpl-headerSubheadline").html(),
                { selectedDataSet: this.app._.data.selectedDS.__cv_niceLabel }
            ));
        } else {
            $("#cubeviz-index-header").html(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-index-tpl-headerSubheadline").html(),
                { selectedDataSet: this.app._.data.selectedDS.__cv_niceLabel }
            ));
        }
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
            {closeOnEscape: true, height: 450, showCross: true, width: "50%"}
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
        var modelLabel = "";
        
        // if model label is set and not blank, use it!
        if(false === _.isUndefined(this.app._.backend.modelInformation ["http://www.w3.org/2000/01/rdf-schema#label"])
           && false === _.str.isBlank(this.app._.backend.modelInformation ["http://www.w3.org/2000/01/rdf-schema#label"])){
            modelLabel = this.app._.backend.modelInformation ["http://www.w3.org/2000/01/rdf-schema#label"].content;
        
        // if not, use modelUri instead
        } else {
            modelLabel = this.app._.backend.modelUrl;
        }
        
        // display model label
        $("#cubeviz-index-headerDialogBox").html(CubeViz_View_Helper.tplReplace(
            $("#cubeviz-index-tpl-headerDialogBoxHead").html(),
            { label: modelLabel }
        ));
        
        /**
         * build list with model information
         */
        var headerDialogBox:any = $($("#cubeviz-index-headerDialogBox").children().last());    
        _.each(this.app._.backend.modelInformation, function(entry){
            headerDialogBox.append(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-index-tpl-headerDialogBoxEntry").html(),
                {
                    predicateLabel: entry.predicateLabel,
                    objectContent: CubeViz_Visualization_Controller.linkify(
                        entry.content
                    )
                }
            ));
        });
    }
    
    /**
     *
     */
    public renderHeader() 
    {
        var modelLabel;
        
        // if model label is set and not blank, use it!
        if(false === _.isUndefined(this.app._.backend.modelInformation ["http://www.w3.org/2000/01/rdf-schema#label"])
           && false === _.str.isBlank(this.app._.backend.modelInformation ["http://www.w3.org/2000/01/rdf-schema#label"])){
            modelLabel = this.app._.backend.modelInformation ["http://www.w3.org/2000/01/rdf-schema#label"].content;
        
        // if not, use modelUri instead
        } else {
            modelLabel = this.app._.backend.modelUrl;
        }
        
        // decide if model or data set label is visualization headline
        // model is headline, data set is subheadline
        if (false === this.app._.backend.uiSettings.useDataSetInsteadOfModel) {
            // set headline
            $("#cubeviz-index-header").html(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-index-tpl-header").html(),
                { modelLabel: modelLabel }
            ));
            
            // set sub headline
            $("#cubeviz-index-headerSubheadline").html(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-index-tpl-headerSubheadline").html(),
                { selectedDataSet: this.app._.data.selectedDS.__cv_niceLabel }
            ) + $("#cubeviz-index-tpl-headerSubheadlineButtons").html());
        
        // dataset is headline
        } else {
            
            // set headline
            $("#cubeviz-index-header").html(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-index-tpl-headerSubheadline").html(),
                { selectedDataSet: this.app._.data.selectedDS.__cv_niceLabel }
            ));
            
            // set sub headline
            $("#cubeviz-index-headerSubheadline").html(
                $("#cubeviz-index-tpl-headerSubheadlineButtons").html()
            );
        }
    }
}
