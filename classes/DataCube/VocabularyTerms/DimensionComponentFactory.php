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
class DataCube_VocabularyTerms_DimensionComponentFactory extends ArrayObject
{    
	public function __construct() {
		$this ['selectedDimensionComponents'] = array();
	}
	
	/**
	 * @param $dimensionComponents 
	 */	
	public function initFromArray($selectedDimensionComponents) {
		foreach ( $selectedDimensionComponents as $dimension => $entries ) {
            foreach ( $entries as $entry ) {
                $this ['selectedDimensionComponents'] [$dimension] [] = $entry;
            }
        }
	}
}
