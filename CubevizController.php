<?php

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
        //
    }
    
    /**
     * 
     */
    public function sayhelloAction () {
        // disable autorendering for this action only
        $this->_helper->viewRenderer->setNoRender();
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
		$dsdUri = $this->_request->getParam('dsdUri'); // Data Structure Definition
				
		$query = new DataCube_Query($model);
				
        $this->_response->setBody(json_encode($query->getDataSets($dsdUri)));
	}
	
	/**
	 * 
	 */
	public function getcomponentsAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
		$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		$dsdUri = $this->_request->getParam('dsdUri'); // Data Structure Definition
		$dsUri = $this->_request->getParam('dsUri'); // Data Set
		$componentType = $this->_request->getParam('cT'); // can be  DataCube_UriOf::Dimension or DataCube_UriOf::Measure
		
		$query = new DataCube_Query($model);
		
		try {
			$this->_response->setBody(json_encode($query->getComponents($dsdUri, $dsUri, $componentType)));
		} catch(CubeViz_Exception $e) {
			$this->_response->setBody($e->getMessage());
			//error message
		}        
	}
	
	/**
	 * 
	 */
	public function getcomponentelementsAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
		$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		$dsUri = $this->_request->getParam('dsUri'); // Data Structure Definition
		$componentProperty = $this->_request->getParam('cP'); // Data Structure Definition
				
		$query = new DataCube_Query($model);
				
        $this->_response->setBody(json_encode($query->getComponentElements($dsUri, $componentProperty)));
	}
}
