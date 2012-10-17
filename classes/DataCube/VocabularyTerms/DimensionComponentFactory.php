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
class DataCube_VocabularyTerms_DimensionComponentFactory
{    
	/**
	 * @param $dimensionComponents 
	 */	
	public static function extract ($selectedDimensions, $selectedDimensionComponents) {
		$return = array ();
        
        $selectedDimensions = DataCube_VocabularyTerms_DimensionFactory::extract ( $selectedDimensions );
        
        foreach ( $selectedDimensionComponents as $dimension => $entries ) {
            foreach ( $entries as $entry ) {
                $return [$dimension] = $selectedDimensions [$dimension];
                $return [$dimension] ['elements'][] = $entry;
            }
        }
        return $return;
	}
}
