// src/app.ts
import express, { Request, Response } from 'express';
import 'reflect-metadata';
import { In } from 'typeorm';
import { AppDataSource } from './data-source'; // Adjust the import as needed
import { Home } from './entities/Home'; // Adjust the import as needed
import { HomeUser } from './entities/HomeUser'; // Adjust the import as needed
import { User } from './entities/User'; // Adjust the import as needed

const app = express();
app.use(express.json());

AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');

        // Find all users
        app.get('/user/find-all', async (req, res) => {
            try {
                const users = await AppDataSource.getRepository(User).find();
                console.log('Fetched users:', users);  // Log the raw data
                res.json(users);
            } catch (error) {
                console.error('Error fetching users:', error);
                res.status(500).json({ error: 'Error fetching users' });
            }
        });
        

        // Find all homes by user
        app.get('/home/find-by-user/:userId', async (req, res) => {
            const { userId } = req.params;
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
            const offset = (page - 1) * limit;
        
            try {
                const homes = await AppDataSource.getRepository(Home)
                    .createQueryBuilder('home')
                    .innerJoin('user_home_relationship', 'homeUser', 'homeUser.home_id = home.id')
                    .where('homeUser.username = :userId', { userId })
                    .skip(offset)
                    .take(limit)
                    .getMany();
        
                res.json(homes);
            } catch (error) {
                console.error('Error fetching homes:', error);
                res.status(500).json({ error: 'An error occurred while fetching homes.' });
            }
        });
        
        
        

        // Find all users by home
        app.get('/user/find-by-home/:homeId', async (req, res) => {
            const { homeId } = req.params;
        
            try {
                // Fetch the users associated with the given home ID
                const users = await AppDataSource.getRepository(User)
                    .createQueryBuilder('user')
                    .innerJoin('user_home_relationship', 'relationship', 'relationship.username = user.username')
                    .where('relationship.home_id = :homeId', { homeId })
                    .getMany();
        
                res.json(users);
            } catch (error) {
                console.error('Error fetching users:', error);
                res.status(500).json({ error: 'An error occurred while fetching users.' });
            }
        });


// Update user details
app.put('/user/update-details', async (req: Request, res: Response) => {
    const { id, username, email } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }
    if (!username && !email) {
        return res.status(400).json({ error: 'Either username or email must be provided for update.' });
    }

    const userRepository = AppDataSource.getRepository(User);

    // Start a transaction
    await AppDataSource.manager.transaction(async transactionalEntityManager => {
        try {
            // Check if the user exists
            const user = await transactionalEntityManager.findOne(User, {
                where: { id }
            });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const oldUsername = user.username;
            
            // If username is being updated, check if it's already taken
            if (username && username !== oldUsername) {
                const existingUser = await transactionalEntityManager.findOne(User, {
                    where: { username }
                });
                if (existingUser) {
                    return res.status(409).json({ error: 'Username already taken.' });
                }

                // Disable foreign key checks
                await transactionalEntityManager.query('SET FOREIGN_KEY_CHECKS = 0');

                // Update the user table
                await transactionalEntityManager.update(User, id, { username });

                // Update the user_home_relationship table
                await transactionalEntityManager.query(
                    'UPDATE user_home_relationship SET username = ? WHERE username = ?',
                    [username, oldUsername]
                );

                // Re-enable foreign key checks
                await transactionalEntityManager.query('SET FOREIGN_KEY_CHECKS = 1');
            }

            // Update email if provided
            if (email && email !== user.email) {
                await transactionalEntityManager.update(User, id, { email });
            }

            // Fetch the updated user
            const updatedUser = await transactionalEntityManager.findOne(User, {
                where: { id }
            });
            res.json(updatedUser);
        } catch (error) {
            console.error('Error updating user details:', error);
            // Handle unique constraint violation
            if (error instanceof Error && error.message.includes('ER_DUP_ENTRY')) {
                return res.status(409).json({ error: 'Email already exists.' });
            }
            throw error; // Re-throw the error to trigger a transaction rollback
        }
    }).catch(error => {
        console.error('Transaction failed:', error);
        res.status(500).json({ error: 'An error occurred while updating user details.' });
    });
});

        

        // Update users in a home

// Endpoint to update users in a home
app.put('/home/update-users', async (req, res) => {
    const { homeId, usernames } = req.body;

    if (!homeId || !Array.isArray(usernames) || usernames.length === 0) {
        return res.status(400).json({
            error: 'Home ID and an array of usernames are required.'
        });
    }

    try {
        const homeRepository = AppDataSource.getRepository(Home);
        const userRepository = AppDataSource.getRepository(User);
        const homeUserRepository = AppDataSource.getRepository(HomeUser);

        // Check if the home exists
        const home = await homeRepository.findOne({
            where: { id: homeId }
        });

        if (!home) {
            return res.status(404).json({
                error: 'Home not found.'
            });
        }

        // Fetch users by username
        const users = await userRepository.find({
            where: { username: In(usernames) }
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
        await homeUserRepository.delete({
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
        await homeUserRepository.save(newHomeUsers);

        // Fetch and return the updated home
        const updatedHome = await homeRepository.findOne({
            where: { id: homeId },
            relations: ['homeUsers', 'homeUsers.user']
        });

        res.json(updatedHome);
    } catch (error) {
        console.error('Error updating users:', error);
        if (error instanceof Error) {
            res.status(500).json({
                error: 'An internal error occurred',
                details: error.message
            });
        } else {
            res.status(500).json({
                error: 'An unknown error occurred'
            });
        }
    }
});

        
        
        

            

        app.listen(3001, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((err) => {
        console.error('Error during Data Source initialization', err);
    });
