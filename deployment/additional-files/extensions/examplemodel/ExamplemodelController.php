<?php

/**
 * 
 */
class ExamplemodelController extends OntoWiki_Controller_Component {
    
    public function init () {
        parent::init();
    }
    
    /**
     * 
     */
    public function indexAction () {
	}
    
    /**
     * 
     */
    public function createAction () {
        
        // Deactivate layout
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        // set example knowledge base uri (based on the one in static/data/exampleCube.ttl!)
        $ns = 'http://example.cubeviz.org/datacube/';
        
        // Check if example knowledge base is NOT available yet.
        if (false == $this->_erfurt->getStore()->isModelAvailable ($ns)) {
        
            // set file related stuff
            $ttl = file_get_contents ( __DIR__ .'/static/data/exampleCube.ttl' );
            
            // echo $ttl;
            
            // try to create new model
            $m = $this->_erfurt->getStore()->getNewModel($ns);
            
            $filetype = 'ttl';
            $locator = Erfurt_Syntax_RdfParser::LOCATOR_DATASTRING;
            
            // import given file content
            $this->_erfurt->getStore()->importRdf ( $ns, $ttl, $filetype, $locator );
            
            // redirect to model select view
            $location = $this->_config->staticUrlBase .'page/gettingstarted/';            
            header ('Location: '. $location);
        }
	}
}
