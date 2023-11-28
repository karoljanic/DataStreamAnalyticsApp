import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { SampleDataService } from './dashboard.service';


//trzeba wybrać, która opcja będzie łatwiejsza do obsługi
//tworzenie zmiennych żeby móc je później pobrać przez serwis

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  valueswa1: any[] = [];
  valueswr1: any[] = [];
  valuesp1: any[] = [];
  valuessmallest: any[] = [];
  valuesaverage: any[] = [];
  valueshighest: any[] = [];

  constructor(private sampleDataService: SampleDataService) {
    this.valueswa1 = sampleDataService.getValueswa1();
    this.valueswr1 = sampleDataService.getValueswr1();
    this.valuesp1 = sampleDataService.getValuesp1();
    this.valuessmallest = sampleDataService.getValuesmallest();
    this.valuesaverage = sampleDataService.getValuesaverage();
    this.valueshighest = sampleDataService.getValueshighest();
  }


  ngOnInit() {

    new Chart("line-chart", {
      type: 'line',
      data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        datasets: [
          {
            label: "Liczba ofert we Wrocławiu",
            data: this.valueswr1,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(255, 99, 132)',
          },
          {
            label: "Liczba ofert w Warszawie",
            data: this.valueswa1,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(54, 162, 235)',
          },
          {
            label: "Liczba ofert w Poznaniu",
            data: this.valuesp1,
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
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.1)',
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            }
          }
        },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            bodyFont: {
              size: 14
            },
            titleFont: {
              size: 16,
              weight: 'bold',
            }
          },
          legend: {
            labels: {
              font: {
                size: 14,
              }
            }
          }
        }
      }
    }),
      new Chart("line-chart1", {
        type: 'line',
        data: {
          labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          datasets: [
            {
              label: "Liczba ofert o najniższej krajowej",
              data: this.valuessmallest,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 2,
              pointBackgroundColor: 'rgb(255, 99, 132)',
            },
            {
              label: "Liczba ofert z przedziału od 5 do 10 tys.",
              data: this.valuesaverage,
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderWidth: 2,
              pointBackgroundColor: 'rgb(54, 162, 235)',
            },
            {
              label: "Liczba ofert powyżej 10 tysięcy",
              data: this.valueshighest,
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
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0,0,0,0.1)',
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              }
            }
          },
          plugins: {
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.7)',
              bodyFont: {
                size: 14
              },
              titleFont: {
                size: 16,
                weight: 'bold',
              }
            },
            legend: {
              labels: {
                font: {
                  size: 14,
                }
              }
            }
          }
        }
      })
  }
}

// import { Component, OnInit } from '@angular/core';
// import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
// import { Label } from 'chartist';

// @Component({
//   selector: 'app-dashboard',
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css']
// })
// export class DashboardComponent implements OnInit {
//   public lineChartData: ChartDataset[] = [];
//   public lineChartLabels: Label[] = [];
//   public lineChartOptions: ChartOptions = {
//     responsive: true,
//   };
//   public lineChartLegend = true;
//   public lineChartType: ChartType = 'line';
//   public lineChartPlugins = [];

//   constructor() { }

//   ngOnInit(): void {
//     const numberOfCharts = 5;

//     for (let i = 0; i < numberOfCharts; i++) {
//       const data: number[] = [];
//       const labels: Label[] = [];

//       for (let j = 0; j < 10; j++) {
//         data.push(Math.floor(Math.random() * 100));
//         labels.push(`Label ${j}`);
//       }

//       this.lineChartData.push({
//         data,
//         label: `Chart ${i + 1}`,
//         borderWidth: 2,
//         pointRadius: 2,
//         borderColor: `rgba(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},1)`,
//         backgroundColor: 'transparent',
//       });

//       this.lineChartLabels = labels;
//     }
//   }
// }
