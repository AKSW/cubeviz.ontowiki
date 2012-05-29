<?php
/**
 * This class represents a Measure
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
class DataCube_Measure
{    
	public $uri;
	public $uri_md5;
	public $label;
	public $type; 
	public $order; 
	public $aggregationMethod;
	public $roundValues;
	public $orderDirection;
	
	public function __construct($uri, $uri_md5, $label, $type, $order, $aggregationMethod, $roundValues, $orderDirection) {
		$this->uri = $uri;
		$this->uri_md5 = $uri_md5;
		$this->label = $label;
		$this->type = $type;
		$this->order = $order;
		$this->aggregationMethod = $aggregationMethod;
		$this->roundValues = $roundValues;
		$this->orderDirection = $orderDirection;
	}
}
