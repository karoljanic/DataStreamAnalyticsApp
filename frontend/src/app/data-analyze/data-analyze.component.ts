import { Component, ViewChild } from '@angular/core';
import { AnalyzeDataService } from '../services/analyzedata.service';
import { ChartPoint, Query, Stream, Tag, Type } from './sketches';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RequestCreatorComponent, RequestNodeType } from './request-creator/request-creator.component';
import Chart from 'chart.js/auto';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-data-analyze',
  templateUrl: './data-analyze.component.html',
  styleUrls: ['./data-analyze.component.scss']
})
export class DataAnalyzeComponent {
  @ViewChild('requestCreatorComponentRef', { static: false }) requestCreator: RequestCreatorComponent | undefined;

  streams: { stream: Stream, selected: boolean }[] = [];
  tags: { allTags: Tag[], form: FormControl, selectedTags: Tag[], category: string }[] = [];
  types: Type[] = [];
  granularities: string[] = ['daily', 'weekly', 'monthly'];

  newOperands: string[] = [];
  queryIsValid: boolean = true;
  showSpinner: boolean = false;
  showChart: boolean = false;

  saveResultForm: FormGroup;
  saveResultFormErrorMessages = '';

  chartPeriod = new FormGroup({
    start: new FormControl<Date | null>(new Date('01/01/2024')),
    end: new FormControl<Date | null>(new Date('01/31/2024')),
  });

  currentChartPoints: ChartPoint[] = [];
  currentChartType: Type | undefined;
  currentChartGranularity: string = 'daily';
  currentChartPeriod: { start: string, end: string } = { start: '2020-01-01', end: '2020-01-31' };
  currentQuery: Query | undefined = undefined;
  chart: Chart | undefined;
  currentChartDatas: string[] = [];
  currentChartValues: number[] = [];

  constructor(private analyzeDataService: AnalyzeDataService, private formBuilder: FormBuilder, private snackBar: MatSnackBar) {
    this.analyzeDataService.getStreams().subscribe((data: any) => {
      this.streams = data.map((stream: Stream) => {
        return { stream: stream, selected: false };
      });
    });

    this.saveResultForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  streamSelected(stream: { stream: Stream, selected: boolean }) {
    if (stream.selected) {
      this.tags = [];
      stream.selected = false;
    }
    else {
      this.streams.forEach(s => s.selected = false);
      stream.selected = true;
      this.requestCreator?.initialize();

      this.analyzeDataService.getStreamDetail(stream.stream.id).subscribe((data: any) => {
        const tagsByCategory: Tag[][] = this.divideTagsByCategory(data.tags);
        this.tags = tagsByCategory.map((tags: Tag[]) => {
          const form = new FormControl();
          return { allTags: tags, form: form, selectedTags: [], category: tags[0].category };
        });
        this.types = data.types;
        this.currentChartType = this.types[0];
      })
    }
  }

  addOperands(tags: Tag[]) {
    this.newOperands = tags.map(t => t.name);
  }

  clearCanvas() {
    this.requestCreator?.initialize();
  }

  visualizeQuery() {
    const query = this.requestCreator?.getQuery();
    const queryIsValid = query !== null && this.checkCompletion(query);

    if (!queryIsValid) {
      this.queryIsValid = false;
      this.showChart = false;
      return;
    }
    else {
      this.queryIsValid = true;
      let queryAsString = JSON.stringify(query);

      for (const tags of this.tags) {
        for (const tag of tags.allTags) {
          queryAsString = queryAsString.replace(tag.name, tag.id.toString())
        }
      }

      //this.showChart = false;
      this.showSpinner = true;

      this.analyzeDataService.processQuery(queryAsString).subscribe((query: Query) => {
        this.currentQuery = query;
        this.showSpinner = false;
        this.generateChart();
      });
    }
  }

  dataTypeChange(type: Type) {
    this.currentChartType = type;
    this.generateChart();
  }

  dataPeriodChange(start: any, end: any) {
    if (start.value === '' || end.value === '') {
      return;
    }

    this.currentChartPeriod = {
      start: this.convertDateFormat(start.value),
      end: this.convertDateFormat(end.value)
    };
    this.generateChart();
  }

  dataGranularityChange(granularity: string) {
    this.currentChartGranularity = granularity;
    this.generateChart();
  }

  save() {
    if (this.saveResultForm.valid) {
      const title = this.saveResultForm.get('title')!.value as string;
      const description = this.saveResultForm.get('description')!.value as string;
      if (title.length < 5) {
        this.saveResultFormErrorMessages = 'Title must be at least 5 characters long.';
      }
      else if (description.length < 10) {
        this.saveResultFormErrorMessages = 'Description must be at least 10 characters long.';
      }
      else if (title.length > 50) {
        this.saveResultFormErrorMessages = 'Title must be at most 50 characters long.';
      }
      else if (description.length > 200) {
        this.saveResultFormErrorMessages = 'Description must be at most 200 characters long.';
      }
      else {
        this.saveResultFormErrorMessages = '';
      }

      this.snackBar.open('Functionality available in next version.', 'Close');
    }
    else {
      this.saveResultFormErrorMessages = 'Title and description are required.';
    }
  }

  private divideTagsByCategory(tags: Tag[]): Tag[][] {
    const divided: { [key: string]: Tag[] } = {};
    tags.forEach((tag) => {
      const category = tag.category;
      if (divided[category]) {
        divided[category].push(tag);
      } else {
        divided[category] = [tag];
      }
    });

    return Object.values(divided);
  }

  private checkCompletion(queryNode: any): boolean {
    if (queryNode.type === RequestNodeType.FUNCTION) {
      if (queryNode.right === 'NULL') {
        return false;
      }
      return this.checkCompletion(queryNode.right);
    }
    else if (queryNode.type === RequestNodeType.OPERAND) {
      return true;
    }
    else if (queryNode.type === RequestNodeType.OPERATOR) {
      if (queryNode.right === 'NULL' || queryNode.left === 'NULL') {
        return false;
      }
      return this.checkCompletion(queryNode.right) && this.checkCompletion(queryNode.left);
    }
    return false;
  }

  private convertDateFormat(date: string): string {
    const dateValues = date.split('/');
    const day = dateValues[1].toString().padStart(2, '0');
    const month = dateValues[0].toString().padStart(2, '0');
    const year = dateValues[2].toString();
    return `${year}-${month}-${day}`;
  }

  private generateChart(): void {
    this.analyzeDataService.getQuery(this.currentQuery!, this.currentChartPeriod.start, this.currentChartPeriod.end, this.currentChartType!.id).subscribe((points: any) => {
      console.log("aaaaaaaaa")
      this.currentChartPoints = points
      this.showChart = true;
      setTimeout(() => {
        this.currentChartDatas = this.currentChartPoints.map((point: ChartPoint) => point.day);
        this.currentChartValues = this.currentChartPoints.map((point: ChartPoint) => point.value);

        if (this.chart === undefined) {
          this.chart = new Chart("result-char", {
            type: 'line',
            data: {
              labels: this.currentChartDatas,
              datasets: [{ data: this.currentChartValues }]
            },
            options: {
              maintainAspectRatio: true,
              aspectRatio: 2,
              responsive: false,
              scales: {
                y: { beginAtZero: true },
                x: {}
              },
              plugins: { legend: { display: false } }
            }
          });
        }
        else {
          this.chart.data.labels = this.currentChartDatas;
          this.chart.data.datasets[0] = { data: this.currentChartValues };
          this.chart.update()
        }
      }, 200); // waiting for contex creation
    });
  }
}
