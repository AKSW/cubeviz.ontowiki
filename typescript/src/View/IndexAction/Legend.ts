/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_IndexAction_Legend extends CubeViz_View_Abstract
{
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_IndexAction_Legend", attachedTo, app);
        
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
            }
        ]);
    }
    
    /**
     *
     */
    public destroy() : CubeViz_View_Abstract
    {
        // slide up box
        $("#cubeviz-legend-definitionsAndScopes").slideUp("slow");
        
        // empty data container
        $("#cubeviz-legend-dataSet").html("");
        $("#cubeviz-legend-observations").html("");
        
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
    public onClick_definitionsAndScopesButton(event) : bool 
    {
        event.preventDefault();
        
        // show overview
        $("#cubeviz-legend-definitionsAndScopes").slideToggle('slow');
        
        return false;
    }
    
    /**
     *
     */
    public onReRender_visualization() 
    {
        this.destroy();
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
    public render() : CubeViz_View_Abstract
    {
        $("#cubeviz-legend-definitionsAndScopes").hide();
     
        var selectedMeasureUri = CubeViz_Visualization_Controller.getSelectedMeasure(
                this.app._.data.selectedComponents.measures
            ).typeUrl,
            self = this;
        
        /**
         * Data set
         */
        var dataSetTpl = _.template($("#cubeviz-legend-tpl-dataSet").text());
        $("#cubeviz-legend-dataSet").html(dataSetTpl({
            label: this.app._.data.selectedDS.label,
            url: this.app._.data.selectedDS.url
        }));
        
        
        /**
         * Observation list 
         */
        var observationLabel:string = "",
            dimensionElementLabelTpl = _.template(
            $("#cubeviz-legend-tpl-dimensionElementLabel").text()),
            observationTpl:any = _.template($("#cubeviz-legend-tpl-observation").text()),
            dimensionTypeUrls:string[] = [],
            rdfsLabelUri = "http://www.w3.org/2000/01/rdf-schema#label";
            
        // collect all type urls of selected component dimensions
        _.each(self.app._.data.selectedComponents.dimensions, function(dim){
            dimensionTypeUrls.push(dim.typeUrl);
        });
        
        _.each(this.app._.data.retrievedObservations, function(obs){
            
            /**
             * Set label of the observation entry
             */       
            observationLabel = "";
            
            if(false === _.isUndefined(obs[rdfsLabelUri])
               && "" != obs[rdfsLabelUri][0].label) {                
                observationLabel = obs[rdfsLabelUri][0].value;
            } else {            
                _.each(dimensionTypeUrls, function(typeUrl){
                    
                    if(true === _.isUndefined(obs[typeUrl])){
                        return;
                    }
                    
                    if("" != observationLabel) {
                        observationLabel += " - ";
                    }
                    
                    observationLabel += dimensionElementLabelTpl({
                        label: $.trim(obs[typeUrl][0].label),
                        url: obs[typeUrl][0].value
                    });
                });
                
                // if nothing was set
                if("" == observationLabel){
                    observationLabel = "Observation without dimension data!";
                }
            }
            
            /**
             * add observation entry to list
             */
            $("#cubeviz-legend-observations").append(observationTpl({
                observationLabel: observationLabel,
                observationValue: obs[selectedMeasureUri][0].value,
                measurePropertyValue: "",
                measurePropertyAttribute: "",
                observationUri: obs.observationUri[0].value
            }));
        });
        
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({
            "click #cubeviz-legend-definitionsAndScopesButton": 
                this.onClick_definitionsAndScopesButton
        });
        
        return this;
    }
}
