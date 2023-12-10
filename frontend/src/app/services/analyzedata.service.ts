import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Stream, Tag, Type } from "../data-analyze/sketches";

@Injectable({
    providedIn: 'root'
})
export class AnalyzeDataService {
    private static streamsApiUri = '/api/streams';
    private static tagsApiUri = '/api/tags';
    private static typesApiUri = '/api/types';

    constructor(private http: HttpClient) { }

    getStreams(): Observable<Stream[]> {
        //return this.http.get<Stream[]>(AnalyzeDataService.streamsApiUri);

        const streams: Stream[] = [
            { id: 1, name: 'Stream 1' },
            { id: 2, name: 'Stream 2' },
            { id: 3, name: 'Stream 3' }
        ];
        return of(streams);
    }

    getTags(streamId: number): Observable<Tag[]> {
        //return this.http.get<Tag[]>(AnalyzeDataService.tagsApiUri + '/' + streamId);

        const tags: Tag[] = [
            { id: 1, name: 'C++', category: 'Technology' },
            { id: 2, name: 'Java', category: 'Technology' },
            { id: 3, name: 'Rust', category: 'Technology' },
            { id: 4, name: 'Angular', category: 'Technology' },
            { id: 5, name: 'Andorid', category: 'Technology' },
            { id: 6, name: 'Wroclaw', category: 'Location' },
            { id: 7, name: 'Warszawa', category: 'Location' },
            { id: 8, name: 'Gliwice', category: 'Location' },
            { id: 9, name: 'Szczecin', category: 'Location' },
            { id: 10, name: 'Owoce', category: 'Other' },
            { id: 11, name: 'L4', category: 'Other' },
            { id: 12, name: 'Ubezpieczenie', category: 'Other' },
            { id: 13, name: 'Pole golfowe', category: 'Other' },
            { id: 14, name: '4 dni pracy', category: 'Other' },
            { id: 15, name: 'Dress Code', category: 'Other' }
        ];
        return of(tags.filter(t => t.id % streamId == 0));
    }

    getTypes(streamId: number): Observable<Type> {
        //return this.http.get<Type>(AnalyzeDataService.typesApiUri + '/' + streamId);

        const types: Type[] = [
            { id: 1, name: '' },    // counting
            { id: 2, name: 'PLN' }, // salary
        ];
        return of(types[streamId % 2]);
    }
}
