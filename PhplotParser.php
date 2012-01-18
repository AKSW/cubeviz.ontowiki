<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

/**
 * The superclass-file providing the class skeleton for this class file
 */
require_once 'Parser.php';

/**
 * The file containing the code for the bar chart model used by the parser
 */
require_once 'model/BarChart.php';

/**
 * The file containing the code for the line chart model used by the parser
 */
require_once 'model/LineChart.php';

/**
 * The file containing the code for the pie chart model used by the parser
 */
require_once 'model/PieChart.php';

/**
 * The external library file used by this parser to create the output graphics
 */
require_once 'libraries/phplot/phplot.php';

/**
 * Parser for the chartview component enabling the use of the PHPlot chart
 * library.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
class PhplotParser extends Parser {
    
    /**
     * Holds the translations for the supported chart types into the HighCharts
     * chart names
     * @var array The chart type translation table as string array:
     * 'chartName' => 'highChartsName' 
     */
    private $_chartType = array();
    
    /**
     * Holds the chart data out of the chart object for easier access
     * @var array The chart data as the data in the array of the chart object 
     */
    private $_chartData = array();
    
    /**
     * Holds the supported chart types for this parser
     * @var array The supported chart types by this parser as a string array of
     * chart type names
     * @see Parser::_supportedChartTypes
     */
    static protected $_supportedChartTypes = array('bar', 'line', 'pie');
    
    /**
     * Initializes the PHPlot parser with the chart object, the addon names
     * and the translator. This method creates a new PHPlot object on which the
     * parser will further operate. Also the chart data is set to the internal
     * variables to allow an easier access.
     * @param Chart $chart The chart object to parse
     * @param array $addons The addons to load identified via the class name
     * @param translate $translate The translator used for GUI output
     */
    public function __construct($chart, $plugins, $translate) {
        
        //load basic functions for any parser
        parent::__construct($chart, $plugins, $translate);
        
        //extract the chart data for an easier handling
        $this->_chartData['x'] = $chart->getXAxis();
        $this->_chartData['y'] = $chart->getYAxis();
        $this->_chartData['z'] = $chart->getZAxis();
        $this->_chartData['data'] = $chart->getData();
        $this->_chartData['titles'] = $chart->getTitles();
        
        //initialize output object
        $this->_chartObject = new PHPlot(1000, 600);
        
        //load the chart type translations for the specific library
        $this->_chartType = array('bar' => 'bars', 
                                  'pie' => 'pie', 
                                  'line' => 'linepoints');
       
    }
    
    /**
     * Returns the HTML output code of the parser for the graphical output of
     * the chart.
     * @return string The HTML code as a string
     * @see Parser::retrieveChartResult()  
     */
    public function retrieveChartResult() {
        
        $resultOutputCode = "<center><img src=\"data:image/png;base64,";
        
        if($this->_chart instanceOf BarChart) {
            
            $resultOutputCode .= $this->_parseBarChart();
        }
        if($this->_chart instanceOf PieChart) {
            
            $resultOutputCode .= $this->_parsePieChart();
        }
        if($this->_chart instanceOf LineChart) {
            
            $resultOutputCode .= $this->_parseLineChart();
        }
        
        $resultOutputCode .= "\"/></center>";
        return $resultOutputCode;
    }
    
    /**
     * Returns the HTML code output for the bar chart.
     * @return string The HTML code output as string 
     */
    private function _parseBarChart() {
        
        $data = array();
        $legend = array();
        
        foreach ($this->_chartData['data'] as $xDimension => $xDataContent) {

            $xEntry = array($this->_chartData['x']['dimensionValues'][$xDimension]);

            foreach ($xDataContent as $zDimension => $zDataValue) {

                $xEntry[] = $zDataValue;
                if(count($xDataContent) > 1) 
                    $legend[] = $this->_chartData['z']['dimensionValues'][$zDimension];
            }

            $data[] = $xEntry;
        }

        $this->_chartObject->SetDataValues($data);
        if(!empty ($legend)) $this->_chartObject->SetLegend(array_unique($legend));
        $this->_chartObject->SetDataType('text-data');
        $this->_chartObject->SetXLabel($this->_chartData['x']['dimensionName']);
        $this->_chartObject->SetYLabel($this->_chartData['y']['measure']);
        $this->_chartObject->SetXTickIncrement(1);

        return $this->_retrieveCompleteChartCode();
    }
    
    /**
     * Returns the HTML code output for the line chart.
     * @return string The HTML code output as string 
     */
    private function _parseLineChart() {
        
        $data = array();
        $legend = array();

        foreach ($this->_chartData['data'] as $xDimension => $xDataContent) {

            $xEntry = array($this->_chartData['x']['dimensionValues'][$xDimension]);

            foreach ($xDataContent as $zDimension => $zDataValue) {

                $xEntry[] = $zDataValue;
                if(count($xDataContent) > 1) 
                    $legend[] = $this->_chartData['z']['dimensionValues'][$zDimension];
            }
            
            $data[] = $xEntry;
        }

        $this->_chartObject->SetDataValues($data);
        if(!empty ($legend)) $this->_chartObject->SetLegend(array_unique($legend));
        $this->_chartObject->SetDataType('text-data');
        $this->_chartObject->SetXLabel($this->_chartData['x']['dimensionName']);
        $this->_chartObject->SetYLabel($this->_chartData['y']['measure']);
        $this->_chartObject->SetXTickIncrement(1);

        return $this->_retrieveCompleteChartCode();
    }
    
    /**
     * Returns the HTML code output for the pie chart.
     * @return string The HTML code output as string 
     */
    private function _parsePieChart() {
        
        $data = array();
        
        foreach ($this->_chartData['data'] as $xDimension => $xDataValue) {
            
            $xEntry = array($this->_chartData['x']['dimensionValues'][$xDimension], 
                $xDataValue['sum']);
            
            $data[] = $xEntry;
        }
        
        $this->_chartObject->SetDataType('text-data-single');
        $this->_chartObject->SetDataValues($data);
        
        foreach($data as $entry) {
            $this->_chartObject->SetLegend(implode(": ", $entry)." ".
                    $this->_chartData['y']['measure']);
        }
        
        return $this->_retrieveCompleteChartCode();
    }
    
    /**
     * Returns the complete HTML code for the browser output of the chart. Therefor
     * the PHPlot object is plotted with GD and the output stream is captured 
     * and encoded to base64 so that it can be viewed by the browser without the
     * need of storing the image physically.
     * @return string The HTML code for parsing the chart in the browser
     */
    private function _retrieveCompleteChartCode() {
        
        $contents = null;
        
        //configure the plot for output
        $this->_chartObject->SetPlotType($this->_chartType[$this->_chart->getType()]);
        $this->_chartObject->SetTitle($this->_chartData['titles']['title'].', '.
                $this->_chartData['titles']['subtitle']);
        $this->_chartObject->SetIsInline(true);
        $this->_chartObject->SetFileFormat('png');
        $this->_chartObject->SetPrintImage(false);
        
        //run all plugins for the adaption of the plot-object
        $this->createAllAddOnObjects();
        
        //draw the plot and catch the image output for encoding as html
        $this->_chartObject->DrawGraph();
        ob_start();
        ImagePNG($this->_chartObject->img);
        $contents = ob_get_contents();
        ob_end_clean();
        
        //encoding the content object and cleaning up
        $this->_chartObject = null;
        return base64_encode($contents);
    }
    
    /**
     * Creates a certain addon object identified by its name and stores it
     * internally. Due to the usage of the PHPlot object by all addons this
     * method overwrites the general implementation by passing the chart object
     * with the changes of the previous addon to the next one.
     * @param string $name The name of the addon object to create
     * @see Parser::createAddOnObject()
     */
    public function createAddOnObject($name) {
        
        $this->_addonObjects[$name] = new $name($this->_chart->getType(), 
                $this->_translate, $this->_chartObject);
        
        $this->_chartObject = $this->_addonObjects[$name]->retrieveAdaptedContainer();
    }
}

?>
