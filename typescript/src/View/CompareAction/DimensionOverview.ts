/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CompareAction_DimensionOverview extends CubeViz_View_Abstract 
{            
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CompareAction_DimensionOverview", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onReceived_dimensions1AndDimensions2",
                handler: this.onReceived_dimensions1AndDimensions2
            },
            {
                name:    "onSelected_dataset1",
                handler: this.onSelected_dataset1
            },
            {
                name:    "onSelected_dataset2",
                handler: this.onSelected_dataset2
            },
            {
                name:    "onSelect_noModel1",
                handler: this.onSelect_noModel1
            },
            {
                name:    "onSelect_noModel2",
                handler: this.onSelect_noModel2
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
    public destroy () : CubeViz_View_Abstract
    {
        super.destroy();
        return this;
    }
    
    /**
     *
     */
    public displayDimensionsAndDimensionElements() 
    {
        var datasetUri1 = this.app._.compareAction.dimensionNr2UriAssignment [1],
            datasetUri2 = this.app._.compareAction.dimensionNr2UriAssignment [2],
            dimensionContainer:any = null,
            dimensionElementList:any = null,
            ds2Counter:number = 0,
            j:number = 0,
            self = this;          
        
        $("#cubeviz-compare-dimensionOverview").html ("");
        
        // go through all dimensions of dataset1
        _.each (this.app._.compareAction.dimensions[datasetUri1], function(componentSpecification){
            
            dimensionContainer = null;
            ds2Counter = 0;
            
            if (true === _.isObject(componentSpecification.__cv_sameAsCompSpec)) {
                
                dimensionContainer = CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-compare-tpl-dimensionInBothDatasets").html(), {
                        dimensionLabel: componentSpecification.__cv_niceLabel
                    }
                );
            } else {
                dimensionContainer = CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-compare-tpl-twoDifferentDimensions").html(), {
                        dimensionLabel1: componentSpecification.__cv_niceLabel,
                        dimensionLabel2: "TODO"
                    }
                );
            }
            
            // set dimension header
            $("#cubeviz-compare-dimensionOverview").append(dimensionContainer);
            
            // set dimension elements for both datasets
            dimensionElementList = $($("#cubeviz-compare-dimensionOverview").find(".table").last());
            
            console.log("");
            console.log("componentSpecification");
            console.log(componentSpecification);
            
            console.log("");
            console.log("dimensionElementList");
            console.log(dimensionElementList);
            
            // go through all dimension elements of dataset1
            _.each (componentSpecification.__cv_elements, function(dimensionElementDs1){
                
                j = 0;
                
                console.log("");
                console.log("dimensionElementDs1");
                console.log(dimensionElementDs1);
                
                _.each (self.app._.compareAction.dimensions[datasetUri2], function(cS){
                    
                    if (true === _.isObject(componentSpecification.__cv_sameAsCompSpec)
                        && cS.__cv_uri == componentSpecification.__cv_sameAsCompSpec.__cv_uri) {
                    
                        _.each (cS.__cv_elements, function(dimensionElementDs2){
                            
                            if (j++ == ds2Counter) {
                                dimensionElementList.append(CubeViz_View_Helper.tplReplace(
                                    "<tr><td>[[dimensionElementLabel1]]</td><td>[[dimensionElementLabel2]]</td></tr>", {
                                        dimensionElementLabel1: dimensionElementDs1.__cv_niceLabel,
                                        dimensionElementLabel2: dimensionElementDs2.__cv_niceLabel
                                    }
                                ));
                            }
                        });
                    } else {
                    }
                });
                
                ++ds2Counter;
            });
        });
    }
    
    /**
     *
     */
    public connectComponentSpecifications(foundUri:string, dimension:any) 
    {
        var datasetUri1 = this.app._.compareAction.dimensionNr2UriAssignment [1];
        
        this.app._.compareAction.dimensions [datasetUri1][foundUri].__cv_sameAsCompSpec = dimension;
    }
    
    /**
     *
     */
    public handleDatasetSelectorChanges(datasetNr:string) 
    {
        var datasetUri = this.app._.compareAction.datasetNr2UriAssignment [datasetNr],
            self = this;
        
        // nullify dimension information, for the case, the following loadAllDimensions
        // does not return anything / is not working
        this.app._.compareAction.dimensions [datasetUri] = null;
        this.app._.compareAction.dimensionNr2UriAssignment [datasetNr] = '';
        
        // load according dimensions
        DataCube_Component.loadAllDimensions(
            this.app._.backend.url, "", this.app._.compareAction.modelNr2UriAssignment[datasetNr],
            this.app._.compareAction.datasets [datasetUri]["http://purl.org/linked-data/cube#structure"], 
            this.app._.compareAction.datasetNr2UriAssignment [datasetNr], 
            function(result){
                
                // set dimension > dataset assignment and data new
                self.app._.compareAction.dimensions [datasetUri] = result;
                self.app._.compareAction.dimensionNr2UriAssignment [datasetNr] = datasetUri;
            
                // there are two dimension groups received
                if ("" != self.app._.compareAction.dimensionNr2UriAssignment[1]
                    && "" != self.app._.compareAction.dimensionNr2UriAssignment[2]) {
                    self.triggerGlobalEvent ("onReceived_dimensions1AndDimensions2");
                }
            }
        );
    }
    
    /**
     *
     */
    public onSelected_dataset1(event) 
    {
        this.handleDatasetSelectorChanges("1");
    }
    
    /**
     *
     */
    public onSelected_dataset2(event) 
    {
        this.handleDatasetSelectorChanges("2");
    }
    
    /**
     *
     */
    public onReceived_dimensions1AndDimensions2(event, data) 
    {
        var datasetUri1 = this.app._.compareAction.dimensionNr2UriAssignment [1],
            datasetUri2 = this.app._.compareAction.dimensionNr2UriAssignment [2],
            self = this,
            urisToCheck:string[] = [];
        
        // go through all dimensions of dataset1
        _.each (this.app._.compareAction.dimensions[datasetUri1], function(dimension){
            urisToCheck.push (dimension.__cv_uri);
            
            if (false === _.str.isBlank(dimension["http://www.w3.org/2002/07/owl#sameAs"])) {
                urisToCheck.push (dimension["http://www.w3.org/2002/07/owl#sameAs"]);
            }
        });
        
        _.each (this.app._.compareAction.dimensions[datasetUri2], function(dimension){
            
            // dimension uri found
            if (-1 < $.inArray (dimension.__cv_uri, urisToCheck)) {
                
            }
            
            // sameAs relation found
            if (-1 < $.inArray (dimension["http://www.w3.org/2002/07/owl#sameAs"], urisToCheck)) {
                
                self.connectComponentSpecifications (
                    dimension["http://www.w3.org/2002/07/owl#sameAs"],
                    dimension
                );                
            }
        });
        
        this.displayDimensionsAndDimensionElements ();
    }
    
    /**
     *
     */
    public onSelect_noModel1() 
    {
        this.app._.compareAction.dimensions [
            this.app._.compareAction.datasetNr2UriAssignment [1]
        ] = null;
    }
    
    /**
     *
     */
    public onSelect_noModel2() 
    {
        this.app._.compareAction.dimensions [
            this.app._.compareAction.datasetNr2UriAssignment [2]
        ] = null;
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
        this.bindUserInterfaceEvents({
        });
        
        return this;
    }
}
