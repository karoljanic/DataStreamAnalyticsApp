import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  ngOnInit() {
      new Chart("line-chart",{
        type:'line',
        data: {
          labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          datasets: [
            {
              label: "Liczba ofert we Wrocławiu",
              data: [13, 16, 21, 28, 32],
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 2,
              pointBackgroundColor: 'rgb(255, 99, 132)',
            },
            {
              label: "Liczba ofert w Warszawie",
              data: [26, 29, 31, 24, 10],
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderWidth: 2,
              pointBackgroundColor: 'rgb(54, 162, 235)',
            },
            {
              label: "Liczba ofert w Poznaniu",
              data: [5, 20, 7, 0, 15],
              borderColor: 'rgb(200, 80, 150)',
              backgroundColor: 'rgba(200, 80, 150, 0.2)',
              borderWidth: 2,
              pointBackgroundColor: 'rgb(200, 80, 150)',
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          aspectRatio: 2,
          responsive: false,
          scales:{
            y:{
              beginAtZero:true,
              grid:{
                color: 'rgba(0,0,0,0.1)',
              }
            },
            x:{
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              }
            }
          },
          plugins:{
            tooltip:{
              backgroundColor: 'rgba(0,0,0,0.7)',
              bodyFont:{
                size:14
              },
              titleFont:{
                size: 16,
                weight: 'bold',
              }
            },
            legend:{
              labels:{
                font:{
                  size: 14,
                }
              }
            }
          }
        }
      }),
      new Chart("line-chart1",{
        type:'line',
        data: {
          labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          datasets: [
            {
              label: "Liczba ofert o najniższej krajowej",
              data: [2, 5, 1, 10, 7],
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 2,
              pointBackgroundColor: 'rgb(255, 99, 132)',
            },
            {
              label: "Liczba ofert z przedziału od 5 do 10 tys.",
              data: [35, 19, 27, 24, 20],
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderWidth: 2,
              pointBackgroundColor: 'rgb(54, 162, 235)',
            },
            {
              label: "Liczba ofert powyżej 10 tysięcy",
              data: [3, 15, 7, 8, 11],
              borderColor: 'rgb(200, 80, 150)',
              backgroundColor: 'rgba(200, 80, 150, 0.2)',
              borderWidth: 2,
              pointBackgroundColor: 'rgb(200, 80, 150)',
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          aspectRatio: 2,
          responsive: false,
          scales:{
            y:{
              beginAtZero:true,
              grid:{
                color: 'rgba(0,0,0,0.1)',
              }
            },
            x:{
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              }
            }
          },
          plugins:{
            tooltip:{
              backgroundColor: 'rgba(0,0,0,0.7)',
              bodyFont:{
                size:14
              },
              titleFont:{
                size: 16,
                weight: 'bold',
              }
            },
            legend:{
              labels:{
                font:{
                  size: 14,
                }
              }
            }
          }
        }
      })
  }
}


