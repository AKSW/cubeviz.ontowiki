/// <reference path="..\..\..\..\..\declaration\libraries\d3js.d.ts" />

/**
 * 
 */
class CubeViz_Visualization_D3js_CirclePackingForClusters
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
        var cluster:any = {},
            self = this,
            value:any = null;
        
        // each "cluster" represents one of this dimension's dimension elements
        _.each (multipleDimensions[0].__cv_elements, function(element){
                
            cluster = {
                // cluster title
                name: element.__cv_niceLabel,
                children: []
            }
            
            _.each (observations, function(observation){
                
                // if current observation had a relation to one the dimension
                // elements, add it to the cluster
                if (observation[multipleDimensions[0]["http://purl.org/linked-data/cube#dimension"]] == element.__cv_uri) {
                    
                    // parse observation value
                    value = DataCube_Observation.parseValue(
                        observation, selectedMeasure["http://purl.org/linked-data/cube#measure"]
                    );
                    
                    // add observation to according cluster
                    cluster.children.push ({ name: _.str.numberFormat(value, 4, ',', '.'), size: value });
                }
            });
            
            // after cluster was built, add it to big giantic ball
            self.generatedData.children.push (cluster);
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
        : CubeViz_Visualization_D3js_CirclePackingForClusters 
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
                return _.str.numberFormat(d.size, 4, ',', '.'); 
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
