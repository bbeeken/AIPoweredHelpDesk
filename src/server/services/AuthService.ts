import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import DatabaseService from '../config/database';
import { User, AuthenticatedUser, UserSession } from '../../shared/types/database';
import { config } from '../config/environment';

interface LoginCredentials {
  username: string;
  password: string;
}

interface MicrosoftUserData {
  objectId: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

class AuthService {
  private db = DatabaseService.getInstance();

  async authenticateLocal(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<{ user: AuthenticatedUser; tokens: { accessToken: string; refreshToken: string } }> {
    const users = await this.db.query<User & { Role_Name: string }>(
      `SELECT u.*, r.Role_Name 
       FROM Users u
       LEFT JOIN User_Roles ur ON u.User_ID = ur.User_ID AND ur.Is_Active = 1
       LEFT JOIN Roles r ON ur.Role_ID = r.Role_ID
       WHERE u.Username = ? AND u.Is_Active = 1 AND u.Account_Type = 'Local'`,
      [credentials.username]
    );

    if (!users.length || !users[0].Password_Hash) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];

    if (user.Account_Locked_Until && new Date(user.Account_Locked_Until) > new Date()) {
      throw new Error('Account is locked');
    }

    const isValid = await bcrypt.compare(
      credentials.password,
      user.Password_Hash!
    );
    if (!isValid) {
      await this.incrementFailedAttempts(user.User_ID);
      throw new Error('Invalid credentials');
    }

    await this.resetFailedAttempts(user.User_ID);

    const sessionId = await this.createSession(user.User_ID, ipAddress, userAgent, 'Local');
    const authenticatedUser = await this.buildUserProfile(user, sessionId);

    const tokens = this.generateTokens(authenticatedUser);

    await this.updateLastLogin(user.User_ID);

    return { user: authenticatedUser, tokens };
  }

  async authenticateMicrosoft(microsoftToken: string, ipAddress?: string, userAgent?: string): Promise<{ user: AuthenticatedUser; tokens: { accessToken: string; refreshToken: string } }> {
    const microsoftUser = await this.validateMicrosoftToken(microsoftToken);
    let users = await this.db.query<User & { Role_Name: string }>(
      `SELECT u.*, r.Role_Name 
       FROM Users u
       LEFT JOIN User_Roles ur ON u.User_ID = ur.User_ID AND ur.Is_Active = 1
       LEFT JOIN Roles r ON ur.Role_ID = r.Role_ID
       WHERE u.Microsoft_Object_ID = ? AND u.Is_Active = 1`,
      [microsoftUser.objectId]
    );

    let user: User;
    if (!users.length) {
      user = await this.createMicrosoftUser(microsoftUser);
    } else {
      user = users[0];
    }

    const sessionId = await this.createSession(user.User_ID, ipAddress, userAgent, 'Microsoft');
    const authenticatedUser = await this.buildUserProfile(user, sessionId);
    const tokens = this.generateTokens(authenticatedUser);
    await this.updateLastLogin(user.User_ID);

    return { user: authenticatedUser, tokens };
  }

  private async buildUserProfile(user: User, sessionId: string): Promise<AuthenticatedUser> {
    const roles = await this.db.query<{ Role_Name: string }>(
      `SELECT DISTINCT r.Role_Name
       FROM User_Roles ur
       JOIN Roles r ON ur.Role_ID = r.Role_ID
       WHERE ur.User_ID = ? AND ur.Is_Active = 1`,
      [user.User_ID]
    );

    const permissions = await this.db.query<{ Permission_Name: string }>(
      `SELECT DISTINCT p.Permission_Name
       FROM User_Roles ur
       JOIN Role_Permissions rp ON ur.Role_ID = rp.Role_ID
       JOIN Permissions p ON rp.Permission_ID = p.Permission_ID
       WHERE ur.User_ID = ? AND ur.Is_Active = 1 AND rp.Is_Granted = 1`,
      [user.User_ID]
    );

    const sites = await this.db.query<{ Site_ID: number }>(
      `SELECT DISTINCT ur.Site_ID
       FROM User_Roles ur
       WHERE ur.User_ID = ? AND ur.Is_Active = 1 AND ur.Site_ID IS NOT NULL
       UNION
       SELECT u.Site_ID FROM Users u WHERE u.User_ID = ? AND u.Site_ID IS NOT NULL`,
      [user.User_ID, user.User_ID]
    );

    return {
      userId: user.User_ID,
      username: user.Username,
      email: user.Email,
      displayName: user.Display_Name || `${user.First_Name} ${user.Last_Name}`,
      roles: roles.map(r => r.Role_Name),
      permissions: permissions.map(p => p.Permission_Name),
      sites: sites.map(s => s.Site_ID).filter(Boolean),
      accountType: user.Account_Type,
      sessionId
    };
  }

