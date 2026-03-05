import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Cockpit } from './shared/components/cockpit/cockpit';

@Component({
  selector: 'app-root',
  imports: [Header, Cockpit, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor(public router: Router) {}
}
