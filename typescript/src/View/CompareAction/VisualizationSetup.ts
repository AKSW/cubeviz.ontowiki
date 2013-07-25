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
                name:    "onReceived_dimensions1AndDimensions2",
                handler: this.onReceived_dimensions1AndDimensions2
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
        
        var mergedDataCube:any = null,
            self = this;
        
        // based on all the data, create a merged data cube
        mergedDataCube = mergedDataCube = DataCube_DataCubeMerger.createMergedDataCube(
            this.app._.backend.url, JSON.stringify(this.app._.compareAction),
            this.app._.compareAction.datasets[1], this.app._.compareAction.datasets[2],
            this.app._.compareAction.equalDimensions, 
            DataCube_Component.getMeasures(this.app._.compareAction.components.measures[1])[0],
            DataCube_Component.getMeasures(this.app._.compareAction.components.measures[2])[0],
            this.app._.compareAction.retrievedObservations[1],
            this.app._.compareAction.retrievedObservations[2]
        );
        
        // save generated object and remember given hash
        CubeViz_ConfigurationLink.save(
            this.app._.backend.url, this.app._.backend.modelUrl, mergedDataCube, "data",
            function(dataHash){                
                // trigger event and attach new data hash and merged data cube
                self.triggerGlobalEvent("onCreated_mergedDataCube", {
                    dataHash: dataHash,
                    mergedDataCube: mergedDataCube
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
        
        _.each (charts, function(chart){
            
            // set visualization class
            uiObject.visualization.className = chart.className;
               
            // generate ui hash ...
            CubeViz_ConfigurationLink.save(
                self.app._.backend.url, self.app._.backend.modelUrl, uiObject, "ui",
                function(uiHash){                
                    
                    // ... than generate data hash according to merged datacube
                    // to set a click event handler afterwards
                    CubeViz_ConfigurationLink.save(
                        self.app._.backend.url, self.app._.backend.modelUrl, mergedDataCube, "data",
                        function(dataHash){  
                            
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
                            
                            link += "&cv_dataHash=" + dataHash
                                  + "&cv_uiHash=" + uiHash;
                            
                            $($newVisz.find("a").first())
                                .attr ("href", link)
                                .attr ("target", "_blank");
                                
                            $("#cubeviz-compare-availableVisualizations").append ($newVisz);
                        
                        }, true
                    );
                    
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
    public onClick_useBtn1() 
    {        
        // TODO adapt for multiple measures
        var measureUri = DataCube_Component.getMeasures(this.app._.compareAction.components.measures[1])
            [0]["http://purl.org/linked-data/cube#measure"],
            mergedDataCube:any = null,
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

        // based on all the data, create a merged data cube
        mergedDataCube = DataCube_DataCubeMerger.createMergedDataCube(
            this.app._.backend.url, JSON.stringify(this.app._.compareAction),
            this.app._.compareAction.datasets[1], this.app._.compareAction.datasets[2],
            this.app._.compareAction.equalDimensions, 
            DataCube_Component.getMeasures(this.app._.compareAction.components.measures[1])[0],
            DataCube_Component.getMeasures(this.app._.compareAction.components.measures[2])[0],
            this.app._.compareAction.retrievedObservations[1],
            this.app._.compareAction.retrievedObservations[2]
        );
        
        // save generated object and remember given hash
        CubeViz_ConfigurationLink.save(
            this.app._.backend.url, this.app._.backend.modelUrl, mergedDataCube, "data",
            function(dataHash){                
                // trigger event and attach new data hash and merged data cube
                self.triggerGlobalEvent("onCreated_mergedDataCube", {
                    dataHash: dataHash,
                    mergedDataCube: mergedDataCube
                });
            }, true
        );
    }
    
    /**
     *
     */
    public onClick_useBtn2() 
    {
        // TODO adapt for multiple measures
        var measureUri = DataCube_Component.getMeasures(this.app._.compareAction.components.measures[2])
            [0]["http://purl.org/linked-data/cube#measure"],
            mergedDataCube:any = null,
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

        // based on all the data, create a merged data cube
        mergedDataCube = DataCube_DataCubeMerger.createMergedDataCube(
            this.app._.backend.url, JSON.stringify(this.app._.compareAction),
            this.app._.compareAction.datasets[1], this.app._.compareAction.datasets[2],
            this.app._.compareAction.equalDimensions, 
            DataCube_Component.getMeasures(this.app._.compareAction.components.measures[1])[0],
            DataCube_Component.getMeasures(this.app._.compareAction.components.measures[2])[0],
            this.app._.compareAction.retrievedObservations[1],
            this.app._.compareAction.retrievedObservations[2]
        );
        
        // save generated object and remember given hash
        CubeViz_ConfigurationLink.save(
            this.app._.backend.url, this.app._.backend.modelUrl, mergedDataCube, "data",
            function(dataHash){                
                // trigger event and attach new data hash and merged data cube
                self.triggerGlobalEvent("onCreated_mergedDataCube", {
                    dataHash: dataHash,
                    mergedDataCube: mergedDataCube
                });
            }, true
        );
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
        
        this.checkAndShowVisualizationSetup();
    }
    
    /**
     *
     */
    public onReceived_dimensions1AndDimensions2() 
    {
        /**
         * Show dataset labels
         */
        $("#cubeviz-compare-confViz-datasetLabel1").html (
            _.str.prune (this.app._.compareAction.datasets[1].__cv_niceLabel, 55));
        
        $("#cubeviz-compare-confViz-datasetLabel2").html (
            _.str.prune (this.app._.compareAction.datasets[2].__cv_niceLabel, 55));
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
            "click #cubeviz-compare-confViz-useBtn2": this.onClick_useBtn2
        });
        
        return this;
    }
}
