<?php

/**
 * 
 */
class CubevizHelper extends OntoWiki_Component_Helper 
{
    /**
     *
     */
    public function __construct() 
    {
        // In case no model was selected, show no menu entry
        if (false === isset(OntoWiki::getInstance()->selectedModel)) {
            return;
        }
        
        $owApp      = OntoWiki::getInstance();
        $translate  = $owApp->translate;
        $url        = new OntoWiki_Url(array('controller' => 'cubeviz', 'action' => 'analyze'), array());
        $extrasMenu = OntoWiki_Menu_Registry::getInstance()->getMenu('application')->getSubMenu('Extras');
        $extrasMenu->setEntry($translate->_('ApplicationExtrasMenu_Label'), (string) $url);
    }
}
