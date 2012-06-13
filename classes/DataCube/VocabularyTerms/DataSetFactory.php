<?php
/**
 * This class represents a DimensionFactory
 *
 * @copyright Copyright (c) 2012, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
class DataCube_VocabularyTerms_DataSetFactory extends ArrayObject
{    
	public function __construct() {
		$this ['dataSets'] = array ();
	}
	
	public function initFromArray($selectedDataSets) {
		$selectedDataSets_length = sizeof($selectedDataSets);
		while($selectedDataSets_length--) {
			$current_ds = $selectedDataSets[$selectedDataSets_length];
			$ds = new DataCube_VocabularyTerms_DataSet($current_ds['url'], $current_ds['label']);
			array_push($this ['dataSets'], $ds);
		}
	}
}
