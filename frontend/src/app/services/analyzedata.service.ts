import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AnalyzeDataService {
    private static streamsApiUri = '/api/streams';
    private static tagsApiUri = '/api/tags';
    private static typesApiUri = '/api/types';

    constructor(private http: HttpClient) { }

    getStreams() {
        return this.http.get(AnalyzeDataService.streamsApiUri);
    }

    getTags(streamId: number) {
        return this.http.post(AnalyzeDataService.tagsApiUri, { streamId });
    }

    getTypes(streamId: number) {
        return this.http.post(AnalyzeDataService.typesApiUri, { streamId });
    }
}
