<?php
/**
 * This class represents an LinkHandle object
 * Used for handling files in the links/ directory
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviv
 * @author Konrad Abicht
 */ 
class CubeViz_ViewHelper
{
    public static $isCubeVizAppLoaded = false;
    public static $isCubeVizDataselectionModuleLoaded = false;
    public static $isCubeVizIndexLoaded = false;
    
    /**
     * Get information about the selected model
     * @param $modelStore Store of selected model
     * @param $model Model itself
     * @param $modelIri Iri of the selected model
     * @return Array Array with fields containing information about the model
     */
    public static function getModelInformation ($modelStore, $model, $modelIri) 
    {
        $modelResource = new OntoWiki_Model_Resource($modelStore, $model, $modelIri);
        $modelResource = $modelResource->getValues();
        $titleHelper = new OntoWiki_Model_TitleHelper($model);

        $modelInformation = array();
        
        // if model resource contains further information about the model
        if (true === isset($modelResource [$modelIri])){
            
            // just add all used predicates to title helper, to get
            // the titles later on
            foreach ($modelResource [$modelIri] as $predicateUri => $object) {
                $titleHelper->addResource($predicateUri);
            }
            
            // now build model information array
            foreach ($modelResource [$modelIri] as $predicateUri => $object) {

                // set predicate label
                $modelInformation[$predicateUri] = array (
                    'predicateLabel' => $titleHelper->getTitle($predicateUri)
                );
                
                // choose type of content (uri or literal)
                if (true === isset($object[0]['content'])) {
                    $modelInformation[$predicateUri]['content'] = $object[0]['content'];
                } else {
                    $modelInformation[$predicateUri]['content'] = $object[0]['uri'];
                }
            }
        }
        
        return $modelInformation;
    }
    
    /**
     * 
     */
    public static function initApp(&$view, &$model, $backend, $context, $modelIri,
        $serviceUrl, $staticUrlBase, $baseImagesPath, $dataHash, $uiHash, 
        $titleHelperLimit, $dimensionElementLimit) 
    {        
        // if cubeVizApp was not loaded yet
        if(false === CubeViz_ViewHelper::$isCubeVizAppLoaded) {  
            
            // get information about the selected model
            $modelStore = $model->getStore();
            $modelInformation = CubeViz_ViewHelper::getModelInformation($modelStore, $model, $modelIri);             
            
            /**
             * Set view and some of its properties.
             */
            $view->cubevizImagesPath = $baseImagesPath;
            
            /**
             * Get hashes from parameter list
             */
            // hash for data
            if(null == $dataHash) {
                $dataHash = null;
            }
            
            // hash for ui
            if(null == $uiHash) {
                $uiHash = null;
            }
                
            $view->isCubeVizDataselectionModuleLoaded = false === isset($view->isCubeVizDataselectionModuleLoaded)
                ? false : $view->isCubeVizDataselectionModuleLoaded;
            
            /**
             * Read information from files according to given hashes
             */
            $c = new CubeViz_ConfigurationLink($model, $titleHelperLimit, $dimensionElementLimit);
            $config = array();
            $generatedDataHash = '';
            $generatedUiHash = '';
            
            list($config['data'], $generatedDataHash) = $c->read ($dataHash, 'data');
            
            list($config['ui'], $generatedUiHash) = $c->read ($uiHash, 'ui');

            $config['backend'] = array(
                'context'               => $context, 
                'database'              => $backend,
                'dataHash'              => $generatedDataHash,
                'imagesPath'            => $baseImagesPath,
                'modelInformation'      => $modelInformation,
                'modelUrl'              => $modelIri,
                'serviceUrl'            => $serviceUrl,
                'uiHash'                => $generatedUiHash,
                'uiParts'               => array(
                    'dataselectionModule' => array('isLoaded' => CubeViz_ViewHelper::$isCubeVizDataselectionModuleLoaded),
                    'index'               => array('isLoaded' => CubeViz_ViewHelper::$isCubeVizIndexLoaded)
                ),
                'uiSettings'            => array (),
                'url'                   => $staticUrlBase . 'cubeviz/'
            );
                
            CubeViz_ViewHelper::$isCubeVizAppLoaded = true;
            
            return $config;
        }
        
        return null;
    }
}
