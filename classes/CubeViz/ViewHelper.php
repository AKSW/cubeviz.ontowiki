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
    public static $isCubeVizModuleLoaded = false;
    public static $isCubeVizIndexLoaded = false;
    
    /**
     * Get information about the selected model
     * @param $modelStore Store of selected model
     * @param $model Model itself
     * @param $modelIri Iri of the selected model
     * @return Array Array with fields about dc:creator, dc:description, 
     *               rdfs:label, doap:license, doap:revision, doap:shortdesc
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
    public static function initApp(&$view, &$model, $backend, $cacheDir, 
        $context, $modelIri, $staticUrlBase, $baseImagesPath, $dataHash, $uiHash) 
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
                $dataHash = CubeViz_ConfigurationLink::$filePrefForDataHash;
            }
            
            // hash for ui
            if(null == $uiHash) {
                $uiHash = CubeViz_ConfigurationLink::$filePrefForUiHash;
            }
                
            $view->isCubeVizModuleLoaded = false === isset($view->isCubeVizModuleLoaded)
                ? false : $view->isCubeVizModuleLoaded;
            
            /**
             * Read information from files according to given hashes
             */
            $c = new CubeViz_ConfigurationLink($cacheDir);
            $config = array();
            
            $config['data'] = $c->read ($dataHash, $model);
            $newDataHash = CubeViz_ConfigurationLink::$filePrefForDataHash
                . md5(json_encode($config['data']));
            
            $config['ui'] = $c->read ($uiHash, $model);
            $newUiHash = CubeViz_ConfigurationLink::$filePrefForUiHash
                . md5(json_encode($config['ui']));

            $config['backend'] = array(
                'context'               => $context, 
                'database'              => $backend,
                'dataHash'              => $newDataHash,
                'imagesPath'            => $baseImagesPath,
                'modelInformation'      => $modelInformation,
                'modelUrl'              => $modelIri,
                'uiHash'                => $newUiHash,
                'uiParts'               => array(
                    'module'            => array('isLoaded'=> CubeViz_ViewHelper::$isCubeVizModuleLoaded),
                    'index'             => array('isLoaded'=> CubeViz_ViewHelper::$isCubeVizIndexLoaded)
                ),
                'retrievedObservations' => array(),
                'sparqlEndpoint'        => 'local',
                'url'                   => $staticUrlBase . 'cubeviz/'
            );
            
            // load observations related to given data
            $query = new DataCube_Query($model);
            
            $config['backend']['retrievedObservations'] = $query->getObservations(array(
                'selectedComponents' => $config['data']['selectedComponents'],
                'selectedDS' => array('url' => $config['data']['selectedDS']['url'])
            ));
                
            CubeViz_ViewHelper::$isCubeVizAppLoaded = true;
            
            return $config;
        }
        
        return null;
    }
}
