import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth/auth.service';

@Component({
  selector: 'my-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn!: boolean;
  displayName!: string;

  destroySubscribtions = new Subject();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroySubscribtions))
      .subscribe((authState) => {
        this.isLoggedIn = authState.isLoggedIn;
        this.displayName = authState.user?.displayName ?? '';
      });
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.destroySubscribtions.complete();
  }
}
