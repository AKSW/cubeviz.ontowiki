<?php
/**
 * @copyright Copyright (c) 2013, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
 
/**
 * This class represents an Array. It allows you to return a particular value
 * if some element is undefined the user wanna access. Using predefined ArrayAccess
 * class of PHP: http://php.net/manual/en/class.arrayaccess.php
 */
class CubeViz_Array implements arrayaccess
{
    /**
     * 
     */
    protected $_useIfValueNotSet = '';
    
    /**
     * Constructor
     */
    public function __construct($useIfValueNotSet = '') 
    {
        $this->_useIfValueNotSet = $useIfValueNotSet;
    }
    
    public function set($name, $value) 
    {
        $this->{$name} = $value;
    }
    
    /**
     * Uses a default if element is not set
     */
    public function get($name) 
    {
        return true === isset($this->{$name}) 
            ? $this->{$name} : $this->_useIfValueNotSet;
    }

    public function offsetGet($offset) 
    {
        return $this->get($offset);
    }

    public function offsetSet($offset, $value) 
    {
        $this->set($offset, $value);
    }
    
    public function offsetExists($offset) 
    {
        return isset($this->{$offset});
    }
    
    public function offsetUnset($offset) 
    {
        unset($this->{$offset});
    }
}
