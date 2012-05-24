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
 
 /**
 * Static class AuxilaryFunctions. Contain transformation and adapter functions. 
 */
require_once 'model/AuxilaryFunctions.php';

class CubevizModule extends OntoWiki_Module
{
    protected $session = null;

    public function init() {
        $this->session = $this->_owApp->session;
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
		define("DS",DIRECTORY_SEPARATOR);
        
        //basePath for the component
        $this->view->basePath = $this->_config->staticUrlBase . "extensions" . DS . "cubeviz" . DS;
        $this->view->cubevizPath = $this->_config->staticUrlBase . "cubeviz" . DS;
        $this->view->backend = $this->_owApp->getConfig()->store->backend;
        $this->view->isModelSelected = true;
        
        $chartType = true == isset ( $_REQUEST ['chartType'] ) ? $_REQUEST ['chartType'] : 'bar';
		switch($chartType) {
			case 'bar':
				break;
			case 'pie':
				break;
			case 'line':
				break;
			case 'area':
				break;
			case 'splines':
				break;
			case 'scatterplot':
				break;
			case 'table':
				break;
			default:
				$chartType = 'bar';
				break;
		}
        
		// suggesting that the getcwd() pointing to the ontowiki root folder			
		$hashCode = true == isset ( $_REQUEST ['hC'] ) ? $_REQUEST ['hC'] : 'default';
		
		$configuration = AuxilaryFunctions::readConfiguration($hashCode);
						
		$this->view->sparqlEndpoint = json_decode($configuration['sparqlEndpoint']);
		$this->view->selectedGraph = json_decode($configuration['selectedGraph']);
		$this->view->selectedDSD = json_decode($configuration['selectedDSD']);
		$this->view->selectedDS = json_decode($configuration['selectedDS']);
		$this->view->selectedMeasures = $configuration['selectedMeasures'];
		$this->view->selectedDimensions = $configuration['selectedDimensions'];
		$this->view->selectedDimensionComponents = $configuration['selectedDimensionComponents'];
		$this->view->chartType = $chartType;
		$this->view->modelUri = $_REQUEST['m'];
        
		$content = $this->render('cubeviz');
        return $content;
    }

    public function layoutType(){
        return "inline";
    }

}


