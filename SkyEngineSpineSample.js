require(process.env.UPPERCASE_PATH + '/LOAD.js');

BOOT({
	CONFIG : {
		defaultBoxName : 'SkyEngineSpineSample',
		
		title : 'SkyEngine Spine Sample',
		
		isDevMode : true,
		webServerPort : 8725,
		
		SkyEngine : {
			isDebugMode : true
		}
	},
	
	BROWSER_CONFIG : {
		isNotToConnectServer : true
	},
	
	NODE_CONFIG : {
		// 테스트 목적이기 때문에 CPU 클러스터링 기능을 사용하지 않습니다.
		isNotUsingCPUClustering : true
	}
});
