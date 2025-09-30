import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
})
export class Layout implements OnInit, OnDestroy {
  isMobile = false;
  private currentTheme = 'light';

  private destroyed = new Subject<void>();
  private breakpointObserver = inject(BreakpointObserver);
  private renderer = inject(Renderer2);
  private document: Document = inject(DOCUMENT);

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  }

  ngOnDestroy(){
    this.destroyed.next();
    this.destroyed.complete();
  }

  private setTheme(theme: string): void {
    this.currentTheme = theme;
    this.renderer.setStyle(this.document.body, 'color-scheme', theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  get isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }
}
