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
        
		// set URL for cubeviz extension folder
		$cubeVizExtensionURL_controller = $this->_config->staticUrlBase . "cubeviz/";
        $this->view->cubevizPath = $cubeVizExtensionURL_controller;
        // send backend information to the view
        $ontowikiBackend = $this->_owApp->getConfig()->store->backend;
        $this->view->backend = $ontowikiBackend;
		
		$this->view->basePath = $this->_config->staticUrlBase . "extensions/cubeviz/";
		$this->view->basePath_images = $this->_config->staticUrlBase . "extensions/cubeviz/static/images/";
		
		//endpoint is local now!
		$sparqlEndpoint = "local";
		
		//model
		$this->view->modelUrl =  $this->_owApp->selectedModel;
		$graphUrl = $this->_owApp->selectedModel->getModelIri();
		
		//linkCode
		$linkCode = $this->_request->getParam ("lC");
		if(NULL == $linkCode) {
			$linkCode = "default";
		}
		$this->view->linkCode = $linkCode;
		$configuration = new CubeViz_ConfigurationLink($sparqlEndpoint, $graphUrl);
		$configuration->initFromLink($linkCode);		
		$this->view->links = json_encode($configuration->getLinks());
											
		// TODO: get backend from OntoWiki config
		$this->view->backend = "virtuoso";
	}
	
	public function getresultobservationsAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();        
		
		$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		$graphUrl = $this->_request->getParam ('m');
		$linkCode = $this->_request->getParam('lC');
		$sparqlEndpoint = $this->_request->getParam('sparqlEndpoint');
				
		$configuration = new CubeViz_ConfigurationLink($sparqlEndpoint, $graphUrl);
		$configuration->initFromLink($linkCode);
		$links = $configuration->getLinks();
						
		$query = new DataCube_Query($model);
		
		$dimensions = $links[$linkCode]['selectedDimensions'];
		$dimensionComponents = $links[$linkCode]['selectedDimensionComponents'];
		$graphUrl = $links[$linkCode]['selectedGraph'];		
				
		$resultObservations = $query->getObservations($graphUrl, $dimensionComponents);
						
		$this->_response->setBody($resultObservations);
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
		
		$sparqlEndpoint = json_decode($config['sparqlEndpoint']);
		$model = json_decode($config['selectedGraph']);
		
		$configuration = new CubeViz_ConfigurationLink($sparqlEndpoint, $model);
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
