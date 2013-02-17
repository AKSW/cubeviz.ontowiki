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
    public displayDataSet(dsLabel, dsUrl) 
    {
        var dataSetTpl = _.template($("#cubeviz-legend-tpl-dataSet").text());
        $("#cubeviz-legend-dataSet").html(dataSetTpl({label: dsLabel, url: dsUrl}));
    }
    
    /**
     *
     */
    public displayList(list:any[]) 
    {
        $("#cubeviz-legend-observations").html("");
        
        var observationTpl:any = _.template($("#cubeviz-legend-tpl-observation").text());
                
        _.each(list, function(obs){
            $("#cubeviz-legend-observations").append(observationTpl(obs));
        });
    }
    
    /**
     *
     */
    public generateList(observations:any[], selectedComponentDimensions:any[], 
        selectedMeasureUri:string) 
    {
        var observationLabel = "",
            dimensionElementLabelTpl = _.template(
                $("#cubeviz-legend-tpl-dimensionElementLabel").text()
            ),
            dimensionTypeUrls:string[] = [],
            observationLabel:string = "",
            rdfsLabelUri = "http://www.w3.org/2000/01/rdf-schema#label",
            result:any[] = [];
            
         // collect all type urls of selected component dimensions
        _.each(selectedComponentDimensions, function(dim){
            dimensionTypeUrls.push(dim.typeUrl);
        });        
        
        // go through all retrieved observations
        _.each(observations, function(obs){
            
            /**
             * Set label of the observation entry
             */       
            observationLabel = "";
            
            if (false === _.isUndefined(obs[rdfsLabelUri])
               && "" != obs[rdfsLabelUri][0].label) {                
                observationLabel = obs[rdfsLabelUri][0].value;
            } else {            
                _.each (dimensionTypeUrls, function(typeUrl){
                    
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
                if ("" == observationLabel){
                    observationLabel = "Observation without dimension data";
                }
            }
            
            /**
             * add observation entry to list
             */
            result.push ({
                observationLabel: observationLabel,
                observationValue: obs[selectedMeasureUri][0].value,
                measurePropertyValue: "",
                measurePropertyAttribute: "",
                observationUri: obs.observationUri[0].value
            });
        });
        
        return result;
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
    public onClick_sortByTitle() 
    {
        this.collection.sortAscendingBy ("observationLabel");
        this.displayList(this.collection._);
    }
    
    /**
     *
     */
    public onClick_sortByValue() 
    {
        this.collection.sortAscendingBy ("observationValue");
        this.displayList(this.collection._);
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
        var selectedMeasureUri = CubeViz_Visualization_Controller.getSelectedMeasure(
                this.app._.data.selectedComponents.measures
            ).typeUrl,
            self = this;
        
        /**
         * Data set
         */
        this.displayDataSet( 
            this.app._.data.selectedDS.label,
            this.app._.data.selectedDS.url
        );
        
        /**
         * Observation list 
         */
                     
        // read all observations and generates a list of it
        this.collection.reset("observationLabel").addList(this.generateList(
            this.app._.data.retrievedObservations,
            this.app._.data.selectedComponents.dimensions,
            selectedMeasureUri
        ));
        
        // sort generated list by title (observationLabel)
        this.collection.sortAscendingBy ("observationLabel");
        
        // render list in HTML
        this.displayList(this.collection._);
        
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({
            "click #cubeviz-legend-definitionsAndScopesButton": 
                this.onClick_definitionsAndScopesButton,
                
            "click #cubeviz-legend-sortByTitle": 
                this.onClick_sortByTitle,
                
            "click #cubeviz-legend-sortByValue": 
                this.onClick_sortByValue
        });
        
        return this;
    }
}
