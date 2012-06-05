<?php
/**
 * This class represents a DataSet
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
class DataCube_DataSet
{    
	/**
	 * Data Set label
	 */
	public $label;
	
	/**
	 * Data Set uri
	 */
	public $uri;
	
	public function __construct($uri = '', $label = '') {
		$this->uri = $uri;
		$this->label = $label;
	}
}
