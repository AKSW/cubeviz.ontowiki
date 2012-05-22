<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

/**
 * The class file containing the bar chart model class
 */
require_once 'BarChart.php';

/**
 * The class file containing the pie chart model class
 */
require_once 'PieChart.php';

/**
 * The class file containing the line chart model class
 */
require_once 'LineChart.php';

/**
 * The class file containing the area chart model class
 */
require_once 'AreaChart.php';

/**
 * The class file containing the splines chart model class
 */
require_once 'SplinesChart.php';

/**
 * The class file containing the scatter plot chart model class
 */
require_once 'ScatterPlotChart.php';

/**
 * The class file containing the table chart model class
 */
require_once 'TableChart.php';

/**
 * Helper class for the chart models used by the component. This class provides 
 * functions to retrieve and create applicable chart types for given data.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
class ChartHelper {
    
    /**
     * Holds all chart types which can be used to create chart with the component
     * @var array The chart types known by the component: 'type' => 'name'  
     */
    private $_chartTypes = array();
    
    /**
     * Holds the type-specific limits for each chart type
     * @var array The chart limits for each type: 'type' => { 'limit' => int } 
     */
    private $_chartLimits = array();
    
    /**
     * Initializes the chart helper by gathering all types and their limits.
     */
    public function __construct() {
        
        //set all chart types
        $this->_chartTypes = array('bar' => 'Bars', 'pie' => 'Pie', 'line' => 'Lines', 
            'area' => 'Area', 'splines' => 'Splines', 'scatterplot' => 'ScatterPlot',
            'table' => 'Table');
        
        //set all chart type limits
        $this->_chartLimits['bar'] = BarChart::getLimits();
        $this->_chartLimits['pie'] = PieChart::getLimits();
        $this->_chartLimits['line'] = LineChart::getLimits();
        $this->_chartLimits['area'] = AreaChart::getLimits();
        $this->_chartLimits['splines'] = SplinesChart::getLimits();
        $this->_chartLimits['scatterplot'] = ScatterPlotChart::getLimits();
        $this->_chartLimits['table'] = TableChart::getLimits();
    }
    
    /**
     * Returns all chart types which are known by the component and can be used.
     * @return array The chart types which can be used by the component:
     * 'type' => 'name' 
     */
    public function retrieveAllChartTypes() {
        
        return $this->_chartTypes;
    }
    
    /**
     * Returns all chart types which are applicable for the given data specification.
     * The applicable types are found by examining the number of dimensions and
     * measures to process.
     * @param array $dataSpecTable The data specification: 'dimCount' => int,
     * 'measCount' => int
     * @return array The applicable chart types: 'type' => 'name' 
     */
    public function retrieveApplicableChartTypes($dataSpecTable) {
        
        $chartTypes = array();
        
        //process each chart type for a possible fit by all limit boundaries
        foreach($this->_chartTypes as $type => $name) {
            
            if($this->_chartLimits[$type]['minDimension'] <= $dataSpecTable['dimCount'] &&
                    $this->_chartLimits[$type]['maxDimension'] >= $dataSpecTable['dimCount'] &&
                    $this->_chartLimits[$type]['minMeasure'] <= $dataSpecTable['measCount'] &&
                    $this->_chartLimits[$type]['maxMeasure'] >= $dataSpecTable['measCount'])
                    
                    {
                
                $chartTypes[$type]['name'] = $name;
            }
        }
        
        return $chartTypes;
    }
    
    /**
     * Creates a chart model object of the given type with the given chart data.
     * @param string $type The chart type given as name string
     * @param array $chartData The chart data: 'dimensionData' => {...}, 
     * 'measureData' => {...}, 'nameTable' => {...}, 'dimensions' => {...},
     * 'measures' => {...}, 'titles' => {...}, 'model' => Erfurt_Rdf_Model
     * @return Chart The chart object as an instance of the appropriate subclass
     * of Chart
     */
    public function createChart($type, $chartData) {
                
        $chart = null;
        
        //create the chart as given by the $type parameter
        switch($type) {
            case 'bar': $chart = new BarChart($chartData['dimensionData'], 
                    $chartData['measureData'], $chartData['nameTable'],
                    $chartData['dimensions'], $chartData['measures'],
                    $chartData['titles'], $chartData['model']);
                break;
            case 'pie': $chart = new PieChart($chartData['dimensionData'], 
                    $chartData['measureData'], $chartData['nameTable'],
                    $chartData['dimensions'], $chartData['measures'],
                    $chartData['titles'], $chartData['model']);
                break;
            case 'line': $chart = new LineChart($chartData['dimensionData'], 
                    $chartData['measureData'], $chartData['nameTable'],
                    $chartData['dimensions'], $chartData['measures'],
                    $chartData['titles'], $chartData['model']);
                break;
            case 'area': $chart = new AreaChart($chartData['dimensionData'], 
                    $chartData['measureData'], $chartData['nameTable'],
                    $chartData['dimensions'], $chartData['measures'],
                    $chartData['titles'], $chartData['model']);                
                break;
            case 'splines': $chart = new SplinesChart($chartData['dimensionData'], 
                    $chartData['measureData'], $chartData['nameTable'],
                    $chartData['dimensions'], $chartData['measures'],
                    $chartData['titles'], $chartData['model']);                
                break;
            case 'scatterplot': $chart = new ScatterPlotChart($chartData['dimensionData'], 
                    $chartData['measureData'], $chartData['nameTable'],
                    $chartData['dimensions'], $chartData['measures'],
                    $chartData['titles'], $chartData['model']);                
                break;
            case 'table': $chart = new TableChart($chartData['dimensionData'], 
                    $chartData['measureData'], $chartData['nameTable'],
                    $chartData['dimensions'], $chartData['measures'],
                    $chartData['titles'], $chartData['model']);                
                break;
        }
        
        return $chart;
        
    }
}
?>
