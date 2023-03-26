import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'my-signin-page',
  templateUrl: './signin-page.component.html',
  styleUrls: ['./signin-page.component.css'],
})
export class SigninPageComponent implements OnInit, OnDestroy {
  isLoading!: boolean;

  private destroySubscribtions = new Subject();

  signinForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get emailControl() {
    return this.signinForm.controls.email;
  }
  get passwordControl() {
    return this.signinForm.controls.password;
  }

  constructor(private authService: AuthService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroySubscribtions))
      .subscribe((authState) => {
        this.isLoading = authState.isLoading;
      });
  }

  onSignin() {
    if (!this.signinForm.valid) {
      this.signinForm.markAsTouched();
      return;
    }
    this.authService
      .signin(this.emailControl.value, this.passwordControl.value)
      .pipe(takeUntil(this.destroySubscribtions))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroySubscribtions.complete();
  }
}
