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

require_once CUBEVIZ_ROOT . DS . 'classes' . DS . 'DataCube' . DS . 'DataStructureDefinition.php';
require_once CUBEVIZ_ROOT . DS .'classes' . DS . 'DataCube' . DS . 'DataSet.php';
require_once CUBEVIZ_ROOT . DS . 'classes' . DS . 'DataCube' . DS . 'MeasureFactory.php';
require_once CUBEVIZ_ROOT . DS . 'classes' . DS . 'DataCube' . DS . 'DimensionFactory.php';
require_once CUBEVIZ_ROOT . DS . 'classes' . DS . 'DataCube' . DS . 'DimensionComponentFactory.php';
 
class CubeViz_ConfigurationLink
{   
	/**
     * Path to the links/ folder
     */
    protected $_linksFolder = '';
    
    public $sparqlEndpoint;
    public $selectedGraph;
    public $selectedDSD;
    public $selectedDS;
    public $selectedMeasures;
    public $selectedDimensions;
    public $selectedDimensionComponents;
    public $selectedChartType;
    
    
    public function __construct() {
		$this->_linksFolder = CUBEVIZ_ROOT . DS . 'config' . DS . 'links/';
	}
	
	/**
	 * Read configuration from 
	 */
	public function initFromLink($linkCode) {
		$configuration = array();
		if(file_exists($this->_linksFolder . $linkCode)) {
			$parameters = file($this->_linksFolder . $linkCode);
			$this->sparqlEndpoint = json_decode(trim($parameters[0]), true);
			$this->selectedGraph = json_decode(trim($parameters[1]), true);
			$selectedDSD = json_decode(trim($parameters[2]), true);
			$this->selectedDSD = new DataCube_DataStructureDefinition($selectedDSD['uri'],$selectedDSD['label']);
			$selectedDS = json_decode(trim($parameters[3]), true);
			$this->selectedDS = new DataCube_DataSet($selectedDS['uri'],$selectedDS['label']);
			$selectedMeasures = json_decode(trim($parameters[4]), true);
			$this->selectedMeasures = new DataCube_MeasureFactory();
			$this->selectedMeasures->initFromArray($selectedMeasures);
			$selectedDimensions = json_decode(trim($parameters[5]), true);
			$this->selectedDimensions = new DataCube_DimensionFactory();
			$this->selectedDimensions->initFromArray($selectedDimensions);
			$selectedDimensionComponents = json_decode(trim($parameters[6]), true);
			$this->selectedDimensionComponents = new DataCube_DimensionComponentFactory();
			$this->selectedDimensionComponents->initFromArray($selectedDimensionComponents);
			$this->selectedChartType = json_decode(trim($parameters[7]), true);
		} else {
            throw new CubeViz_Exception ('Link you specified does not exist! Please, check extensions/cubeviz/config/links folder');
		}
		return true;
	}
}
