/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
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
    public checkAndCreateMergedDataCube() 
    {
        // check if everthing important was loaded
        if (false === this._equalDimensionsFound
            || false === this._measuresReceived
            || false === this._observationsReceived) {
            // ... if not, stop execution of this function now    
            return;
        }
        
        // object representing the data part of configuration
        var measure1:any = null,
            measure2:any = null,
            mergedDataCube:any = {},
            mergedDataCubeUri:string = "",
            dimensionUri:string = "",
            virtualDimensions:any[] = [];
            
        // TODO check if there is already a merged data cube
        
        
        // set data cube object
        mergedDataCube = DataCube_DataCubeMerger.getDefaultDataCubeObject();
        
        
        // generate new uri for merged data cube
        mergedDataCubeUri = DataCube_DataCubeMerger.generateMergedDataCubeUri(
            this.app._.backend.url,
            JSON.stringify(this.app._.compareAction)
        );
        
        
        /**
         * set dataset
         */
        mergedDataCube.dataSets = DataCube_DataCubeMerger.buildDataSets(
            mergedDataCubeUri,
            this.app._.compareAction.datasets[1].__cv_niceLabel,
            this.app._.compareAction.datasets[2].__cv_niceLabel,
            this.app._.compareAction.datasets[1].__cv_uri,
            this.app._.compareAction.datasets[2].__cv_uri
        );
        
        mergedDataCube.selectedDS = mergedDataCube.dataSets[0];
        
        
        /**
         * set equal dimension pair(s) as dimensions
         */
        mergedDataCube.components.dimensions = DataCube_DataCubeMerger.getSingleDimensions(
            this.app._.compareAction.equalDimensions
        );
        
        mergedDataCube.selectedComponents.dimensions = DataCube_DataCubeMerger.getSelectedDimensionElements(
            mergedDataCube.components.dimensions
        );
        
        
        /**
         * set measure
         */
        measure1 = this.app._.compareAction.components.measures[1]
            [Object.keys(this.app._.compareAction.components.measures[1])[0]];
        measure2 = this.app._.compareAction.components.measures[2]
            [Object.keys(this.app._.compareAction.components.measures[2])[0]];
        
        mergedDataCube.components.measures = DataCube_DataCubeMerger.buildMeasure(
            mergedDataCubeUri, measure1.__cv_uri, measure2.__cv_uri,
            measure1.__cv_niceLabel, measure2.__cv_niceLabel
        );
                
        mergedDataCube.selectedComponents.measure = mergedDataCube.components.measures [0];
        
        
        /**
         * set data structure definition
         */
        mergedDataCube.dataStructureDefinitions = DataCube_DataCubeMerger.buildDataStructureDefinitions(
            mergedDataCubeUri,
            mergedDataCube.components.dimensions
        );
        
        mergedDataCube.selectedDSD = mergedDataCube.dataStructureDefinitions[0];
        
        
        /**
         * set retrieved observations
         */
        mergedDataCube.retrievedObservations = DataCube_DataCubeMerger.buildRetrievedObservations(
            mergedDataCubeUri, this.app._.compareAction.retrievedObservations
        );
        
        console.log("");
        console.log("mergedDataCube for " + _.size(this.app._.compareAction.equalDimensions) + " equal dimensions:");
        console.log("");
        console.log(mergedDataCube);
        
        
        /**
         * One pair of two equal dimensions
         */
        if (1 == _.size(this.app._.compareAction.equalDimensions)) {
            
            
        }
        
        
        /**
         * two pairs of two equal dimensions
         */
        else if (2 == _.size(this.app._.compareAction.equalDimensions)) {
            
        }
        
        
        /**
         * more than two pairs of two equal dimensions
         */
        else if (2 < _.size(this.app._.compareAction.equalDimensions)) {
            
        }
        
        
        /**
         * no equal dimensions, do nothing
         */
        else { 
            mergedDataCube = null;
        }        
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
    public initialize() : void 
    {
        this.collection.reset("__cv_uri");        
        this.render();
    }
    
    /**
     *
     */
    public onFound_equalDimensions() 
    {
        this._equalDimensionsFound = true;
        
        this.checkAndCreateMergedDataCube();
    }
    
    /**
     *
     */
    public onReceived_measures1AndMeasures2() 
    {
        this._measuresReceived = true;
        
        this.checkAndCreateMergedDataCube();
    }
    
    /**
     *
     */
    public onReceived_observations1AndObservations2() 
    {
        this._observationsReceived = true;
        
        this.checkAndCreateMergedDataCube();
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
