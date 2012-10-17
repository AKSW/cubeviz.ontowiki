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
class DataCube_VocabularyTerms_MeasureFactory
{    	
    /**
     * @param $selectedMeasures 
     * @todo change selectedMeasures -> measures 
     */
	public static function extract ($selectedMeasures) {
		
        $return = array ();
        $selectedMeasures = $selectedMeasures["measures"];
        
        // get all dimension labels
        $labels = array ();
        foreach ( $selectedMeasures as $measure ) {
            $labels [] = $measure ['label'];
        }
        
        // set array entry to certain dimension
        foreach ( $labels as $measureLabel ) {
            foreach ( $selectedMeasures as $measure ) {
                if ( $measure ['label'] == $measureLabel ) {
                    $return [ $measureLabel ] = new DataCube_VocabularyTerms_Measure(
                        $measure['url'], $measure['label'], $measure['type']
                    );
                }
            }
        }
        
        return $return;
	}
}
