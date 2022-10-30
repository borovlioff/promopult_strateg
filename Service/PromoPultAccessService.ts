import axios from "axios";
import { launch } from "puppeteer";
import { UpdateTokenResoponse } from "../types";
import { cookieJsonToString } from "../util/cookieJsonToString";



export class PromoPultAccessService {
    constructor() { }

    async getSession({ login, password }: { login: string, password: string }) {

        const browser = await launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://promopult.ru/user.html');
        await page.waitForSelector('input[name="uname"]');
        await page.type('input[name=uname]', login);
        await page.type('input[name=pass]', password);
        await page.click(`#user_form input[type=submit]`);
        await page.waitForNavigation();
        if (page.url().match(/user.html/g)) {
            return null
        }
        const cookies = cookieJsonToString(await page.cookies())
        return cookies
    }

    async validSession(session: string) {
        try {
            const resp = await axios.get("https://promopult.ru/items.html", {
                headers: {
                    Cookie: session
                }
            });
            if (!resp.request.path.includes("user.html")) {
                return true;
            }
            return false
        } catch (error) {

        }

    }

    async normalizeToken(token: string) {
        return token.replace(/\s(.*)/g, "")
    }

    async getToken(session: string) {
        try {
            if (this.validSession(session)) {
                const resp = await axios.post<UpdateTokenResoponse>("https://promopult.ru/UserInfo/Lb/apiTokenUpdate", {}, {
                    headers: {
                        Cookies: session
                    }
                });
                const token = resp.data;
                return this.normalizeToken(token);
            } else {
                return {
                    message:"Invalid session"
                }
            }

        } catch (error) {
            console.error(error)
        }

    }
}