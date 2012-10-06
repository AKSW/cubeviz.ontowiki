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
class DataCube_VocabularyTerms_DataStructureDefinitionFactory extends ArrayObject
{    
	public function __construct() {
		$this ['dataStructureDefinitions'] = array ();
	}
	
	public function initFromArray($selectedDataStructureDefinitions) {
		$selectedDataStructureDefinitions_length = sizeof($selectedDataStructureDefinitions);
		while($selectedDataStructureDefinitions_length--) {
			$current_dsd = $selectedDataStructureDefinitions[$selectedDataStructureDefinitions_length];
			$dsd = new DataCube_VocabularyTerms_DataStructureDefinition($current_dsd['url'], $current_dsd['label']);
			array_push($this ['dataStructureDefinitions'], $dsd);
		}
	}
}
