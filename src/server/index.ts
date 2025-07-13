import express from '../../express';
import bodyParser from '../../body-parser';
import authRoutes from './routes/auth';
import { config } from './config/environment';
import { Request, Response } from 'express';

const app = express();
app.use(bodyParser.json());
app.use('/auth', authRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(config.server.port, () => {
    console.log(`Server running on port ${config.server.port}`);
  });
}

export default app;
