import * as THREE from 'three';

export class MetaQuestOptimizer {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.frameCount = 0;
        this.fps = 0;
        this.lastTime = performance.now();
        this.targetFPS = 72; // Quest 2 default
        this.performance = {
            geometries: 0,
            textures: 0,
            lights: 0
        };
    }

    optimize() {
        // Optimize geometries for Quest
        this.optimizeGeometries();
        
        // Optimize materials for Quest
        this.optimizeMaterials();
        
        // Optimize lighting
        this.optimizeLighting();
        
        // Enable frustum culling
        this.scene.traverse(obj => {
            if (obj.isMesh) {
                obj.frustumCulled = true;
            }
        });

        console.log('Meta Quest optimization applied:', this.performance);
    }

    optimizeGeometries() {
        let geometryCount = 0;
        this.scene.traverse(obj => {
            if (obj.isMesh && obj.geometry) {
                // Remove unnecessary attributes
                if (obj.geometry.attributes.normal) {
                    // Keep normals for lighting
                }
                
                // Buffer geometry is already efficient
                if (!obj.geometry.isBufferGeometry) {
                    const bufferGeo = new THREE.BufferGeometry();
                    bufferGeo.fromGeometry(obj.geometry);
                    obj.geometry = bufferGeo;
                }
                
                geometryCount++;
            }
        });
        this.performance.geometries = geometryCount;
    }

    optimizeMaterials() {
        let textureCount = 0;
        this.scene.traverse(obj => {
            if (obj.isMesh && obj.material) {
                const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                
                materials.forEach(mat => {
                    if (mat.map) {
                        // Optimize texture
                        mat.map.minFilter = THREE.LinearFilter;
                        mat.map.magFilter = THREE.LinearFilter;
                        textureCount++;
                    }
                    
                    // Reduce material complexity
                    if (mat.metalness !== undefined) {
                        mat.metalness *= 0.8; // Reduce reflectivity
                    }
                    
                    // Use simple fog instead of complex effects
                    mat.fog = true;
                });
            }
        });
        this.performance.textures = textureCount;
    }

    optimizeLighting() {
        let lightCount = 0;
        const lightsToRemove = [];
        
        this.scene.traverse(obj => {
            if (obj.isLight) {
                lightCount++;
                
                // Reduce shadow quality
                if (obj.shadow) {
                    obj.shadow.mapSize.width = 512;
                    obj.shadow.mapSize.height = 512;
                    obj.shadow.camera.far = 50;
                }
                
                // Limit number of lights
                if (lightCount > 3) {
                    lightsToRemove.push(obj);
                }
            }
        });
        
        // Remove excess lights
        lightsToRemove.forEach(light => {
            this.scene.remove(light);
        });
        
        this.performance.lights = Math.min(lightCount, 3);
    }

    onSessionStart(session) {
        // Detect Quest device and adjust settings
        const userAgent = navigator.userAgent;
        const isQuest3 = userAgent.includes('Quest/3');
        const isQuest2 = userAgent.includes('Quest/2');
        const isQuestPro = userAgent.includes('Quest Pro');

        if (isQuest3) {
            this.targetFPS = 90;
            this.renderer.xr.setFramebufferScaleFactor(0.9);
        } else if (isQuestPro) {
            this.targetFPS = 72;
            this.renderer.xr.setFramebufferScaleFactor(0.85);
        } else {
            this.targetFPS = 72;
            this.renderer.xr.setFramebufferScaleFactor(0.8);
        }

        console.log(`Detected device, target FPS: ${this.targetFPS}`);
    }

    update() {
        // Monitor performance
        this.frameCount++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;

        if (deltaTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;

            // Adjust quality based on FPS
            if (this.fps < this.targetFPS * 0.9) {
                // Performance is dropping, reduce quality
                this.renderer.xr.setFramebufferScaleFactor(
                    this.renderer.xr.getFramebufferScaleFactor() * 0.95
                );
                console.warn(`Low FPS detected: ${this.fps}. Reducing quality.`);
            } else if (this.fps > this.targetFPS && this.renderer.xr.getFramebufferScaleFactor() < 0.95) {
                // Performance is good, increase quality
                this.renderer.xr.setFramebufferScaleFactor(
                    Math.min(1.0, this.renderer.xr.getFramebufferScaleFactor() * 1.05)
                );
            }
        }
    }

    getStats() {
        return {
            fps: this.fps,
            targetFPS: this.targetFPS,
            framebufferScale: this.renderer.xr.getFramebufferScaleFactor(),
            ...this.performance
        };
    }
}
