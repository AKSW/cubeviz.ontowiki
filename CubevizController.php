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
        
        // fill title-field
        $this->view->placeholder('main.window.title')->set('Visualization for '. $this->_owApp->selectedModel );
        
        // disable OntoWiki's Navigation
        $on = new OntoWiki_Navigation();
        $on->disableNavigation ();
        
		// set URL for cubeviz extension folder
        $this->view->cubevizPath = $this->_config->staticUrlBase . 'cubeviz/';
        		
        // set base url paths to extension root and images folder
		$this->view->basePath = $this->_config->staticUrlBase . "extensions/cubeviz/";
		$this->view->basePath_images = $this->_config->staticUrlBase . "extensions/cubeviz/static/images/";
		
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
	}
	
	public function getdatafromlinkcodeAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();     
		
        // load configuration which is associated with given linkCode
		$configuration = new CubeViz_ConfigurationLink(__DIR__);
        $configuration = $configuration->read ($this->_request->getParam('lC'));
				
        // send back readed configuration
        // $configuration [0] contains stuff e.g. selectedDSD, ...
        //                [1] contains UI chart config information
		$this->_response->setBody(json_encode($configuration));	
	}
	
	public function getresultobservationsAction() {
		
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();   
             
		// linkCode (default value: "default" )
		$linkCode = $this->_request->getParam ('lC');
		if(NULL == $linkCode) { $linkCode = 'default'; }
        
        // load configuration which is associated with given linkCode
		$configuration = new CubeViz_ConfigurationLink(__DIR__);
        		
		$configuration = $configuration->read ($linkCode);
        $linkConfiguration = json_decode ($configuration [0], true) ; // contains stuff e.g. selectedDSD, ...
		// var_dump ( $linkConfiguration );
        				
        // init Query and model
        $model = new Erfurt_Rdf_Model ( $linkConfiguration ['selectedGraph'] );
		$query = new DataCube_Query ($model);
                
        // ... get and return observations
		$this->_response->setBody($query->getObservations($linkConfiguration));
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

        $this->_response
            ->setHeader('Cache-Control', 'no-cache, must-revalidate')
            ->setHeader('Content-Type', 'application/json')
            ->setHeader('Expires', 'Sat, 26 Jul 1997 05:00:00 GMT')
            ->setBody(json_encode($query->getDataSets($dsdUrl)));
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
		$componentType = $this->_request->getParam('cT'); // can be DataCube_UriOf::Dimension or DataCube_UriOf::Measure
				
		if($componentType == "measure") {
			$componentType = DataCube_UriOf::Measure;
		} else if($componentType == "dimension") {
			$componentType = DataCube_UriOf::Dimension;
		} else {
            // stop execution, because it is not a $componentType that i understand
            $this->_response->setBody("Unknown cT parameter! Given was: " . $componentType);
            return;
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
	 *
	public function getalldimensionselementsAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
		$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		$dsUrl = $this->_request->getParam('dsUrl'); // Data Structure Definition
        
		$dimensions = $this->_request->getParam('dimensions'); // Data Structure Definition
		
		$query = new DataCube_Query($model);
		$result = array();
		
		$dimensions_length = sizeof($dimensions);
		for($i = 0; $i < $dimensions_length; ++$i) {
			$result[$dimensions[$i]["label"]] = $query->getComponentElements($dsUrl, $dimensions[$i]["type"]);
		}		
		       
        $this->_response->setBody(json_encode($result));
	}*/
	
	/**
	 * 
	 */
	public function savelinktofileAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
        // Save parameter
		$config['cubeVizLinksModule'] = $this->_request->getParam('cubeVizLinksModule');
		$config['uiChartConfig'] = $this->_request->getParam('uiChartConfig');
		
		$configuration = new CubeViz_ConfigurationLink(__DIR__);
        
        // write given parameter to file and send back result
		$this->_response->setBody(json_encode($configuration->write($config)));
	}
}
