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
 * The file containing the code for the table chart model used by the parser
 */
require_once 'model/TableChart.php';

/**
 * Parser for the chartview component enabling the use of a generic table chart
 * view for the data.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
class TableParser extends Parser {
    
    /**
     * Holds the complete HTML output for table visualization
     * @var string The HTML code of the created table 
     */
    private $_htmlOutput = '';
    
    /**
     * Holds all dimension data
     * @var array The dimension data as it is set in the table chart 
     */
    private $_dimensionData = array();
    
    /**
     * Holds all measure data
     * @var array The measure data as it is set in the table chart 
     */
    private $_measureData = array();
    
    /**
     * Holds all dimensions
     * @var array The dimensions to process as a string array with their uris
     */
    private $_dimensions = array();
    
    /**
     * Holds all dimension elements
     * @var array The dimension elements:
     * 'dimensionUri' => { 'elementUri' => boolean, ... }
     */
    private $_dimensionElem = array();
    
    /**
     * Holds the counts of all dimensions and their elements
     * @var array The dimension element counts:
     * 'dimensionUri' => int
     */
    private $_dimensionElemCount = array();
    
    /**
     * Holds all dimension element names for the processing of the table cells
     * @var array The dimension element names:
     * 'elementUri' => 'elementLabel'
     */
    private $_dimensionElemNames = array();
    
    /**
     * Holds all table columns ordered by the dimensions
     * @var array The table columns with HTML code as content:
     * 'dimensionUri' => { 'elementUri' => 'codeContent', ... }
     */
    private $_td = array();
    
    /**
     * Holds all table head entries of the table
     * @var array The table heads as a string array with the HTML code:
     * 'dimensionUri' => 'codeContent' 
     */
    private $_th = array();
    
    /**
     * Holds the supported chart types for this parser
     * @var array The supported chart types by this parser as a string array of
     * chart type names
     * @see Parser::_supportedChartTypes 
     */
    static protected $_supportedChartTypes = array('table');
    
    /**
     * Returns the HTML output code of the parser for the graphical output of
     * the table view. The table is completely build in HTML generated from the
     * given dimensions and measures.
     * @return string The HTML code as a string
     * @see Parser::retrieveChartResult()  
     */
    public function retrieveChartResult() {
        
        //no work is done here, so create the AddOn-objects
        $this->createAllAddOnObjects();
        
        $titles = $this->_chart->getTitles();
        
        $this->_htmlOutput .= '<table class="chart-table">';
        
        $data = $this->_chart->getData();
        $this->_dimensionData = $data['dimensionData'];
        $this->_measureData = $data['measureData'];
        $this->_dimensionElem = $data['dimensionElem'];
        $this->_dimensionElemCount = $data['dimensionElemCount'];
        $this->_dimensionElemNames = $data['dimensionElemNames'];
        
        $this->_dimensions = $this->_chart->getXAxis();
        $nameTable = $this->_chart->getZAxis();
        
        $dimensionsReversed = array_reverse($this->_dimensions);
        
        $rowSpan = 1;
        
        //get all dimensions in reversed order to calculate the rowspans
        //and create the table heads
        foreach($dimensionsReversed as $dimension) {
            
            foreach($this->_dimensionElem[$dimension] as $elem => $state) {
                
                if ( false == isset ( $this->_td[$dimension][$elem] ) ) {
                    $this->_td[$dimension][$elem] = '';
                }
                
                $this->_td[$dimension][$elem] .= '<td rowspan="'.$rowSpan.'">'.
                    $this->_dimensionElemNames[$elem].'</td>';
            }
            
            $this->_th[$dimension] = '<th><h2>'.
                $nameTable['d'][$dimension]['label'] .'</h2></th>';
            
            $rowSpan *= $this->_dimensionElemCount[$dimension];
        }
        
        $this->_htmlOutput .= '<tr>';
        
        foreach($this->_dimensions as $dimension) {
            
            $this->_htmlOutput .= $this->_th[$dimension];
        }
        
        $this->_htmlOutput .= '<th><h2>'.
            $this->_translate->_('title measures'). '</h2></th>';
        $this->_htmlOutput .= '</tr>';
        
        //calculate the table body by recursive walkthrough of all dimension 
        //elements
        $idArray = array();
        $this->_addAllSubEntries(0, $idArray);
        
        $this->_htmlOutput .= '</table>';
        
        //return the table
        return $this->_htmlOutput;
    }
    
    /**
     * Creates the sub entries of the table for the dimension given and triggers
     * this method recursively for all dimensions following. The method writes
     * the new cell contents of table into the internal variables.
     * @param int $index The dimension index
     * @param array $idArray The array containing the ids for dimension elements
     * so that the corresponding measure entries can be found:
     * 'elementUri' => boolean
     */
    private function _addAllSubEntries($index, $idArray) {
        
        if($index+1 < count($this->_dimensions)) {
            $dimension = $this->_dimensions[$index];

            $i = 0;
            foreach($this->_dimensionElem[$dimension] as $elem => $state) {

                $innerIdArray = $idArray;
                $this->_htmlOutput .= ($index >= $i ? '' : '<tr>').
                        $this->_td[$dimension][$elem];
                $i++;
                $innerIdArray[$elem] = true;
                $this->_addAllSubEntries($index+1, $innerIdArray);
            }
        }
        else {
            
            $dimension = $this->_dimensions[$index];
            
            $i = 0;
            foreach($this->_dimensionElem[$dimension] as $elem => $state) {

                $innerIdArray = $idArray;
                $this->_htmlOutput .= ($index >= $i ? '' : '<tr>').
                        $this->_td[$dimension][$elem];
                $i++;
                $innerIdArray[$elem] = true;
                //add the measure cell
                foreach($this->_dimensionData as $id => $tuple) {
                    $comparison = array_diff(array_keys($tuple), 
                            array_keys($innerIdArray));
                    
                    if(empty($comparison)) {
                        $this->_htmlOutput .= '<td>';
                        
                        foreach($this->_measureData[$id] as $measure => $value) {
                            // $this->_htmlOutput .= '<div class="chart-table-cell-measure">'. $measure .':</div>';
                            $this->_htmlOutput .= '<div class="chart-table-cell-measure">'.$value.'</div>';
                        }
                        
                        $this->_htmlOutput .= '</td>';
                        break;
                    }
                }
                
                //finish the row
                $this->_htmlOutput .= '</tr>';
            }
        }
        
    }
}
