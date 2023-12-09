import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { UserProfile } from "../profile/user-profile";

@Injectable({
    providedIn: 'root'
})
export class UserProfileService {
    private static profileUri = '/api/users/';

    constructor(private http: HttpClient) { }

    getUserProfile(id: string | null): Observable<UserProfile> {
        return this.http.get<UserProfile>(UserProfileService.profileUri + id);
    }

    updateUserProfile(id: string | null, data: UserProfile): Observable<UserProfile> {
        return this.http.put<UserProfile>(UserProfileService.profileUri + id, data);
    }

    deleteUserProfile(id: string | null): Observable<UserProfile> {
        return this.http.delete<UserProfile>(UserProfileService.profileUri + id);
    }

}