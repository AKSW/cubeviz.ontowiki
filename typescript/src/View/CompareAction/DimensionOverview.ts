/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CompareAction_DimensionOverview extends CubeViz_View_Abstract 
{     
    /**
     * Saves information about selected model and dataset
     */
    public selected = {
        model1: null, model2: null,
        dataset1: null, dataset2: null
    };
    
    /**
     * Remembers received dimensions
     * dimensions [dataset1] according to dataset1 
     *            [dataset2] according to dataset2
     */
    public dimensions = {
        dataset1: null,
        dataset2: null
    };
       
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
                name:    "onSelect_model1",
                handler: this.onSelect_model1
            },
            {
                name:    "onSelect_model2",
                handler: this.onSelect_model2
            },
            {
                name:    "onSelect_noDataset1",
                handler: this.onSelected_noDataset1
            },
            {
                name:    "onSelect_noDataset2",
                handler: this.onSelected_noDataset2
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
        var dimensionContainer:any = null,
            dimensionElementList:any = null,
            ds2Counter:number = 0,
            j:number = 0,
            self = this;          
        
        $("#cubeviz-compare-dimensionOverview").html ("");
        
        // go through all dimensions of dataset1
        _.each (this.dimensions["dataset1"], function(componentSpecification){
            
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
                
                _.each (self.dimensions["dataset2"], function(cS){
                    
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
        this.dimensions["dataset1"][foundUri].__cv_sameAsCompSpec = dimension;
    }
    
    /**
     *
     */
    public handleDatasetSelectorChanges(datasetNr:string, data:any) 
    {
        var self = this;
        
        this.selected["dataset" + datasetNr] = data;
        
        // load according dimensions
        DataCube_Component.loadAllDimensions(
            this.app._.backend.url, "", this.selected ["model" + datasetNr].modelUri,
            data.datasetSelf ["http://purl.org/linked-data/cube#structure"], 
            data.datasetUri, function(result){
                self.dimensions ["dataset"+datasetNr] = result;
            
                // there are two dimension groups received
                if (false === _.isNull(self.dimensions ["dataset1"])
                    && false === _.isNull(self.dimensions ["dataset2"])) {
                    self.triggerGlobalEvent (
                        "onReceived_dimensions1AndDimensions2",
                        { 
                            dataset1Self: self.selected ["dataset1"],
                            dataset2Self: self.selected ["dataset2"]
                        }
                    );
                }
            }
        );
    }
    
    /**
     *
     */
    public onSelected_dataset1(event, data) 
    {
        this.handleDatasetSelectorChanges("1", data);
    }
    
    /**
     *
     */
    public onSelected_dataset2(event, data) 
    {
        this.handleDatasetSelectorChanges("2", data);
    }
    
    /**
     *
     */
    public onReceived_dimensions1AndDimensions2(event, data) 
    {
        var self = this,
            urisToCheck:string[] = [];
        
        // go through all dimensions of dataset1
        _.each (this.dimensions ["dataset1"], function(dimension){
            urisToCheck.push (dimension.__cv_uri);
            
            if (false === _.str.isBlank(dimension["http://www.w3.org/2002/07/owl#sameAs"])) {
                urisToCheck.push (dimension["http://www.w3.org/2002/07/owl#sameAs"]);
            }
        });
        
        _.each (this.dimensions ["dataset2"], function(dimension){
            
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
    public onSelect_model1(event, data) 
    {
        this.selected["model1"] = data;
    }
    
    /**
     *
     */
    public onSelect_model2(event, data) 
    {
        this.selected["model2"] = data;
    }
    
    /**
     *
     */
    public onSelected_noDataset1() 
    {
        this.selected["dataset1"] = null;
        this.selected["dimensions"]["1"] = null;
    }
    
    /**
     *
     */
    public onSelected_noDataset2() 
    {
        this.selected["dataset2"] = null;
        this.selected["dimensions"]["2"] = null;
    }
    
    /**
     *
     */
    public onSelect_noModel1() 
    {
        // nullify model information
        this.selected ["model1"] = null;
        this.selected ["dataset1"] = null;
        this.dimensions["dataset1"] = null;
    }
    
    /**
     *
     */
    public onSelect_noModel2() 
    {
        // nullify model and dataset information
        this.selected ["model2"] = null;
        this.selected ["dataset2"] = null;
        this.dimensions["dataset2"] = null;
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
