import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { RegisterUserInformation, UserCredentials } from './auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  logInForm: any;
  registerForm: any;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
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
    this.authService.login(user.email, user.password).subscribe({
      next: (data) => {
        this.authService.setLoggedInUser(data);
        this.router.navigateByUrl(`/`);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  signUpUser(user: RegisterUserInformation): void {
    this.authService.signup(user).subscribe({
      next: (data) => {
        alert("User registered successfully! Check your email for confirmation.");
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  onLogInSubmit(formData: UserCredentials): void {
    if (this.logInForm.invalid) {
      console.log(this.logInForm.errors);
    }
    else {
      this.logInUser(formData);
    }
  }

  onRegisterSubmit(formData: RegisterUserInformation): void {
    if (this.registerForm.invalid) {
      console.log(this.registerForm.errors);
    }
    else {
      this.signUpUser(formData);
    }
  }
} 
