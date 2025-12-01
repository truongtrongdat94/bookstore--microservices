import { JwtPayload } from './index';

declare global {
  namespace Express {
    interface User extends JwtPayload {}
    
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
