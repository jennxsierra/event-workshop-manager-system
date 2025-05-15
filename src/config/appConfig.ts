import { getIPv4 } from '../utils/networkUtils.js';

const PORT = 3000;

const config = {
  name: 'Event & Workshop Management System',
  abbreviation: '[EWMS]',
  port: PORT,
  url: `http://${getIPv4()}:${PORT}`,
};

export default config;