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
     *
     */
    public displayEqualDimensions() : void
    {        
        var description:string = "",
            dimensionContainer:any = null,
            dimensionElementContainer:any = null,
            dimensionIndex:number = 0,
            i:number = 0,
            newWidth:number = 2000,
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
                
                /**
                 *  add table to top
                 */
                description = dimensions[0].__cv_description;
            
                if (true === _.str.isBlank(description)) {
                    description = "no description found";
                }
                
                dimensionContainer = $(CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-compare-tpl-equalDimension").html(), {
                        dimensionLabel: dimensions[0].__cv_niceLabel,
                        dimensionDescription: description
                    }
                ));
                
                // if there are equal dimension elements
                if (false === _.isUndefined(dimensions[0].__cv_equalElements)
                    && 0 < _.size(dimensions[0].__cv_equalElements)) {
                    
                    dimensionElementContainer = $($(dimensionContainer).find(".cubeviz-compare-dimensionTitleAndElements").first());
                    
                    // title
                    dimensionElementContainer.append(
                        $("<td rowspan=\"3\" style=\"vertical-align: middle;\">" + 
                            "<div style=\"-webkit-transform:rotate(-90deg);\">Dimension Elements</div></td>")
                    );
                    
                    // add elements
                    _.each (dimensions[0].__cv_equalElements, function(element){
                        dimensionElementContainer.append(
                            $("<td rowspan=\"3\" style=\"vertical-align: middle;\">" +
                                "<div style=\"-webkit-transform:rotate(-90deg);\">" + 
                                    element.__cv_niceLabel + "</div></td>")
                        );
                    });

                    // set number of UNequal dimension elements
                    $($(dimensionContainer)
                        .find(".cubeviz-compare-dimensionNumberOfUnequalDimensionElements")
                        .first())
                        .html (_.size(dimensions[0].__cv_elements)
                               - _.size(dimensions[0].__cv_equalElements));

                    // set number of equal dimension elements
                    $($(dimensionContainer)
                        .find(".cubeviz-compare-dimensionNumberOfEqualDimensionElements")
                        .first())
                        .html (_.size(dimensions[0].__cv_equalElements));
                }
                
                $("#cubeviz-compare-equalDimensionsTableContainer1")
                    .append(dimensionContainer);
                    
                
                /**
                 *  add table to bottom
                 */
                description = dimensions[1].__cv_description;
            
                if (true === _.str.isBlank(description)) {
                    description = "no description found";
                }
                 
                dimensionContainer = $(CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-compare-tpl-equalDimension").html(), {
                        dimensionLabel: dimensions[1].__cv_niceLabel,
                        dimensionDescription: description
                    }
                ));
                
                // if there are equal dimension elements
                if (false === _.isUndefined(dimensions[1].__cv_equalElements)
                    && 0 < _.size(dimensions[1].__cv_equalElements)) {
                    
                    dimensionElementContainer = $($(dimensionContainer).find(".cubeviz-compare-dimensionTitleAndElements").first());
                    
                    // title
                    dimensionElementContainer.append(
                        $("<td rowspan=\"3\" style=\"vertical-align: middle;\">" + 
                            "<div style=\"-webkit-transform:rotate(-90deg);\">Dimension Elements</div></td>")
                    );
                    
                    // add elements
                    _.each (dimensions[1].__cv_equalElements, function(element){
                        dimensionElementContainer.append(
                            $("<td rowspan=\"3\" style=\"vertical-align: middle;\">" +
                                "<div style=\"-webkit-transform:rotate(-90deg);\">" + 
                                    element.__cv_niceLabel + "</div></td>")
                        );
                    });                    
                    
                    // set number of UNequal dimension elements
                    $($(dimensionContainer)
                        .find(".cubeviz-compare-dimensionNumberOfUnequalDimensionElements")
                        .first())
                        .html (_.size(dimensions[1].__cv_elements)
                               - _.size(dimensions[1].__cv_equalElements));

                    // set number of equal dimension elements
                    $($(dimensionContainer)
                        .find(".cubeviz-compare-dimensionNumberOfEqualDimensionElements")
                        .first())
                        .html (_.size(dimensions[1].__cv_equalElements));
                }
                
                $("#cubeviz-compare-equalDimensionsTableContainer2")
                    .append(dimensionContainer);                    
                    
                // compute new width of div
                newWidth += 1000;
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
    public displayUnequalDimensions() : void
    {       
        var $container:any = null,
            description:string = "";
        
        $("#cubeviz-compare-unequalDimensionsTableContainer1").html("");
        
        if (0 < _.size(this.app._.compareAction.unequalDimensions[1])
            || 0 < _.size(this.app._.compareAction.unequalDimensions[2])) {
            $("#cubeviz-compare-unequalDimensions1").show();
            $("#cubeviz-compare-unequalDimensions2").show();
        }        
         
        /** 
         * go through all unequal dimensions of dataset1
         */
        _.each (this.app._.compareAction.unequalDimensions[1], function(dimension){
            
            description = dimension.__cv_description;
            
            if (true === _.str.isBlank(description)) {
                description = "no description found";
            }
            
            // build container with dimension information
            $container = $(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-compare-tpl-unequalDimension").html(), {
                dimensionLabel: dimension.__cv_niceLabel,
                dimensionDescription: description
            }));
            
            // set number of dimension elements
            $($container.find(".cubeviz-compare-numberOfDimensionElements").first())
                .html (_.size(dimension.__cv_elements));
            
            // add container
            $("#cubeviz-compare-unequalDimensionsTableContainer1").append($container);
        });
        
        
        /**
         * go through all unequal dimensions of dataset2
         */
        _.each (this.app._.compareAction.unequalDimensions[2], function(dimension){
            
            description = dimension.__cv_description;
            
            if (true === _.str.isBlank(description)) {
                description = "no description found";
            }
            
            // build container with dimension information
            $container = $(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-compare-tpl-unequalDimension").html(), {
                dimensionLabel: dimension.__cv_niceLabel,
                dimensionDescription: description
            }));
            
            // set number of dimension elements
            $($container.find(".cubeviz-compare-numberOfDimensionElements").first())
                .html (_.size(dimension.__cv_elements));
            
            // add container
            $("#cubeviz-compare-unequalDimensionsTableContainer2").append($container);
        });
    }
    
    /**
     * Find and save equal dimensions. Two dimensions are equal if they have the
     * same URI or there is a sameAs-relation between them.
     * @return void
     */
    public findEqualDimensions() : void
    {
        var equalDimensionElements:any = null,
            dimension1:any = null,
            self = this,
            urisToCheck:any = {},
            usedDatasetDimensions:string[] = [];
            
        self.app._.compareAction.equalDimensions = [];
        self.app._.compareAction.unequalDimensions = {1:[], 2:[]};
        
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
                
                // find dimension elements which are in both dimensions
                equalDimensionElements = self.findEqualDimensionElements(
                    dimension1, dimension2
                );
                
                dimension1.__cv_equalElements = equalDimensionElements[1];
                dimension2.__cv_equalElements = equalDimensionElements[2];
                 
                // save equal dimensions
                self.app._.compareAction.equalDimensions.push ([
                    dimension1, dimension2
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
     * Finds equal dimension elements in two dimensions.
     * @param dimension1 any Dimension object out of dataset1
     * @param dimension2 any Dimension object out of dataset2
     * @return object Object with two fields each containing a list which contains
     *                dimension elements which are in both dimensions
     */
    public findEqualDimensionElements(dimension1:any, dimension2:any) : any
    {
        var result:any = {1:[], 2:[]},
            urisToCheck:any = {};
        
        // if one of the dimension does not have any elements
        if (0 == _.size(dimension1.__cv_elements)
            || 0 == _.size(dimension2.__cv_elements)) {
            return result;
        }
        
        // go through all elements of dimension1 and collect:
        //      - dimension element uri
        //      - if available a sameAs relation object
        _.each (dimension1.__cv_elements, function(dimensionElement){
            urisToCheck[dimensionElement.__cv_uri] = dimensionElement;
            
            if (false === _.str.isBlank(dimensionElement["http://www.w3.org/2002/07/owl#sameAs"])) {
                urisToCheck[dimensionElement["http://www.w3.org/2002/07/owl#sameAs"]] 
                    = dimensionElement;
            }
        });
        
        // go through all elements of dimension2 and try to find 
        //      - an element with the same URI
        //      - an element which has a same-As relation to an element of dimension1
        _.each (dimension2.__cv_elements, function(dimensionElement){
            
            // dimension element uri found OR ...
            if (false === _.isUndefined(urisToCheck[dimensionElement.__cv_uri])) {
                result [1].push (urisToCheck[dimensionElement.__cv_uri]);
                result [2].push (dimensionElement);
            }
            // ... sameAs relation found, which means that both dimension elements 
            // are the "same"/equal
            if (false === _.isUndefined(urisToCheck[dimensionElement["http://www.w3.org/2002/07/owl#sameAs"]])) {
                result [1].push (urisToCheck[dimensionElement["http://www.w3.org/2002/07/owl#sameAs"]]);
                result [2].push (dimensionElement);
            }
        });
        
        return result;
    }
    
    /**
     *
     */
    public onReceived_dimensions1AndDimensions2(event) 
    {
        this.findEqualDimensions();        
        
        // at this point, we know which dimension of dataset1 is equal or has
        // a sameAs-relation to which other dimension of dataset2
        
        // first display all unequal dimensions, because their information
        // part is smaller than the part of the equal ones
        this.displayUnequalDimensions();
        
        // display equal dimensions with their bigger information part
        this.displayEqualDimensions();
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
