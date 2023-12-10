import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { UserProfile } from "../profile/user-profile";

@Injectable({
    providedIn: 'root'
})
export class UserProfileService {
    private static profileUri = '/api/users/';
    private static uploadImageUri = '/api/users/upload-image';

    constructor(private http: HttpClient) { }

    getUserProfile(id: string): Observable<UserProfile> {
        return this.http.get<UserProfile>(UserProfileService.profileUri + id);
    }

    updateUserProfile(data: UserProfile): Observable<UserProfile> {
        return this.http.patch<UserProfile>(UserProfileService.profileUri + data.id + '/', data);
    }

    deleteUserProfile(id: number): Observable<UserProfile> {
        return this.http.delete<UserProfile>(UserProfileService.profileUri + id);
    }

    uploadImage(image: any): Observable<any> {
        return this.http.post<any>(UserProfileService.uploadImageUri, image);
    }

}