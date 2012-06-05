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

define("DS", DIRECTORY_SEPARATOR);
define("CUBEVIZ_ROOT", __DIR__);

/**
 * Class DataCube_Chart.
 * (function) getAvailableChartTypes - scans through config/charttypes 
 * folder and return available chart types
 */
require_once CUBEVIZ_ROOT . DS . 'classes' . DS . 'DataCube' . DS . 'Chart.php';

/**
 * Class CubeViz_Exception. Custom CubeViz exceptions class.
 */
require_once CUBEVIZ_ROOT . DS . 'classes' . DS . 'CubeViz' . DS . 'Exception.php';

/**
 * Class CubeViz_ConfigurationLink. Manipulate files in config/links directory
 */
require_once CUBEVIZ_ROOT . DS . 'classes'. DS .'CubeViz'. DS .'ConfigurationLink.php';

class CubevizModule extends OntoWiki_Module
{
    protected $session = null;

    public function init() {
        $this->session = $this->_owApp->session;
        
        $path = __DIR__;
		set_include_path(get_include_path() . PATH_SEPARATOR . $path);
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
		
		if($this->isChartTypeSupported($chartType)) {
			// everything okay
		} else {
			throw new CubeViz_Exception ('Chart type is not supported!');
		}
		
		// get lC from the browser link - pointing to the file
		$linkCode = true == isset ( $_REQUEST ['lC'] ) ? $_REQUEST ['lC'] : 'default';
		
		// initialize links handle and read configuration
		$configuration = new CubeViz_ConfigurationLink();
		$configuration->initFromLink($linkCode);
										
		$this->view->configuration = json_encode($configuration);
		$this->view->modelUri = $_REQUEST['m'];
		// TODO: get backend from OntoWiki config
		$this->view->backend = "virtuoso";
		
        $content = $this->render('static/pages/CubeVizModule');
        return $content;
    }

    public function layoutType(){
        return "inline";
    }
    
    /**
     * Check if $chartType is supported by application
     * Supported chartTypes are located at config/charttypes/
     * example of chartType file filename: pie.json
     */
    private function isChartTypeSupported($chartType) {
		//get available chart types
		$DataCubeChart = new DataCube_Chart();
		$availableChartTypes = $DataCubeChart->getAvailableChartTypes();
		
		//look for chartType in availableChartTypes array()
		$availableChartTypes_length = sizeof($availableChartTypes);
		while($availableChartTypes_length--) {
			if($chartType == $availableChartTypes[$availableChartTypes_length]) {
				return true;
			}			
		}
		return false;
	}

}


