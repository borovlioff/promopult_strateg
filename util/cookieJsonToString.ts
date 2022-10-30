export function cookieJsonToString(cookies: { name:string , value:string}[]) {
    return cookies.map(cookie => (`${cookie.name}=${cookie.value}`)).join("; ");
}