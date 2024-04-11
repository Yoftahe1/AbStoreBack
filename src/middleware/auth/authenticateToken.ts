import { expressjwt } from 'express-jwt';

import config from "../../config/index"

const authenticateToken = expressjwt({ secret: config.secretKey, algorithms: ['HS256'] });

export default authenticateToken;
