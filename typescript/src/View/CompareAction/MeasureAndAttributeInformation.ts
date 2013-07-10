/// <reference path="..\..\..\declaration\libraries\jsStats.d.ts" />
/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CompareAction_MeasureAndAttributeInformation extends CubeViz_View_Abstract 
{        
    private _measures1And2Recveived:bool = false;
    private _observations1And2Received:bool = false;
    
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CompareAction_MeasureAndAttributeInformation", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
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
    public destroy () : CubeViz_View_Abstract
    {
        super.destroy();
        return this;
    }
    
    /**
     *
     */
    public displayMeasuresAndAttributesInformation(datasetNr:number): void
    {
        var $container:any = $("#cubeviz-compare-measuresAndAttributesInformation" + datasetNr),
        
            foundInvalidNumbers:bool = false,
        
            // get the measure
            measure = this.app._.compareAction.components.measures[datasetNr]
                [Object.keys(this.app._.compareAction.components.measures[datasetNr])[0]],
            
            observationValues:any[] = null,
            valuesResult:any[] = null;
            
        // get a list of the values of the observations
        valuesResult = DataCube_Observation.getValues(
            this.app._.compareAction.observations[datasetNr],
            measure ["http://purl.org/linked-data/cube#measure"]
        );        
        observationValues = valuesResult[0];
        foundInvalidNumbers = valuesResult[1];
            
        // show notification if invalid numbers were found, to notify the user
        // that the following computed values are not exact
        if (true === foundInvalidNumbers) {
            $("#cubeviz-compare-mAAInvalidNumbersFound" + datasetNr).show();
        }
            
        /**
         * range
         */
        $($container.find(".cubeviz-compare-mAARangeMin").first()).html (
            true === foundInvalidNumbers 
            ? "~ " + String(jsStats.min (observationValues)).substring(0, 10)
            : String(jsStats.min (observationValues)).substring(0, 10)
        );
        $($container.find(".cubeviz-compare-mAARangeMax").first()).html (
            true === foundInvalidNumbers 
            ? "~ " + String(jsStats.max (observationValues)).substring(0, 10)
            : String(jsStats.max (observationValues)).substring(0, 10)
        );
        
        /**
         * median
         */
        $($container.find(".cubeviz-compare-mAAMedian").first()).html (
            true === foundInvalidNumbers 
            ? "~ " + String(jsStats.median (observationValues)).substring(0, 10)
            : String(jsStats.median (observationValues)).substring(0, 10)
        );
        
        /**
         * mean
         */
        $($container.find(".cubeviz-compare-mAAMean").first()).html (
            true === foundInvalidNumbers 
            ? "~ " + String(jsStats.mean (observationValues)).substring(0, 10)
            : String(jsStats.mean (observationValues)).substring(0, 10)
        );
        
        /**
         * variance
         */
        $($container.find(".cubeviz-compare-mAAVariance").first()).html (
            true === foundInvalidNumbers 
            ? "~ " + String(jsStats.variance (observationValues)).substring(0, 10)
            : String(jsStats.variance (observationValues)).substring(0, 10)
        );
        
        /**
         * standard deviation
         */
        $($container.find(".cubeviz-compare-mAAStandardDeviation").first()).html (
            true === foundInvalidNumbers 
            ? "~ " + String(jsStats.standardDeviation (observationValues)).substring(0, 10)
            : String(jsStats.standardDeviation (observationValues)).substring(0, 10)
        );
        
        // show panel
        $("#cubeviz-compare-measuresAndAttributesInformation" + datasetNr).show();
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
    public onReceived_measures1AndMeasures2() : void
    {
        this._measures1And2Recveived = true;
        
        if (true === this._measures1And2Recveived
            && true === this._observations1And2Received) {
            this.displayMeasuresAndAttributesInformation(1);
            this.displayMeasuresAndAttributesInformation(2);
        }
    }
    
    /**
     *
     */
    public onReceived_observations1AndObservations2() : void
    {
        this._observations1And2Received = true;
        
        if (true === this._measures1And2Recveived
            && true === this._observations1And2Received) {
            this.displayMeasuresAndAttributesInformation(1);
            this.displayMeasuresAndAttributesInformation(2);
        }
    }
    
    /**
     *
     */
    public onStart_application() : void
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
