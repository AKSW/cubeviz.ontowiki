<?php

/**
 * OntoWiki module – Navigation
 *
 * this is the main navigation module
 *
 * @category   OntoWiki
 * @package    extensions_modules_navigation
 * @author     Sebastian Dietzold <sebastian@dietzold.de>
 * @copyright  Copyright (c) 2009, {@link http://aksw.org AKSW}
 * @license    http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 */
class CubevizModule extends OntoWiki_Module
{
    protected $session = null;

    public function init() 
    {
        $this->session = $this->_owApp->session;
        
		$loader = Zend_Loader_Autoloader::getInstance();
		$loader->registerNamespace('CubeViz_');
		$loader->registerNamespace('DataCube_');
		$path = __DIR__;
		set_include_path(get_include_path() . PATH_SEPARATOR . $path . DIRECTORY_SEPARATOR .'classes' . DIRECTORY_SEPARATOR . PATH_SEPARATOR);
	}

    public function getTitle() 
    {
        return 'Data Selection';
    }
    
    /**
     * Check if the current selected knowledgebase contains datacube information
     * @return bool True if selected model contains Data Cube information, false otherwise.
     */
    public function shouldShow()
    {
		if (true == isset($this->_owApp->selectedModel)) {
            $q = new DataCube_Query ( $this->_owApp->selectedModel );
            return $q->containsDataCubeInformation();
        } 
        return false;
    }

    /**
     * Returns the content
     */
    public function getContents() 
    {        
        /**
         * Set paths
         */
        $basePath = $this->view->basePath = $this->_config->staticUrlBase . 'extensions/cubeviz/';
        $baseCssPath = $basePath .'public/css/';
        $baseImagesPath = $basePath .'public/images/';
        $baseJavascriptPath = $basePath .'public/javascript/';
        
        
        /**
         * Including javascript files for this action
         */
        $this->view->headScript()
            ->prependFile ($baseJavascriptPath.'libraries/json2.js', 'text/javascript')
            ->prependFile ($baseJavascriptPath.'libraries/json-template.min.js', 'text/javascript')
            ->prependFile ($baseJavascriptPath.'libraries/underscore.js', 'text/javascript')
            ->prependFile ($baseJavascriptPath.'frontend/Cubeviz_Module.js', 'text/javascript');
            
        
        /**
         * Including css files for this action
         */
        $this->view->headLink()->prependStylesheet($baseCssPath.'main.css');
        $this->view->headLink()->prependStylesheet($baseCssPath.'CubeVizModule/component.css');
        $this->view->headLink()->prependStylesheet($baseCssPath.'CubeVizModule/dataSet.css');
        $this->view->headLink()->prependStylesheet($baseCssPath.'CubeVizModule/dataStructureDefinition.css');
        $this->view->headLink()->prependStylesheet($baseCssPath.'CubeVizModule/footer.css');
        
        /**
         * Model information
         */
        $model = $this->_owApp->selectedModel;
        $modelIri = $model->getModelIri();
        $modelStore = $model->getStore();
        
		// linkCode (each linkcode represents a particular configuration of CubeViz)
		$linkCode = NULL == $this->_request->getParam ('lC') ? '' : $this->_request->getParam ('lC');
                
        /**
         * Set view and some of its properties.
         */
        $this->view->cubevizImagesPath = $baseImagesPath;
                				
        /**
         * Set backend container with backend related information
         */
        $backend = array();
        $backend['context']         = 'development'; // TODO get it from doap.n3
        $backend['database']        = $this->_owApp->getConfig()->store->backend;
        $backend['id']              = 'backend';
        $backend['imagesPath']      = $baseImagesPath;
        $backend['modelUrl']        = $modelIri;
        $backend['url']             = $this->_config->staticUrlBase . 'cubeviz/';
        $backend['sparqlEndpoint']  = 'local'; 
        
        $this->view->cubeVizBackend = json_encode($backend, JSON_FORCE_OBJECT);
        
        /**
         * Set data container with CubeViz related information
         */
        $data = new CubeViz_ConfigurationLink($this->_owApp->erfurt->getCacheDir());
        $data = $data->read ($linkCode); // TODO move to configuration file

        $data['id']         = 'data';
        $data['linkCode']   = $linkCode;
        
        $this->view->cubeVizData = json_encode($data, JSON_FORCE_OBJECT);
    
        /**
         * Contains UI chart config information
         * TODO Replace that
        $this->view->CubeViz_UI_ChartConfig = json_encode(
            $c['CubeViz_UI_ChartConfig'],
            JSON_FORCE_OBJECT
        );*/
    
        /**
         * fill template with content and give generated HTML back
         */
        return $this->render('public/templates/cubeviz/CubeVizModule');
    }

    public function layoutType() { return 'inline'; }
}


