
export enum ComplaintType {
  MISSING_SALARY = 'BELUM_TURUN',
  UNDERPAID_SALARY = 'KURANG_GAJI'
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROSES',
  RESOLVED = 'SELESAI',
  REJECTED = 'DITOLAK',
  ESCALATED = 'ESKALASI'
}

export interface Worker {
  opsId: string;
  fullName: string;
}

export interface BaseComplaint {
  id: string;
  type: ComplaintType;
  status: ComplaintStatus;
  timestamp: string;
  opsId: string;
  fullName: string;
  whatsappNumber: string; // Field baru untuk integrasi chat
  bankAccountNumber: string;
  bankAccountName: string;
  bankName: string;
  period: string;
}

export interface MissingSalaryComplaint extends BaseComplaint {
  alreadyFilledLink: string;
}

export interface UnderpaidSalaryComplaint extends BaseComplaint {
  receivedAmount: string;
  evidenceUrl?: string;
}

export type Complaint = MissingSalaryComplaint | UnderpaidSalaryComplaint;
