<?php
/**
 * This class represents a DimensionFactory
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
 
require_once CUBEVIZ_ROOT . DS . 'classes' . DS . 'DataCube' . DS . 'DimensionComponent.php';

class DataCube_DimensionComponentFactory
{    
	public $dimensionComponents = array();

	public function __construct() {
		
	}
	
	public function initFromArray($selectedDimensionComponents) {
		$selectedDimensionComponents_length = sizeof($selectedDimensionComponents);
		while($selectedDimensionComponents_length--) {
			$current_dimensionComponent = $selectedDimensionComponents[$selectedDimensionComponents_length];
			$dimensionComponent = new DataCube_DimensionComponent($current_dimensionComponent['property'], $current_dimensionComponent['label']);
			array_push($this->dimensionComponents, $dimensionComponent);
		}
	}
}
