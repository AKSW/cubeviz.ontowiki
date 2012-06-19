<?php
/**
 * This class represents a MeasureFactory
 *
 * @copyright Copyright (c) 2012, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
class DataCube_VocabularyTerms_MeasureFactory extends ArrayObject
{    
	public function __construct() {
		$this ['measures'] = array ();
	}
	
    /**
     * @param $selectedMeasures 
     * @todo change selectedMeasures -> measures 
     */
	public function initFromArray($selectedMeasures) {
		$selectedMeasures_length = sizeof($selectedMeasures["measures"]);
		while($selectedMeasures_length--) {
			$current_measure = $selectedMeasures["measures"][$selectedMeasures_length];
			$measure = new DataCube_VocabularyTerms_Measure($current_measure['url'], $current_measure['url_md5'], $current_measure['label'], 
										    $current_measure['type'], $current_measure['order'], $current_measure['aggregationMethod'],
										    $current_measure['roundValues'], $current_measure['orderDirection']);
			array_push($this ['measures'], $measure);
		}
	}
}
