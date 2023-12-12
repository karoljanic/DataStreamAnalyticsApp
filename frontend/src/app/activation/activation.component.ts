import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.scss']
})
export class ActivationComponent {

  info: string = '';

  constructor(private authService: AuthService, private activatedRoute: ActivatedRoute) { }

  activate() {
    const uid = this.activatedRoute.snapshot.paramMap.get('uid') as string;
    const token = this.activatedRoute.snapshot.paramMap.get('token') as string;

    this.info = '';
    this.authService.activate(uid, token).subscribe({
      next: (data) => {
        this.info = data.message;
      },
      error: (error) => {
        this.info = error.message;
      }
    });
  }
}
