// This file allows default imports from modules that don't have default exports

declare module 'jsonwebtoken' {
  import * as jwt from 'jsonwebtoken';
  export default jwt;
}

declare module 'bcryptjs' {
  import * as bcrypt from 'bcryptjs';
  export default bcrypt;
}

declare module 'crypto' {
  import * as crypto from 'crypto';
  export default crypto;
}

declare module 'nodemailer' {
  import * as nodemailer from 'nodemailer';
  export default nodemailer;
}
