import { AfterViewInit, Component } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { AnalyzeDataService } from '../services/analyzedata.service';
import { ChartPoint, Query } from '../data-analyze/sketches';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements AfterViewInit {

  queries: Query[] = [];
  charts: { id: number, tree: any, points: ChartPoint[], title: string, description: string, chart: Chart | undefined }[] = [];

  constructor(private analyzeDataService: AnalyzeDataService) { }

  ngAfterViewInit() {
    this.analyzeDataService.getRandomQueies(5).subscribe({
      next: (data) => {
        this.queries = data;
        for (const query of this.queries) {
          this.analyzeDataService.getQuery(query, '2024-01-01', '2024-01-31', 1).subscribe({
            next: (data) => {
              this.charts.push({ id: query.id, tree: query.tree_form, title: query.title, description: query.description, points: data, chart: undefined });
              setTimeout(() => this.generateChart(query.id), 200);
            },
            error: (error) => { }
          });
        }
      },
      error: (error) => { }
    });
  }


  private generateChart(id: number): void {
    var chart = this.charts.find((chart) => chart.id === id)!.chart;
    const treeForm = this.charts.find((chart) => chart.id === id)!.tree;
    const title = this.charts.find((chart) => chart.id === id)!.title;
    const description = this.charts.find((chart) => chart.id === id)!.description;
    const points = this.charts.find((chart) => chart.id === id)!.points;
    const chartDatas = points.map((point: ChartPoint) => point.day);
    const chartValues = points.map((point: ChartPoint) => point.value);

    if (chart === undefined) {
      chart = new Chart(id.toString(), {
        type: 'line',
        data: {
          labels: chartDatas,
          datasets: [{ data: chartValues }],
        },
        options: {
          maintainAspectRatio: true,
          aspectRatio: 2,
          responsive: false,
          scales: {
            y: { beginAtZero: true },
            x: {}
          },
          plugins: {
            legend: { display: false },
            title: { display: true, text: title, font: { size: 20, family: 'Raleway' } }
          }
        }
      });
    }
    else {
      chart.data.labels = chartDatas;
      chart.data.datasets[0] = { data: chartValues };
    }
  }

  private getChartTitle(tree: any): string {
    // TODO
    return "";
  }
}


// import { Component, OnInit } from '@angular/core';
// import { Chart } from 'chart.js/auto';
// import { SampleDataService } from './dashboard.service';

// @Component({
//   selector: 'app-dashboard',
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.scss']
// })

// export class DashboardComponent implements OnInit {

//   valueswa1: any[] = [];
//   valueswr1: any[] = [];
//   valuesp1: any[] = [];
//   valuessmallest: any[] = [];
//   valuesaverage: any[] = [];
//   valueshighest: any[] = [];

//   constructor(private sampleDataService: SampleDataService) {
//     this.valueswa1 = sampleDataService.getValueswa1();
//     this.valueswr1 = sampleDataService.getValueswr1();
//     this.valuesp1 = sampleDataService.getValuesp1();
//     this.valuessmallest = sampleDataService.getValuesmallest();
//     this.valuesaverage = sampleDataService.getValuesaverage();
//     this.valueshighest = sampleDataService.getValueshighest();
//   }


//   ngOnInit() {

//     new Chart("line-chart", {
//       type: 'line',
//       data: {
//         labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
//         datasets: [
//           {
//             label: "Liczba ofert we Wrocławiu",
//             data: this.valueswr1,
//             borderColor: 'rgb(255, 99, 132)',
//             backgroundColor: 'rgba(255, 99, 132, 0.2)',
//             borderWidth: 2,
//             pointBackgroundColor: 'rgb(255, 99, 132)',
//           },
//           {
//             label: "Liczba ofert w Warszawie",
//             data: this.valueswa1,
//             borderColor: 'rgb(54, 162, 235)',
//             backgroundColor: 'rgba(54, 162, 235, 0.2)',
//             borderWidth: 2,
//             pointBackgroundColor: 'rgb(54, 162, 235)',
//           },
//           {
//             label: "Liczba ofert w Poznaniu",
//             data: this.valuesp1,
//             borderColor: 'rgb(200, 80, 150)',
//             backgroundColor: 'rgba(200, 80, 150, 0.2)',
//             borderWidth: 2,
//             pointBackgroundColor: 'rgb(200, 80, 150)',
//           }
//         ]
//       },
//       options: {
//         maintainAspectRatio: false,
//         aspectRatio: 2,
//         responsive: false,
//         scales: {
//           y: {
//             beginAtZero: true,
//             grid: {
//               color: 'rgba(0,0,0,0.1)',
//             }
//           },
//           x: {
//             grid: {
//               color: 'rgba(0, 0, 0, 0.1)',
//             }
//           }
//         },
//         plugins: {
//           tooltip: {
//             backgroundColor: 'rgba(0,0,0,0.7)',
//             bodyFont: {
//               size: 14
//             },
//             titleFont: {
//               size: 16,
//               weight: 'bold',
//             }
//           },
//           legend: {
//             labels: {
//               font: {
//                 size: 14,
//               }
//             }
//           }
//         }
//       }
//     }),
//       new Chart("line-chart1", {
//         type: 'line',
//         data: {
//           labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
//           datasets: [
//             {
//               label: "Liczba ofert o najniższej krajowej",
//               data: this.valuessmallest,
//               borderColor: 'rgb(255, 99, 132)',
//               backgroundColor: 'rgba(255, 99, 132, 0.2)',
//               borderWidth: 2,
//               pointBackgroundColor: 'rgb(255, 99, 132)',
//             },
//             {
//               label: "Liczba ofert z przedziału od 5 do 10 tys.",
//               data: this.valuesaverage,
//               borderColor: 'rgb(54, 162, 235)',
//               backgroundColor: 'rgba(54, 162, 235, 0.2)',
//               borderWidth: 2,
//               pointBackgroundColor: 'rgb(54, 162, 235)',
//             },
//             {
//               label: "Liczba ofert powyżej 10 tysięcy",
//               data: this.valueshighest,
//               borderColor: 'rgb(200, 80, 150)',
//               backgroundColor: 'rgba(200, 80, 150, 0.2)',
//               borderWidth: 2,
//               pointBackgroundColor: 'rgb(200, 80, 150)',
//             }
//           ]
//         },
//         options: {
//           maintainAspectRatio: false,
//           aspectRatio: 2,
//           responsive: false,
//           scales: {
//             y: {
//               beginAtZero: true,
//               grid: {
//                 color: 'rgba(0,0,0,0.1)',
//               }
//             },
//             x: {
//               grid: {
//                 color: 'rgba(0, 0, 0, 0.1)',
//               }
//             }
//           },
//           plugins: {
//             tooltip: {
//               backgroundColor: 'rgba(0,0,0,0.7)',
//               bodyFont: {
//                 size: 14
//               },
//               titleFont: {
//                 size: 16,
//                 weight: 'bold',
//               }
//             },
//             legend: {
//               labels: {
//                 font: {
//                   size: 14,
//                 }
//               }
//             }
//           }
//         }
//       })
//   }
// }

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
