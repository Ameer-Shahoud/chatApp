import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'my-signin-page',
  templateUrl: './signin-page.component.html',
  styleUrls: ['./signin-page.component.css'],
})
export class SigninPageComponent implements OnInit {
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

  ngOnInit(): void {}

  onSignin() {
    if (!this.signinForm.valid) {
      this.signinForm.markAsTouched();
      return;
    }
    this.authService.signin(
      this.emailControl.value,
      this.passwordControl.value
    );
  }
}
