import * as THREE from 'three';

export class XRController {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.controllers = [];
        this.selectedObject = null;
        this.raycaster = new THREE.Raycaster();
        this.inputSources = [];
        this.handTracking = null;
        this.hands = { left: null, right: null };
        
        this.setupControllers();
        this.setupMouseInput();
    }

    setupControllers() {
        // Setup left and right controllers
        for (let i = 0; i < 2; i++) {
            const controller = this.renderer.xr.getController(i);
            controller.addEventListener('select', (event) => this.onSelect(event, controller));
            controller.addEventListener('squeeze', (event) => this.onSqueeze(event, controller));
            controller.addEventListener('end', (event) => this.onEnd(event, controller));
            this.scene.add(controller);
            this.controllers.push(controller);
        }

        // Add visual representations for controllers
        for (let i = 0; i < 2; i++) {
            const controllerGroup = new THREE.Group();
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.03, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x00d9ff })
            );
            controllerGroup.add(sphere);
            
            // Add ray/line from controller
            const line = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, 0, -5)
                ]),
                new THREE.LineBasicMaterial({ color: 0x00d9ff, linewidth: 2 })
            );
            controllerGroup.add(line);
            
            this.controllers[i].add(controllerGroup);
        }
    }

    setupMouseInput() {
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
        document.addEventListener('click', (event) => this.onMouseClick(event));
    }

    setupHandTracking(session, referenceSpace) {
        // Setup hand tracking for Meta Quest
        session.addEventListener('inputsourceschange', (event) => {
            event.added.forEach(inputSource => {
                if (inputSource.hand) {
                    const handedness = inputSource.handedness; // 'left' or 'right'
                    console.log(`${handedness} hand detected for tracking`);
                    this.hands[handedness] = {
                        inputSource: inputSource,
                        joints: {}
                    };
                }
            });

            event.removed.forEach(inputSource => {
                if (inputSource.hand) {
                    const handedness = inputSource.handedness;
                    this.hands[handedness] = null;
                }
            });
        });
    }

    onSelect(event, controller) {
        this.selectObject(controller);
    }

    onSqueeze(event, controller) {
        this.grabObject(controller);
    }

    onEnd(event, controller) {
        this.releaseObject();
    }

    selectObject(controller) {
        // Raycast from controller
        this.raycaster.setFromXRController(controller);

        const interactiveObjects = this.scene.children.filter(
            obj => obj.userData.isInteractive
        );

        const intersects = this.raycaster.intersectObjects(interactiveObjects, true);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.userData.onHover) {
                obj.userData.onHover.call(obj, true);
            }
            this.selectedObject = obj;
        }
    }

    grabObject(controller) {
        if (this.selectedObject) {
            this.selectedObject.userData.grabbed = true;
            this.selectedObject.userData.onGrab?.call(this.selectedObject);
            
            // Parent to controller for hand/controller movement
            const gripSpace = this.renderer.xr.getControllerGripSpace(
                this.controllers.indexOf(controller)
            );
            gripSpace.attach(this.selectedObject);
        }
    }

    releaseObject() {
        if (this.selectedObject) {
            this.selectedObject.userData.grabbed = false;
            this.selectedObject.userData.onRelease?.call(this.selectedObject);
            
            // Return to world space
            const worldPos = new THREE.Vector3();
            this.selectedObject.getWorldPosition(worldPos);
            
            this.scene.attach(this.selectedObject);
            this.selectedObject.position.copy(worldPos);
            
            // Reset to original position after a moment
            if (this.selectedObject.userData.originalPosition) {
                setTimeout(() => {
                    if (!this.selectedObject.userData.grabbed) {
                        this.selectedObject.position.copy(
                            this.selectedObject.userData.originalPosition
                        );
                    }
                }, 500);
            }
            
            this.selectedObject = null;
        }
    }

    onMouseMove(event) {
        const mouse = {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1
        };

        this.raycaster.setFromCamera(mouse, this.camera);

        const interactiveObjects = this.scene.children.filter(
            obj => obj.userData.isInteractive
        );

        const intersects = this.raycaster.intersectObjects(interactiveObjects);

        interactiveObjects.forEach(obj => {
            if (obj.userData.onHover && !obj.userData.grabbed) {
                obj.userData.onHover.call(obj, false);
            }
        });

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.userData.onHover && !obj.userData.grabbed) {
                obj.userData.onHover.call(obj, true);
            }
        }
    }

    onMouseClick(event) {
        const mouse = {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1
        };

        this.raycaster.setFromCamera(mouse, this.camera);

        const interactiveObjects = this.scene.children.filter(
            obj => obj.userData.isInteractive
        );

        const intersects = this.raycaster.intersectObjects(interactiveObjects);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (this.selectedObject === obj) {
                this.releaseObject();
            } else {
                this.releaseObject();
                this.selectedObject = obj;
                this.grabObject({ dummy: true });
            }
        } else {
            this.releaseObject();
        }
    }

    update(frame) {
        if (frame && frame.inputSources) {
            frame.inputSources.forEach((inputSource, index) => {
                if (inputSource.gamepad) {
                    this.updateGamepadInput(inputSource);
                }
            });
        }
    }

    updateGamepadInput(inputSource) {
        if (inputSource.gamepad && inputSource.gamepad.axes.length >= 2) {
            // Thumbstick input for locomotion
            const axes = inputSource.gamepad.axes;
            // Can implement smooth locomotion or teleportation here
        }
    }

    setupSession(session) {
        session.addEventListener('end', () => {
            this.releaseObject();
        });
    }
}
