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
 
require_once CUBEVIZ_ROOT . DS . 'classes' . DS . 'DataCube' . DS . 'Dimension.php';

class DataCube_DimensionFactory
{    
	public $dimensions = array();

	public function __construct() {
		
	}
	
	public function initFromArray($selectedDimensions) {
		$selectedDimensions_length = sizeof($selectedDimensions["dimensions"]);
		while($selectedDimensions_length--) {
			$current_dimension = $selectedDimensions["dimensions"][$selectedDimensions_length];
			$dimension = new DataCube_Dimension($current_dimension['uri'], $current_dimension['md5'], $current_dimension['label'], 
										    $current_dimension['type'], $current_dimension['order'], $current_dimension['chartAxis'],
										    $current_dimension['orderDirection'], $current_dimension['elementCount'], 
										    $current_dimension['selectedElementCount']);
			array_push($this->dimensions, $dimension);
		}
	}
}
