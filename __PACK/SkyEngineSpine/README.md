# SkyEngineSpine
[SkyEngine](http://skyengine.uppercase.io/)에서 [Spine](http://ko.esotericsoftware.com/) 애니메이션을 사용할 수 있도록 하는 BOX입니다.

## 설치하기
프로젝트의 `DEPENDENCY` 파일에 `Hanul/SkyEngineSpine`을 추가합니다.

## 사용 예시
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

## 애니메이션이 끝났을때의 이벤트 등록
```javascript
spineNode.on('animationend', () => {
	spineNode.changeAnimation('walk');
});
```

## API 문서
[API](API/README.md)

## 소스코드
https://github.com/Hanul/SkyEngineSpine

## 작성자
[Young Jae Sim](https://github.com/Hanul)