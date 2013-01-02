/// <reference path="..\..\..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\..\..\declaration\libraries\Underscore.d.ts" />
/// <reference path="..\..\..\..\..\declaration\libraries\Underscore.string.d.ts" />

/**
 * Fits for all kinds of dimensions
 */
class CubeViz_Visualization_CubeViz_Table extends CubeViz_Visualization_CubeViz_Visualization 
{    
    /**
     * 
     */
    private _generatedStructure = [];
    
    /**
     * 
     */
    private _generatedStructure_Components = [];
    
    /**
     * 
     */
    private _generatedObservations = [];
    
    /**
     * 
     */
    public generatedObservations (cubeVizLinksModule:any) : void
    {
        this._generatedObservations = [];
        var entries = cubeVizLinksModule.retrievedObservations;
        
        /**
         * header contains all the selected labels and and the measure
         */
        
        
        /**
         * ... and now the observations
         */
        var elements:Object = {},
            link = "",
            observation = new DataCube_Observation ();
        
        // initializing observation handling instance with given elements
        // after init, sorting the x axis elements ascending        
        observation.initialize ( 
            entries, 
            cubeVizLinksModule["selectedComponents"]["dimensions"], 
            cubeVizLinksModule.selectedComponents.measures[0].url // type url
        );
        
        var necUris = observation["_selectedDimensionUris"];
        // necUris.push ( CubeViz_Visualization_Controller.getMeasureTypeUrl() );
        necUris.push ( cubeVizLinksModule.selectedComponents.measures[0].url );
        necUris.push ( "http://www.w3.org/2000/01/rdf-schema#label" );
        
        /**
         * Header
         */
        // TODO $.each
        for (var i in entries) {
            
            var entry = {"entries": []};
            
            for ( var uri in entries[i] ) {                
                if ( -1 != $.inArray ( uri, necUris ) ) {
                    entry ["entries"].push (
                        "<br/><div class=\"Vis_CV_Table_ObservationsHeaderLabel\">" + 
                            "<a href=\"" + uri + "\" target=\"_blank\">" + 
                            CubeViz_Visualization_Controller.getDimensionOrMeasureLabel (
                                cubeVizLinksModule.selectedComponents.dimensions,
                                cubeVizLinksModule.selectedComponents.measures,
                                uri
                            ) + "</a>" +
                        "</div>"
                    );
                }
            }
        
            this["_generatedObservations"].push ( entry );
            break;
        }
        
        /**
         * Data
         */
        for (i in entries) {
            
            var entry = {"entries": []};
            
            for ( var uri in entries[i] ) {                
                if ( -1 != $.inArray ( uri, necUris ) ) {
                    
                    link = undefined != entries [i][uri][0]["label"] 
                        ? entries [i][uri][0]["label"]
                        : entries [i][uri][0]["value"];
                        
                    // if value is not an URI 
                    if (false === _s.include (entries [i][uri][0]["value"], "http://")) {
                        entry ["entries"].push (link);
                        
                    // if value IS an URI, save it as link
                    } else { 
                        entry ["entries"].push (
                            "<a href=\"" + entries [i][uri][0]["value"] + "\" target=\"_blank\">" + link + "</a>"
                        );
                    }
                }
            }
        
            this["_generatedObservations"].push ( entry );
        }
        
        // Sort by first column
        this["_generatedObservations"].sort(function(a, b) {
            return a["entries"][0].toUpperCase().localeCompare(b["entries"][0].toUpperCase());
        });
    }
    
    /**
     * 
     */
    public generateStructure (cubeVizLinksModule:Object[]) : void {
        
        var link:any = null;
        
        /**
         * Structure - table header:
         *  Data Structure Definition, Data Set, Component Specification, Selected Dimensions
         */
        this["_generatedStructure"] = [];
        
        // add Data Structure Definition
        backgroundColor = CubeViz_Visualization_Controller.getColor (cubeVizLinksModule ["selectedDSD"]["url"]);
                
        link = "<span style=\"background-color:" + backgroundColor +";width:5px !important;height:5px !important;margin-right:4px;\">&nbsp;</span>";
                
        link += "<a href=\"" + cubeVizLinksModule ["selectedDSD"]["url"] + "\" target=\"_blank\">" + 
                    cubeVizLinksModule ["selectedDSD"]["label"] + "</a>";
        this["_generatedStructure"].push (link);
        
        // add Data Set
        backgroundColor = CubeViz_Visualization_Controller.getColor (cubeVizLinksModule ["selectedDS"]["url"]);
                
        link = "<span style=\"background-color:" + backgroundColor +";width:5px !important;height:5px !important;margin-left:5px;margin-right:4px;\">&nbsp;</span>";
        
        link += "<a href=\"" + cubeVizLinksModule ["selectedDS"]["url"] + "\" target=\"_blank\">" + 
                    cubeVizLinksModule ["selectedDS"]["label"] + "</a>";
        this["_generatedStructure"].push ( link );
        
        
        /**
         * Structure Components
         */
        
        // add selected Dimensions
        var backgroundColor:string = "", data:string = "", entry = {};
        for ( var dim in cubeVizLinksModule["selectedComponents"]["dimensions"] ) {
            dim = cubeVizLinksModule["selectedComponents"]["dimensions"][dim];
            
            entry = {
                "label": dim ["label"],
                "typeUrl": dim ["typeUrl"],
                "entries": []
            };
            
            for ( var i in dim["elements"] ) {
                
                backgroundColor = CubeViz_Visualization_Controller.getColor (dim["elements"][i]["property"]);
                
                data = "<span style=\"background-color:" + backgroundColor +";width:5px !important;height:5px !important;margin-right:4px;\">&nbsp;</span>";
                
                data += "<a href=\"" + dim["elements"][i]["property"] + "\" target=\"_blank\">" + 
                            dim["elements"][i]["propertyLabel"] + 
                        "</a>";
                
                entry ["entries"].push (data);
            }
            
            this["_generatedStructure_Components"].push ( entry );
        }
    }
    
    /**
     * 
     */
    public init (data:any, chartConfig:any) : void 
    {
        super.init ( data, chartConfig );
        
        /**
         * Generates data for data structure definition, data set and selected component dimensions
         */
        this.generateStructure (data);
        
        /**
         * Generates data for result observations
         */
        this.generatedObservations (data);
    }
    
    /**
     * 
     */
    public render () : void 
    {
        console.log("TODO implement Table.ts");
        /*
        var tpl = jsontemplate.Template(templateVisualization_CubeViz_Table);
        
        $("#container").html (tpl.expand({
            "generatedStructure": this["_generatedStructure"],
            "generatedStructure_Components": this["_generatedStructure_Components"],
            "generatedObservations": this["_generatedObservations"]
        }));*/
    }
}
