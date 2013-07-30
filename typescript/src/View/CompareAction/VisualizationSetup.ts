/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\formulaParser.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CompareAction_VisualizationSetup extends CubeViz_View_Abstract 
{     
    private _equalDimensionsFound:bool = false;
    private _measuresReceived:bool = false;
    private _observationsReceived:bool = false;
       
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CompareAction_VisualizationSetup", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onCreated_mergedDataCube",
                handler: this.onCreated_mergedDataCube
            },
            {
                name:    "onFound_equalDimensions",
                handler: this.onFound_equalDimensions
            },
            {
                name:    "onReceived_measures1AndMeasures2",
                handler: this.onReceived_measures1AndMeasures2
            },
            {
                name:    "onReceived_observations1AndObservations2",
                handler: this.onReceived_observations1AndObservations2
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
    public adaptObservationValues(datasetNr:number, formula:string, observations:any,
        measureUri:string) : any
    {        
        try {
            
            var adaptedObservations:any = {},
                observationValue:string = "",
                parser = new formulaParser(),
                specificFormula:string = "";
            
            adaptedObservations = $.parseJSON(JSON.stringify(observations));
            
            _.each (adaptedObservations, function(observation, key){
                
                observationValue = DataCube_Observation.parseValue (observation, measureUri);
                
                // replace all $value$ with real value
                specificFormula = formula.split("$value$").join(observationValue);
                
                // replace all $pi$ with Math.pi
                specificFormula = specificFormula.split("$pi$").join(Math.PI+"");
            
                // replace with new value
                DataCube_Observation.setOriginalValue (
                    observation,
                    measureUri,
                    parser.parse(specificFormula).evaluate()
                );
                
                adaptedObservations[key] = observation;
            });
            
            return adaptedObservations;
                
        } catch (ex) {}
        
        return false;
    }
    
    /**
     *
     */
    public checkAndShowVisualizationSetup() 
    {
        // check if everthing important was loaded
        if (false === this._equalDimensionsFound
            || false === this._measuresReceived
            || false === this._observationsReceived) {
            // ... if not, stop execution of this function now    
            return;
        }
        
        // show adaption-interface
        $("#cubeviz-compare-prepareAndGoToVisualizations").fadeIn();
        
        this.createMergedDataCube();
    }
    
    /**
     *
     */
    public createMergedDataCube() 
    {
        // based on all the data, create a merged data cube
        this.app._.compareAction.mergedDataCube = DataCube_DataCubeMerger.create(
            this.app._.backend.url, JSON.stringify(this.app._.compareAction),
            this.app._.compareAction.datasets[1], this.app._.compareAction.datasets[2],
            this.app._.compareAction.equalDimensions, 
            DataCube_Component.getMeasures(this.app._.compareAction.components.measures[1])[0],
            DataCube_Component.getMeasures(this.app._.compareAction.components.measures[2])[0],
            this.app._.compareAction.retrievedObservations[1],
            this.app._.compareAction.retrievedObservations[2],
            this.app._.compareAction.components.dimensions[1],
            this.app._.compareAction.components.dimensions[1],
            $("input[name=cubeviz-compare-dimensionElementChoice]:checked").val()
        );
        
        // save generated object and remember generated hash
        var self = this;
        
        CubeViz_ConfigurationLink.saveData(
            this.app._.backend.url, this.app._.backend.serviceUrl, 
            this.app._.backend.modelUrl, DataCube_DataCubeMerger.latestHash,
            this.app._.compareAction.mergedDataCube, function(){                
                // trigger event and attach new data hash and merged data cube
                self.triggerGlobalEvent("onCreated_mergedDataCube", {
                    dataHash: DataCube_DataCubeMerger.latestHash,
                    mergedDataCube: self.app._.compareAction.mergedDataCube
                });
            }, true
        );
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
    public displayAvailableVisualizations(charts:any, mergedDataCube:any) : void
    {        
        var link:string = null,
            self = this,
            uiObject:any = {
                visualization: {
                    className: ""
                },
                visualizationSettings: {}
            },
            $newVisz:any = null;

        
        $("#cubeviz-compare-availableVisualizations").html("");
        
        /**
         * Go through all charts given by ChartConfig.js and generate for each
         * of them a link for a particular visualization
         */
        _.each (charts, function(chart){
            
            // set visualization class
            uiObject.visualization.className = chart.className;
            
            // generate hash over given object
            var uiHash = CryptoJS.MD5(JSON.stringify(uiObject))+"";
               
            // generate ui hash ...
            CubeViz_ConfigurationLink.saveUI(
                self.app._.backend.url, self.app._.backend.serviceUrl, 
                self.app._.backend.modelUrl, uiHash, uiObject, function(){
                    
                    link = self.app._.backend.url + "?";
                    
                    $newVisz = $("<div class=\"span2\">" + 
                                        "<a><img class=\"cubeviz-compare-specificVisz\" " +
                                             "src=\"" + self.app._.backend.imagesPath + chart.icon + "\"/></a>" +
                                    "</div>");
                    
                    if (false === _.isNull(self.app._.backend.serviceUrl)) {
                        link += "serviceUrl=" + encodeURIComponent (self.app._.backend.serviceUrl)
                                + "&";
                    }
                               
                    if (true === _.str.isBlank(self.app._.backend.modelUrl)) {
                        link += "m=" + encodeURIComponent (self.app._.compareAction.models[1].__cv_uri);
                    } else {
                        link += "m=" + encodeURIComponent (self.app._.backend.modelUrl);
                    }
                    
                    link += "&cv_dataHash=" + DataCube_DataCubeMerger.latestHash
                          + "&cv_uiHash=" + uiHash;
                    
                    $($newVisz.find("a").first())
                        .attr ("href", link)
                        .attr ("target", "_blank");
                        
                    $("#cubeviz-compare-availableVisualizations").append ($newVisz);  
                }
            );
        });
    }
    
    /**
     * 
     */
    public initialize() : void 
    {
        this.render();
    }
    
    /**
     *
     */
    public onChange_dimensionElementChoice(event) 
    {
        this.createMergedDataCube();
    }
    
    /**
     *
     */
    public onClick_useBtn1() 
    {        
        // TODO adapt for multiple measures
        var measureUri = DataCube_Component.getMeasures(this.app._.compareAction.components.measures[1])
                         [0]["http://purl.org/linked-data/cube#measure"],
            self = this;
        
        this.app._.compareAction.retrievedObservations[1] = this.adaptObservationValues(
            1, 
            $("#cubeviz-compare-confViz-datasetFormula1").val(),
            this.app._.compareAction.originalObservations[1],
            measureUri
        );
        
        if (false === this.app._.compareAction.retrievedObservations[1]) {
            // something went wrong
            return;
        }
        
        this.createMergedDataCube();
    }
    
    /**
     *
     */
    public onClick_useBtn2() 
    {
        // TODO adapt for multiple measures
        var measureUri = DataCube_Component.getMeasures(this.app._.compareAction.components.measures[2])
            [0]["http://purl.org/linked-data/cube#measure"],
            self = this;
        
        this.app._.compareAction.retrievedObservations[2] = this.adaptObservationValues(
            2, 
            $("#cubeviz-compare-confViz-datasetFormula2").val(),
            this.app._.compareAction.originalObservations[2],
            measureUri
        );
        
        if (false === this.app._.compareAction.retrievedObservations[2]) {
            // something went wrong
            return;
        }

        this.createMergedDataCube();
    }
    
    /**
     *
     */
    public onCreated_mergedDataCube(event, data) 
    {    
        this.displayAvailableVisualizations(
            this.app._.backend.chartConfig[_.size(this.app._.compareAction.equalDimensions)].charts,
            data.mergedDataCube
        );               
    }
    
    /**
     *
     */
    public onFound_equalDimensions() 
    {
        this._equalDimensionsFound = true;
        
        /**
         * Show dataset labels
         */
        $("#cubeviz-compare-confViz-datasetLabel1").html (
            _.str.prune (this.app._.compareAction.datasets[1].__cv_niceLabel, 55));
        
        $("#cubeviz-compare-confViz-datasetLabel2").html (
            _.str.prune (this.app._.compareAction.datasets[2].__cv_niceLabel, 55));
        
        this.checkAndShowVisualizationSetup();
    }
    
    /**
     *
     */
    public onReceived_measures1AndMeasures2() 
    {
        this._measuresReceived = true;
        
        this.checkAndShowVisualizationSetup();
    }
    
    /**
     *
     */
    public onReceived_observations1AndObservations2() 
    {
        this._observationsReceived = true;
        
        this.checkAndShowVisualizationSetup();
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
            "click #cubeviz-compare-confViz-useBtn1": this.onClick_useBtn1,
            "click #cubeviz-compare-confViz-useBtn2": this.onClick_useBtn2,
            "change .cubeviz-compare-dimensionElementChoice":
                this.onChange_dimensionElementChoice
        });
        
        return this;
    }
}
