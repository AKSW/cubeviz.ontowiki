/// <reference path="..\..\..\..\..\declaration\libraries\d3js.d.ts" />

/**
 * 
 */
class CubeViz_Visualization_D3js_CirclePacking
{
    public chartConfig:any = {};
    public generatedData:any = {name: "", children: []};
    
    /**
     * @param observations any
     * @param multipleDimensions any[]
     * @param selectedMeasure any
     */
    public computeData(observations:any, multipleDimensions:any[], selectedMeasure:any) : void 
    {
        var children:any[] = [],
            circleLabel:string[] = [],
            self = this;
        
        _.each(observations, function(observation){
            
            circleLabel = [];
            
            // set children
            children = [{name:"", size:""}];
            
            // build observation label
            _.each(multipleDimensions, function(dimension){
                _.each(dimension.__cv_elements, function(element){                    
                    if (element.__cv_uri === observation[dimension["http://purl.org/linked-data/cube#dimension"]]) {
                        circleLabel.push (element.__cv_niceLabel);
                    }
                });
            });
            
            children[0].name = circleLabel.join (" - ");
            
            // set observation value
            children[0].size = DataCube_Observation.parseValue(observation [
                selectedMeasure["http://purl.org/linked-data/cube#measure"]
            ]);
            
            // save
            self.generatedData.children.push({
                name: observation.__cv_niceLabel,
                children: children
            })
        });
    }
    
    /**
     * Initialize a chart instance.
     * @param chartConfig Related chart configuration
     * @param retrievedObservations Array of retrieved observations 
     * @param selectedComponentDimensions Array of dimension objects with
     *                                    selected component dimensions.
     * @param multipleDimensions Array of dimension objects where at least two
     *                           dimension elements were selected.
     * @param oneElementDimensions Array of dimension objects where only one
     *                             dimension element was selected.
     * @param selectedMeasureUri Uri of selected measure
     * @param selectedAttributeUri Uri of selected attribute
     * @return CubeViz_Visualization_D3js_CirclePacking
     */
    public init (chartConfig:any, retrievedObservations:any[], 
        selectedComponentDimensions:any, multipleDimensions:any[],
        oneElementDimensions:any[], selectedMeasure:any,
        selectedAttributeUri:string) 
        : CubeViz_Visualization_D3js_CirclePacking 
    {
        this.chartConfig = chartConfig;
        
        // compute data to visualize based on retrieved observations
        this.computeData(
            retrievedObservations,
            multipleDimensions,
            selectedMeasure
        );
        
        return this;
    }
    
    /**
     * Simply returns the adapted chartConfig.
     * @return any Object to configure chart instance.
     */
    public getRenderResult () : any 
    {   
        // TODO set diameter dynamically
        var diameter = 960;

        var pack = d3.layout.pack()
            .size([diameter - 4, diameter - 4])
            .value(function (d) {
                return d.size;
            });

        var svg = d3.select("#cubeviz-index-visualization")
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .append("g")
            .attr("transform", "translate(2,2)");

        var node = svg.datum(this.generatedData)
            .selectAll(".node")
            .data(pack.nodes)
            .enter().append("g")
            .attr("class", function (d) {
                return d.children ? "node" : "cubeviz-visualization-d3js-circleLeaf node";
            })
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        /**
         * Show tooltip on hover a circle
         */
        node.append("title")
            .text(function (d) {
                return d.name + (d.children ? "" : ": " + d.size);
            });

        /**
         * Handle circle
         */
        node.append("circle")
            // TODO style
            .attr("r", function (d) {
                return d.r;
            });

        node.filter(function (d) {
            return !d.children;
        }).append("text")
            .attr("dy", ".3em")
            
            // style it
            .style("fill", this.chartConfig.style.circle["fill"])
            .style("font-size", this.chartConfig.style.circle["font-size"])
            .style("font-weight", this.chartConfig.style.circle["font-weight"])
            .style("text-anchor", this.chartConfig.style.circle["text-anchor"])
            .text(function (d) {
                return d.name.substring(0, d.r * 0.3);
            });
        
        return svg;
    }
}
