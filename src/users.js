import { MongoClient } from "mongodb";

class Users {
    constructor() {
        this.db = {};
        this.collection = {};
        this.isInit = false;
    }

    async init() {
        try {
            const client = await MongoClient.connect(`mongodb://localhost:27017/`);
            this.db = client.db(`site`);
            this.collection = this.db.collection(`users`);
            this.collection.ensureIndex({ userName: 1 }, { "unique": 1 });
            this.isInit = true;
        } catch (error) {
            if (this.db !== {})
                this.db.close();

            this.isInit = false;
            let err = new Error(`Unable to connect to db`);
            err.original = error;
            throw err;
        }
    }

    async getUser(userName) {
        if (!this.isInit)
            await this.init();
        try {
            return await this.collection.find({ "userName": userName });
        } catch (error) {
            let err = new Error(`${userName} not found`);
            err.original = error;
            throw err;
        }
    }

    async addUser(userName, password) {
        if (!this.isInit)
            await this.init();
        try {
            return await this.collection.update({ userName: userName },
                { $set: { userName: userName, password: password } },
                { "upsert": true });
        } catch (error) {
            let err = new Error(`Unable to add ${userName}`);
            err.original = error;
            throw err;
        }
    }

    async deleteUser(userName) {
        if (!this.isInit)
            await this.init();
        try {
            return await this.collection.remove({ "userName": userName });
        } catch (error) {
            let err = new Error(`Unable to remove ${userName}`);
            err.original = error;
            throw err;
        }
    }
}

export { Users };