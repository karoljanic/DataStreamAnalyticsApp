import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { RegisterUserInformation } from './auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: any;
  registerError: string = '';

  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar, private authService: AuthService, private router: Router) {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  signUpUser(user: RegisterUserInformation): void {
    this.registerError = '';
    this.snackBar.open("Registering user...", "Close");
    this.authService.signup(user).subscribe({
      next: (data) => {
        this.snackBar.dismiss();
        this.snackBar.open("User registered successfully! Check your email for confirmation.", "Close");
      },
      error: (error) => {
        this.snackBar.dismiss();
        var message = error['error']['message'];
        this.registerError = message.charAt(0).toUpperCase() + message.slice(1);
      }
    });
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
