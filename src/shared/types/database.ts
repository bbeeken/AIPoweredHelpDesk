export interface User {
  User_ID: number;
  Username: string;
  Email: string;
  Password_Hash?: string;
  First_Name: string;
  Last_Name: string;
  Display_Name?: string;
  Phone?: string;
  Department?: string;
  Job_Title?: string;
  Manager_User_ID?: number;
  Site_ID?: number;
  Profile_Picture_URL?: string;
  Is_Active: boolean;
  Account_Type: 'Local' | 'Microsoft';
  Microsoft_Object_ID?: string;
  Last_Login_Date?: Date;
  Password_Last_Changed?: Date;
  Failed_Login_Attempts: number;
  Account_Locked_Until?: Date;
  Must_Change_Password: boolean;
  Two_Factor_Enabled: boolean;
  Two_Factor_Secret?: string;
  Security_Question?: string;
  Security_Answer_Hash?: string;
  Preferences?: string;
  Created_Date: Date;
  Modified_Date: Date;
  Created_By?: number;
  Modified_By?: number;
}

export interface Role {
  Role_ID: number;
  Role_Name: string;
  Role_Description?: string;
  Is_System_Role: boolean;
  Created_Date: Date;
}

export interface UserRole {
  User_Role_ID: number;
  User_ID: number;
  Role_ID: number;
  Site_ID?: number;
  Assigned_Date: Date;
  Assigned_By?: number;
  Is_Active: boolean;
}

export interface Permission {
  Permission_ID: number;
  Permission_Name: string;
  Permission_Description?: string;
  Resource_Type?: string;
  Action_Type?: string;
  Created_Date: Date;
}

export interface TicketMaster {
  Ticket_ID: number;
  Subject?: string;
  Ticket_Body?: string;
  Ticket_Status_ID?: number;
  Contact_User_ID?: number;
  Asset_ID?: number;
  Site_ID?: number;
  Ticket_Category_ID?: number;
  Created_Date: Date;
  Assigned_User_ID?: number;
  Priority_ID?: number;
  Assigned_Vendor_ID?: number;
  Resolution?: string;
  Estimated_Hours?: number;
  Actual_Hours?: number;
  Due_Date?: Date;
  Resolved_Date?: Date;
  Closed_Date?: Date;
  Created_By?: number;
  Modified_By?: number;
  Modified_Date: Date;
}

export interface TicketMasterExpanded {
  Ticket_ID: number;
  Subject?: string;
  Ticket_Body?: string;
  Ticket_Status_ID?: number;
  Ticket_Status_Label?: string;
  Contact_User_ID?: number;
  Contact_Email?: string;
  Contact_Name?: string;
  Contact_Department?: string;
  Asset_ID?: number;
  Asset_Label?: string;
  Site_ID?: number;
  Site_Label?: string;
  Ticket_Category_ID?: number;
  Ticket_Category_Label?: string;
  Created_Date: Date;
  Assigned_User_ID?: number;
  Assigned_Email?: string;
  Assigned_Name?: string;
  Assigned_Department?: string;
  Priority_ID?: number;
  Assigned_Vendor_ID?: number;
  Assigned_Vendor_Name?: string;
  Resolution?: string;
  Priority_Level?: string;
  Due_Date?: Date;
  Resolved_Date?: Date;
  Closed_Date?: Date;
  Estimated_Hours?: number;
  Actual_Hours?: number;
  Created_By_Name?: string;
  Modified_By_Name?: string;
  Modified_Date: Date;
}

export interface TicketMessage {
  ID: number;
  Ticket_ID?: number;
  Message?: string;
  Sender_User_ID?: number;
  DateTimeStamp: Date;
  Is_Internal: boolean;
  Message_Type: string;
  Edited_Date?: Date;
  Edited_By?: number;
  Is_Deleted: boolean;
}

export interface Asset {
  ID: number;
  Label?: string;
  Asset_Category_ID?: number;
  Serial_Number?: string;
  Model?: string;
  Manufacturer?: string;
  Site_ID?: number;
}

export interface Site {
  ID: number;
  Label?: string;
  City?: string;
  State?: string;
}

export interface TicketCategory {
  ID: number;
  Label?: string;
}

export interface TicketStatus {
  ID: number;
  Label?: string;
}

export interface PriorityLevel {
  ID: number;
  Level?: string;
}

export interface Vendor {
  ID: number;
  Name?: string;
  Site_ID?: number;
  Asset_Category_ID?: number;
}

export interface OnCallShift {
  id: number;
  User_ID: number;
  start_time: Date;
  end_time: Date;
  Shift_Type: string;
  Notes?: string;
  Created_Date: Date;
  Created_By?: number;
}

export interface UserSession {
  Session_ID: string;
  User_ID: number;
  IP_Address?: string;
  User_Agent?: string;
  Login_Date: Date;
  Last_Activity: Date;
  Expires_At: Date;
  Is_Active: boolean;
  Login_Method?: string;
  Device_Info?: string;
}

export interface CreateTicketDTO {
  subject: string;
  body: string;
  categoryId?: number;
  priorityId?: number;
  assetId?: number;
  siteId?: number;
  estimatedHours?: number;
  dueDate?: Date;
}

export interface UpdateTicketDTO {
  subject?: string;
  body?: string;
  statusId?: number;
  categoryId?: number;
  priorityId?: number;
  assignedUserId?: number;
  resolution?: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  siteId?: number;
  accountType: 'Local' | 'Microsoft';
  microsoftObjectId?: string;
}

export interface AuthenticatedUser {
  userId: number;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
  permissions: string[];
  sites: number[];
  accountType: 'Local' | 'Microsoft';
  sessionId: string;
}
