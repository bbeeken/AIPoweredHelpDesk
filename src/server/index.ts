import express from '../../express';
import bodyParser from '../../body-parser';
import authRoutes from './routes/auth';
import { config } from './config/environment';

const app = express();
app.use(bodyParser.json());
app.use('/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(config.server.port, () => {
    console.log(`Server running on port ${config.server.port}`);
  });
}

export default app;
