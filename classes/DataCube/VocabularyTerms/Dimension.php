<?php
/**
 * This class represents a Dimension
 *
 * @copyright Copyright (c) 2012, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
class DataCube_VocabularyTerms_Dimension extends ArrayObject
{    
    /**
     * Constructor
	 * @param $uri Uri of the dimension
     * @param $uri_md5 
     * @param $label
	 * @param $type
	 * @param $order
	 * @param $chartAxis
	 * @param $orderDirection
	 * @param $elementCount
	 * @param $selectedElementCount
     */
    public function __construct($url, $url_md5, $label, $type, $order, $chartAxis, $orderDirection, $elementCount, $selectedElementCount) {
		$this ['url'] = $url;
		$this ['url_md5'] = $url_md5; // deleteable?!
		$this ['label'] = $label;
		$this ['type'] = $type;
		$this ['order'] = $order;
		$this ['chartAxis'] = $chartAxis;
		$this ['orderDirection'] = $orderDirection;
		$this ['elementCount'] = $elementCount;
		$this ['selectedElementCount'] = $selectedElementCount;
	}
}
