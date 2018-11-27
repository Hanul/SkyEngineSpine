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
		
		let rawSkeletonData;
		let rawAtlasData;
		let pixiTexture;
		
		PARALLEL([
		(done) => {
			
			GET(json, (result) => {
				rawSkeletonData = JSON.parse(result);
				done();
			});
		},
		
		(done) => {
			
			GET(atlas, (result) => {
				rawAtlasData = result;
				done();
			});
		},
		
		(done) => {
			
			pixiTexture = PIXI.utils.TextureCache[png];
			
			if (pixiTexture === undefined) {
				
				let img = new Image();
				
				img.crossOrigin = 'anonymous';
				
				img.onload = () => {
					
					img.onload = undefined;
					
					if (self.checkIsRemoved() !== true) {
						
						if (PIXI.utils.TextureCache[png] !== undefined) {
							pixiTexture = PIXI.utils.TextureCache[png];
						}
						
						else {
							
							pixiTexture = new PIXI.Texture.from(img);
							
							PIXI.Texture.addToCache(pixiTexture, png);
						}
						
						done();
					}
				};
				
				img.src = png;
			}
			
			else {
				done();
			}
		},
		
		() => {
			
			if (self.checkIsRemoved() !== true) {
				
				let spineAtlas = new PIXI.spine.core.TextureAtlas(rawAtlasData, (notUsing, callback) => {
					callback(pixiTexture.baseTexture);
				});
				
				let spineAtlasLoader = new PIXI.spine.core.AtlasAttachmentLoader(spineAtlas);
				let spineJsonParser = new PIXI.spine.core.SkeletonJson(spineAtlasLoader);
				
				pixiSpine = new PIXI.spine.Spine(spineJsonParser.readSkeletonData(rawSkeletonData));
				
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
		}]);
		
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
	}
});