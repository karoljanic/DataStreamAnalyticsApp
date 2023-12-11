import { Component, ViewChild } from '@angular/core';
import { AnalyzeDataService } from '../services/analyzedata.service';
import { ChartPoint, Query, Stream, Tag, Type } from './sketches';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RequestCreatorComponent, RequestNodeType } from './request-creator/request-creator.component';
import Chart from 'chart.js/auto';

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
  showChart: boolean = true;

  saveResultForm: FormGroup;
  saveResultFormErrorMessages = '';

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  chartPoints: ChartPoint[] = [];
  chart: Chart | undefined;

  constructor(private analyzeDataService: AnalyzeDataService, private formBuilder: FormBuilder) {
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

      this.showChart = false;
      this.showSpinner = true;

      this.analyzeDataService.processQuery(queryAsString).subscribe((queryId: Query) => {
        this.analyzeDataService.getQuery(queryId, '2020-01-01', '2020-01-31', 1).subscribe((points: any) => {
          this.chartPoints = points
          this.showSpinner = false;

          this.showChart = true;
          setTimeout(() => { this.generateChart(this.types[0]); }, 200); // waiting for contex creation
        });
      });
    }
  }

  dataTypeChange(type: Type) {
    this.generateChart(type);
  }

  dataGranularityChange(granularity: string) {
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

  private generateChart(type: Type): void {
    const datas: string[] = this.chartPoints.map((point: ChartPoint) => point.day);
    const values: number[] = this.chartPoints.map((point: ChartPoint) => point.value);

    if (this.chart !== undefined) {
      this.chart.destroy();
    }

    this.chart = new Chart("result-char", {
      type: 'line',
      data: {
        labels: datas,
        datasets: [
          {
            data: values,
          },
        ]
      },
      options: {
        maintainAspectRatio: true,
        aspectRatio: 2,
        responsive: false,
        scales: {
          y: { beginAtZero: true },
          x: {}
        },
      }
    });
  }
}
