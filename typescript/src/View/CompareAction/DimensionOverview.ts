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
            /*{
                name:    "onReceived_dimensions1AndDimensions2",
                handler: this.onReceived_dimensions1AndDimensions2
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
            }*/
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
     * @param tableInstance any jQuery instance of table containing dimension elements
     * @param dimension1 any A dimension of dataset1
     */
    public displayDimensionElementsOfEqualDimensions(tableInstance:any, mainDimension:any, 
        secondaryDimension:any) : void
    {
        var currentDimension2:string = "",
            dimension2Used:bool = false,
            ds2Counter:number = 0,
            i:number = 0,
            self = this;
        
        // go through all dimension elements of dataset1
        _.each (mainDimension.__cv_elements, function(dimensionElementDs1){
            
            i = 0;
            
            _.each (secondaryDimension.__cv_elements, function(dimensionElementDs2){
                        
                if (i++ == ds2Counter) {
                    tableInstance.append(CubeViz_View_Helper.tplReplace(
                        "<tr><td>[[dimensionElementLabel1]]</td><td>[[dimensionElementLabel2]]</td></tr>", {
                            dimensionElementLabel1: dimensionElementDs1.__cv_niceLabel,
                            dimensionElementLabel2: dimensionElementDs2.__cv_niceLabel
                        }
                    ))
                }
            });
            
            ++ds2Counter;
        });
    }
    
    /**
     * @param tableInstance any jQuery instance of table containing dimension elements
     * @param dimension1 any A dimension of dataset1
     */
    public displayDimensionElementsOfUnequalDimensions(tableInstance:any, dimension:any) : void
    {
        var currentDimension2:string = "",
            dimension2Used:bool = false,
            ds2Counter:number = 0,
            i:number = 0,
            self = this;
        
        // go through all dimension elements of dataset1
        _.each (dimension.__cv_elements, function(dimensionElementDs1){
            
            tableInstance.append(CubeViz_View_Helper.tplReplace(
                "<tr><td>[[dimensionElementLabel]]</td></tr>", {
                    dimensionElementLabel: dimensionElementDs1.__cv_niceLabel
                }
            ));
        });
    }
    
    /**
     *
     */
    public displayDimensions() : void
    {
        var dimensionContainer:any = null,
            dimensionIndex:number = 0,
            i:number = 0,
            secondaryDimension:any = null,
            self = this;          
        
        $("#cubeviz-compare-dimensionOverview").html ("");
        
        /**
         * go through all equal dimensions
         */
        _.each (this.app._.compareAction.equalDimensions, function(dimensions){
            dimensionContainer = CubeViz_View_Helper.tplReplace(
                $("#cubeviz-compare-tpl-dimensionInBothDatasets").html(), {
                    dimensionLabel: dimensions[0].__cv_niceLabel
                }
            );
            
            // set dimension header
            $("#cubeviz-compare-dimensionOverview").append(dimensionContainer);
            
            // display elements of the LEFT dimension
            self.displayDimensionElementsOfEqualDimensions(
                $($("#cubeviz-compare-dimensionOverview").find(".table").last()), // table instance
                dimensions[0], // current dimension of dataset1
                dimensions[1] // current dimension of dataset2
            );
        });
        
        /**
         * go through all UNequal dimensions
         */
        _.each (this.app._.compareAction.unequalDimensions[this.app._.compareAction.mainDatasetNr], function(mainDimension){
            
            secondaryDimension = null;
            i = 0;
            
            _.each (self.app._.compareAction.unequalDimensions[self.app._.compareAction.secondaryDatasetNr], function(otherDimension){
                if (i++ == dimensionIndex) {
                    secondaryDimension = otherDimension;
                }
            });
            
            // set dimension
            if (false === _.isUndefined(secondaryDimension)
                && false === _.isNull(secondaryDimension)) {
                dimensionContainer = CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-compare-tpl-twoDifferentDimensions").html(), {
                        dimensionLabel1: mainDimension.__cv_niceLabel,
                        dimensionLabel2: secondaryDimension.__cv_niceLabel
                    }
                );
            } else {
                dimensionContainer = CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-compare-tpl-lonelyDimension").html(), {
                        dimensionLabel: mainDimension.__cv_niceLabel
                    }
                );
            }
            
            // add dimension container
            $("#cubeviz-compare-dimensionOverview").append(dimensionContainer);
            
            // display elements of the LEFT dimension
            self.displayDimensionElementsOfUnequalDimensions(
                $($("#cubeviz-compare-dimensionOverview").find(".mainTable").last()), // table instance
                mainDimension
            );
            
            // display elements of the RIGHT dimension
            if (false === _.isUndefined(secondaryDimension)
                && false === _.isNull(secondaryDimension)) {
                self.displayDimensionElementsOfUnequalDimensions(
                    $($("#cubeviz-compare-dimensionOverview").find(".secondaryTable").last()), // table instance
                    secondaryDimension
                );
            }
            
            dimensionIndex++;
        });
    }
    
    /**
     *
     */
    public findEqualDimensions() 
    {
        var mainDimension:any = null,
            self = this,
            urisToCheck:any = {},
            usedMainDatasetDimensions:string[] = [];
            
        self.app._.compareAction.equalDimensions = [];
        self.app._.compareAction.unequalDimensions = {1:[], 2:[]};
        self.app._.compareAction.shareDimensions = {};
        
        // set mainDatasetNr:
        // means, that mainDatasetNr contains more dimensions as the other one
        if (_.size(this.app._.compareAction.dimensions[1])
            < _.size(this.app._.compareAction.dimensions[2])) {
            this.app._.compareAction.mainDatasetNr = 2;
            this.app._.compareAction.secondaryDatasetNr = 1;
        }
        
        // go through all dimensions of dataset1 and 
        // save 
        //      - dimension uri
        //      - sameAs object, if available
        // to check afterwards, if there are relations in dimensions[2]
        _.each (this.app._.compareAction.dimensions[this.app._.compareAction.mainDatasetNr], function(dimension){
            urisToCheck[dimension.__cv_uri] = dimension.__cv_uri;
            
            if (false === _.str.isBlank(dimension["http://www.w3.org/2002/07/owl#sameAs"])) {
                urisToCheck[dimension["http://www.w3.org/2002/07/owl#sameAs"]] = dimension.__cv_uri;
            }
        });
        
        // go through all dimensions of dataset2
        _.each (this.app._.compareAction.dimensions[this.app._.compareAction.secondaryDatasetNr], function(dimension){
            
            // dimension uri found OR sameAs relation found, which means that both 
            // dimensions are the "same"/equal
            if (false === _.isUndefined(urisToCheck[dimension.__cv_uri])
                || false === _.isUndefined(urisToCheck[dimension["http://www.w3.org/2002/07/owl#sameAs"]])) {
                  
                if (false === _.isUndefined(urisToCheck[dimension.__cv_uri])) {
                    mainDimension = self.app._.compareAction.dimensions[self.app._.compareAction.mainDatasetNr][urisToCheck[dimension.__cv_uri]];
                } else {
                    mainDimension = self.app._.compareAction.dimensions[self.app._.compareAction.mainDatasetNr][urisToCheck[dimension["http://www.w3.org/2002/07/owl#sameAs"]]];
                }
                  
                self.app._.compareAction.equalDimensions.push ([
                    // related dimension of the main dataset
                    mainDimension,
                    
                    // related dimension of the secondary dataset
                    dimension
                ]);
                
                usedMainDatasetDimensions.push(mainDimension.__cv_uri);
                
            } else {
                
                // save current dimension in according list
                self.app._.compareAction.unequalDimensions[self.app._.compareAction.secondaryDatasetNr]
                    .push (dimension);
            }
        });
        
        // get the rest of the main dataset dimensions, which are not equal to
        // any dimension of secondary dataset
        _.each (this.app._.compareAction.dimensions[this.app._.compareAction.mainDatasetNr], function(dimension){
            if (-1 === $.inArray (dimension.__cv_uri, usedMainDatasetDimensions)) {
                self.app._.compareAction.unequalDimensions[self.app._.compareAction.mainDatasetNr]
                    .push (dimension);
            }
        });
    }
    
    /**
     *
     */
    public findEqualDimensionElements() 
    {
        
    }
    
    /**
     *
     */
    public onReceived_dimensions1AndDimensions2(event) 
    {
        this.findEqualDimensions();        
        
        // at this point, we know which dimension of dataset1 is equal or has
        // a sameAs-relation to which other dimension of dataset2 (save in shareDimensions)
        
        this.findEqualDimensionElements();
        
        this.displayDimensions();
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
