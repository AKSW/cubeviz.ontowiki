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
         * Model information
         */
        $model = $this->_owApp->selectedModel;
        $modelIri = $model->getModelIri();
        $modelStore = $model->getStore();
        
		// linkCode (each linkcode represents a particular configuration of CubeViz)
		$linkCode = NULL == $this->_request->getParam ('lC') ? '' : $this->_request->getParam ('lC');
        
        
        /**
         * Load configuration which is associated with given linkCode
         */
		$configuration = new CubeViz_ConfigurationLink($this->_owApp->erfurt->getCacheDir());
        $configuration = $configuration->read ($linkCode);
        
        
        /**
         * Set view and some of its properties.
         */
		// set URL for cubeviz extension folder
        $this->view->cubevizUrl = $this->_config->staticUrlBase . 'cubeviz/';
        $this->view->cubevizImagesPath = $this->_config->staticUrlBase . 'extensions/cubeviz/public/images/';
        
        // send backend information to the view
        $this->view->backendName = $this->_owApp->getConfig()->store->backend;
				
		// model
		$this->view->modelUrl = $model;
		$graphUrl = $modelIri;
		        
        $this->view->linkCode = $linkCode;
        
        if (true == isset ($configuration [0])) {
            $this->view->linkConfiguration = $configuration [0]; // contains stuff e.g. selectedDSD, ...
            $this->view->cubeVizUIChartConfig = $configuration [1]; // contains UI chart config information
        } else {
            $this->view->linkConfiguration = '{
                "backend": "'. $this->view->backendName .'",
                "components": {},
                "selectedDSD": {},
                "selectedDS": {},
                "selectedComponents": {"dimensions": {}, "measures": {}}
            }';
            $this->view->cubeVizUIChartConfig = 'null';
        }
    
        return $this->render('public/templates/cubeviz/Module/index');
    }

    public function layoutType() { return 'inline'; }
}


