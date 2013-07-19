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
     * @param dataset any
     */
    public displayDataset(dataset:any, dataStructureDefinition:any) : void 
    {
        var self = this,
            tmp:any = null;
        
        // label
        $("#cubeviz-legend-dsLabel").html (
            "<a href=\"" + dataset.__cv_uri + "\" target=\"_blank\">" 
            + dataset.__cv_niceLabel + "</a>"
        );
        
        /**
         * rest of properties
         */
        $("#cubeviz-legend-dsProperties").html(
            "<tr class=\"info\">"
            + "<td><strong>Property</strong></td>"
            + "<td><strong>Value</strong></td>" +
            "</tr>"
        );
        
        // URI
        $("#cubeviz-legend-dsProperties").append(
            "<tr>"
            + "<td>URI</td>"
            + "<td style=\"word-break:break-all;\">" +
                "<a href=\"" + dataset.__cv_uri + "\" target=\"_blank\">" +
                    dataset.__cv_uri + 
                "</a></td>" +
            "</tr>"
        );
        
        _.each (dataset, function(value, property){
            
            // only show property with really uris (exclude __cv_* uri's)
            if (false === _.str.include(property, "__cv_")) {
                
                // relation to data structure definition
                if ("http://purl.org/linked-data/cube#structure" == property) {
                    
                    value = "<a href=\"" + dataStructureDefinition.__cv_uri + "\""
                               + " target=\"_blank\">" 
                               + dataStructureDefinition.__cv_niceLabel + "</a>";
                    
                // if value is list (object or array)
                } else if (true === _.isObject(value) || true === _.isArray(value)){
                    
                    var list = new CubeViz_Collection();
                    value = CubeViz_Visualization_Controller.linkify (
                        list.addList (value)._.join (", ")
                    );
                
                // simple property-value-pair    
                } else {
                    if (true === self.isValidUrl(value)) {
                        value = "<a href=\"" + value + "\" target=\"_blank\">"
                                    + _.str.prune (value, 60) +
                                "</a>";
                    }
                }
                
                // add pair to list
                $("#cubeviz-legend-dsProperties").append(
                    "<tr>"
                    + "<td>"
                        + "<a href=\"" + property + "\" target=\"_blank\">" + property + "</a></td>"
                    + "<td style=\"word-break:break-all;\">" + value + "</td>" +
                    "</tr>"
                );
            }
        });
        
        /**
         * if available, show source datasets
         */
        if (false === _.isNull(dataset.__cv_sourceDataset)
            && false === _.isUndefined(dataset.__cv_sourceDataset)) {
            
            // go through each source dataset
            _.each (dataset.__cv_sourceDataset, function(sourceDataset){
                
                // source dataset label
                $("#cubeviz-legend-dsProperties").append (
                    "<tr><td colspan=\"2\"></td></tr>" + 
                    
                    "<tr class=\"warning\">" + 
                        "<td colspan=\"2\">" + 
                            "<strong>Source Dataset: " + 
                            "<a href=\"" + sourceDataset.__cv_uri + "\" target=\"_blank\">" + 
                            sourceDataset.__cv_niceLabel + "</a></strong>" + 
                        "</td>" +
                    "</tr>"
                );
                
                // URI
                $("#cubeviz-legend-dsProperties").append(
                    "<tr>"
                    + "<td>URI</td>"
                    + "<td style=\"word-break:break-all;\">" + 
                        "<a href=\"" + sourceDataset.__cv_uri + "\" target=\"_blank\">" + 
                            sourceDataset.__cv_uri + "</a></td>" +
                    "</tr>"
                );
                
                // go through all properties of a source dataset
                _.each (sourceDataset, function(value, property){
                    
                    // only show property with really uris (exclude __cv_* uri's)
                    if (false === _.str.include(property, "__cv_")) {
                            
                        // if value is list (object or array)
                        if (true === _.isObject(value) || true === _.isArray(value)){
                            
                            var list = new CubeViz_Collection();
                            value = CubeViz_Visualization_Controller.linkify (
                                list.addList (value)._.join (", ")
                            );
                        
                        // simple property-value-pair    
                        } else {
                            if (true === self.isValidUrl(value)) {
                                value = "<a href=\"" + value + "\" target=\"_blank\">"
                                            + _.str.prune (value, 60) +
                                        "</a>";
                            }
                        }
                        
                        // add pair to list
                        $("#cubeviz-legend-dsProperties").append(
                            "<tr>"
                            + "<td>"
                                + "<a href=\"" + property + "\" target=\"_blank\">" + property + "</a></td>"
                            + "<td>" + value + "</td>" +
                            "</tr>"
                        );
                    }
                });
            });
        }
    }
    
    /**
     * @param dataStructureDefinition any
     */
    public displayDataStructureDefinition(dataStructureDefinition:any) : void
    {
        var self = this,
            tmp:any = null;
        
        // label
        $("#cubeviz-legend-dsdLabel").html (
            "<a href=\"" + dataStructureDefinition.__cv_uri + "\" target=\"_blank\">" 
            + dataStructureDefinition.__cv_niceLabel + "</a>"
        );
        
        // rest of properties
        $("#cubeviz-legend-dsdProperties").html(
            "<tr class=\"info\">"
            + "<td><strong>Property</strong></td>"
            + "<td><strong>Value</strong></td>" +
            "</tr>"
        );
        
        // URI
        $("#cubeviz-legend-dsdProperties").append(
            "<tr>"
            + "<td>URI</td>"
            + "<td style=\"word-break:break-all;\">" +
                "<a href=\"" + dataStructureDefinition.__cv_uri + "\" target=\"_blank\">" +
                    dataStructureDefinition.__cv_uri +
                "</a></td>" +
            "</tr>"
        );
        
        _.each (dataStructureDefinition, function(value, property){
            
            // only show values with really properties (exclude __cv_* uri's)
            if (false === _.str.include(property, "__cv_")) {
                
                // component relations
                if ("http://purl.org/linked-data/cube#component" == property) {
                    
                    var labels:string[] = [],
                        list:CubeViz_Collection = new CubeViz_Collection();
                    
                    // get list of value labels
                    list.addList(value)
                        .each(function(element){                            
                            // dimensions
                            _.each(self.app._.data.selectedComponents.dimensions, function(dimension){
                                if (element === dimension.__cv_uri) {
                                    labels.push(
                                        "<a href=\"#" + (CryptoJS.MD5(dimension.__cv_uri) + "").substring (0, 6) + "\">" 
                                        + dimension.__cv_niceLabel + "</a> " +
                                        "<i class=\"icon-anchor\" style=\"font-size: 10px;\"></i>"
                                    );
                                }
                            });
                        });
                        
                    // measure
                    labels.push (
                        self.app._.data.selectedComponents.measure.__cv_niceLabel
                    );
                    
                    // attribute (optional)
                    if (false === _.isNull(self.app._.data.selectedComponents.attribute)
                        && false === _.isUndefined(self.app._.data.selectedComponents.attribute)) {
                        labels.push (
                            self.app._.data.selectedComponents.attribute.__cv_niceLabel
                        );
                    }
                        
                    // build label list
                    value = labels.join(", ");
                    
                // if value is list (object or array)
                } else if (true === _.isObject(value) || true === _.isArray(value)){
                    
                    var list = new CubeViz_Collection();
                    value = CubeViz_Visualization_Controller.linkify (
                        list.addList (value)._.join (", ")
                    );
                
                // simple property-value-pair    
                } else {
                    if (true === self.isValidUrl(value)) {
                        value = "<a href=\"" + value + "\" target=\"_blank\">"
                                    + _.str.prune (value, 60) +
                                "</a>";
                    }
                }
                
                // add pair to list
                $("#cubeviz-legend-dsdProperties").append(
                    "<tr>"
                    + "<td>"
                        + "<a href=\"" + property + "\" target=\"_blank\">" + property + "</a></td>"
                    + "<td style=\"word-break:break-all;\">" + value + "</td>" +
                    "</tr>"
                );
            }
        });
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
                        $("#cubeviz-legend-tpl-observationsTableHeadEntry").html(), dimension
                    ) 
                    + "</td>";
        });
        
        // title of selected measure
        html += "<td colspan=\"2\">" 
                + CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-legend-tpl-observationsTableHeadEntry").html(), selectedMeasure
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
            numberOfUsedDimensionElements:number = 0,
            
            // range of the values of observations
            rangeMin = "<strong>min:</strong> " + String(jsStats.min (observationValues[0])).substring(0, 10),
            rangeMax = "<strong>max:</strong> " + String(jsStats.max (observationValues[0])).substring(0, 10);
            
        html = "<tr class=\"info\">";
        
        _.each(selectedDimensions, function(dimension){ 
            
            // get the number of used dimension elements in retrieved observation
            numberOfUsedDimensionElements = _.size(DataCube_Observation.getUsedDimensionElementUris(
                observations,
                dimension["http://purl.org/linked-data/cube#dimension"]
            ));
                
            // html entry for this particular dimension
            if (numberOfUsedDimensionElements < _.size(dimension.__cv_elements)) {
                html += "<td><strong>" 
                        + _.size(dimension.__cv_elements) + "</strong> "
                        + "different dimension elements available, "
                        + "but only <strong>" + numberOfUsedDimensionElements + "</strong> are in use</td>"; 
            } else {
                html += "<td><strong>" 
                        + _.size(dimension.__cv_elements) + "</strong> "
                        + "different dimension elements are in use</td>";
            }
        });
        
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
                        + "<a href=\"#" + (CryptoJS.MD5(dimension.__cv_uri) + "").substring(0, 6) + "\" "
                        +    "title=\"Anchor to dimension: " + dimension.__cv_niceLabel + "\">"
                        +   label
                        + "</a> "
                        + "<i class=\"icon-anchor\" style=\"font-size: 10px;\"></i>"
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
     * @param selectedComponentDimensions any
     */
    public displaySelectedDimensions(selectedComponentDimensions:any) : void
    {
        var elementList:CubeViz_Collection = new CubeViz_Collection(),
            self = this,
            tmpList:CubeViz_Collection = new CubeViz_Collection(),
            $table:any = null;
        
        $("#cubeviz-legend-componentDimensions").html("");
        
        // go through each dimension
        _.each(selectedComponentDimensions, function(dimension){
            
            // setup tpl
            $("#cubeviz-legend-componentDimensions").append($(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-legend-tpl-dimensionBlock").html(),
                { 
                    dimensionLabel: dimension.__cv_niceLabel,
                    dimensionUri: dimension.__cv_uri,
                    dimensionUriHash: (CryptoJS.MD5(dimension.__cv_uri)+"").substring (0, 6)
                }
            )));
            
            $table = $($("#cubeviz-legend-componentDimensions").find(".table").last());
            
            // table header
            $table.append(
                "<tr class=\"info\">"
                + "<td><strong>Property</strong></td>"
                + "<td><strong>Value</strong></td>" +
                "</tr>"
            );
            
            $table.append(
                "<tr>"
                + "<td>URI</td>"
                + "<td style=\"word-break:break-all;\">" +
                    "<a href=\"" + dimension.__cv_uri + "\" target=\"_blank\">" +
                        dimension.__cv_uri +
                    "</a></td>" +
                "</tr>"
            );
            
            // go through all properties
            _.each (dimension, function(value, property){
                                
                // only show property with really uris (exclude __cv_* uri's)
                if (false === _.str.include(property, "__cv_")) {
                
                    // if value is list (object or array)
                    if (true === _.isObject(value) || true === _.isArray(value)){
                        
                        var list = new CubeViz_Collection();
                        value = CubeViz_Visualization_Controller.linkify (
                            list.addList (value)._.join (", ")
                        );
                    
                    // simple property-value-pair    
                    } else {
                        if (true == self.isValidUrl(value)) {
                            value = "<a href=\"" + value + "\" target=\"_blank\">"
                                        + _.str.prune (value, 60) +
                                    "</a>";
                        }
                    }
                
                    $table.append(
                        "<tr>"
                        + "<td><a href=\"" + property + "\">" + property + "</a></td>"
                        + "<td>" + value + "</td>" +
                        "</tr>"
                    );
                }
            });
            
            /**
             * add dimension elements
             */
            tmpList.reset();
            
            elementList
                .reset()
                // add all dimension elements to a list
                .addList(dimension.__cv_elements)
                
                // add each element to another list, but before attach some html
                .each(function(element){$table.append(tmpList.add(
                    "<a href=\""+ element.__cv_uri  +"\" target=\"_blank\">" +
                        element.__cv_niceLabel + "</a>",
                null, true));});
                
            // add HTML of the other list
            $table.append(
                "<tr><td colspan=\"2\"><strong><em>Dimension Elements</em></strong></td></tr>" +
                "<tr>"
                    + "<td colspan=\"2\">" + tmpList._.join (", ") + "</td>" + 
                "</tr>"
            );
            
            /**
             * if available, show source component specification
             */
            if (false === _.isNull(dimension.__cv_sourceComponentSpecification)
                && false === _.isUndefined(dimension.__cv_sourceComponentSpecification)) {
                
                // go through each source component specification
                _.each (dimension.__cv_sourceComponentSpecification, function(sourceCS){
                    
                    // source component specification label
                    $table.append (
                        "<tr><td colspan=\"2\"></td></tr>" + 
                        
                        "<tr class=\"warning\">" + 
                            "<td colspan=\"2\">" + 
                                "<strong>Source Component Specification: " + 
                                "<a href=\"" + sourceCS.__cv_uri + "\" target=\"_blank\">" + 
                                sourceCS.__cv_niceLabel + "</a></strong>" + 
                            "</td>" +
                        "</tr>"
                    );

                    // URI
                    $table.append(
                        "<tr>"
                        + "<td>URI</td>"
                        + "<td style=\"word-break:break-all;\">" +
                            "<a href=\"" + sourceCS.__cv_uri + "\" target=\"_blank\">" +
                            sourceCS.__cv_uri +
                            "</a></td>" +
                        "</tr>"
                    );
                    
                    // go through all properties of a source component specification
                    _.each (sourceCS, function(value, property){
                        
                        // only show property with really uris (exclude __cv_* uri's)
                        if (false === _.str.include(property, "__cv_")) {
                                
                            // if value is list (object or array)
                            if (true === _.isObject(value) || true === _.isArray(value)){
                                
                                var list = new CubeViz_Collection();
                                value = CubeViz_Visualization_Controller.linkify (
                                    list.addList (value)._.join (", ")
                                );
                            
                            // simple property-value-pair    
                            } else {
                                if (true === self.isValidUrl(value)) {
                                    value = "<a href=\"" + value + "\" target=\"_blank\">"
                                                + _.str.prune (value, 60) +
                                            "</a>";
                                }
                            }
                            
                            // add pair to list
                            $table.append(
                                "<tr>"
                                + "<td>"
                                    + "<a href=\"" + property + "\" target=\"_blank\">" + property + "</a></td>"
                                + "<td style=\"word-break:break-all;\">" + value + "</td>" +
                                "</tr>"
                            );
                        }
                    });                    
                    
                    /**
                     * add dimension elements
                     */
                    tmpList.reset();
                    
                    elementList
                        .reset()
                        // add all dimension elements to a list
                        .addList(sourceCS.__cv_elements)
                        
                        // add each element to another list, but before attach some html
                        .each(function(element){$table.append(tmpList.add(
                            "<a href=\""+ element.__cv_uri  +"\" target=\"_blank\">" +
                                element.__cv_niceLabel + "</a>",
                        null, true));});
                        
                    // add HTML of the other list
                    $table.append(
                        "<tr><td colspan=\"2\"><em>Dimension Elements</em></td></tr>" +
                        "<tr>"
                            + "<td colspan=\"2\">" + tmpList._.join (", ") + "</td>" + 
                        "</tr>"
                    );
                });
            }
        });
    }
        
    /**
     * @param selectedMeasure any
     * @param selectedAttribute any
     */
    public displaySelectedMeasureAndAttribute(selectedMeasure:any, selectedAttribute:any) : void
    {     
        var self = this,
            $table = $("#cubeviz-legend-componentMeasureProperties");
           
        /**
         * display measure
         */
        $("#cubeviz-legend-componentMeasureLabel").html(
            "<a href=\"" + selectedMeasure.__cv_uri + "\">" 
            + selectedMeasure.__cv_niceLabel + "</a>"
        );
        
        // table header
        $table.append(
            "<tr class=\"info\">"
            + "<td><strong>Property</strong></td>"
            + "<td><strong>Value</strong></td>" +
            "</tr>"
        );
    
        // go through all properties
        _.each (selectedMeasure, function(value, property){
        
            // only show property with really uris (exclude __cv_* uri's)
            if (false === _.str.include(property, "__cv_")) {
                
                // if value is list (object or array)
                if (true === _.isObject(value) || true === _.isArray(value)){
                    
                    var list = new CubeViz_Collection();
                    value = CubeViz_Visualization_Controller.linkify (
                        list.addList (value)._.join (", ")
                    );
                
                // simple property-value-pair    
                } else {
                    if (true == self.isValidUrl(value)) {
                        value = "<a href=\"" + value + "\" target=\"_blank\">"
                                    + _.str.prune (value, 60) +
                                "</a>";
                    }
                }
            
                $table.append(
                    "<tr>"
                    + "<td><a href=\"" + property + "\">" + property + "</a></td>"
                    + "<td>" + value + "</td>" +
                    "</tr>"
                );              
            }
        });
        
        /**
         * if available, show source measures
         */
        if (false === _.isNull(selectedMeasure.__cv_sourceMeasure)
            && false === _.isUndefined(selectedMeasure.__cv_sourceMeasure)) {
            
            // go through each source component specification
            _.each (selectedMeasure.__cv_sourceMeasure, function(sourceMeasure){
                
                // source component specification label
                $table.append (
                    "<tr><td colspan=\"2\"></td></tr>" + 
                    
                    "<tr class=\"warning\">" + 
                        "<td colspan=\"2\">" + 
                            "<strong>Source Measure: " + 
                            "<a href=\"" + sourceMeasure.__cv_uri + "\" target=\"_blank\">" + 
                                sourceMeasure.__cv_niceLabel + "</a></strong>" + 
                        "</td>" +
                    "</tr>"
                );

                // URI
                $table.append(
                    "<tr>"
                    + "<td>URI</td>"
                    + "<td style=\"word-break:break-all;\">" +
                        "<a href=\"" + sourceMeasure.__cv_uri + "\" target=\"_blank\">" +
                        sourceMeasure.__cv_uri +
                        "</a></td>" +
                    "</tr>"
                );
                
                // go through all properties of a source component specification
                _.each (sourceMeasure, function(value, property){
                    
                    // only show property with really uris (exclude __cv_* uri's)
                    if (false === _.str.include(property, "__cv_")) {
                            
                        // if value is list (object or array)
                        if (true === _.isObject(value) || true === _.isArray(value)){
                            
                            var list = new CubeViz_Collection();
                            value = CubeViz_Visualization_Controller.linkify (
                                list.addList (value)._.join (", ")
                            );
                        
                        // simple property-value-pair    
                        } else {
                            if (true === self.isValidUrl(value)) {
                                value = "<a href=\"" + value + "\" target=\"_blank\">"
                                            + _.str.prune (value, 60) +
                                        "</a>";
                            }
                        }
                        
                        // add pair to list
                        $table.append(
                            "<tr>"
                            + "<td>"
                                + "<a href=\"" + property + "\" target=\"_blank\">" + property + "</a></td>"
                            + "<td style=\"word-break:break-all;\">" + value + "</td>" +
                            "</tr>"
                        );
                    }
                });
            });
        }
        
        
        /**
         * display attribute (if available)
         */
        // if attribute is not available
        if (true === _.isNull(selectedAttribute) 
            || true === _.isUndefined(selectedAttribute)) {
            $("#cubeviz-legend-componentAttribute").hide();
        
        // attribute is available
        } else {
            $("#cubeviz-legend-componentAttributeLabel").html(
                "<a href=\"" + selectedMeasure.__cv_uri + "\">" 
                + selectedAttribute.__cv_niceLabel + "</a>"
            );
            
            // table header
            $("#cubeviz-legend-componentAttributeProperties")
                .append(
                    "<tr class=\"info\">"
                    + "<td><strong>Property</strong></td>"
                    + "<td><strong>Value</strong></td>" +
                    "</tr>"
                );
            
            // go through all properties
            _.each (selectedAttribute, function(value, property){
            
                // only show property with really uris (exclude __cv_* uri's)
                if (false === _.str.include(property, "__cv_")) {
                    
                    // if value is list (object or array)
                    if (true === _.isObject(value) || true === _.isArray(value)){
                        
                        var list = new CubeViz_Collection();
                        value = CubeViz_Visualization_Controller.linkify (
                            list.addList (value)._.join (", ")
                        );
                    
                    // simple property-value-pair    
                    } else {
                        if (true == self.isValidUrl(value)) {
                            value = "<a href=\"" + value + "\" target=\"_blank\">"
                                        + _.str.prune (value, 60) +
                                    "</a>";
                        }
                    }
                
                    $("#cubeviz-legend-componentAttributeProperties").append(
                        "<tr>"
                        + "<td><a href=\"" + property + "\">" + property + "</a></td>"
                        + "<td>" + value + "</td>" +
                        "</tr>"
                    );              
                }
            });
        }
    }
    
    /**
     * 
     */
    public initialize() : void
    {
        this.render();
    }
    
    /**
     * copied from http://stackoverflow.com/a/14582229
     * Checks if given string is a valid url
     * @param str string String to check
     * @return bool True if given string is a valid url, false otherwise.
     */
    public isValidUrl(str:string) : bool
    {
        return ((new RegExp(
                '^(https?:\\/\\/)?'+                                // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)*[a-z]{2,}|'+ // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))'+                      // OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+                  // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?'+                         // query string
                '(\\#[-a-z\\d_]*)?$','i'                            // fragment locator
            )).test(str)) 
            
            // additional check for . or /
            && (true === _.str.include(str, ".") || true === _.str.include(str, "/"));
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
        this.displayDataStructureDefinition(this.app._.data.selectedDSD);
        this.displayDataset(this.app._.data.selectedDS, this.app._.data.selectedDSD);
        
        /**
         * Selected configuration
         */
        this.displaySelectedDimensions(this.app._.data.selectedComponents.dimensions);
        this.displaySelectedMeasureAndAttribute(
            this.app._.data.selectedComponents.measure,
            this.app._.data.selectedComponents.attribute
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
