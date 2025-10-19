import { Router } from 'express';
import { User, Post } from '../types';
import fs from 'fs';
import path from 'path';

const router = Router();

const projectRoot = process.cwd();
const pathJSON = path.join(projectRoot, 'data');

const usersJSON = fs.readFileSync(path.join(pathJSON, 'users.json'), 'utf-8');
const parsedUsersJSON = JSON.parse(usersJSON);

const postsJSON = fs.readFileSync(path.join(pathJSON, 'posts.json'), 'utf-8');
const parsedPostsJSON = JSON.parse(postsJSON);

function saveUsers() {
    fs.writeFile(path.join(pathJSON, 'users.json'), JSON.stringify(parsedUsersJSON, null, 2), (err) => {
        if (err) throw err;
    });
}

router.get('/', (req, res) => {
    res.redirect('/users');
});

router.get('/users', (req, res) => {
    let users: User[] = parsedUsersJSON.users;
    res.render('userList', {
        users: users
    });
});

router.post('/users/:user_id', (req, res) => {
    const id = req.params.user_id;
    const { userName, userSurname, userEmail, userBirthDate, userRole, userStatus } = req.body;

    let users: User[] = parsedUsersJSON.users;
    users.forEach(user => {
        if (user.id === id) {
            user.profile.name = userName;
            user.profile.surname = userSurname;
            user.profile.email = userEmail;
            user.profile.birthDate = userBirthDate;
            user.role = userRole;
            user.status = userStatus;
            return;
        }
    });

    saveUsers();
    res.redirect('/users');
});

router.get('/users/:user_id/friends', (req, res) => {
    const id = req.params.user_id;

    let users: User[] = parsedUsersJSON.users;
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).send('Пользователь не найден');
    }

    const userFriends = users.filter(u => user.friends.includes(u.id));

    res.render('userFriends', {
        user: user,
        friends: userFriends
    });
});

router.get('/users/:user_id/posts', (req, res) => {
    const id = req.params.user_id;

    let users: User[] = parsedUsersJSON.users;
    const user = users.find(u => u.id === id);

    let posts: Post[] = parsedPostsJSON.posts;

    if (!user) {
        return res.status(404).send('Пользователь не найден');
    }

    const postsWithAuthors = posts.map(post => {
        const author = users.find(u => u.id === post.authorId);
        return {
            ...post,
            author: author
        };
    });

    const friendsPosts = postsWithAuthors.filter(post => 
        user.friends.includes(post.authorId)
    );

    res.render('userPosts', {
        user: user,
        posts: friendsPosts
    });
});

export default router;