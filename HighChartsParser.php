<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

/**
 * The superclass-file providing the basic class skeleton for this file
 */
require_once 'Parser.php';

/**
 * The file containing the code for the bar chart model used by the parser
 */
require_once 'model/BarChart.php';

/**
 * The file containing the code for the pie chart model used by the parser
 */
require_once 'model/PieChart.php';

/**
 * The file containing the code for the line chart model used by the parser
 */
require_once 'model/LineChart.php';

/**
 * The file containing the code for the area chart model used by the parser
 */
require_once 'model/AreaChart.php';

/**
 * The file containing the code for the splines chart model used by the parser
 */
require_once 'model/SplinesChart.php';

/**
 * The file containing the code for the scatterplot chart model used by the parser
 */
require_once 'model/ScatterPlotChart.php';

/**
 * Parser for the chartview component enabling the use of the HighCharts chart
 * library.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
class HighChartsParser extends Parser {
    
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
     * Holds the general configuration data for the HighCharts output code
     * @var array The configuration data as strings for the HighCharts output:
     * 'chartName' => { 'option' => 'content' } 
     */
    private $_chartConfig = array();
    
    /**
     * Holds the xAxis captions used in most chart types
     * @var string The categories on the xAxis as a string 
     */
    private $_categories = '';
    
    /**
     * Holds the series data for the chart as a JSON string
     * @var string The series data as a JSON container in a string 
     */
    private $_series = '';
    
    /**
     * Holds the supported chart types for this parser
     * @var array The supported chart types by this parser as a string array of
     * chart type names
     * @see Parser::_supportedChartTypes 
     */
    static protected $_supportedChartTypes = array('bar', 'line', 'pie', 'area', 
        'splines', 'scatterplot');

    /**
     * Initializes the HighCharts parser with the chart object, the addon names
     * and the translator. This method creates the general configuration entries
     * used to structure the output and sets all internal data for the parser.
     * @param Chart $chart The chart object to parse
     * @param array $addons The addons to load identified via the class name
     * @param translate $translate The translator used for GUI output
     */
    public function __construct($chart, $addons, $translate) {
        
        //load basic functions for any parser
        parent::__construct($chart, $addons, $translate);
        
        //extract the chart data for an easier handling
        $this->_chartData['x'] = $chart->getXAxis();
        $this->_chartData['y'] = $chart->getYAxis();
        $this->_chartData['z'] = $chart->getZAxis();
        $this->_chartData['data'] = $chart->getData();
        $this->_chartData['titles'] = $chart->getTitles();
        
        //set the charttype-specific standard configuration options for this library
        $this->_chartConfig['bar']['legend'] = "layout: 'horizontal',
        			backgroundColor: '#FFFFFF',
				align: 'center',
				verticalAlign: 'bottom',
				x: 0,
				y: 0,
				floating: false,
				shadow: true";
        
        $this->_chartConfig['bar']['plotOptions'] = "column: {
					pointPadding: 0.2,
					borderWidth: 0 },
                                        series: { dataLabels: {}}";
        
        $this->_chartConfig['bar']['tooltip'] = "formatter: function() { 
                                return '<b>'+this.series.name+'</b><br>'+
				this.x +': '+ this.y + ' "
                                    .$this->_chartData['y']['measure']."';}";
        
        $this->_chartConfig['pie']['legend'] = "";
        
        $this->_chartConfig['pie']['plotOptions'] = "pie: {
                                                    allowPointSelect: true,
                                                    cursor: 'pointer',
                                                    dataLabels: {
                                                            enabled: true,
                                                            color: '#000000',
                                                            connectorColor: '#000000',
                                                            formatter: function() {
                                                                    return '<b>'+ 
                                                                    this.point.name +'</b><br>".
                                                                    $this->_chartData['y']['measure'].
                                                                    ": '+ this.y;
                                                            }
                                                    }
                                            }";

        $this->_chartConfig['pie']['tooltip'] = "formatter: function() { 
                                return '<b>'+ this.series.name +'</b> '+ 
                                this.point.name +'<br>".$this->_chartData['y']['measure'].
                                ": '+ this.y;}";
        
        $this->_chartConfig['line']['legend'] = "layout: 'horizontal',
        			backgroundColor: '#FFFFFF',
				align: 'center',
				verticalAlign: 'bottom',
				x: 0,
				y: 0,
				floating: false,
				shadow: true";
        
        $this->_chartConfig['line']['plotOptions'] = "";
        
        $this->_chartConfig['line']['tooltip'] = "formatter: function() { 
                                return '<b>'+this.series.name+'</b><br>'+
				this.x +': '+ this.y + ' ".
                                    $this->_chartData['y']['measure']."';}";
        
        $this->_chartConfig['area']['tooltip'] = "formatter: function() {
							return '<b>'+this.series.name +'</b><br>'+
                                                        this.x +': '+ this.y + ' ".
                                                        $this->_chartData['y']['measure']."';}";
        
        $this->_chartConfig['area']['legend'] = "layout: 'horizontal',
        			backgroundColor: '#FFFFFF',
				align: 'center',
				verticalAlign: 'bottom',
				x: 0,
				y: 0,
				floating: false,
				shadow: true";
        
	$this->_chartConfig['area']['plotOptions'] = "area: {
							marker: {
								enabled: false,
								symbol: 'circle',
								radius: 1,
								states: {
									hover: {
										enabled: true
									}
								}
							}}";
        
        $this->_chartConfig['splines']['tooltip'] = "formatter: function() {
							return '<b>'+this.series.name +'</b><br>'+
                                                        this.x +': '+ this.y + ' ".
                                                        $this->_chartData['y']['measure']."';}";
        
        $this->_chartConfig['splines']['legend'] = "layout: 'horizontal',
        			backgroundColor: '#FFFFFF',
				align: 'center',
				verticalAlign: 'bottom',
				x: 0,
				y: 0,
				floating: false,
				shadow: true";
        
        $this->_chartConfig['splines']['plotOptions'] = "spline: {
                                                            marker: {
                                                                enable: false
                                                                }
                                                            }";
        
        $this->_chartConfig['scatterplot']['tooltip'] = "formatter: function() {
							return '<b>'+this.series.name +'</b><br>'+
                                                        '".
                                                        $this->_chartData['x']['dimensionValues'].
                                                        ": '+this.x +', ".
                                                        $this->_chartData['y']['dimensionValues'].
                                                        ": '+ this.y;}";
        
        $this->_chartConfig['scatterplot']['legend'] = "layout: 'horizontal',
        			backgroundColor: '#FFFFFF',
				align: 'center',
				verticalAlign: 'bottom',
				x: 0,
				y: 0,
				floating: false,
				shadow: true";
        
        $this->_chartConfig['scatterplot']['plotOptions'] = "scatter: {
                                                            marker: {
                                                                radius: 4,
                                                                states: {
                                                                    hover: {
                                                                        enabled: true,
                                                                        lineColor: 'rgb(0,0,0)'
                                                                    }
                                                                }
                                                                },
                                                            states: {
                                                                hover: {
                                                                    marker: {
                                                                        enabled: false
                                                                    }
                                                                }
                                                            }
                                                            }";
        
        //load the chart type translations for the specific library
        $this->_chartType = array('bar' => 'column', 
                                 'pie' => 'pie', 
                                 'line' => 'line', 
                                 'area' => 'area', 
                                 'splines' => 'spline', 
                                 'scatterplot' => 'scatter');
        
        //set the name of the output object
        $this->_chartObject = 'chart';
        
    }
    
    /**
     * Returns the HTML output code of the parser for the graphical output of
     * the chart. In particular two script parts are returned with links to the 
     * needed JS-library files are included.
     * @return string The HTML code as a string
     * @see Parser::retrieveChartResult()  
     */
    public function retrieveChartResult() {
        
        $resultOutputCode = "";
        
        //check the chart for error message, else start the processing of the
        //graphics
        if($this->_chart->getMessage() != '') {
            
            $resultOutputCode .= $this->_translate->_($this->_chart->getMessage()); 
        }
        else {
            //run the appropriate submethod for creating the char code depending on
            //the chart type for being able to adapt the parsing routine for chart-
            //specific characteristics
            if($this->_chart instanceOf BarChart) {

                $resultOutputCode .= $this->_parseBarChart();
            }
            if($this->_chart instanceOf PieChart) {

                $resultOutputCode .= $this->_parsePieChart();
            }
            if($this->_chart instanceOf LineChart) {

                $resultOutputCode .= $this->_parseLineChart();
            }
            if($this->_chart instanceof AreaChart) {

                $resultOutputCode .= $this->_parseAreaChart();
            }
            if($this->_chart instanceof SplinesChart) {

                $resultOutputCode .= $this->_parseSplinesChart();
            }
            if($this->_chart instanceof ScatterPlotChart) {

                $resultOutputCode .= $this->_parseScatterPlotChart();
            }

            //add the output container for the JS char output
            $resultOutputCode 
                .= '<div id="container" style="height:600px;margin:0 auto;"></div>';
        }
        
        //create all addons here because there is nothing to do in PHP
        $this->createAllAddOnObjects();
        
        return $resultOutputCode;
    }
    
    /**
     * Returns the code (JS script links...) which imports the needed libraries
     * for this parser.
     * @return The code with the needed library links
     * @see Parser::retrieveImportCode() 
     */
    public function retrieveImportCode() {
        
        $resultOutputCode = '';
        
        //add the library script link here
        $resultOutputCode .= 
            '<script type="text/javascript" src="%1$slibraries/HighCharts/js/highcharts.js"></script>';
        $resultOutputCode .= 
            '<script type="text/javascript" src="%1$slibraries/HighCharts/js/modules/exporting.js"></script>';
        
        return $resultOutputCode;
    }
    
    /**
     * Returns the code (HTML/JS/...) needed for the interpretation and execution
     * of the chart result if the OntoWiki framework is not used for viewing.
     * This method is called by the service action of the component.
     * @return string The code needed to run the result code of the parser without
     * the OntoWiki framework
     * @see Parser::retrieveServiceCode() 
     */
    public function retrieveServiceCode() {
        
        return '<script type="text/javascript" 
            src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>';
    }
    
    /**
     * Returns the HTML/JS code output for the bar chart.
     * @return string The HTML/JS code output as string 
     */
    private function _parseBarChart() {
        
        $this->_categories = "categories: ['".implode("','", 
                $this->_chartData['x']['dimensionValues'])."']";
        
        $series = array();
        $finalSeries = '[';
        
        foreach ($this->_chartData['data'] as $xDimension => $xDataContent) {
            
            foreach ($xDataContent as $zDimension => $zDataValue) {
                
                if(!isset($series[$zDimension])) 
                    $series[$zDimension] 
                        = "{name: '".$this->_chartData['z']['dimensionValues']
                        [$zDimension]."', data: [";
               
                $categoryValue = $this->_chartData['x']['dimensionValues'][$xDimension];
                if(!is_numeric($this->_chartData['x']['dimensionValues'][$xDimension])) {
                    $categoryValue = "'".$categoryValue."'";
                }
                
                $series[$zDimension] .= "[".$categoryValue.", ".$zDataValue."], ";
            }
        }
        
        foreach ($series as $serie) {
            $finalSeries .= substr($serie, 0, strlen($serie)-2).']},';
        }
        
        $specificChartOptions = "";
        
        $xAxis = "xAxis: {".$this->_categories.", labels: {rotation: 0}},";
        
        $yAxis = "yAxis: {min: 0, title: {
                                            text: '".$this->_chartData['y']['measure']."'
                                        }},";
        
        $this->_series = substr($finalSeries, 0, strlen($finalSeries)-1).']';
        
        $specificChartOptions .= $xAxis."\n".$yAxis;
        
        return $this->_retrieveCompleteChartCode($specificChartOptions);
    }
    
    /**
     * Returns the HTML/JS code output for the line chart.
     * @return string The HTML/JS code output as string 
     */
    private function _parseLineChart() {
        
        $this->_categories = "categories: ['".implode("','", 
                $this->_chartData['x']['dimensionValues'])."']";
        
        $series = array();
        $finalSeries = '[';
        
        foreach ($this->_chartData['data'] as $xDimension => $xDataContent) {
            
            foreach ($xDataContent as $zDimension => $zDataValue) {
                
                if(!isset($series[$zDimension])) 
                    $series[$zDimension] = "{name: '".$this->_chartData['z']
                        ['dimensionValues'][$zDimension]."', data: [";
                
                $categoryValue = $this->_chartData['x']['dimensionValues'][$xDimension];
                if(!is_numeric($this->_chartData['x']['dimensionValues'][$xDimension])) {
                    $categoryValue = "'".$categoryValue."'";
                }
                
                $series[$zDimension] .= "[".$categoryValue.", ".$zDataValue."], ";
            }
        }
        
        foreach ($series as $serie) {
            $finalSeries .= substr($serie, 0, strlen($serie)-2).']},';
        }
        
        $specificChartOptions = "";
        
        $xAxis = "xAxis: {".$this->_categories.", labels: {rotation: 0}},";
        
        $yAxis = "yAxis: {min: 0, title: {
                                        text: '".$this->_chartData['y']['measure']."'
                                        }},";
        
        $this->_series = substr($finalSeries, 0, strlen($finalSeries)-1).']';
        
        $specificChartOptions .= $xAxis."\n".$yAxis;
        
        return $this->_retrieveCompleteChartCode($specificChartOptions);
    }
    
    /**
     * Returns the HTML/JS code output for the pie chart.
     * @return string The HTML/JS code output as string 
     */
    private function _parsePieChart() {
        
        $series = "[{name: '".$this->_chartData['x']['dimensionName']."', data: [";
        
        foreach($this->_chartData['data'] as $xDimension => $xDataValue) {
            
            $series .= "['".$this->_chartData['x']['dimensionValues'][$xDimension].
                    "', ".$xDataValue['sum']."],";
        }
        
        $this->_series = substr($series, 0, strlen($series)-1)."]}]";
        
        return $this->_retrieveCompleteChartCode('');
    }
    
    /**
     * Returns the HTML/JS code output for the area chart.
     * @return string The HTML/JS code output as string 
     */
    private function _parseAreaChart() {
        
        $this->_categories = "categories: ['".implode("','", 
                $this->_chartData['x']['dimensionValues'])."']";
        
        $series = array();
        $finalSeries = '[';
        
        foreach ($this->_chartData['data'] as $xDimension => $xDataContent) {
            
            foreach ($xDataContent as $zDimension => $zDataValue) {
                
                if(!isset($series[$zDimension])) 
                    $series[$zDimension] = "{name: '".$this->_chartData['z']
                        ['dimensionValues'][$zDimension]."', data: [";
                
                $categoryValue = $this->_chartData['x']['dimensionValues'][$xDimension];
                if(!is_numeric($this->_chartData['x']['dimensionValues'][$xDimension])) {
                    $categoryValue = "'".$categoryValue."'";
                }
                
                $series[$zDimension] .= "[".$categoryValue.", ".$zDataValue."], ";
            }
        }
        
        foreach ($series as $serie) {
            $finalSeries .= substr($serie, 0, strlen($serie)-2).']},';
        }
        
        $specificChartOptions = "";
        
        $xAxis = "xAxis: {".$this->_categories.", labels: {rotation: 0}},";
        
        $yAxis = "yAxis: {min: 0, title: {
                                            text: '".$this->_chartData['y']['measure']."'
                                        }},";
        
        $this->_series = substr($finalSeries, 0, strlen($finalSeries)-1).']';
        
        $specificChartOptions .= $xAxis."\n".$yAxis;
        
        return $this->_retrieveCompleteChartCode($specificChartOptions);
    }
    
    /**
     * Returns the HTML/JS code output for the splines chart.
     * @return string The HTML/JS code output as string 
     */
    private function _parseSplinesChart() {
        
        $this->_categories = "categories: ['".implode("','", 
                $this->_chartData['x']['dimensionValues'])."']";
        
        $series = array();
        $finalSeries = '[';
        
        foreach ($this->_chartData['data'] as $xDimension => $xDataContent) {
            
            foreach ($xDataContent as $zDimension => $zDataValue) {
                
                if(!isset($series[$zDimension])) 
                    $series[$zDimension] = "{name: '".
                        $this->_chartData['z']['dimensionValues'][$zDimension].
                        "', data: [";
                
                $categoryValue = $this->_chartData['x']['dimensionValues'][$xDimension];
                if(!is_numeric($this->_chartData['x']['dimensionValues'][$xDimension])) {
                    $categoryValue = "'".$categoryValue."'";
                }
                
                $series[$zDimension] .= "[".$categoryValue.", ".$zDataValue."], ";
            }
        }
        
        foreach ($series as $serie) {
            $finalSeries .= substr($serie, 0, strlen($serie)-2).']},';
        }
        
        $specificChartOptions = "";
        
        $xAxis = "xAxis: {".$this->_categories.", labels: {rotation: 0}},";
        
        $yAxis = "yAxis: {min: 0, title: {
                                            text: '".$this->_chartData['y']['measure']."'
                                        }},";
        
        $this->_series = substr($finalSeries, 0, strlen($finalSeries)-1).']';
        
        $specificChartOptions .= $xAxis."\n".$yAxis;
        
        return $this->_retrieveCompleteChartCode($specificChartOptions);
    }
    
    /**
     * Returns the HTML/JS code output for the scatter plot chart.
     * @return string The HTML/JS code output as string 
     */
    private function _parseScatterPlotChart() {
        
        $series = array();
        $finalSeries = '[';
        
        foreach($this->_chartData['data'] as $xyDimension => $zContent) {
            foreach($zContent as $zIndex => $zValue) {
                if(!isset($series[$zIndex])) 
                    $series[$zIndex] = "{name: '".
                        $this->_chartData['z']['dimensionValues'][$zIndex].
                        "', data: [[".$zValue.", ";
                else
                    $series[$zIndex] .= $zValue."]]}";
            }
        }
        
        foreach ($series as $serie) {
            
            if(strpos($serie, ']]}') > 0) {
                $finalSeries .= $serie.', ';
            }
        }
        
        $finalSeries = substr($finalSeries, 0, strlen($finalSeries)-2).']';
        
        $specificChartOptions = "";
        
        //for this chart the xAxis also has a minimum because it shows measure values
        $xAxis = "xAxis: {min: 0, title: { enabled: true, text: '".
                $this->_chartData['x']['dimensionValues'].
                "'}, startOnTick: true, endOnTick: true, labels: {rotation: 0}},";
        
        $yAxis = "yAxis: {min: 0, title: {
                                            text: '".$this->_chartData['y']['dimensionValues']."'
                                        }},";
        
        $this->_series = $finalSeries;
        
        $specificChartOptions .= $xAxis."\n".$yAxis;
        
        return $this->_retrieveCompleteChartCode($specificChartOptions);
    }
    
    /**
     * Returns the complete HTML/JS code with the JSON container for the HighCharts
     * library to render the chart. As input the method needs the specific chart
     * options given by the methods for creating the type-dependent chart code.
     * @param string $specificChartOptions The type-dependent chart code
     * @return string The HTML/JS code for creating the chart in the browser
     */
    private function _retrieveCompleteChartCode($specificChartOptions) {
        
        $result = '';
        
        //fixed options: always set and needed				
        $chart = "chart: {renderTo: 'container', 
                   defaultSeriesType: '".
                        $this->_chartType[$this->_chart->getType()]."'},";
        
        $credits = 'credits: {enabled: false},';
        
        $title = "title: {text: '".$this->_chartData['titles']['title']."'},";
        
        $subtitle = "subtitle: {text: '".$this->_chartData['titles']['subtitle']."'},";
        
        $series = "series: ".$this->_series;
        
        //general options: set out of the standard code, could be adapted externally via AddOn
        $legend = "legend: {".$this->_chartConfig[$this->_chart->getType()]['legend']."},";
        
	$plotOptions = "plotOptions: {".
                $this->_chartConfig[$this->_chart->getType()]['plotOptions']."},";
        
        $tooltip = "tooltip: {".$this->_chartConfig[$this->_chart->getType()]['tooltip']."},";
        
        $result .= "<script type=\"text/javascript\">
		
			var chart;
			$(document).ready(function() {
				chart = new Highcharts.Chart({
                                        ".$chart."
                                        ".$credits."
					".$title."
					".$subtitle."
                                        ".$specificChartOptions."
                                        ".$legend."
                                        ".$plotOptions."
                                        ".$tooltip."
					".$series."				
				});
				
				
			});
				
		</script>";
        
        return $result;
    }
    
}

?>
