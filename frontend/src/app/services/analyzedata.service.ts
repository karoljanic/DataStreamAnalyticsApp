import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AnalyzeDataService {
    static streamsApiUri = 'http://localhost:8000/api/streams';
    static tagsApiUri = 'http://localhost:8000/api/tags';
    static typesApiUri = 'http://localhost:8000/api/types';

    constructor(private http: HttpClient) { }

    getStreams() {
        //const headers = new HttpHeaders({ 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' });

        const headers = new HttpHeaders({
            "Access-Control-Allow-Origin": "*"
        });

        return this.http.get(AnalyzeDataService.streamsApiUri, { headers: headers });
    }

    getTags(streamId: string) {
        return this.http.post(AnalyzeDataService.tagsApiUri, { streamId });
    }

    getTypes(streamId: string) {
        return this.http.post(AnalyzeDataService.typesApiUri, { streamId });
    }
}
