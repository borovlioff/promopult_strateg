import { LocalServise } from "../Service/LocalServise";
import { PromoPultAccessService } from "../Service/PromoPultAccessService";
import { UserServise } from "../Service/UserServise";
const input = require("input")


const userService = new UserServise(new LocalServise("user"));
const accessService = new PromoPultAccessService();


async function sigin() {
    const loginAndPassword = await input.text("Login:passoword?") as string;
    const [login, password] = loginAndPassword.split(":");
    return await accessService.getSession({ login, password });
}



(async () => {
    const users = await userService.get({});
   
    if (users.length == 0) {
        let session = await sigin();
        console.log(session);

        if (session) {
            let token = await accessService.getToken(session);
            console.log(token);

            if(typeof token === "string"){
                await userService.add({
                    session,
                    token
                })
            }

        }

    } else {
        const user = users[0];
        if(await accessService.validSession(user.session)){
            console.log(`Status: login`); 
        } else {
            console.log(`Status: Need login`)
        }
            
        
    }
})();



