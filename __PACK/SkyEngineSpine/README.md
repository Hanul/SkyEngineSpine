# SkyEngineSpine

사용방법
```javascript
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
```

## 작성자
[Young Jae Sim](https://github.com/Hanul)