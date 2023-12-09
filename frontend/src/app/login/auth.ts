export interface UserCredentials {
    email: string,
    password: string
}

export interface LoggedInUser {
    user_id: number,
    token: string,
    username: string
}

export interface RegisterUserInformation {
    name: string,
    surname: string,
    email: string,
    password: string,
    confirmPassword: string
}