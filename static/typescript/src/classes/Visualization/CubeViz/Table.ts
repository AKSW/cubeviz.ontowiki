/// <reference path="..\DeclarationSourceFiles\jsontemplate.d.ts" />
/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

/**
 * Fits for all kinds of dimensions
 */
class Visualization_CubeViz_Table extends Visualization_CubeViz_Visualization {
    
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
    public generatedObservations (cubeVizLinksModule:Object[], entries:Object[]) : void {
        
        this["_generatedObservations"] = [];
        
        /**
         * header contains all the selected labels and and the measure
         */
        
        
        /**
         * ... and now the observations
         */
        var elements:Object = {},
            entry:Object = {},
            link = "",
            observation = new Observation ();
        
        // initializing observation handling instance with given elements
        // after init, sorting the x axis elements ascending
        console.log ( "entries" );
        console.log ( entries );
        
        observation.initialize ( 
            entries, 
            cubeVizLinksModule["selectedComponents"]["dimensions"], 
            Visualization_Controller.getMeasureTypeUrl()
        );
        
        var necUris = observation["_selectedDimensionUris"];
        necUris.push ( Visualization_Controller.getMeasureTypeUrl() );
        necUris.push ( "http://www.w3.org/2000/01/rdf-schema#label" );
        
        for (var i in entries) {
            
            entry = {"entries": []};
            
            for ( var uri in entries[i] ) {                
                if ( -1 != $.inArray ( uri, necUris ) ) {
                    
                    link = undefined != entries [i][uri][0]["label"] 
                        ? entries [i][uri][0]["label"]
                        : entries [i][uri][0]["value"];
                        
                    // if value is not an URI 
                    if ( false == System.contains (entries [i][uri][0]["value"], "http://") ) {
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
        backgroundColor = Visualization_Controller.getColor (cubeVizLinksModule ["selectedDSD"]["url"]);
                
        link = "<span style=\"background-color:" + backgroundColor +";width:5px !important;height:5px !important;margin-right:4px;\">&nbsp;</span>";
                
        link += "<a href=\"" + cubeVizLinksModule ["selectedDSD"]["url"] + "\" target=\"_blank\">" + 
                    cubeVizLinksModule ["selectedDSD"]["label"] + "</a>";
        this["_generatedStructure"].push (link);
        
        // add Data Set
        backgroundColor = Visualization_Controller.getColor (cubeVizLinksModule ["selectedDS"]["url"]);
                
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
                
                backgroundColor = Visualization_Controller.getColor (dim["elements"][i]["property"]);
                
                data = "<span style=\"background-color:" + backgroundColor +";width:5px !important;height:5px !important;margin-right:4px;\">&nbsp;</span>";
                
                data += "<a href=\"" + dim["elements"][i]["property"] + "\" target=\"_blank\">" + 
                            dim["elements"][i]["propertyLabel"] + 
                        "</a>";
                
                entry ["entries"].push (data);
            }
            
            this["_generatedStructure_Components"].push ( entry );
        }
        
        // add selected Measures
        for ( var dim in cubeVizLinksModule["selectedComponents"]["measures"] ) {
            break;
            dim = cubeVizLinksModule["selectedComponents"]["measures"][dim];
            
            data = "<div style=\"float:left;\">" +
                        "<a href=\"" + dim["typeUrl"] + "\">" + dim["label"] + "</a>" +
                   "</div>";
            
            backgroundColor = Visualization_Controller.getColor (dim["typeUrl"]);
            data += "<div style=\"background-color:" + backgroundColor +";width:10px;height:10px;float:left;vertical-align:middle;\">&nbsp;</div>";
            
            entry = {
                "label": dim ["label"],
                "entries": [data]
            };
            
            this["_generatedStructure_Components"].push ( entry );
            break;
        }
    }
    
    /**
     * 
     */
    public init (entries:Object[], cubeVizLinksModule:Object[], chartConfig:Object[] ) : void {
        super.init ( entries, cubeVizLinksModule, chartConfig );
        
        /**
         * Generates data for data structure definition, data set and selected component dimensions
         */
        this.generateStructure (cubeVizLinksModule);
        
        /**
         * Generates data for result observations
         */
        this.generatedObservations (cubeVizLinksModule, entries);
    }
    
    /**
     * 
     */
    public render () : void {
        var tpl = jsontemplate.Template(templateVisualization_CubeViz_Table);
        
        $("#container").html (tpl.expand({
            "generatedStructure": this["_generatedStructure"],
            "generatedStructure_Components": this["_generatedStructure_Components"],
            "generatedObservations": this["_generatedObservations"]
        }));
    }
}
