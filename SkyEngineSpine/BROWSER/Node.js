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
		//OPITONAL: params.skin
		//OPITONAL: params.mixInfos
		
		let json = params.json;
		let atlas = params.atlas;
		let png = params.png;
		let animation = params.animation;
		let skin = params.skin;
		let mixInfos = params.mixInfos;
		
		if (skin === undefined) {
			skin = 'default';
		}
		
		let assetManager = new spine.canvas.AssetManager();
		assetManager.loadText(json);
		assetManager.loadText(atlas);
		assetManager.loadTexture(png);
		
		let skeleton;
		let animationState;
		let bounds;
		
		let skeletonRenderer;
		
		let changeSkin = self.changeSkin = (_skin) => {
			skin = _skin;
			
			if (skeleton !== undefined) {
				skeleton.setSkinByName(skin);
			}
		};
		
		let changeAnimation = self.changeAnimation = (_animation) => {
			animation = _animation;
			
			if (animationState !== undefined) {
				animationState.setAnimation(0, animation, true);
			}
		};
		
		let step;
		OVERRIDE(self.step, (origin) => {
			
			step = self.step = (deltaTime) => {
				
				if (animationState !== undefined) {
					animationState.update(deltaTime / 1000);
				}
				
				origin(deltaTime);
			};
		});
		
		let draw;
		OVERRIDE(self.draw, (origin) => {
			
			draw = self.draw = (context) => {
				
				if (skeleton === undefined && assetManager.isLoadingComplete() === true) {
					
					skeleton = new spine.Skeleton(
						new spine.SkeletonJson(
							new spine.AtlasAttachmentLoader(
								new spine.TextureAtlas(assetManager.get(atlas), (path) => {
									return assetManager.get(png);
								})
							)
						).readSkeletonData(assetManager.get(json))
					);
					
					skeleton.flipY = true;
					
					skeleton.setToSetupPose();
					skeleton.updateWorldTransform();
					
					let offset = new spine.Vector2();
					let size = new spine.Vector2();
					
					skeleton.getBounds(offset, size, []);
					
					bounds = {
						offset : offset,
						size : size
					};
					
					skeleton.setSkinByName(skin);
					
					let animationStateData = new spine.AnimationStateData(skeleton.data);
					
					if (mixInfos !== undefined) {
						EACH(mixInfos, (mixInfo) => {
							animationStateData.setMix(mixInfo.from, mixInfo.to, mixInfo.duration);
						});
					}
					
					animationState = new spine.AnimationState(animationStateData);
					animationState.setAnimation(0, animation, true);
					animationState.addListener({
						complete : () => {
							self.fireEvent('animationend');
						}
					});
					
					self.fireEvent('load');
				}
				
				if (skeleton !== undefined) {
					
					if (skeletonRenderer === undefined) {
						skeletonRenderer = new spine.canvas.SkeletonRenderer(context);
						skeletonRenderer.debugRendering = CONFIG.SkyEngine.isDebugMode;
						skeletonRenderer.triangleRendering = true;
					}
					
					// draw
					animationState.apply(skeleton);
					skeleton.updateWorldTransform();
					skeletonRenderer.draw(skeleton);
				}
				
				origin(context);
			};
		});
	}
});