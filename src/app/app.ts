import { Component, signal } from '@angular/core';
import { LexikAuthTest } from "./lexik-auth-test/lexik-auth-test";

@Component({
  selector: 'app-root',
  imports: [LexikAuthTest],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');

}
