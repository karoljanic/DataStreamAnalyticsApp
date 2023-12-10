import { AfterViewInit, Component } from '@angular/core';
import { AnalyzeDataService } from '../services/analyzedata.service';
import { Stream, Tag, Type } from './sketches';

@Component({
  selector: 'app-data-analyze',
  templateUrl: './data-analyze.component.html',
  styleUrls: ['./data-analyze.component.scss']
})
export class DataAnalyzeComponent {

  streams: Stream[] = [];
  tags: Tag[] = [];
  types: Type[] = [];
  operators: string[] = ['AND', 'OR', 'NOT', 'XOR', 'WITHOUT'];
  operands: string[] = [];

  constructor(private analyzeDataService: AnalyzeDataService) {
    this.analyzeDataService.getStreams().subscribe((data: any) => {
      this.streams = data.results;
    });
  }

  streamSelected(stream: Stream) {
    console.log(stream);
    for (let i = 0; i < 50; i++) {
      this.tags.push({ id: i, name: 'A' + i });
    }
    // this.tags = [{ id: 1, name: 'A' }, { id: 1, name: 'B' }, { id: 1, name: 'C' }, { id: 1, name: 'D' }, { id: 1, name: 'E' }];
    // this.analyzeDataService.getTags(stream.id).subscribe((data: any) => {
    //   this.tags = data.results;
    //   console.log(this.tags);
    // });

    // this.analyzeDataService.getTypes(stream.id).subscribe((data: any) => {
    //   this.types = data.results;
    //   console.log(this.types);
    // });
  }

  tagClicked(tag: Tag) {
    console.log(tag);
  }
}
