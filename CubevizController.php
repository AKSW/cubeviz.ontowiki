<?php

class CubevizController extends OntoWiki_Controller_Component {
    
    public function init () {
        parent::init();
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
}
