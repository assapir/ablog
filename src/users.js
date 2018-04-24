class Users {
    constructor(collection) {
        this.collection = collection;
    }

    async getUser(username) {
        try {
            return await this.collection.find({ "username": username });
        } catch (error) {
            let err = new Error(`${username} not found`);
            err.original = error;
            throw err;
        }
    }

    async addUser(username, password) {
        try {
            return await this.collection.insert({ username: username, password: password });
        } catch (error) {
            throw new Error(`Unable to add ${username} - ${error.message}`);
        }
    }

    async updateUser(username) {
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