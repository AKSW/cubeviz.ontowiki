<?php

/**
 * 
 */
class CubevizController extends OntoWiki_Controller_Component {

    protected $_configuration = null;
    
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
        
        // In case no model was selected, it redirect to the root url of OntoWiki
        if ( null == $this->_owApp->selectedModel ) {
            $this->_helper->redirector->gotoUrl('');
        }
        
        // fill title-field
        $this->view->placeholder('main.window.title')->set('Visualization for '. $this->_owApp->selectedModel );
        
        // disable OntoWiki's Navigation
        $on = $this->_owApp->getNavigation();
        $on->disableNavigation ();
        
		// set URL for cubeviz extension folder
        $this->view->cubevizPath = $this->_config->staticUrlBase . 'cubeviz/';
        		
        // set base url paths to extension root and images folder
		$this->view->basePath = $this->_config->staticUrlBase . 'extensions/cubeviz/';
		$this->view->cubevizImagesPath = $this->_config->staticUrlBase . 'extensions/cubeviz/static/images/';
		
		// send backend information to the view
        $this->view->backend = $this->_owApp->getConfig()->store->backend;
				
		// model
		$this->view->modelUrl = $this->_owApp->selectedModel;
        $this->view->modelInformation = $this->_owApp->selectedModel->getMetaInformation ();
        
        $th = new OntoWiki_Model_TitleHelper ($this->_owApp->selectedModel);
        $th->addResource($this->_owApp->selectedModel->getModelIri());
		$this->view->modelTitle = $th->getTitle($this->_owApp->selectedModel->getModelIri());
		$graphUrl = $this->_owApp->selectedModel->getModelIri();
		
		// linkCode (each linkcode represents a particular configuration of CubeViz)
		$this->view->linkCode = NULL == $this->_request->getParam ('lC') ? '' : $this->_request->getParam ('lC');
        
		// load configuration which is associated with given linkCode
		$configuration = $this->_getConfiguration ();
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
	}
	
	public function getdatafromlinkcodeAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();     
		
        // load configuration which is associated with given linkCode
		$configuration = $this->_getConfiguration ();
        $configuration = $configuration->read ($this->_request->getParam('lC'));
				
        // send back readed configuration
        // $configuration [0] contains stuff e.g. selectedDSD, ...
        //                [1] contains UI chart config information
		$this->_response->setBody(json_encode($configuration));	
	}
	
	public function getobservationsAction() {
		
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();   
             
        // load configuration which is associated with given linkCode
		$configuration = $this->_getConfiguration (); 	
        
		// linkCode (each linkcode represents a particular configuration of CubeViz)
		$linkCode = NULL == $this->_request->getParam ('lC') ? '' : $this->_request->getParam ('lC');
        $linkConfiguration = array ();
        
		$configuration = $configuration->read ($linkCode);
        if (true == isset ($configuration [0])) {
            $linkConfiguration = json_decode ( $configuration [0], true ); // contains stuff e.g. selectedDSD, ...
        }
        				
        // init Query and model
		$query = new DataCube_Query ( $this->_owApp->selectedModel );
                
        
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
				
        $this->_response->setBody(json_encode($query->getDataStructureDefinitions()));
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
	 */
	public function savelinktofileAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
        // Save parameter
		$config['cubeVizLinksModule'] = $this->_request->getParam('cubeVizLinksModule');
		$config['uiChartConfig'] = $this->_request->getParam('uiChartConfig');
		
		$configuration = $this->_getConfiguration ();
        
        // write given parameter to file and send back result
		$this->_response->setBody(json_encode($configuration->write($config)));
	}

    protected function _getConfiguration () {
        $cacheDir = $this->_owApp->erfurt->getCacheDir();
        if (null === $this->_configuration) {
    		$this->_configuration = new CubeViz_ConfigurationLink($cacheDir);
        } 
        return $this->_configuration;
    }

}
