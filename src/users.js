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
            this.collection.ensureIndex({ username: 1 }, { "unique": 1 });
            this.isInit = true;
        } catch (error) {
            if (this.db !== {})
                await this.db.close();

            this.isInit = false;
            let err = new Error(`Unable to connect to db`);
            err.original = error;
            throw err;
        }
    }

    async getUser(username) {
        if (!this.isInit)
            await this.init();
        try {
            return await this.collection.find({ "username": username });
        } catch (error) {
            let err = new Error(`${username} not found`);
            err.original = error;
            throw err;
        }
    }

    async addUser(username, password) {
        if (!this.isInit)
            await this.init();
        try {
            return await this.collection.insert({ username: username, password: password });
        } catch (error) {
            throw new Error(`Unable to add ${username} - ${error.message}`);
        }
    }

    async updateUser(username) {
        if (!this.isInit)
            await this.init();
        try {
            return await this.collection.update({ username: username },
                { $set: { username: username } },
                { "upsert": false });
        } catch (error) {
            let err = new Error(`Unable to update ${username}`);
            err.original = error;
            throw err;
        }
    }

    async deleteUser(username) {
        if (!this.isInit)
            await this.init();
        try {
            return await this.collection.remove({ "username": username });
        } catch (error) {
            let err = new Error(`Unable to remove ${username}`);
            err.original = error;
            throw err;
        }
    }
}

export { Users };