  private async createSession(userId: number, ipAddress?: string, userAgent?: string, loginMethod?: string): Promise<string> {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.db.execute(
      `INSERT INTO User_Sessions (Session_ID, User_ID, IP_Address, User_Agent, Expires_At, Login_Method)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, userId, ipAddress, userAgent, expiresAt, loginMethod]
    );

    return sessionId;
  }

  private generateTokens(user: AuthenticatedUser): { accessToken: string; refreshToken: string } {
    const tokenPayload = {
      userId: user.userId,
      username: user.username,
      email: user.email,
      roles: user.roles,
      sessionId: user.sessionId
    };

    const accessToken = jwt.sign(tokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
      issuer: 'helpdesk-api',
      audience: 'helpdesk-app'
    });

    const refreshToken = jwt.sign(
      { userId: user.userId, sessionId: user.sessionId },
      config.jwt.refreshSecret,
      {
        expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
        issuer: 'helpdesk-api',
        audience: 'helpdesk-app'
      }
    );

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string): Promise<AuthenticatedUser> {
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    const sessions = await this.db.query<UserSession>(
      `SELECT * FROM User_Sessions 
       WHERE Session_ID = ? AND User_ID = ? AND Is_Active = 1 AND Expires_At > GETDATE()`,
      [decoded.sessionId, decoded.userId]
    );

    if (!sessions.length) {
      throw new Error('Session expired or invalid');
    }

    await this.db.execute(
      `UPDATE User_Sessions SET Last_Activity = GETDATE() WHERE Session_ID = ?`,
      [decoded.sessionId]
    );

    const user = await this.getUserById(decoded.userId);
    return await this.buildUserProfile(user, decoded.sessionId);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;

    const sessions = await this.db.query<UserSession>(
      `SELECT * FROM User_Sessions 
       WHERE Session_ID = ? AND User_ID = ? AND Is_Active = 1 AND Expires_At > GETDATE()`,
      [decoded.sessionId, decoded.userId]
    );

    if (!sessions.length) {
      throw new Error('Session expired');
    }

    const user = await this.getUserById(decoded.userId);
    const authenticatedUser = await this.buildUserProfile(user, decoded.sessionId);

    return this.generateTokens(authenticatedUser);
  }

  async logout(sessionId: string): Promise<void> {
    await this.db.execute(
      `UPDATE User_Sessions SET Is_Active = 0 WHERE Session_ID = ?`,
      [sessionId]
    );
  }

  private async getUserById(userId: number): Promise<User> {
    const users = await this.db.query<User>(
      `SELECT * FROM Users WHERE User_ID = ? AND Is_Active = 1`,
      [userId]
    );

    if (!users.length) {
      throw new Error('User not found');
    }

    return users[0];
  }

  private async incrementFailedAttempts(userId: number): Promise<void> {
    await this.db.execute(
      `UPDATE Users 
       SET Failed_Login_Attempts = Failed_Login_Attempts + 1,
           Account_Locked_Until = CASE 
             WHEN Failed_Login_Attempts >= 4 THEN DATEADD(minute, 30, GETDATE())
             ELSE Account_Locked_Until
           END
       WHERE User_ID = ?`,
      [userId]
    );
  }

  private async resetFailedAttempts(userId: number): Promise<void> {
    await this.db.execute(
      `UPDATE Users 
       SET Failed_Login_Attempts = 0, Account_Locked_Until = NULL
       WHERE User_ID = ?`,
      [userId]
    );
  }

  private async updateLastLogin(userId: number): Promise<void> {
    await this.db.execute(
      `UPDATE Users SET Last_Login_Date = GETDATE() WHERE User_ID = ?`,
      [userId]
    );
  }

  private async validateMicrosoftToken(token: string): Promise<MicrosoftUserData> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to validate Microsoft token');
    }

    const data = await response.json();

    return {
      objectId: data.id,
      email: data.mail || data.userPrincipalName,
      displayName: data.displayName,
      firstName: data.givenName,
      lastName: data.surname
    };
  }

  private async createMicrosoftUser(microsoftUser: MicrosoftUserData): Promise<User> {
    const result = await this.db.execute(
      `INSERT INTO Users (Username, Email, First_Name, Last_Name, Display_Name, Is_Active, Account_Type, Microsoft_Object_ID)
       OUTPUT INSERTED.*
       VALUES (?, ?, ?, ?, ?, 1, 'Microsoft', ?)`,
      [
        microsoftUser.email,
        microsoftUser.email,
        microsoftUser.firstName,
        microsoftUser.lastName,
        microsoftUser.displayName,
        microsoftUser.objectId
      ]
    );

    await this.db.execute(
      `INSERT INTO User_Roles (User_ID, Role_ID, Assigned_By)
       VALUES (?, (SELECT Role_ID FROM Roles WHERE Role_Name = 'End_User'), ?)`,
      [result.recordset[0].User_ID, result.recordset[0].User_ID]
    );

    return result.recordset[0];
  }
}

export default AuthService;
