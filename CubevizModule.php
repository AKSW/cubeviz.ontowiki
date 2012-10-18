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
        return "Data Selection";
    }
    
    public function shouldShow(){
		//show only for http://data.lod2.eu/scoreboard/
		$scoreboard = "http://data.lod2.eu/scoreboard/";
		if (isset($this->_owApp->selectedModel)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns the content
     */
    public function getContents() {

		// set URL for cubeviz extension folder
        $this->view->cubevizPath = $this->_config->staticUrlBase . 'cubeviz/';
        
        // send backend information to the view
        $this->view->backend = $this->_owApp->getConfig()->store->backend;
				
		// model
		$this->view->modelUrl = $this->_owApp->selectedModel;
		$graphUrl = $this->_owApp->selectedModel->getModelIri();
		
		// linkCode (default value: "default" )
		$this->view->linkCode = $this->_request->getParam ("lC");
		if(NULL == $this->view->linkCode) { $this->view->linkCode = "default"; }
        
        // load configuration which is associated with given linkCode
		$configuration = new CubeViz_ConfigurationLink(__DIR__);
        
        // check folder permissions
        // throws an exception if not enough folder permissions
        $configuration->checkFolderPermissions ();
        
        $configuration = $configuration->read ($this->view->linkCode);
		$this->view->linkConfiguration = $configuration [0]; // contains stuff e.g. selectedDSD, ...
		$this->view->cubeVizUIChartConfig = $configuration [1]; // contains UI chart config information
                                        
        $content = $this->render('static/pages/CubeVizModule');
        return $content;
    }

    public function layoutType(){
        return "inline";
    }
    
}


