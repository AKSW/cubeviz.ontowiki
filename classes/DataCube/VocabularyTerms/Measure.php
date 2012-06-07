<?php
/**
 * This class represents a measure
 *
 * @copyright Copyright (c) 2012, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
class DataCube_VocabularyTerms_Measure extends ArrayObject
{    
    /**
     * Constructor
	 * @param $uri Uri of the dimension
     * @param $uri_md5 
     * @param $label
	 * @param $type
	 * @param $order
	 * @param $aggregationMethod
	 * @param $roundValues
	 * @param $orderDirection
     */
	public function __construct($uri, $uri_md5, $label, $type, $order, $aggregationMethod, $roundValues, $orderDirection) {
		$this ['uri'] = $uri;
		$this ['uri_md5'] = $uri_md5; // deleteable?!
		$this ['label'] = $label;
		$this ['type'] = $type;
		$this ['order'] = $order;
		$this ['aggregationMethod'] = $aggregationMethod;
		$this ['roundValues'] = $roundValues;
		$this ['orderDirection'] = $orderDirection;
	}
}
