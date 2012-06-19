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
		if (isset($this->_owApp->selectedModel) && ($this->_owApp->selectedModel->getBaseIri() == $scoreboard)) {
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
		// use $this->view->moduleUrl for the basePath (OntoWiki var);

		// set URL for cubeviz extension folder
		$cubeVizExtensionURL_controller = $this->_config->staticUrlBase . "cubeviz/";
        $this->view->cubevizPath = $cubeVizExtensionURL_controller;
        // send backend information to the view
        $ontowikiBackend = $this->_owApp->getConfig()->store->backend;
        $this->view->backend = $ontowikiBackend;
		// get chartType from the browser link
        $chartType = true == isset ( $_REQUEST ['chartType'] ) ? $_REQUEST ['chartType'] : 'pie';
		
		// get lC from the browser link - pointing to the file
		$linkCode = true == isset ( $_REQUEST ['lC'] ) ? $_REQUEST ['lC'] : 'default';
		
		// initialize links handle and read configuration
		$configuration = new CubeViz_ConfigurationLink();
		$configuration->initFromLink($linkCode);
													
		$this->view->links = json_encode($configuration->getLinks());
		$this->view->modelUrl =  $this->_owApp->selectedModel; // $_REQUEST['m'];
		// TODO: get backend from OntoWiki config
		$this->view->backend = "virtuoso";
				
        $content = $this->render('static/pages/CubeVizModule');
        return $content;
    }

    public function layoutType(){
        return "inline";
    }
    
}


