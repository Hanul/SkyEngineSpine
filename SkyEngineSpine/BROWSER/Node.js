/*
 * 스파인 노드
 */
SkyEngineSpine.Node = CLASS((cls) => {
	
	let spineDataCache = {};
	
	return {
		
		preset : () => {
			return SkyEngine.Node;
		},
		
		init : (inner, self, params) => {
			//REQUIRED: params
			//REQUIRED: params.json
			//REQUIRED: params.animation
			//OPTIONAL: params.skin
			//OPTIONAL: params.mixInfos
			
			let json = params.json;
			let animation = params.animation;
			let skin = params.skin;
			let mixInfos = params.mixInfos;
			
			if (skin === undefined) {
				skin = 'default';
			}
			
			let pixiSpine;
			
			let generatePixiSpine = self.generatePixiSpine = (spineData) => {
				
				if (self.checkIsRemoved() !== true) {
					
					pixiSpine = new PIXI.spine.Spine(spineData);
					
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
				}
			};
			
			if (spineDataCache[json] !== undefined) {
				generatePixiSpine(spineDataCache[json]);
			}
			
			else {
				
				// 데이터 로딩
				PIXI.loader.add(json, json).load((loader, res) => {
					
					if (self.checkIsRemoved() !== true) {
						
						let spineData = res[json].spineData;
						
						spineDataCache[json] = spineData;
						
						generatePixiSpine(spineData);
						
						self.fireEvent('load');
					}
				});
			}
			
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
					
					pixiSpine.state.apply(pixiSpine.skeleton);
					pixiSpine.skeleton.updateWorldTransform();
				}
			};
			
			let getAnimation = self.getAnimation = () => {
				return animation;
			};
		},
		
		afterInit : (inner, self, params) => {
			//REQUIRED: params
			//REQUIRED: params.json
			
			let json = params.json;
			
			if (spineDataCache[json] !== undefined) {
				self.fireEvent('load');
			}
		}
	};
});