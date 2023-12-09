import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { LoggedInUser, RegisterUserInformation } from "../login/auth";
import { LocalStorageService } from "./localstorage.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private static loginAuthUri = '/api/login/';
    private static logoutAuthUri = '/api/logout/';
    private static signupAuthUri = '/api/signup/';
    private static activateAuthUri = '/api/activate/';

    private loggedInUserSource = new BehaviorSubject<LoggedInUser | null>(this.localStorage.get(LocalStorageService.userKey));
    loggedInUser = this.loggedInUserSource.asObservable();

    constructor(private http: HttpClient, private localStorage: LocalStorageService) { }

    login(username: string, password: string): Observable<LoggedInUser> {
        return this.http.post<LoggedInUser>(AuthService.loginAuthUri, { username, password });
    }

    logout(): Observable<LoggedInUser> {
        return this.http.post<LoggedInUser>(AuthService.logoutAuthUri, {});
    }

    signup(userInfo: RegisterUserInformation): Observable<LoggedInUser> {
        return this.http.post<LoggedInUser>(AuthService.signupAuthUri, userInfo);
    }

    activate(uid: string, token: string): Observable<any> {
        return this.http.post<any>(AuthService.activateAuthUri, { uid, token });
    }

    setLoggedInUser(user: LoggedInUser): void {
        if (this.localStorage.get(LocalStorageService.userKey) !== JSON.stringify(user)) {
            this.localStorage.store(LocalStorageService.userKey, JSON.stringify(user));
        }
        this.loggedInUserSource.next(user);
    }

    setLoggedOutUser(): void {
        this.localStorage.clear(LocalStorageService.userKey);
        this.loggedInUserSource.next(null);
    }
}