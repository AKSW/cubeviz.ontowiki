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
     *
     */
    public displayDimensions() : void
    {        
        var dimensionContainer:any = null,
            dimensionIndex:number = 0,
            i:number = 0,
            newWidth:number = 1000,
            self = this;
            
        // there are at least two equal dimensions
        if (0 < _.size(this.app._.compareAction.equalDimensions)) {
            
            // show table cells
            $("#cubeviz-compare-equalDimensions1").show();
            $("#cubeviz-compare-equalDimensions2").show();

            // empty table container
            $("#cubeviz-compare-equalDimensionsTableContainer1").html("");
            $("#cubeviz-compare-equalDimensionsTableContainer2").html("");
            
            /**
             * go through all equal dimensions
             */
            _.each (this.app._.compareAction.equalDimensions, function(dimensions){
                
                // add table to top
                dimensionContainer = CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-compare-tpl-equalDimension").html(), {
                        dimensionLabel: dimensions[0].__cv_niceLabel,
                        dimensionDescription: dimensions[0].__cv_description
                    }
                );
                
                $("#cubeviz-compare-equalDimensionsTableContainer1")
                    .append(dimensionContainer);
                    
                // add table to bottom
                dimensionContainer = CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-compare-tpl-equalDimension").html(), {
                        dimensionLabel: dimensions[1].__cv_niceLabel,
                        dimensionDescription: dimensions[1].__cv_description
                    }
                );
                
                $("#cubeviz-compare-equalDimensionsTableContainer2")
                    .append(dimensionContainer);                    
                    
                // compute new width of div
                newWidth += 800;
            });
                        
            // set new width                
            $("#cubeviz-compare-equalDimensionsTableContainer1")
                .width (newWidth);
                
            $("#cubeviz-compare-equalDimensionsTableContainer2")
                .width (newWidth);
        }
    }
    
    /**
     *
     */
    public findEqualDimensions() 
    {
        var dimension1:any = null,
            self = this,
            urisToCheck:any = {},
            usedDatasetDimensions:string[] = [];
            
        self.app._.compareAction.equalDimensions = [];
        self.app._.compareAction.unequalDimensions = {1:[], 2:[]};
        self.app._.compareAction.shareDimensions = {};
        
        // go through all dimensions of dataset1 and 
        // save 
        //      - dimension uri
        //      - sameAs object, if available
        // to check afterwards, if there are relations in dimensions[2]
        _.each (this.app._.compareAction.components.dimensions[1], function(dimension){
            urisToCheck[dimension.__cv_uri] = dimension.__cv_uri;
            
            if (false === _.str.isBlank(dimension["http://www.w3.org/2002/07/owl#sameAs"])) {
                urisToCheck[dimension["http://www.w3.org/2002/07/owl#sameAs"]] = dimension.__cv_uri;
            }
        });
        
        // go through all dimensions of dataset2
        _.each (this.app._.compareAction.components.dimensions[2], function(dimension2){
            
            // dimension uri found OR sameAs relation found, which means that both 
            // dimensions are the "same"/equal
            if (false === _.isUndefined(urisToCheck[dimension2.__cv_uri])
                || false === _.isUndefined(urisToCheck[dimension2["http://www.w3.org/2002/07/owl#sameAs"]])) {
                  
                if (false === _.isUndefined(urisToCheck[dimension2.__cv_uri])) {
                    dimension1 = self.app._.compareAction.components.dimensions[1][
                        urisToCheck[dimension2.__cv_uri]
                    ];
                } else {
                    dimension1 = self.app._.compareAction.components.dimensions[1][
                        urisToCheck[dimension2["http://www.w3.org/2002/07/owl#sameAs"]]
                    ];
                }
                  
                self.app._.compareAction.equalDimensions.push ([
                    // related dimension of the main dataset
                    dimension1,
                    
                    // related dimension of the secondary dataset
                    dimension2
                ]);
                
                usedDatasetDimensions.push(dimension1.__cv_uri);
                
            } else {
                
                // save current dimension in according list
                self.app._.compareAction.unequalDimensions[2]
                    .push (dimension2);
            }
        });
        
        // get the rest of the main dataset dimensions, which are not equal to
        // any dimension of secondary dataset
        _.each (this.app._.compareAction.components.dimensions[1], function(dimension){
            if (-1 === $.inArray (dimension.__cv_uri, usedDatasetDimensions)) {
                self.app._.compareAction.unequalDimensions[1]
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
