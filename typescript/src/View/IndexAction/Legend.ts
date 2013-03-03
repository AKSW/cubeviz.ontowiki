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
        var infoList:any = null,
            label = "";
     
        $("#cubeviz-legend-observations").html("");
        
        // go through all observations        
        _.each(list, function(obs){
            $("#cubeviz-legend-observations").append(observationTpl(obs));
            
            infoList = $($("#cubeviz-legend-observations").find(".cubeviz-legend-observationInfoList").last());
            
            _.each(obs.__cv_elements, function(dimensionElement){
                
                infoList.append(observationInfoEntry({
                    dimensionLabel: dimensionElement.dimensionLabel,
                    fullLabel: dimensionElement.__cv_niceLabel,
                    shortLabel: _.str.prune(dimensionElement.__cv_niceLabel, 65, "..."),
                    __cv_uri: dimensionElement.__cv_uri
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
            dimensionElementsCopy = new CubeViz_Collection ("__cv_uri"),
            html:string = "",
            label:string = "";
                
        $("#cubeviz-legend-components").html(tplComponentsList());
        
        // go through each dimension
        _.each(selectedComponentDimensions, function(dimension){
            $("#cubeviz-legend-componentList").append(tplComponentDimension({
                __cv_niceLabel: dimension.__cv_niceLabel
            }));
            
            dimensionElementList = $($("#cubeviz-legend-componentList")
                .find(".cubeviz-legend-componentDimensionList").last());
            
            html = "";
            
            // working with copy of dimension elements ...
            dimensionElementsCopy
                
                // clean it from old elements
                .reset()
                
                // create a copy, avoids changing the source element list
                .addList(JSON.parse(JSON.stringify(dimension.__cv_elements)))
                
                // sort label by idKey
                .sortAscendingBy()
                            
                // go through each dimension element
                .each(function(dimensionElement){
                    
                    // add li entry
                    dimensionElementList.append(tplDimensionEntry({
                        fullLabel: dimensionElement.__cv_niceLabel,
                        shortLabel: _.str.prune(dimensionElement.__cv_niceLabel, 75, " ..."),
                        __cv_uri: dimensionElement.__cv_uri
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
                        .data("componentDimensionElementUri", dimensionElement.__cv_uri)
                        .data("componentDimensionInfoArea", componentDimensionInfoArea)
                        .data("observationIcon", observationIcon)
                        .data("cubeviz-legend-componentDimensionInfoArea", dimensionElement.__cv_uri)
                        .data("dimension", dimension);
                });
        });
    }
    
    /**
     *
     */
    public generateList(observations:any[], selectedComponentDimensions:any[], 
        selectedMeasureUri:string) : any[]
    {
        var cubeDimensionUri = "http://purl.org/linked-data/cube#dimension",
            observationLabel = "",
            dimensionElementLabelTpl = _.template(
                $("#cubeviz-legend-tpl-dimensionElementLabel").text()
            ),
            dimensionElements:any = [],
            label = "",
            observationLabel:string = "",
            rdfsLabelUri = "http://www.w3.org/2000/01/rdf-schema#label",
            result:any[] = [];
        
        // go through all retrieved observations
        _.each(observations, function(observation){
            
            /**
             * set related dimension elements
             * each observation is associated with a couple of dimension elements,
             * but only one element per dimension. here we selected these elements
             * and save their uri and label to show it later on.
             */
            dimensionElements = [];
            _.each(selectedComponentDimensions, function(dimension){
                _.each(dimension.__cv_elements, function(dimensionElement){
                    // check the related dimension element uri set in observation
                    // if it is equal to current dimension element, use it
                    if (dimensionElement.__cv_uri == observation[dimension[cubeDimensionUri]]) {
                        dimensionElements.push({
                            dimensionLabel: dimension.__cv_niceLabel,
                            __cv_niceLabel: dimensionElement.__cv_niceLabel,
                            __cv_uri: dimensionElement.__cv_uri
                        });
                    }
                });
            });
            
            /**
             * add observation entry to list
             */
            result.push ({
                __cv_niceLabel: observation.__cv_niceLabel,
                __cv_value: observation[selectedMeasureUri],
                __cv_uri: observation.__cv_uri,
                __cv_elements: dimensionElements
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
            dimensionElementInformation = dimension.__cv_elements[componentDimensionElementUri],
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
        this.collection.sortAscendingBy ("__cv_niceLabel");
        this.displayRetrievedObservations(this.collection._);
    }
    
    /**
     *
     */
    public onClick_sortByValue() 
    {
        this.collection.sortAscendingBy ("__cv_value");
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
        var selectedMeasureUri = this.app._.data.selectedComponents.measures[
                Object.keys(this.app._.data.selectedComponents.measures)[0]
            ]["http://purl.org/linked-data/cube#measure"],
            self = this;
        
        /**
         * Show Data Structure Definition and Data set
         */
        this.displayDsdAndDs( 
            // DSD
            this.app._.data.selectedDSD.__cv_niceLabel, this.app._.data.selectedDSD.__cv_uri,
            // DS
            this.app._.data.selectedDS.__cv_niceLabel, this.app._.data.selectedDS.__cv_uri
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
        this.collection.reset("__cv_niceLabel").addList(this.generateList(
            this.app._.backend.retrievedObservations,
            this.app._.data.selectedComponents.dimensions,
            selectedMeasureUri
        ));
        
        // sort generated list by title (observationLabel)
        this.collection.sortAscendingBy ("__cv_niceLabel");
        
        // render list in HTML
        this.displayRetrievedObservations(this.collection._);
        
        // attach dialog which contains model information
        CubeViz_View_Helper.attachDialogTo(
            $("#cubeviz-legend-componentDimensionInfoDialog"),
            {closeOnEscape: true, showCross: true, width: 550}
        );
        
        // remove event handler
        $("#cubeviz-legend-btnShowRetrievedObservations").off();
        $("#cubeviz-legend-btnShowSelectedConfiguration").off();
        $("#cubeviz-legend-componentDimensionShowInfo").off();
        $("#cubeviz-legend-sortByTitle").off();                
        $("#cubeviz-legend-sortByValue").off();
        
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
