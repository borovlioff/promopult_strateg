import { IUser } from '../types';
import { LocalServise } from "./LocalServise";

export class UserServise {
    constructor(
        private store = new LocalServise<IUser[]>("user")
    ) {

    }

    async get(params) {
        try {
            await this.store.read()
            const users = this.store.data;
            return users;
        } catch (error) {
            console.error(error)
        }
    }

    async getById(id: number) {
        try {
            await this.store.read()
            const user = this.store.data.filter((user) => user.id == id)[0];
            if (!user) {
                return null
            }
            return user;
        } catch (error) {
            console.error(error)
        }
    }

    async updateById(id, changhes) {
        await this.store.read();
        for (let i = 0; i < this.store.data.length; i++) {
            let user = this.store.data[i];
            if (user.id == id) {
                user = { id, updateDate: new Date(), ...changhes };
            }
        }
        await this.store.write();
    }

    async add(user: IUser) {
        await this.store.read();
        this.store.data.push({ id: this.store.data.length, ...user, creatDate: new Date() });
        await this.store.write()
    }

}