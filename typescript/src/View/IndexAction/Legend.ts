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
        $("#cubeviz-legend-dsdAndDs").html(CubeViz_View_Helper.tplReplace(
            $("#cubeviz-legend-tpl-dsdAndDs").html(),
            { dsdLabel: dsdLabel, dsdUrl: dsdUrl, dsLabel: dsLabel, dsUrl: dsUrl }
        ));
    }
    
    /**
     * observations any[] 
     * selectedDimensions any
     * selectedMeasure any
     */
    public displayRetrievedObservations(observations:any[], selectedDimensions:any,
        selectedMeasure:any) : void
    {                
        var html:string = "",
            i:number = 0,
            label:string = "";
     
        $("#cubeviz-legend-observations").html("");
        
        /**
         * set table header
         */
        html = "<tr>";
        _.each(selectedDimensions, function(dimension){
            // head entry
            html += "<td>"
                    + CubeViz_View_Helper.tplReplace(
                        $("#cubeviz-legend-tpl-tableHeadEntry").html(), dimension
                    ) 
                    + "</td>";
        });
        
        // title of selected measure
        html += "<td colspan=\"2\">" 
                + CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-legend-tpl-tableHeadEntry").html(), selectedMeasure
                  )
                + "</td>";          
             
        // dummy cell
        html += "<td></td></tr>";
        
        // add generated HTML to DOM
        $("#cubeviz-legend-observations").append(html);
        
        // attach dimension objects to sortAsc and sortDesc buttons
        _.each(selectedDimensions, function(dimension){
            // sortAsc button
            $($("#cubeviz-legend-observations").find(".cubeviz-legend-sortAsc").get(i))
                .data ("dimension", dimension);
            
            // sortDesc button
            $($("#cubeviz-legend-observations").find(".cubeviz-legend-sortDesc").get(i++))
                .data ("dimension", dimension);
        });
        
        // attach measure object to value column
        $($("#cubeviz-legend-observations").find(".cubeviz-legend-sortAsc").get(i))
                .data ("measure", selectedMeasure);
        $($("#cubeviz-legend-observations").find(".cubeviz-legend-sortDesc").get(i))
                .data ("measure", selectedMeasure);
                
        
        /**
         * add line with additional information about the meta data
         */
        var observationValues = DataCube_Observation.getValues(
                observations, selectedMeasure ["http://purl.org/linked-data/cube#measure"]
            ),
            // range of the values of observations
            rangeMin = "<strong>min:</strong> " + String(jsStats.min (observationValues[0])).substring(0, 10),
            rangeMax = "<strong>max:</strong> " + String(jsStats.max (observationValues[0])).substring(0, 10);
            
        html = "<tr class=\"info\">";
        
        _.each(selectedDimensions, function(dimension){ 
            html += "<td><strong>" + _.size(dimension.__cv_elements) + "</strong> different dimension elements</td>"; });
        
        html +=   "<td>" + rangeMin + "</td>"
                + "<td>" + rangeMax + "</td>"
                + "<td></td>"
                "</tr>";
        
        $("#cubeviz-legend-observations").append(html);
        
        /**
         * go through all observations        
         */
        _.each(observations, function(observation){
            
            html = "<tr>";
            
            _.each(selectedDimensions, function(dimension){
                
                // get label of dimension element used in observation
                _.each(dimension.__cv_elements, function(element){
                    if (element.__cv_uri == observation[dimension ["http://purl.org/linked-data/cube#dimension"]]) {
                        label = element.__cv_niceLabel;
                    }
                });
                
                // add label of according dimension element
                html += "<td class=\"cubeviz-legend-dimensionElementLabelTd\">" 
                        + "<a href=\"" + observation[dimension ["http://purl.org/linked-data/cube#dimension"]] + "\" "
                        +    "title=\"" + observation[dimension ["http://purl.org/linked-data/cube#dimension"]] + "\" "
                        +    "target=\"_blank\">"
                        + label
                        + "</a>"
                        + "</td>";
            });
        
            // observation value
            html += "<td class=\"cubeviz-legend-measureTd\" colspan=\"2\">" 
                    + observation[selectedMeasure["http://purl.org/linked-data/cube#measure"]]
                    + "</td>";
            
            // link to observation
            html += "<td>" 
                    + "<a href=\"" + observation.__cv_uri + "\" target=\"_blank\">Link</a>"
                    + "</td>";
            
            // close line
            html += "</tr>";       
            
            $("#cubeviz-legend-observations > tbody:last").append(html);
        });
        
        // re-bind event handler
        this.bindUserInterfaceEvents({
            "click .cubeviz-legend-sortAsc": this.onClick_sortAsc,
            "click .cubeviz-legend-sortDesc": this.onClick_sortDesc
        })
    }
        
    /**
     *
     */
    public displaySelectedConfiguration(selectedComponentDimensions:Object) : void
    {
        // variables
        var componentDimensionInfoArea = null,
            observationIcon = null,
            dimensionElementList:any = null,
            dimensionElementsCopy = new CubeViz_Collection ("__cv_uri"),
            html:string = "",
            label:string = "";
                
        $("#cubeviz-legend-components").html($("#cubeviz-legend-tpl-componentList").html());
        
        // go through each dimension
        _.each(selectedComponentDimensions, function(dimension){
            
            // set dimension information (label)
            $("#cubeviz-legend-componentList").append(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-legend-tpl-componentDimension").html(),
                { __cv_niceLabel: dimension.__cv_niceLabel }
            ));
            
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
                    dimensionElementList.append(CubeViz_View_Helper.tplReplace(
                        $("#cubeviz-legend-tpl-componentDimensionEntry").html(),
                        {
                            fullLabel: dimensionElement.__cv_niceLabel,
                            __cv_shortLabel: _.str.prune(dimensionElement.__cv_niceLabel, 75, " ..."),
                            __cv_uri: dimensionElement.__cv_uri
                        }
                    ));
                    
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
                        .data("componentDimensionInfoArea", componentDimensionInfoArea)
                        .data("dimension", dimension)
                        .data("dimensionElement", dimensionElement)
                        .data("observationIcon", observationIcon);
                });
        });
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
        $("#cubeviz-legend-retrievedObservations").slideToggle("slow");
        
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
            dimension = showMoreInformationBtn.data("dimension"),
            dimensionElement = showMoreInformationBtn.data("dimensionElement"),
            observationIcon = showMoreInformationBtn.data("observationIcon");
            
        // create an instance of ul
        var infoList = $($("#cubeviz-legend-tpl-componentDimensionInfoList").html());
     
        // go through all dimension element information
        _.each(dimensionElement, function(value, key){
            
            // use related information if its not from CubeViz
            if(false === _.str.startsWith (key, "__cv_")) {                
                // li entry
                infoList.append(CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-legend-tpl-componentDimensionInfoListEntry").html(),
                    {
                        key: key,
                        value: CubeViz_Visualization_Controller.linkify(value)
                    }
                ));
            }
        });
        
        // append generated list to info area and fade it in / out
        $("#cubeviz-legend-componentDimensionInfoDialog")
            .html("")
            .append(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-legend-tpl-componentDimensionInfoHeader").html(),
                dimensionElement
            ))
            .append(infoList)
            .fadeIn("slow");
            
        $("#cubeviz-legend-componentDimensionInfoDialog").dialog("open");
        
        return false;
    }
    
    /**
     *
     */
    public onClick_sortAsc(e) : void 
    {
        /**
         * click to a dimension
         */
        if (false === _.isUndefined($(e.target).data("dimension"))) {
            
            this.app._.data.retrievedObservations = this.sortDimensionsAscOrDesc(
                $(e.target).data("dimension"),
                this.app._.data.retrievedObservations,
                -1,
                1
            );
            
        /**
         * click to a measure
         */
        } else if (false === _.isUndefined($(e.target).data("measure"))) {
            
            this.app._.data.retrievedObservations = this.sortMeasureValuesAscOrDesc(
                $(e.target).data("measure"),
                this.app._.data.retrievedObservations,
                -1,
                1
            );            
        } 
        
        // In this case, there was no valid data attached, so ignore this click
        else { return; }        
        
        // reset legend table
        this.displayRetrievedObservations(
            this.app._.data.retrievedObservations, 
            this.app._.data.selectedComponents.dimensions,
            this.app._.data.selectedComponents.measure
        );
    }
    
    /**
     *
     */
    public onClick_sortDesc(e) : void 
    {
        /**
         * click to a dimension
         */
        if (false === _.isUndefined($(e.target).data("dimension"))) {
            
            this.app._.data.retrievedObservations = this.sortDimensionsAscOrDesc(
                $(e.target).data("dimension"),
                this.app._.data.retrievedObservations,
                1,
                -1
            );
            
        /**
         * click to a measure
         */
        } else if (false === _.isUndefined($(e.target).data("measure"))) {
            
            this.app._.data.retrievedObservations = this.sortMeasureValuesAscOrDesc(
                $(e.target).data("measure"),
                this.app._.data.retrievedObservations,
                1,
                -1
            );            
        } 
        
        // In this case, there was no valid data attached, so ignore this click
        else { return; }        
        
        // reset legend table
        this.displayRetrievedObservations(
            this.app._.data.retrievedObservations, 
            this.app._.data.selectedComponents.dimensions,
            this.app._.data.selectedComponents.measure
        );
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
        var selectedMeasureUri = this.app._.data.selectedComponents.measure["http://purl.org/linked-data/cube#measure"],
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
        this.collection
            .reset("__cv_niceLabel")
            .addList(this.app._.data.retrievedObservations);
        
        // sort generated list
        this.collection.sortAscendingBy (selectedMeasureUri);
        
        // render list in HTML
        this.displayRetrievedObservations(
            this.collection._,
            this.app._.data.selectedComponents.dimensions,
            this.app._.data.selectedComponents.measure
        );
        
        // attach dialog which contains model information
        CubeViz_View_Helper.attachDialogTo(
            $("#cubeviz-legend-componentDimensionInfoDialog"),
            {closeOnEscape: true, showCross: true, height: 450, width: "50%"}
        );
        
        // remove event handler
        $("#cubeviz-legend-btnShowRetrievedObservations").off();
        $("#cubeviz-legend-btnShowSelectedConfiguration").off();
        $(".cubeviz-legend-componentDimensionShowInfo").off();
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
        });
        
        return this;
    }
    
    /**
     * @param selectedComponent any
     * @param observations any
     * @param ifLower number If the first value is lower than the second one
     * @param ifHigher number If the first value is higher than the second one
     */
    public sortDimensionsAscOrDesc(selectedComponent:any, observations:any, ifLower:number, ifHigher:number) 
    {
        var accordingFieldLabel:string = "",
            anotherAccordingFieldLabel:string = "",
            observationList = new CubeViz_Collection("__cv_uri"),
            selectedComponentUri:string = selectedComponent["http://purl.org/linked-data/cube#dimension"];
            
        observationList.addList(observations);
        
        // sort observations
        observationList._.sort(function(observation, anotherObservation){
            
            // get dimension element label for a observation
            accordingFieldLabel = DataCube_Component.findDimensionElement(
                selectedComponent.__cv_elements, observation [selectedComponentUri]
            ).__cv_niceLabel;
            
            // get dimension element label for the other observation
            anotherAccordingFieldLabel = DataCube_Component.findDimensionElement(
                selectedComponent.__cv_elements, anotherObservation[selectedComponentUri]
            ).__cv_niceLabel;
            
            return accordingFieldLabel < anotherAccordingFieldLabel
                ? ifLower : ifHigher;
        });
        
        return observationList.toObject();
    }
    
    /**
     * @param selectedComponent any
     * @param observations any
     * @param ifLower number If the first value is lower than the second one
     * @param ifHigher number If the first value is higher than the second one
     */
    public sortMeasureValuesAscOrDesc(selectedComponent:any, observations:any, ifLower:number, ifHigher:number) 
    {
        var observationList = new CubeViz_Collection ("__cv_uri"),
            selectedComponentUri = selectedComponent["http://purl.org/linked-data/cube#measure"];
        
        observationList.addList(observations);
        
        // sort observations
        observationList._.sort(function(observation, anotherObservation){                
            return observation[selectedComponentUri] < anotherObservation[selectedComponentUri]
                ? ifLower : ifHigher;
        });
        
        return observationList.toObject();
    }
}
