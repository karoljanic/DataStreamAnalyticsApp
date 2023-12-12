import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ChartPoint, Query, Stream, StreamDetail, Tag, Type } from "../data-analyze/sketches";

@Injectable({
    providedIn: 'root'
})
export class AnalyzeDataService {
    private static streamsApiUri = '/api/streams';
    private static tagsApiUri = '/api/tags';
    private static typesApiUri = '/api/types';
    private static processQueryApiUri = '/api/queries/';
    private static queryResultApiUri = '/api/result';
    private static randomQueriesApiUri = '/api/queries/random';

    constructor(private http: HttpClient) { }

    getStreams(): Observable<Stream[]> {
        return this.http.get<Stream[]>(AnalyzeDataService.streamsApiUri);
    }

    getStreamDetail(streamId: number): Observable<StreamDetail[]> {
        return this.http.get<StreamDetail[]>(AnalyzeDataService.streamsApiUri + '/' + streamId);
    }

    processQuery(quervalue: string): Observable<Query> {
        return this.http.post<Query>(AnalyzeDataService.processQueryApiUri, { "tree_form": quervalue });
    }

    getQuery(query: Query, startDate: string, endDate: string, type: number): Observable<ChartPoint[]> {
        return this.http.get<ChartPoint[]>(AnalyzeDataService.queryResultApiUri + '/' + query.id, { params: { "start-date": startDate, "end-date": endDate, "type": type } });
    }

    getRandomQueies(n: number): Observable<Query[]> {
        return this.http.get<Query[]>(AnalyzeDataService.randomQueriesApiUri + '/' + n.toString());
    }
}
