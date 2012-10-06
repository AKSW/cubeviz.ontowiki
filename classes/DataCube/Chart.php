<?php
/**
 * This class represents a Chart
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
class DataCube_Chart
{    
    /**
     * Path to chart configuration files
     */
    protected $_chartFolder = '';
    
    /**
     * Constructor
     */
    public function __construct () {
        $this->_chartFolder = dirname (__FILE__ ) .'/../../config/charttypes/';
    }
    
    /**
     * Check if chart folder exists and is readable
     * @throws CubeViz_Exception
     * @return boolean
     */
    protected function checkChartFolder () {
        
        clearstatcache();
        
        if(true == file_exists ($this->_chartFolder) && true == is_readable ($this->_chartFolder)) {
            return true;
        } else {
            throw new CubeViz_Exception ('Chart folder does not exists or is not readable!');
        }
    }
    
    /**
     * Get a list of files in charttypes folder
     * @return array File list
     */
    public function getAvailableChartTypes () {
        
        if ( true == $this->checkChartFolder ($this->_chartFolder) ) {
        
            $fileList = array ();
            
            $dir = new DirectoryIterator($this->_chartFolder);
            foreach ($dir as $fileinfo) {
                if (!$fileinfo->isDot()) {
                    
                    $filename = $fileinfo->getFilename();
                    $fileList [] = substr ( $filename, 0, strpos ( $filename, '.json') );
                }
            }
            return $fileList;
        }
    }
}
