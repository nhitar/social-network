import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const USERS_FILE_PATH = path.join(__dirname, '../../public/assets/data/users.json');
const POSTS_FILE_PATH = path.join(__dirname, '../../public/assets/data/posts.json');
const MESSAGES_FILE_PATH = path.join(__dirname, '../../public/assets/data/messages.json');

let clients: any[] = [];

function sendEventToAll(data: any) {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

app.get('/api/users', (req, res) => {
  try {
    const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    const usersData = JSON.parse(data);
    res.json(usersData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при чтении данных пользователей' });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const newUser = req.body;
    
    const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    const usersData = JSON.parse(data);
    
    const existingUser = usersData.users.find((user: any) => 
      user.profile.email === newUser.profile.email
    );
    
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с такой почтой уже существует' });
    }
    
    usersData.users.push(newUser);
    
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(usersData, null, 2));
    
    return res.json({ success: true, user: newUser });
    
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка при добавлении пользователя' });
  }
});

app.post('/api/users/:userId/avatar', (req, res) => {
  try {
    const { userId } = req.params;
    const { avatar } = req.body;

    const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    const usersData = JSON.parse(data);

    const currentUser = usersData.users.find((user: any) => 
      user.id === userId
    );

    currentUser.profile.avatar = avatar;

    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(usersData, null, 2));

    return res.json({
      success: true,
      user: currentUser
    });

  } catch (error) {
    return res.status(500).json({ error: 'Ошибка при работе с аватаркой' });
  }
});

app.post('/api/users/:userId/friends', (req, res) => {
  try {
    const { userId } = req.params;
    const { friendId } = req.body;
    
    const usersData = JSON.parse(fs.readFileSync(USERS_FILE_PATH, 'utf8'));
    
    const user = usersData.users.find((u: any) => u.id === userId);
    const friend = usersData.users.find((u: any) => u.id === friendId);
    
    if (!user || !friend) {
      return res.status(404).json({ error: 'User or friend not found' });
    }
    
    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
    }
    
    if (!friend.friends.includes(userId)) {
      friend.friends.push(userId);
    }
    
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(usersData, null, 2));
    
    return res.json({ 
      success: true, 
      user: user,
      friend: friend 
    });
    
  } catch (error) {
    return res.status(500).json({ error: 'Не удалось добавить друга' });
  }
});

app.post('/api/posts', (req, res) => {
  try {
    const newPost = req.body;
    
    const data = fs.readFileSync(POSTS_FILE_PATH, 'utf8');
    const postsData = JSON.parse(data);
    
    postsData.posts.push(newPost);
    
    fs.writeFileSync(POSTS_FILE_PATH, JSON.stringify(postsData, null, 2));

    sendEventToAll({ type: 'NEW_POST', post: newPost });
    
    return res.json({ success: true, post: newPost });
    
  } catch (error) {
    return res.status(500).json({ error: 'Не удалось добавить новость' });
  }
});

app.post('/api/posts/:postId/like', (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    const data = fs.readFileSync(POSTS_FILE_PATH, 'utf8');
    const postsData = JSON.parse(data);
    
    const post = postsData.posts.find((post: any) => post.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }
    
    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }
    
    fs.writeFileSync(POSTS_FILE_PATH, JSON.stringify(postsData, null, 2));
    
    sendEventToAll({ 
      type: 'POST_LIKED', 
      postId: postId,
      likes: post.likes,
      userId: userId,
      liked: likeIndex === -1
    });

    return res.json({ 
      success: true, 
      likes: post.likes,
      liked: likeIndex === -1
    });
    
  } catch (error) {
    return res.status(500).json({ error: 'Не удалось поставить лайк' });
  }
});

app.get('/api/messages', (req, res) => {
  try {
    const data = fs.readFileSync(MESSAGES_FILE_PATH, 'utf8');
    const messagesData = JSON.parse(data);
    res.json(messagesData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка чтения сообщений' });
  }
});

app.post('/api/messages', (req, res) => {
  try {
    const newMessage = req.body;
    
    const data = fs.readFileSync(MESSAGES_FILE_PATH, 'utf8');
    const messagesData = JSON.parse(data);
    
    messagesData.messages.push(newMessage);
    
    fs.writeFileSync(MESSAGES_FILE_PATH, JSON.stringify(messagesData, null, 2));

    sendEventToAll({ type: 'NEW_MESSAGE', message: newMessage });
    
    return res.json({ success: true, message: newMessage });
    
  } catch (error) {
    return res.status(500).json({ error: 'Не удалось отправить сообщение' });
  }
});

app.listen(PORT, () => {});