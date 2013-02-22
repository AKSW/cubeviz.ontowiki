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
        // remove event handler
        $("#cubeviz-legend-btnShowRetrievedObservations").off();
        $("#cubeviz-legend-sortByTitle").off();                
        $("#cubeviz-legend-sortByValue").off();
        
        // slide up boxes
        $("#cubeviz-legend-retrievedObservations").slideUp("slow");
        $("#cubeviz-legend-selectedConfiguration").slideUp("slow");
        
        // empty lists
        $("#cubeviz-legend-dataSet").html("");
        $("#cubeviz-legend-observations").html("");
        $("#cubeviz-legend-configurationList").html("");
        
        // Question mark dialog
        CubeViz_View_Helper.destroyDialog(
            $("#cubeviz-legend-componentDimensionInfoDialog")
        );
        
        super.destroy();
        return this;
    }
    
    /**
     *
     */
    public displayDsdAndDs(dsdLabel, dsdUrl, dsLabel, dsUrl) 
    {
        var dsdAndDsTpl = _.template($("#cubeviz-legend-tpl-dsdAndDs").text());
        $("#cubeviz-legend-dsdAndDs").html(dsdAndDsTpl({
            dsdLabel: dsdLabel, dsdUrl: dsdUrl,
            dsLabel: dsLabel, dsUrl: dsUrl
        }));
    }
    
    /**
     *
     */
    public displayRetrievedObservations(list:any[]) : void
    {
        // templates
        var observationInfoEntry:any = _.template($("#cubeviz-legend-tpl-observationInfoListEntry").text()),
            observationTpl:any = _.template($("#cubeviz-legend-tpl-observation").text());
                
        // variables
        var infoList:any = null;
     
        $("#cubeviz-legend-observations").html("");
        
        // go through all observations        
        _.each(list, function(obs){
            $("#cubeviz-legend-observations").append(observationTpl(obs));
            
            infoList = $($("#cubeviz-legend-observations").find(".cubeviz-legend-observationInfoList").last());
            
            _.each(obs.dimensionElements, function(dimensionElement){
                infoList.append(observationInfoEntry({
                    dimensionLabel: dimensionElement.dimensionLabel,
                    fullLabel: dimensionElement.label,
                    shortLabel: _.str.prune(dimensionElement.label, 65, "..."),
                    url: dimensionElement.value
                }));
            });
        });
    }
        
    /**
     *
     */
    public displaySelectedConfiguration(selectedComponentDimensions:Object) : void
    {
        // template objects
        var tplComponentDimension:any = _.template($("#cubeviz-legend-tpl-componentDimension").text()),
            tplComponentsList:any = _.template($("#cubeviz-legend-tpl-componentList").text()),
            tplDimensionEntry:any = _.template($("#cubeviz-legend-tpl-componentDimensionEntry").text());
                
        // variables
        var componentDimensionInfoArea = null,
            observationIcon = null,
            dimensionElementList:any = null,
            dimensionElementsCopy = new CubeViz_Collection ("http://www.w3.org/2000/01/rdf-schema#label"),
            html:string = "";
                
        $("#cubeviz-legend-components").html(tplComponentsList());
        
        // go through each dimension
        _.each(selectedComponentDimensions, function(dimension){
            $("#cubeviz-legend-componentList").append(tplComponentDimension({
                label: dimension.label
            }));
            
            dimensionElementList = $($("#cubeviz-legend-componentList")
                .find(".cubeviz-legend-componentDimensionList").last());
            
            html = "";
            
            // working with copy of dimension elements ...
            dimensionElementsCopy
                
                // clean it from old elements
                .reset()
                
                // create a copy, avoids changing the source element list
                .addList(JSON.parse(JSON.stringify(dimension.elements)))
                
                // sort label by idKey
                .sortAscendingBy()
                            
                // go through each dimension element
                .each(function(dimensionElement){
                    
                    // add li entry
                    dimensionElementList.append(tplDimensionEntry({
                        label: dimensionElement[dimensionElementsCopy.idKey],
                        url: dimensionElement["__cv_uri"]
                    }));
                    
                    // save reference of info area
                    observationIcon = $(dimensionElementList
                        .find(".cubeviz-legend-observationIcon")
                        .last());
                    
                    // save reference of info area
                    componentDimensionInfoArea = $(dimensionElementList
                        .find(".cubeviz-legend-componentDimensionInfoArea")
                        .last());
                    
                    // select latest show more information button and attach data
                    $(dimensionElementList
                        .find(".cubeviz-legend-componentDimensionShowInfo")
                        .last())
                        .data("componentDimensionElementUri", dimensionElement["__cv_uri"])
                        .data("componentDimensionInfoArea", componentDimensionInfoArea)
                        .data("observationIcon", observationIcon)
                        .data("cubeviz-legend-componentDimensionInfoArea", dimensionElement["__cv_uri"])
                        .data("dimensionHashedUrl", dimension.hashedUrl);
                });
        });
    }
    
    /**
     *
     */
    public generateList(observations:any[], selectedComponentDimensions:any[], 
        selectedMeasureUri:string) : any[]
    {
        var observationLabel = "",
            dimensionElementLabelTpl = _.template(
                $("#cubeviz-legend-tpl-dimensionElementLabel").text()
            ),
            dimensionElements:any = [],
            dimensionInformation:any[] = [],
            label = "",
            observationLabel:string = "",
            rdfsLabelUri = "http://www.w3.org/2000/01/rdf-schema#label",
            result:any[] = [];
            
         // collect all type urls of selected component dimensions
        _.each(selectedComponentDimensions, function(dim, hashedUrl){
            dimensionInformation.push({ hashedUrl: hashedUrl, typeUrl: dim.typeUrl });
        });
        
        // go through all retrieved observations
        _.each(observations, function(obs){

            /**
             * set label of the observation entry
             */       
            observationLabel = "";
            
            if (false === _.isUndefined(obs[rdfsLabelUri])
               && "" != obs[rdfsLabelUri][0].label) {                
                observationLabel = obs[rdfsLabelUri][0].value;
            } else {            
                _.each (dimensionInformation, function(dimension){
                    
                    if(true === _.isUndefined(obs[dimension.typeUrl])){
                        return;
                    }
                    
                    if("" != observationLabel) {
                        observationLabel += " - ";
                    }
                    
                    observationLabel += dimensionElementLabelTpl({
                        label: $.trim(obs[dimension.typeUrl][0].label),
                        url: obs[dimension.typeUrl][0].value
                    });
                });
                
                // if nothing was set
                if ("" == observationLabel){
                    observationLabel = "Observation without dimension data";
                }
            }
            
            dimensionElements = [];
            
            /**
             * set related dimension elements
             */
            _.each(dimensionInformation, function(dimension){
                
                // use label if not is not blank, otherwise value                
                label = false === _.isUndefined(obs[dimension.typeUrl][0].label)
                        && false === _.str.isBlank(obs[dimension.typeUrl][0].label)
                        ? obs[dimension.typeUrl][0].label
                        : obs[dimension.typeUrl][0].value;
                
                dimensionElements.push({
                    dimensionLabel: selectedComponentDimensions[dimension.hashedUrl].label,
                    label: obs[dimension.typeUrl][0].label,
                    value: obs[dimension.typeUrl][0].value
                });
            });
            
            /**
             * add observation entry to list
             */
            result.push ({
                observationLabel: observationLabel,
                observationShortLabel: _.str.prune(observationLabel, 70, " ..."),
                observationValue: obs[selectedMeasureUri][0].value,
                measurePropertyValue: "",
                measurePropertyAttribute: "",
                observationUri: obs.observationUri[0].value,
                dimensionElements: dimensionElements
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
    public onClick_btnShowSelectedConfiguration(event) : bool 
    {
        event.preventDefault();
        
        // show overview
        $("#cubeviz-legend-selectedConfiguration").slideToggle('slow');
        
        return false;
    }
    
    /**
     *
     */
    public onClick_btnShowRetrievedObservations (event) : bool 
    {
        event.preventDefault();
        
        // show overview
        $("#cubeviz-legend-retrievedObservations").slideToggle('slow');
        
        return false;
    }
    
    /**
     *
     */
    public onClick_componentDimensionShowInfo(event) : bool 
    {
        event.preventDefault();
        
        // variables
        var showMoreInformationBtn = $(event.target),
            componentDimensionElementUri = showMoreInformationBtn.data("componentDimensionElementUri"),
            dimensionHashedUrl = showMoreInformationBtn.data("dimensionHashedUrl"),
            dimension = this.app._.data.selectedComponents.dimensions [dimensionHashedUrl],
            dimensionElementInformation = dimension.elements[componentDimensionElementUri],
            observationIcon = showMoreInformationBtn.data("observationIcon");
            
        // templates
        var tplInfoHeader = _.template($("#cubeviz-legend-tpl-componentDimensionInfoHeader").text()),
            tplInfoList = _.template($("#cubeviz-legend-tpl-componentDimensionInfoList").text()),
            tplInfoListEntry = _.template($("#cubeviz-legend-tpl-componentDimensionInfoListEntry").text());
            
        // create an instance of ul
        var infoList = $(tplInfoList());
     
        // go through all dimension element information
        _.each(dimensionElementInformation, function(value, key){
            
            // use related information if its not from CubeViz
            if(false === _.str.startsWith (key, "__cv_")) {                
                // li entry
                infoList.append(tplInfoListEntry({
                    key: key,
                    value: value
                }));
            }
        });
        
        // append generated list to info area and fade it in / out
        $("#cubeviz-legend-componentDimensionInfoDialog")
            .html("")
            .append($(tplInfoHeader()))
            .append(infoList)
            .fadeToggle("slow");
            
        $("#cubeviz-legend-componentDimensionInfoDialog").dialog("open");
        
        return false;
    }
    
    /**
     *
     */
    public onClick_sortByTitle() 
    {
        this.collection.sortAscendingBy ("observationLabel");
        this.displayRetrievedObservations(this.collection._);
    }
    
    /**
     *
     */
    public onClick_sortByValue() 
    {
        this.collection.sortAscendingBy ("observationValue");
        this.displayRetrievedObservations(this.collection._);
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
         * Show Data Structure Definition and Data set
         */
        this.displayDsdAndDs( 
            // DSD
            this.app._.data.selectedDSD.label, this.app._.data.selectedDSD.url,
            // DS
            this.app._.data.selectedDS.label, this.app._.data.selectedDS.url
        );
        
        /**
         * Selected configuration
         */
        this.displaySelectedConfiguration( 
            this.app._.data.selectedComponents.dimensions
        );
        
        /**
         * Observation list 
         */
                     
        // read all observations and generates a list of it
        this.collection.reset("observationLabel").addList(this.generateList(
            this.app._.backend.retrievedObservations,
            this.app._.data.selectedComponents.dimensions,
            selectedMeasureUri
        ));
        
        // sort generated list by title (observationLabel)
        this.collection.sortAscendingBy ("observationLabel");
        
        // render list in HTML
        this.displayRetrievedObservations(this.collection._);
        
        // attach dialog which contains model information
        CubeViz_View_Helper.attachDialogTo(
            $("#cubeviz-legend-componentDimensionInfoDialog"),
            {closeOnEscape: true, showCross: true, width: 550}
        );
        
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({
            "click #cubeviz-legend-btnShowSelectedConfiguration": 
                this.onClick_btnShowSelectedConfiguration,
                
            "click #cubeviz-legend-btnShowRetrievedObservations": 
                this.onClick_btnShowRetrievedObservations,
                
            "click .cubeviz-legend-componentDimensionShowInfo": 
                this.onClick_componentDimensionShowInfo,
                
            "click #cubeviz-legend-sortByTitle": 
                this.onClick_sortByTitle,
                
            "click #cubeviz-legend-sortByValue": 
                this.onClick_sortByValue
        });
        
        return this;
    }
}
