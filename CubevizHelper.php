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
        $owApp      = OntoWiki::getInstance();
        $translate  = $owApp->translate;
        $extrasMenu = OntoWiki_Menu_Registry::getInstance()->getMenu('application')->getSubMenu('Extras');

        // If a model is selected, add entry to analyze action
        if (true === isset(OntoWiki::getInstance()->selectedModel)) {
            $extrasMenu->setEntry($translate->_('ApplicationExtrasMenu_Label'), (string) new OntoWiki_Url(array(
                'controller' => 'cubeviz', 
                'action' => 'analyze'), 
            array()));
        }
        
        // add entry to comparing action
        $extrasMenu->setEntry($translate->_('ApplicationExtrasMenu_ComparingLabel'), (string) new OntoWiki_Url(array(
                'controller' => 'cubeviz', 
                'action' => 'compare'), 
            array()));
    }
}
