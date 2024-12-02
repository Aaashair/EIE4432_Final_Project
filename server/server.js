// server/server.js
import express from 'express';
import path from 'path';
import multer from 'multer';
import session from 'express-session';

// 如果需要使用 __dirname，需要手动构建
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5500; // 您可以选择其他端口

// 中间件，用于解析 JSON 请求体
app.use(express.json());

// 设置静态文件路径
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'SignIn.html'));
});

app.use(
  session({
    secret: 'wbk123456', // 请使用一个安全的秘密密钥
    resave: false,
    saveUninitialized: true,
    // 在生产环境中建议设置为 true，并使用 HTTPS
  })
);

// 导入路由模块，需要添加文件扩展名 .js
import loginRoute from './routes/login.js';
import signupRoute from './routes/signup.js';
import eventsRoute from './routes/events.js';
import bookingRoute from './routes/booking.js'; // 导入预订路由
import usersRoute from './routes/users.js';
import ticketsRoute from './routes/tickets.js'; // 导入票务路由
import profileRoute from './routes/profile.js';

// 使用路由
app.use('/auth', loginRoute);
app.use('/auth', signupRoute);
app.use('/api', eventsRoute);
app.use('/api', bookingRoute); // 使用预订路由
app.use('/auth', usersRoute);
app.use('/api', ticketsRoute); // 使用票务路由
app.use('/auth', profileRoute);

// 使用路由
app.use('/auth', profileRoute);
import { initializeEventsCollection } from './eventdb.js';

(async () => {
  await initializeEventsCollection();
})();

// 错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // 处理 Multer 特有的错误
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
