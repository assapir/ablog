import { MongoClient } from "mongodb";

class Users {
    constructor() {
        this.db = {};
    }

    async init(dbName) {
        try {
            this.db = await MongoClient.connect(`mongodb://localhost:27017/${dbName}`);
        } catch (error) {
            let err = new Error(`Unable to connect to db`);
            err.original = error;
            throw err;
        }
    }
}

export { Users };