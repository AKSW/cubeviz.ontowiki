/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\jsontemplate.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CubeVizModule_DataStructureDefintion extends CubeViz_View_Abstract 
{
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CubeVizModule_DataStructureDefintion", attachedTo, app);
        
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
        
        CubeViz_View_Helper.destroyDialog(
            $("#cubeviz-dataStructureDefinition-dialog")
        );
        
        return this;
    }
    
    /**
     * 
     */
    public initialize() : void
    {        
        // save given elements, doublings were ignored!
        this.collection
            .reset("__cv_uri")
            .addList(this.app._.data.dataStructureDefinitions);
        
        // render given elements
        this.render();
    }
    
    /**
     * If new option was selected
     */
    public onChange_list(event) : void 
    {
        this.showSpinner();
        
        this.triggerGlobalEvent("onBeforeChange_selectedDSD");
        
        var selectedElementId:string = $("#cubeviz-dataStructureDefinition-list").val(),
            selectedElement = this.collection.get(selectedElementId);
        
        // TODO: remember previous selection
        
        // set new selected data structure definition
        this.app._.data.selectedDSD = selectedElement;
    
        this.triggerGlobalEvent("onAfterChange_selectedDSD");
    }
    
    /**
     *
     */
    public onClick_questionmark() 
    {
        CubeViz_View_Helper.openDialog(
            $("#cubeviz-dataStructureDefinition-dialog")
        );
    }
    
    /**
     *
     */
    public onStart_application(event, data) 
    {
        this.initialize();
    }
    
    /**
     * 
     */
    public render() : CubeViz_View_Abstract
    {
        /**
         * List of items
         */        
        var list = $("#cubeviz-dataStructureDefinition-list"),
            optionTpl = jsontemplate.Template($("#cubeviz-dataStructureDefinition-tpl-listOption").html()),
            self = this;

        // output loaded data
        this.collection.each(function(element){
            
            // set selected variable, if element's __cv_uri is equal to selected dsd's one
            element["selected"] = element.__cv_uri == self.app._.data.selectedDSD.__cv_uri
                ? " selected" : "";

            list.append(optionTpl.expand(element));
        });
        
        /**
         * Question mark dialog
         */
        CubeViz_View_Helper.attachDialogTo(
            $("#cubeviz-dataStructureDefinition-dialog"),
            {closeOnEscape: true, showCross: true, width: 500}
        );
        
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({
            "change #cubeviz-dataStructureDefinition-list" : this.onChange_list,
            "click #cubeviz-dataStructureDefinition-questionMark": this.onClick_questionmark
        });
        
        this.triggerGlobalEvent("onAfterRender_dataStructureDefinition");
        
        return this;
    }
    
    /**
     * Show a spinner to let the user know that something is working.
     * @return void
     */
    public showSpinner() : void
    {        
        $("#cubeviz-module-dataSelection").slideUp("slow", function(){
            $("#cubeviz-module-spinner").slideDown("slow");
        });
    }
}
