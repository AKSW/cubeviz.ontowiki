<?php
/**
 * This class represents a DataStructureDefinition
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
class DataCube_DataStructureDefinition extends ArrayObject
{    
	/**
	 * @param $label Data structure definition label
	 * @param $uri Data structure definition uri
	 */
	public function __construct($uri = '', $label = '') {
		$this ['uri'] = $uri;
		$this ['label'] = $label;
	}
}
