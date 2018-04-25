class Users {
    constructor(collection) {
        this.collection = collection;
        this.collection.createIndex({ username: 1 }, { "unique": true });
    }

    async checkUser(username) {
        try {
            const result = await this.collection.find({ username: username }, { projection: { _id: 0 } });
            return await result.toArray();
        } catch (error) {
            throw new Error(`${username} not found - ${error.message}`);
        }
    }

    async addUser(username, password) {
        try {
            return await this.collection.insert({ username: username, password: password });
        } catch (error) {
            const err = new Error(`Unable to add ${username} - ${error.message}`);
            err.code = error.code;
            throw err;
        }
    }

    async changeUsername(username) {
        try {
            return await this.collection.update(
                { username: username },
                { $set: { username: username } },
                { "upsert": false });
        } catch (error) {
            throw new Error(`Unable to update ${username} - ${error.message}`);
        }
    }

    async changePassword(username, password) {
        try {
            return await this.collection.update(
                { username: username },
                { $set: { password: password } },
                { "upsert": false });
        } catch (error) {
            throw new Error(`Unable to update ${username} - ${error.message}`);
        }
    }

    async deleteUser(username) {
        try {
            return await this.collection.remove({ "username": username });
        } catch (error) {
            throw new Error(`Unable to remove ${username} - ${error.message}`);
        }
    }
}

export { Users };