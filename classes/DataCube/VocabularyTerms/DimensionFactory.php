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
class DataCube_VocabularyTerms_DimensionFactory
{    	
	public static function extract ($selectedDimensions) {
                
        $return = array ();
        $selectedDimensions = $selectedDimensions ['dimensions'];
                
        // get all dimension labels
        $labels = array ();
        foreach ( $selectedDimensions as $dimension ) {
            $labels [] = $dimension ['label'];
        }
        
        // set array entry to certain dimension
        foreach ( $labels as $dimensionLabel ) {
            foreach ( $selectedDimensions as $dimension ) {
                if ( $dimension ['label'] == $dimensionLabel ) {
                    $return [ $dimensionLabel ] = new DataCube_VocabularyTerms_Dimension(
                        $dimension['url'], $dimension['label'], 
                        $dimension['type'], $dimension['elementCount'], 
                        $dimension['selectedElementCount']
                    );
                }
            }
        }
        
        return $return;
	}
}
