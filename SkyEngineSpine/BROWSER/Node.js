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
		
		let assetManager = new spine.canvas.AssetManager();
		assetManager.loadText(json);
		assetManager.loadText(atlas);
		assetManager.loadTexture(png);
		
		let skeleton;
		let animationState;
		let skeletonRenderer;
		
		// 스킨을 변경합니다.
		let changeSkin = self.changeSkin = (_skin) => {
			skin = _skin;
			
			if (skeleton !== undefined) {
				skeleton.setSkinByName(skin);
			}
		};
		
		// 애니메이션을 변경합니다.
		let changeAnimation = self.changeAnimation = (_animation) => {
			animation = _animation;
			
			if (animationState !== undefined) {
				animationState.setAnimation(0, animation, true);
				
				if (skeleton !== undefined) {
					animationState.apply(skeleton);
					skeleton.updateWorldTransform();
				}
			}
		};
		
		let getAnimation = self.getAnimation = () => {
			return animation;
		};
		
		let step;
		OVERRIDE(self.step, (origin) => {
			
			step = self.step = (deltaTime) => {
				
				if (animationState !== undefined) {
					animationState.update(deltaTime);
					animationState.apply(skeleton);
				}
				
				origin(deltaTime);
			};
		});
		
		self.on('remove', () => {
			
			assetManager.removeAll();
			
			assetManager = undefined;
			skeleton = undefined;
			animationState = undefined;
			skeletonRenderer = undefined;
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
					
					let bounds = {
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
					animationState.apply(skeleton);
					animationState.addListener({
						event : (entry, event) => {
							self.fireEvent(event.data.name);
						},
						complete : () => {
							self.fireEvent('animationend');
						}
					});
					
					self.fireEvent('load');
				}
				
				if (skeleton !== undefined) {
					
					if (skeletonRenderer === undefined) {
						skeletonRenderer = new spine.canvas.SkeletonRenderer(context);
						skeletonRenderer.debugRendering = BROWSER_CONFIG.SkyEngine.isDebugMode;
					}
					
					// draw
					if (skeleton !== undefined) {
						skeleton.updateWorldTransform();
						skeletonRenderer.draw(skeleton);
					}
				}
				
				origin(context);
			};
		});
	}
});