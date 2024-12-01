// server/server.js
import express from 'express';
import path from 'path';

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
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'SignIn.html'));
});

// 导入路由模块，需要添加文件扩展名 .js
import loginRoute from './routes/login.js';
import signupRoute from './routes/signup.js';
import eventsRoute from './routes/events.js';
import bookingRoute from './routes/booking.js'; // 导入预订路由

// 使用路由
app.use('/auth', loginRoute);
app.use('/auth', signupRoute);
app.use('/api', eventsRoute);
app.use('/api', bookingRoute); // 使用预订路由

import { initializeEventsCollection } from './eventdb.js';

(async () => {
  await initializeEventsCollection();
})();

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
