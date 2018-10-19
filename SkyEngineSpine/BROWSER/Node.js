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
		let img;
		
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
			
			img = new Image();
			img.onload = () => {
				img.onload = undefined;
				done();
			};
			img.src = png;
		},
		
		() => {
			
			if (self.checkIsRemoved() !== true) {
				
				let spineAtlas = new PIXI.spine.core.TextureAtlas(rawAtlasData, (notUsing, callback) => {
					callback(new PIXI.BaseTexture(img));
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