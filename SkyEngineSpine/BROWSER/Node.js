/*
 * 스파인 노드
 */
SkyEngineSpine.Node = CLASS({
	
	preset : () => {
		return SkyEngine.Node;
	},
	
	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.json
		//REQUIRED: params.atlas
		//REQUIRED: params.png
		//REQUIRED: params.animation
		//OPTIONAL: params.skin
		//OPTIONAL: params.mixInfos
		
		let json = params.json;
		let atlas = params.atlas;
		let png = params.png;
		let animation = params.animation;
		let skin = params.skin;
		let mixInfos = params.mixInfos;
		
		if (skin === undefined) {
			skin = 'default';
		}
		
		let pixiSpine;
		
		// 데이터 로딩
		PIXI.loader.add('data', json).load((loader, res) => {
			
			if (self.checkIsRemoved() !== true) {
				
				pixiSpine = new PIXI.spine.Spine(res.data.spineData);
				
				pixiSpine.skeleton.setSkinByName(skin);
				pixiSpine.state.setAnimation(0, animation, true);
				
				if (mixInfos !== undefined) {
					EACH(mixInfos, (mixInfo) => {
						pixiSpine.stateData.setMixByName(mixInfo.from, mixInfo.to, mixInfo.duration);
					});
				}
				
				pixiSpine.zIndex = -9999999;
				pixiSpine.blendMode = SkyEngine.Util.BlendMode.getPixiBlendMode(self.getBlendMode());
				
				pixiSpine.state.addListener({
					event : (entry, event) => {
						self.fireEvent(event.data.name);
					},
					complete : () => {
						self.fireEvent('animationend');
					}
				});
				
				self.addToPixiContainer(pixiSpine);
				
				self.fireEvent('load');
			}
		});
		
		// 스킨을 변경합니다.
		let changeSkin = self.changeSkin = (_skin) => {
			skin = _skin;
			
			if (pixiSpine !== undefined) {
				pixiSpine.skeleton.setSkinByName(skin);
			}
		};
		
		// 애니메이션을 변경합니다.
		let changeAnimation = self.changeAnimation = (_animation) => {
			animation = _animation;
			
			if (pixiSpine !== undefined) {
				pixiSpine.state.setAnimation(0, animation, true);
			}
		};
		
		let getAnimation = self.getAnimation = () => {
			return animation;
		};
	}
});