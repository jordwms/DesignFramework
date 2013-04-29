<?php
	/*
	 *	Dynamic HTML/CSS/JS Loader with shared global resources
	 *	for things like header/footer and css/js libraries that
	 *  will be used across all modules.
	 *
	 *	We use a layout paradigm for the global html header/footer "template"
	 *
	 *	A module consists of a folder which conrains an index.html (or module_name.html) 
	 *  and any .css and .js files in the same direcotry
	 *  The folder name defines the module name
	 *
	 *  1. get paths to global css files (vendor libraries)
	 *  2. start building the $css string with the html tags to inject into the template
	 *  3. build the $js string by doing the same for global javascript resources
	 *  4. get the module html or build a list of modules
	 *  5. get the global layout which will inject the above mentioned strings
	 */

	//script execution timing
	$script_execution_start = microtime(true);

	/*
	 *	DIRECTORY CONSTANTS
	 */
	define('MODULES_DIR', './modules/');
	define('GLOBAL_DIR', './global/');

	/*
	 *	Global Module CSS Resources
	 *	Begin by listing building a list of all css files in the modules/global/css/ directory
	 *  The files are then built into <link rel="stylesheet"> tags
	 *
	 *	Any files preceded with an ! or . will be ignored.  This is so they can be referenced manually
	 *  and used in a location other than the $css variable or not at all
	 */
	$css_includes = array_diff(scandir(GLOBAL_DIR.'css/'), array('..', '.'));

	//ignore any files preceded with a ! or .
	$css_includes = array_filter($css_includes,function($file){
		if( strpos($file, '!') === 0 || strpos($file, '.') === 0 ){
			return false;
		} else {
			return true;
		}
	});

	//Build the CSS tags
	$css = array_map(
		function($css_file){
			return '<link rel="stylesheet" href="'.GLOBAL_DIR.'css/'.$css_file.'">';
		},
		$css_includes
	);
	$css = implode(PHP_EOL, $css);


	/*
	 *	Global Module JS Resources
	 *	Begin by listing building a list of all js files in the modules/global/js/ directory
	 *  The files are then built into <script src=""></script> tags to be embeded on a template
	 *
	 *	Any files preceded with an ! or . will be ignored.  This is so they can be referenced manually
	 *  and used in a location other than the $js variable or not at all
	 */
	$js_includes = array_diff(scandir(GLOBAL_DIR.'js/'), array('..', '.'));

	//ignore any files preceeded with an ! or . character 
	$js_includes = array_filter($js_includes,function($js_file){
		if( strpos($js_file, '!') === 0 || strpos($js_file, '.') === 0 ){
			return false;
		} else {
			return true;
		}
	});

	//Build the $js string with html script tags
	$js = array_map(
		function($js_file){
			return '<script src="'.GLOBAL_DIR.'js/'.$js_file.'"></script>';
		},
		$js_includes
	);
	$js = implode(PHP_EOL, $js);

	/*
	 *	Modules
	 *
	 *  Begin by building a list of available modules
	 *  A module is simply a sub directory in the modules folder
	 *  For obvious reasons, the name "global" is reserved and thus not included in the list
	 */
	$modules = array_diff(scandir(MODULES_DIR), array('..', '.', '.DS_Store', 'global'));

	/*
	 *	First see if the module exists and load it
	 *  If not, show a list of modules
	 */
	if( count($_GET) > 0 ){
		/*
		 *	This verifies the modules exists and loads it's resources
		 */
		$module_name = key($_GET);
		if( in_array($module_name, $modules) ){
			$module_path = MODULES_DIR.$module_name.'/';

			//load either index.html or module_name.html
			$module_html = $module_path.'index.html';
			if( ! file_exists($module_html) )
				$module_html = $module_path.$module_name.'.html';

			//if neither file exists... fail 404
			if( ! file_exists($module_html) ){
				header("HTTP/1.0 404 Not Found");
				require(GLOBAL_DIR.'html/404.html');
				die;
			}
				
			$module_files = array_diff(scandir(MODULES_DIR.$module_name.'/'), array('..', '.'));
			foreach ($module_files as $file_name) {
				if( strlen($file_name) - strpos($file_name, '.css') == 4 ){
					$css .= '<link rel="stylesheet" href="'.$module_path.$file_name.'">';
				}elseif( strlen($file_name) - strpos($file_name, '.js') == 3 ){
					$js .= PHP_EOL.'<script src="'.$module_path.$file_name.'"></script>';
				}
			}

			ob_start();
			require($module_html);
			$html = ob_get_clean();
		} else {
			header("HTTP/1.0 404 Not Found");
			require(GLOBAL_DIR.'html/404.html');
			die;
		}
	} else {
		/*
		 * This is where we build the list of modules
		 */

		//show list of modules :D
		$module_list = array_map(
			function($module){
				return '<a class="modules" href="?'.$module.'">'.$module.'</a>'.PHP_EOL;
			},
			$modules
		);

		$html = implode('', $module_list);
		$css .= '<link rel="stylesheet" href="'.MODULES_DIR.'module_list.css">';
	}

	$script_execution_end = microtime(true);
	$execution_time = $script_execution_end - $script_execution_start;

	// finally get they layout
	// the layout has access to all variables here
	// $html, $js, $css are the primary variables whcih contain the markup tags necessary to load all of the resources
	// $execution_time can be handy for performance benchmarking
	require(GLOBAL_DIR.'html/layout.html');