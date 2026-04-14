import { Component } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DashboardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {}
