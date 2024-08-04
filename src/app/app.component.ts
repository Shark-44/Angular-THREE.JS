import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarViewerComponent } from './car-viewer/car-viewer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CarViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'car-viewer';
}
