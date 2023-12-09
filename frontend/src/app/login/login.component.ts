import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { RegisterUserInformation, UserCredentials } from './auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  logInForm: any;
  registerForm: any;
  loginError: string = '';
  registerError: string = '';

  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar, private authService: AuthService, private router: Router) {
    this.logInForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  logInUser(user: UserCredentials): void {
    this.loginError = '';
    this.authService.login(user.email, user.password).subscribe({
      next: (data) => {
        this.authService.setLoggedInUser(data);
        this.router.navigateByUrl(`/`);
      },
      error: (error) => {
        this.loginError = error['error']['non_field_errors'][0];
      }
    });
  }

  signUpUser(user: RegisterUserInformation): void {
    this.registerError = '';
    this.authService.signup(user).subscribe({
      next: (data) => {
        this.snackBar.open("User registered successfully! Check your email for confirmation.", "Close");
      },
      error: (error) => {
        console.log(error);
        this.registerError = error['error']['message'];
      }
    });
  }

  onLogInSubmit(formData: UserCredentials): void {
    if (this.logInForm.invalid) {
      this.loginError = 'Fill form data';
    }
    else {
      this.logInUser(formData);
    }
  }

  onRegisterSubmit(formData: RegisterUserInformation): void {
    if (this.registerForm.invalid) {
      this.registerError = 'Fill form data';
    }
    else {
      this.signUpUser(formData);
    }
  }
} 
