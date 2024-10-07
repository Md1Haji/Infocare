"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const cors_1 = __importDefault(require("cors")); // Import the cors package
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const data_source_1 = require("./data-source"); // Adjust the import as needed
const Home_1 = require("./entities/Home"); // Adjust the import as needed
const HomeUser_1 = require("./entities/HomeUser"); // Adjust the import as needed
const User_1 = require("./entities/User"); // Adjust the import as needed
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Use CORS middleware
app.use((0, cors_1.default)());
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log('Data Source has been initialized!');
    // Find all users
    app.get('/user/find-all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield data_source_1.AppDataSource.getRepository(User_1.User).find();
            console.log('Fetched users:', users); // Log the raw data
            res.json(users);
        }
        catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Error fetching users' });
        }
    }));
    // Find all homes by user
    app.get('/home/find-by-user/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const offset = (page - 1) * limit;
        try {
            const homes = yield data_source_1.AppDataSource.getRepository(Home_1.Home)
                .createQueryBuilder('home')
                .innerJoin('user_home_relationship', 'homeUser', 'homeUser.home_id = home.id')
                .where('homeUser.username = :userId', { userId })
                .skip(offset)
                .take(limit)
                .getMany();
            res.json(homes);
        }
        catch (error) {
            console.error('Error fetching homes:', error);
            res.status(500).json({ error: 'An error occurred while fetching homes.' });
        }
    }));
    // Find all users by home
    app.get('/user/find-by-home/:homeId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { homeId } = req.params;
        try {
            // Fetch the users associated with the given home ID
            const users = yield data_source_1.AppDataSource.getRepository(User_1.User)
                .createQueryBuilder('user')
                .innerJoin('user_home_relationship', 'relationship', 'relationship.username = user.username')
                .where('relationship.home_id = :homeId', { homeId })
                .getMany();
            res.json(users);
        }
        catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'An error occurred while fetching users.' });
        }
    }));
    // Update user details
    app.put('/user/update-details', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id, username, email } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'User ID is required.' });
        }
        if (!username && !email) {
            return res.status(400).json({ error: 'Either username or email must be provided for update.' });
        }
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        // Start a transaction
        yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Check if the user exists
                const user = yield transactionalEntityManager.findOne(User_1.User, {
                    where: { id }
                });
                if (!user) {
                    return res.status(404).json({ error: 'User not found.' });
                }
                const oldUsername = user.username;
                // If username is being updated, check if it's already taken
                if (username && username !== oldUsername) {
                    const existingUser = yield transactionalEntityManager.findOne(User_1.User, {
                        where: { username }
                    });
                    if (existingUser) {
                        return res.status(409).json({ error: 'Username already taken.' });
                    }
                    // Disable foreign key checks
                    yield transactionalEntityManager.query('SET FOREIGN_KEY_CHECKS = 0');
                    // Update the user table
                    yield transactionalEntityManager.update(User_1.User, id, { username });
                    // Update the user_home_relationship table
                    yield transactionalEntityManager.query('UPDATE user_home_relationship SET username = ? WHERE username = ?', [username, oldUsername]);
                    // Re-enable foreign key checks
                    yield transactionalEntityManager.query('SET FOREIGN_KEY_CHECKS = 1');
                }
                // Update email if provided
                if (email && email !== user.email) {
                    yield transactionalEntityManager.update(User_1.User, id, { email });
                }
                // Fetch the updated user
                const updatedUser = yield transactionalEntityManager.findOne(User_1.User, {
                    where: { id }
                });
                res.json(updatedUser);
            }
            catch (error) {
                console.error('Error updating user details:', error);
                // Handle unique constraint violation
                if (error instanceof Error && error.message.includes('ER_DUP_ENTRY')) {
                    return res.status(409).json({ error: 'Email already exists.' });
                }
                throw error; // Re-throw the error to trigger a transaction rollback
            }
        })).catch(error => {
            console.error('Transaction failed:', error);
            res.status(500).json({ error: 'An error occurred while updating user details.' });
        });
    }));
    // Update users in a home
    // Endpoint to update users in a home
    app.put('/home/update-users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { homeId, usernames } = req.body;
        if (!homeId || !Array.isArray(usernames) || usernames.length === 0) {
            return res.status(400).json({
                error: 'Home ID and an array of usernames are required.'
            });
        }
        try {
            const homeRepository = data_source_1.AppDataSource.getRepository(Home_1.Home);
            const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
            const homeUserRepository = data_source_1.AppDataSource.getRepository(HomeUser_1.HomeUser);
            // Check if the home exists
            const home = yield homeRepository.findOne({
                where: { id: homeId }
            });
            if (!home) {
                return res.status(404).json({
                    error: 'Home not found.'
                });
            }
            // Fetch users by username
            const users = yield userRepository.find({
                where: { username: (0, typeorm_1.In)(usernames) }
            });
            // Verify that all usernames exist
            const existingUsernames = users.map(user => user.username);
            const notFoundUsernames = usernames.filter(username => !existingUsernames.includes(username));
            if (notFoundUsernames.length > 0) {
                return res.status(404).json({
                    error: `User(s) with username(s) ${notFoundUsernames.join(', ')} not found.`
                });
            }
            // Remove existing user associations for this home
            yield homeUserRepository.delete({
                homeId: homeId
            });
            // Create new user associations
            const newHomeUsers = users.map(user => {
                return homeUserRepository.create({
                    username: user.username,
                    homeId: home.id
                });
            });
            console.log('New HomeUsers to be saved:', newHomeUsers);
            yield homeUserRepository.save(newHomeUsers);
            // Fetch and return the updated home
            const updatedHome = yield homeRepository.findOne({
                where: { id: homeId },
                relations: ['homeUsers', 'homeUsers.user']
            });
            res.json(updatedHome);
        }
        catch (error) {
            console.error('Error updating users:', error);
            if (error instanceof Error) {
                res.status(500).json({
                    error: 'An internal error occurred',
                    details: error.message
                });
            }
            else {
                res.status(500).json({
                    error: 'An unknown error occurred'
                });
            }
        }
    }));
    app.listen(3001, () => {
        console.log('Server is running on port 3000');
    });
})
    .catch((err) => {
    console.error('Error during Data Source initialization', err);
});
