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

    public function init() {
        $this->session = $this->_owApp->session;
        
		$loader = Zend_Loader_Autoloader::getInstance();
		$loader->registerNamespace('CubeViz_');
		$loader->registerNamespace('DataCube_');
		$path = __DIR__;
		set_include_path(get_include_path() . PATH_SEPARATOR . $path . DIRECTORY_SEPARATOR .'classes' . DIRECTORY_SEPARATOR . PATH_SEPARATOR);
	}

    public function getTitle() {
        return 'Data Selection';
    }
    
    public function shouldShow(){
        
        /**
         * Check if the current selected knowledgebase contains datacube information
         */
		if (true == isset($this->_owApp->selectedModel)) {
            $q = new DataCube_Query ( $this->_owApp->selectedModel );
            return $q->containsDataCubeInformation();
        } 
        
        return false;
    }

    /**
     * Returns the content
     */
    public function getContents() {

		// set URL for cubeviz extension folder
        $this->view->cubevizPath = $this->_config->staticUrlBase . 'cubeviz/';
        $this->view->cubevizImagesPath = $this->_config->staticUrlBase . 'extensions/cubeviz/public/images/';
        
        // send backend information to the view
        $this->view->backend = $this->_owApp->getConfig()->store->backend;
				
		// model
		$this->view->modelUrl = $this->_owApp->selectedModel;
		$graphUrl = $this->_owApp->selectedModel->getModelIri();
		
		// linkCode (each linkcode represents a particular configuration of CubeViz)
		$this->view->linkCode = NULL == $this->_request->getParam ('lC') ? '' : $this->_request->getParam ('lC');
        
        // load configuration which is associated with given linkCode
		$configuration = new CubeViz_ConfigurationLink($this->_owApp->erfurt->getCacheDir());
        $configuration = $configuration->read ($this->view->linkCode);
        if (true == isset ($configuration [0])) {
            $this->view->linkConfiguration = $configuration [0]; // contains stuff e.g. selectedDSD, ...
            $this->view->cubeVizUIChartConfig = $configuration [1]; // contains UI chart config information
        } else {
            $this->view->linkConfiguration = '{
                "backend": "'. $this->view->backend .'",
                "components": {},
                "selectedDSD": {},
                "selectedDS": {},
                "selectedComponents": {"dimensions": {}, "measures": {}}
            }';
            $this->view->cubeVizUIChartConfig = 'null';
        }
    
        $content = $this->render('public/templates/cubeviz/CubeVizModule');
        return $content;
    }

    public function layoutType(){
        return 'inline';
    }
    
}


