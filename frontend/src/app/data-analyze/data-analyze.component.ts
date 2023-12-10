import { Component, ViewChild } from '@angular/core';
import { AnalyzeDataService } from '../services/analyzedata.service';
import { Stream, Tag, Type } from './sketches';
import { FormControl } from '@angular/forms';
import { RequestCreatorComponent } from './request-creator/request-creator.component';

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

  newOperands: string[] = [];

  constructor(private analyzeDataService: AnalyzeDataService) {
    this.analyzeDataService.getStreams().subscribe((data: any) => {
      this.streams = data.map((stream: Stream) => {
        return { stream: stream, selected: false };
      });
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

      this.analyzeDataService.getTags(stream.stream.id).subscribe((data: any) => {
        const tagsByCategory: Tag[][] = this.divideTagsByCategory(data);
        this.tags = tagsByCategory.map((tags: Tag[]) => {
          const form = new FormControl();
          return { allTags: tags, form: form, selectedTags: [], category: tags[0].category };
        });
      });

      this.analyzeDataService.getTypes(stream.stream.id).subscribe((data: any) => {
        this.types = [data];
      });
    }
  }

  addOperands(tags: Tag[]) {
    this.newOperands = tags.map(t => t.name);
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
}
