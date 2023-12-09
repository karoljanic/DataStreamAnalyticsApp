import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.scss']
})
export class ActivationComponent {

  constructor(private authService: AuthService, private activatedRoute: ActivatedRoute) { }

  activate() {
    const uid = this.activatedRoute.snapshot.paramMap.get('uid') as string;
    const token = this.activatedRoute.snapshot.paramMap.get('token') as string;

    this.authService.activate(uid, token).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
