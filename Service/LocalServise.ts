import { promises as fs} from "fs";

export class LocalServise<T>{
    _data:T;
    fileName:string;
    constructor(
        fileName:string
    ){
        this.fileName = fileName + ".json";
    }

    get data(){
        return this._data;
    }

    set data(newData){
        this._data = newData;
    }

    async read(){
        try {
            let db: Buffer | String = await fs.readFile(this.fileName);
            this._data = JSON.parse(db.toString())
            return this;
        } catch (error) {
            await fs.writeFile(this.fileName, JSON.stringify([]));
            return await this.read();
        }
    }

    async write(){
        try {
            await fs.writeFile(this.fileName, JSON.stringify(this._data));
        } catch (error) {
            console.error(error);
        }
    }
}
