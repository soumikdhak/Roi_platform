import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { connectDB } from './dataBase/index.js';
import { app } from './app.js';

const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Welcome to the backend server!');
});

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Application is running at http://localhost:${port}`);
        });

        return import('./cron.js');
    })
    .catch((err) => {
        console.log(`Database Connection failed : ${err}`);
    });