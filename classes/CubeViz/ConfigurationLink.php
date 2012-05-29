<?php
/**
 * This class represents an LinkHandle object
 * Used for handling files in the links/ directory
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */ 
class CubeViz_ConfigurationLink
{   
	/**
     * Path to the links folder
     */
    protected $_linksFolder = '';    
    protected $_links = null;
    
    /**
     * Constructor
     */
    public function __construct() {
        
        $ds = DIRECTORY_SEPARATOR;        
		$this->_linksFolder = dirname (__FILE__) . $ds . '..' . $ds . '..' . $ds . 'data' . $ds . 'links/';
        
        $this->_links = array ();
	}
	
	/**
	 * Read configuration from a json file in links folder
     * @param $linkCode Name of the file (name = hash code)
     * @return true
     * @throws CubeViz_Exception
	 */
	public function initFromLink($linkCode) {
		
		if(file_exists($this->_linksFolder . $linkCode)) {
			
            $parameters = file($this->_linksFolder . $linkCode);
			
            $this->_links [$linkCode] ['sparqlEndpoint'] = json_decode(trim($parameters[0]), true);
            
			$this->_links [$linkCode] ['selectedGraph'] = json_decode(trim($parameters[1]), true);
			
            // Data Structure Definition
            $selectedDSD = json_decode(trim($parameters[2]), true);
			$this->_links [$linkCode] ['selectedDSD'] = new DataCube_DataStructureDefinition (
                $selectedDSD['uri'], $selectedDSD['label']
            );
			
            // Data Set
            $selectedDS = json_decode(trim($parameters[3]), true);
			$this->_links [$linkCode] ['selectedDS'] = new DataCube_DataSet(
                $selectedDS['uri'],$selectedDS['label']
            );
			
            // Measures
            $selectedMeasures = json_decode(trim($parameters[4]), true);
			$this->_links [$linkCode] ['selectedMeasures'] = new DataCube_MeasureFactory();
			$this->_links [$linkCode] ['selectedMeasures']->initFromArray($selectedMeasures);
			
            // Dimensions
            $selectedDimensions = json_decode(trim($parameters[5]), true);
			$this->selectedDimensions = new DataCube_DimensionFactory();
			$this->selectedDimensions->initFromArray($selectedDimensions);
            
            // Dimension components
			$selectedDimensionComponents = json_decode(trim($parameters[6]), true);
			$this->_links [$linkCode] ['selectedDimensionComponents'] = new DataCube_DimensionComponentFactory();
			$this->_links [$linkCode] ['selectedDimensionComponents']->initFromArray($selectedDimensionComponents);
			
            // Chart type
            $this->_links [$linkCode] ['selectedChartType'] = json_decode(trim($parameters[7]), true);
            
		} else {
            throw new CubeViz_Exception ('Link you specified does not exist! Please, check '. $this->_linksFolder .' folder.');
		}
		return true;
	}
}
