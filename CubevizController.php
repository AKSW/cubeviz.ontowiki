<?php

/**
 * 
 */
class CubevizController extends OntoWiki_Controller_Component {
    
    public function init () {
        parent::init();
        $loader = Zend_Loader_Autoloader::getInstance();
		$loader->registerNamespace('CubeViz_');
		$loader->registerNamespace('DataCube_');
		$path = __DIR__;
		set_include_path(get_include_path() . PATH_SEPARATOR . $path . DIRECTORY_SEPARATOR .'classes' . DIRECTORY_SEPARATOR . PATH_SEPARATOR);
		
    }
    
    /**
     * 
     */
    public function indexAction () {
        
		//http://localhost/extensions/cubeviz/
		$cubeVizExtensionURL_controller = $this->_config->staticUrlBase . "cubeviz/";
        $this->view->cubevizPath_index = $cubeVizExtensionURL_controller;
        $this->view->basePath_index = $this->_config->staticUrlBase . "extensions/cubeviz/";
        $this->view->basePath_images = $this->view->basePath_index ."static/images/";
        
	// TODO delete this because its a hack
	$this->view->chartType = $this->_request->getParam ("chartType");
        
	// send backend information to the view
        $ontowikiBackend = $this->_owApp->getConfig()->store->backend;
        $this->view->backend_index = $ontowikiBackend;
		// get chartType from the browser link
        $chartType = true == isset ( $_REQUEST ['chartType'] ) ? $_REQUEST ['chartType'] : 'pie';
		
		// get lC from the browser link - pointing to the file
		$linkCode = true == isset ( $_REQUEST ['lC'] ) ? $_REQUEST ['lC'] : 'default';
		
		// initialize links handle and read configuration
		$configuration = new CubeViz_ConfigurationLink();
		$configuration->initFromLink($linkCode);
													
		$this->view->links_index = json_encode($configuration->getLinks());
		$this->view->modelUrl_index = $this->_owApp->selectedModel;
		// TODO: get backend from OntoWiki config
		$this->view->backend_index = "virtuoso";
	}
	
	public function getresultobservationsAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();        
		
		$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		$linkCode = $this->_request->getParam('lC');
		
		$configuration = new CubeViz_ConfigurationLink();
		$configuration->initFromLink($linkCode);
		$links = $configuration->getLinks();
				
		$query = new DataCube_Query($model);
		
		//$resultObservations = $query->getResultObservations($links['default']);
						
		$this->_response->setBody();
	}
    
    /**
     * 
     */
    public function getdatastructuredefinitionsAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
		$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		
		$query = new DataCube_Query($model);
				
        $this->_response->setBody(json_encode($query->getDataStructureDefinition()));
	}
	
	/**
	 * 
	 */
	public function getdatasetsAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
		$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		$dsdUrl = $this->_request->getParam('dsdUrl'); // Data Structure Definition
				
		$query = new DataCube_Query($model);
				
        $this->_response->setBody(json_encode($query->getDataSets($dsdUrl)));
	}
	
	/**
	 * 
	 */
	public function getcomponentsAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
		$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		$dsdUrl = $this->_request->getParam('dsdUrl'); // Data Structure Definition
		$dsUrl = $this->_request->getParam('dsUrl'); // Data Set
		$componentType = $this->_request->getParam('cT'); // can be  DataCube_UriOf::Dimension or DataCube_UriOf::Measure
		
		if($componentType == "measure") {
			$componentType = DataCube_UriOf::Measure;
		} else if($componentType == "dimension") {
			$componentType = DataCube_UriOf::Dimension;
		}
		
		$query = new DataCube_Query($model);
				
		try {
			$this->_response->setBody(json_encode($query->getComponents($dsdUrl, $dsUrl, $componentType)));
		} catch(CubeViz_Exception $e) {
			$this->_response->setBody($e->getMessage());
			//error message
		}        
	}
	
	/**
	 * 
	 */
	public function getalldimensionselementsAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
		$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		$dsUrl = $this->_request->getParam('dsUrl'); // Data Structure Definition
		$dimensions = json_decode($this->_request->getParam('dimensions'), true); // Data Structure Definition
		
		$query = new DataCube_Query($model);
		$result = array();
		
		$dimensions_length = sizeof($dimensions["dimensions"]);
		for($i = 0; $i < $dimensions_length; $i++) {
			$dim_cur = $dimensions["dimensions"][$i];
			$result[$dim_cur["label"]] = $query->getComponentElements($dsUrl, $dim_cur["type"]);
		}		
		       
        $this->_response->setBody(json_encode($result));
	}
	
	/**
	 * 
	 */
	public function savelinktofileAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
		//$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		//$dsUrl = $this->_request->getParam('dsUrl'); // Data Structure Definition
		//$dimensions = json_decode($this->_request->getParam('dimensions'), true); // Data Structure Definition
		$config['sparqlEndpoint'] = $this->_request->getParam('sparqlEndpoint');
		$config['selectedGraph'] = $this->_request->getParam('modelUrl');
		$config['selectedDSD'] = $this->_request->getParam('selectedDSD');
		$config['selectedDS'] = $this->_request->getParam('selectedDS');
		$config['selectedMeasures'] = $this->_request->getParam('selectedMeasures');
		$config['selectedDimensions'] = $this->_request->getParam('selectedDimensions');
		$config['selectedDimensionComponents'] = $this->_request->getParam('selectedDimensionComponents');
		$config['selectedChartType'] = $this->_request->getParam('selectedChartType');

		$configuration = new CubeViz_ConfigurationLink();
		$result = $configuration->writeToFile($config);
		
		/*
		$query = new DataCube_Query($model);
		$result = array();
		
		$dimensions_length = sizeof($dimensions["dimensions"]);
		for($i = 0; $i < $dimensions_length; $i++) {
			$dim_cur = $dimensions["dimensions"][$i];
			$result[$dim_cur["label"]] = $query->getComponentElements($dsUrl, $dim_cur["type"]);
		}		*/      
        $this->_response->setBody(json_encode($result));
	}
}
