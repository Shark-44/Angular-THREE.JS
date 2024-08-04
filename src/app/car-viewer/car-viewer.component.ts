import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

@Component({
  selector: 'app-car-viewer',
  standalone: true,
  template: '<canvas #rendererCanvas></canvas>',
  styles: ['canvas { width: 100%; height: 100% }']
})
export class CarViewerComponent implements OnInit, AfterViewInit {
  @ViewChild('rendererCanvas') rendererCanvas!: ElementRef;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  constructor() { }

  ngOnInit() {
    this.initThree();
    this.loadModel();
    this.animate();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.rendererCanvas.nativeElement });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI / 2;

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  private loadModel() {
    const loader = new GLTFLoader();
    loader.load('assets/car.glb', (gltf) => {
      this.scene.add(gltf.scene);
      this.camera.lookAt(gltf.scene.position);
    }, undefined, (error) => {
      console.error('An error occurred while loading the model:', error);
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
  ngAfterViewInit() {
    this.initThree();
    this.loadModel();
    this.animate();
  }
}