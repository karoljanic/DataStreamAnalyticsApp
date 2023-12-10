import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, delay, of } from "rxjs";
import { ChartPoint, Stream, Tag, Type } from "../data-analyze/sketches";

@Injectable({
    providedIn: 'root'
})
export class AnalyzeDataService {
    private static streamsApiUri = '/api/streams';
    private static tagsApiUri = '/api/tags';
    private static typesApiUri = '/api/types';
    private static processQueryApiUri = '/api/processquery';
    private static queryApiUri = '/api/query';
    private static randomQueriesApiUri = '/api/randomqueries';

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

    processQuery(quervalue: string): Observable<number> {
        //return this.http.post<number>(AnalyzeDataService.processQueryApiUri, { quervalue: query });

        return of(1).pipe(
            delay(2000)
        );
    }

    getQuery(id: number, startDate: string, endDate: string, granulation: string): Observable<ChartPoint[]> {
        // return this.http.post<ChartPoint[]>(AnalyzeDataService.queryApiUri,
        //     { id: id, startDate: startDate, endDate: endDate, granulation: granulation });

        return of([{ data: 1, value: 1 }, { data: 2, value: 2 }, { data: 3, value: 3 }, { data: 4, value: 4 }, { data: 5, value: 5 }, { data: 6, value: 6 }, { data: 7, value: 7 }, { data: 8, value: 8 }, { data: 9, value: 9 }, { data: 10, value: 10 }, { data: 11, value: 11 }, { data: 12, value: 12 }, { data: 13, value: 13 }, { data: 14, value: 14 }, { data: 15, value: 15 }, { data: 16, value: 16 }, { data: 17, value: 17 }, { data: 18, value: 18 }, { data: 19, value: 19 }, { data: 20, value: 20 }, { data: 21, value: 21 }, { data: 22, value: 22 }, { data: 23, value: 23 }, { data: 24, value: 24 }, { data: 25, value: 25 }, { data: 26, value: 26 }, { data: 27, value: 27 }, { data: 28, value: 28 }, { data: 29, value: 29 }, { data: 30, value: 30 }, { data: 31, value: 31 }, { data: 32, value: 32 }, { data: 33, value: 33 }, { data: 34, value: 34 }, { data: 35, value: 35 }, { data: 36, value: 36 }, { data: 37, value: 37 }, { data: 38, value: 38 }, { data: 39, value: 39 }, { data: 40, value: 40 }, { data: 41, value: 41 }, { data: 42, value: 42 }, { data: 43, value: 43 }, { data: 44, value: 44 }, { data: 45, value: 45 }, { data: 46, value: 46 }, { data: 47, value: 47 }, { data: 48, value: 48 }, { data: 49, value: 49 }, { data: 50, value: 50 }]);
    }

    getRandomQueies(): Observable<number[]> {
        //return this.http.get<number[]>(AnalyzeDataService.randomQueriesApiUri);

        return of([1, 2, 3]);
    }
}
