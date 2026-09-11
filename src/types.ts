export interface DatabaseStatus {
  connectedToLiveDB: boolean;
  database_name: string;
  mariadb_version: string;
  character_set_name: string;
  collation_name: string;
  tablesCount: number;
  isReadyForNextTask: boolean;
  protectedDatabases: string[];
  modifiedDatabases: string[];
  queryLogs: QueryLog[];
}

export interface QueryLog {
  timestamp: string;
  query: string;
  status: string;
  message?: string;
  result?: string;
}

export interface SafetyRule {
  id: number;
  rule: string;
  status: string;
  verified: boolean;
}

export interface SafetyAuditData {
  rules: SafetyRule[];
  summary: {
    mariadbVersion: string;
    databaseCreated: string;
    characterSet: string;
    collation: string;
    modifiedDatabasesCount: number;
    modifiedDatabasesList: string[];
    isDatabaseEmptyAndReady: boolean;
  };
}

export interface Learner {
  id: string;
  learnerNo?: string;
  laNumber?: string;
  surname: string;
  firstName: string;
  secondName: string;
  idNumber: string;
  gender?: string;
  center?: string;
  startDate?: string;
  comments: string;
  marks?: number;
  moderatorName?: string;
  moderatorNumber?: string;
  moderationStatus?: string;
  cohort?: string;
  companyEmployeeNo?: string;
  companyGroup?: string;
  otherNumbers?: string;
  matchBasis?: string;
  employeeNumberSource?: string;
  supportingSources?: string;
  reviewNotes?: string;
}

export interface SassetaDocument {
  id: string;
  learnerId?: string;
  learnerNo?: string;
  cohort?: string;
  trainingYear?: string;
  evidenceCategory: string;
  documentType: string;
  originalFilename: string;
  relativePath: string;
  fileExtension: string;
  fileSize: number;
  mimeType: string;
  sha256?: string;
  verificationStatus?: string;
  importDate: string;
}

export interface SassetaScan {
  id: string;
  scanDate: string;
  totalFiles: number;
  matchedFiles: number;
  unmatchedFiles: number;
  errors: number;
  status: string;
}

export interface SassetaStats {
  repositoryStatus: string;
  rootConfigured: boolean;
  learnersFound: number;
  documentsFound: number;
  matchedDocuments: number;
  unmatchedDocuments: number;
  missingDocuments: number;
  duplicateDocuments: number;
  repositoryErrors: number;
  lastScan: string | null;
}

export interface TrainingSchedule {
  id: string;
  unitStandardId: string;
  unitStandardTitle: string;
  credits: string;
  groupName: string;
  month: string;
  activity: string;
  date: string;
  facilitator?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  idNumber: string;
  nationality: string;
  dateOfBirth: string;
  age: number;
  eeStatus: string;
  license: string;
}

export interface WorkplaceScheduleRecord {
  id: string;
  learnerNo: string;
  learnerName: string;
  learnerIdNumber: string;
  learnerUsername: string;
  usId: string;
  unitStandardTitle: string;
  activityType: string;
  week: number;
  scheduledStart: string;
  scheduledEnd: string;
  actualLogin?: string;
  actualLogout?: string;
  evidenceSource?: string;
  evidenceReference?: string;
  verificationStatus: string;
  verifiedBy?: string;
  assessorMentor: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Assessor {
  id: string;
  name: string;
  regNumber: string;
  idNumber: string;
  role: string;
  phone: string;
  email: string;
  center: string;
  unitStandardScope?: string;
  active: number;
  assignedCount?: number;
  verifiedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MentorFile {
  name: string;
  relativePath: string;
  size: number;
  formattedSize: string;
  extension: string;
  mimeType: string;
  category: string;
  lastModified: string;
  sha256?: string;
  previewUrl: string;
}

export interface MentorSlaRecord {
  folderName: string;
  orderNumber: number;
  mentorName: string;
  fileCount: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  lastModified: string;
  categoriesPresent: string[];
  hasMOU: boolean;
  hasPSIRA: boolean;
  hasCertificates: boolean;
  hasLearnerList: boolean;
  hasIDorPassport: boolean;
  files: MentorFile[];
}

export interface MentorsSlaSummary {
  repositoryPath: string;
  totalMentors: number;
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  totalMOUCount: number;
  totalPSIRACount: number;
  totalLearnerListsCount: number;
  categories: { name: string; count: number }[];
}

export type CourseDocumentType = 'file' | 'directory';

export interface CourseDocumentNode {
  name: string;
  title?: string;
  type: CourseDocumentType;
  path: string;
  extension?: string;
  size?: number;
  formattedSize?: string;
  lastModified?: string;
  mimeType?: string;
  friendlyDocType?: string;
  unitStandardId?: string | null;
  unitStandardTitle?: string | null;
  children?: CourseDocumentNode[];
  fileCount?: number;
  directoryCount?: number;
}

export interface CourseDocumentsTreeResponse {
  name: string;
  title?: string;
  type: 'directory';
  rootPath: string;
  totalFiles: number;
  totalDirectories: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  children: CourseDocumentNode[];
  lastScanned: string;
}

export interface CourseDocumentSearchItem {
  name: string;
  title: string;
  path: string;
  folderPath: string;
  extension: string;
  size: number;
  formattedSize: string;
  lastModified: string;
  mimeType: string;
  friendlyDocType: string;
  unitStandardId: string | null;
  unitStandardTitle?: string | null;
}


