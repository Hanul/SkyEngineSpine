SkyEngineSpineSample.Home = CLASS({
	
	preset : () => {
		return VIEW;
	},
	
	init : (inner) => {
		
		let spineNode = SkyEngineSpine.Node({
			json : SkyEngineSpineSample.R('spineboy.json'),
			atlas : SkyEngineSpineSample.R('spineboy.atlas'),
			png : SkyEngineSpineSample.R('spineboy.png'),
			animation : 'walk',
			centerY : -300,
			scale : 0.5,
			mixInfos : [{
				from : 'jump',
				to : 'run',
				duration : 0.2
			}]
		}).appendTo(SkyEngine.Screen);
		
		let delay = DELAY(1, () => {
			spineNode.changeAnimation('jump');
			delay = DELAY(1, () => {
				spineNode.changeAnimation('run');
			});
		});
		
		inner.on('close', () => {
			spineNode.remove();
			delay.remove();
		});
	}
});
