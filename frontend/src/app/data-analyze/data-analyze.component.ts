import { Component } from '@angular/core';
import { AnalyzeDataService } from '../services/analyzedata.service';

@Component({
  selector: 'app-data-analyze',
  templateUrl: './data-analyze.component.html',
  styleUrls: ['./data-analyze.component.scss']
})
export class DataAnalyzeComponent {

  private streams: string[] = [];
  private tags: string[] = [];
  private types: string[] = [];

  constructor(private analyzeDataService: AnalyzeDataService) {
    this.analyzeDataService.getStreams().subscribe((data: any) => {
      this.streams = data;
      console.log(this.streams);
    });
  }
}
