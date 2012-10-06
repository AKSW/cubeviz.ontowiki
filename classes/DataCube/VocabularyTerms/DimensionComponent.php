<?php
/**
 * This class represents a DimensionComponent
 *
 * @copyright Copyright (c) 2012, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
class DataCube_VocabularyTerms_DimensionComponent extends ArrayObject
{   
	/**
	 * @param $property
	 * @param $label
	 */
	public function __construct($property, $property_label, $dimension_type, $dimension_url, $dimension_label) {
		$this ['property'] = $property;
		$this ['property_label'] = $property_label;
		$this ['dimension_type'] = $dimension_type;
		$this ['dimension_url'] = $dimension_url;
		$this ['dimension_label'] = $dimension_label;
	}
}
