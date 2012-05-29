<?php
/**
 * This class represents a Dimension
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
class DataCube_Dimension
{    
	public $uri;
	public $uri_md5;
	public $label;
	public $type; 
	public $order; 
	public $chartAxis;
	public $orderDirection;
	public $elementCount;
	public $selectedElementCount;
	
	public function __construct($uri, $uri_md5, $label, $type, $order, $chartAxis, $orderDirection, $elementCount, $selectedElementCount) {
		$this->uri = $uri;
		$this->uri_md5 = $uri_md5;
		$this->label = $label;
		$this->type = $type;
		$this->order = $order;
		$this->chartAxis = $chartAxis;
		$this->orderDirection = $orderDirection;
		$this->elementCount = $elementCount;
		$this->selectedElementCount = $selectedElementCount;
	}
}
