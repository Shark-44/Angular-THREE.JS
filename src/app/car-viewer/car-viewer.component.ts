import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgFor } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

@Component({
  selector: 'app-car-viewer',
  imports: [NgFor],
  standalone: true,
  templateUrl: './car-viewer.component.html',
  styleUrl: './car-viewer.component.css'
})
export class CarViewerComponent implements OnInit, AfterViewInit {
  @ViewChild('rendererCanvas') rendererCanvas!: ElementRef;

  color: string = '';
  colors: string[] = ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#214BF8'];


  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private dirLight!: THREE.DirectionalLight;
  private dirLightHelper!: THREE.DirectionalLightHelper;
  private dirLightColor: string = '#214BF8';
  private lightPitch: number = Math.PI / 4;
  private lightYaw: number = 20;
  private lightRadius: number = 30;

  constructor() { }

  ngOnInit() {
    // L'initialisation sera faite dans ngAfterViewInit
  }

  ngAfterViewInit() {
    this.initThree();
    this.loadModel();
    this.setupKeyboardControls();
    this.animate();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 15;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.rendererCanvas.nativeElement, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI / 2;

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
    this.updateLightPosition();
    this.dirLight.castShadow = false; // ombre
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 500;
    this.scene.add(this.dirLight);

    this.dirLightHelper = new THREE.DirectionalLightHelper(this.dirLight, 5);
    this.scene.add(this.dirLightHelper);

    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  private loadModel() {
    const loader = new GLTFLoader();
    loader.load('assets/car.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          console.log(child.name, child.material);
          if (child.material) {
            if (child.name === 'polySurface282_main_color_0') { // Remplacez par le nom approprié
              (child.material as THREE.MeshStandardMaterial).color.set(this.color);
            }
          }
        }
      });
  
      this.scene.add(gltf.scene);
  
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = this.camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5;
      this.camera.position.set(center.x, center.y, center.z + cameraZ);
      this.camera.lookAt(center);
      this.controls.target.copy(center);
      this.controls.update();
    }, undefined, (error) => {
      console.error('An error occurred while loading the model:', error);
    });
  }

  private updateLightPosition() {
    this.dirLight.position.x = this.lightRadius * Math.sin(this.lightYaw) * Math.cos(this.lightPitch);
    this.dirLight.position.y = this.lightRadius * Math.sin(this.lightPitch);
    this.dirLight.position.z = this.lightRadius * Math.cos(this.lightYaw) * Math.cos(this.lightPitch);
    this.dirLight.lookAt(0, 0, 0);
    if (this.dirLightHelper) {
      this.dirLightHelper.update();
    }
  }

  private setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
      const step = 0.1;
      switch(event.key) {
        case 'ArrowUp':
          this.lightPitch = Math.min(this.lightPitch + step, Math.PI / 2);
          break;
        case 'ArrowDown':
          this.lightPitch = Math.max(this.lightPitch - step, -Math.PI / 2);
          break;
        case 'ArrowLeft':
          this.lightYaw += step;
          break;
        case 'ArrowRight':
          this.lightYaw -= step;
          break;
      }
      this.updateLightPosition();
    });
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
    // pour changer de couleur
    applyColor(color: string, materialName: string) {
      this.color = color;
      this.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material && child.name === materialName) {
            (child.material as THREE.MeshStandardMaterial).color.set(color);
          }
        }
      });
    }
    onIntensityChange(event: Event) {
      const input = event.target as HTMLInputElement;
      const intensity = parseFloat(input.value);
      this.dirLight.intensity = intensity;
    }
}