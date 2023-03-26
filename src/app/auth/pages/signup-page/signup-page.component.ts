import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'my-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css'],
})
export class SignupPageComponent implements OnInit, OnDestroy {
  isLoading!: boolean;

  private destroySubscribtions = new Subject();

  signupForm = this.fb.nonNullable.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get displayNameControl() {
    return this.signupForm.controls.displayName;
  }
  get emailControl() {
    return this.signupForm.controls.email;
  }
  get passwordControl() {
    return this.signupForm.controls.password;
  }

  constructor(private authService: AuthService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroySubscribtions))
      .subscribe((authState) => {
        this.isLoading = authState.isLoading;
      });
  }

  onSignup() {
    if (!this.signupForm.valid) {
      this.signupForm.markAsTouched();
      return;
    }
    this.authService
      .signup(
        this.displayNameControl.value,
        this.emailControl.value,
        this.passwordControl.value
      )
      .pipe(takeUntil(this.destroySubscribtions))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroySubscribtions.complete();
  }
}
