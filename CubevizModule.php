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
        $this->view->headScript()->prependFile($baseJavascriptPath.'libraries/json2.js', 'text/javascript');
        $this->view->headScript()->prependFile($baseJavascriptPath.'libraries/json-template.min.js', 'text/javascript');
        $this->view->headScript()->prependFile($baseJavascriptPath.'frontend/Cubeviz_Module.js', 'text/javascript');
        
        
        /**
         * Including css files for this action
         */
        $this->view->headLink()->prependStylesheet($baseCssPath.'/main.css');
        
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
         * Set CubeViz_Links_Module
         * Contains loaded configuration for given hashcode or default values.
         */
        $c = new CubeViz_ConfigurationLink($this->_owApp->erfurt->getCacheDir());
        $c = $c->read ($linkCode);

        $c['CubeViz_Links_Module'] ['backend']           = $this->_owApp->getConfig()->store->backend;
        $c['CubeViz_Links_Module'] ['linkCode']          = $linkCode;
        $c['CubeViz_Links_Module'] ['cubevizPath']       = $this->_config->staticUrlBase . 'cubeviz/';
        $c['CubeViz_Links_Module'] ['modelUrl']          = $modelIri;
        $c['CubeViz_Links_Module'] ['sparqlEndpoint']    = 'local'; 
        $this->view->CubeViz_Links_Module = json_encode($c['CubeViz_Links_Module'], JSON_FORCE_OBJECT);
    
        /**
         * Contains UI chart config information
         */
        $this->view->CubeViz_UI_ChartConfig = json_encode(
            $c['CubeViz_UI_ChartConfig'],
            JSON_FORCE_OBJECT
        );
    
        /**
         * 
         */
        $this->view->CubeViz_Config = json_encode(
            array(
                'context'       => 'development', // TODO get it from doap.n3
                'imagesPath'    => $baseImagesPath
            ), 
            JSON_FORCE_OBJECT
        );
    
        /**
         * fill template with content and give generated HTML back
         */
        return $this->render('public/templates/cubeviz/CubeVizModule');
    }

    public function layoutType() { return 'inline'; }
}


