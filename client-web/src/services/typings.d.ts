// @ts-ignore
/* eslint-disable */

declare namespace API {
  // type Employee = {
  //   name?: string;
  //   avatar?: string;
  //   userid?: string;
  //   email?: string;
  //   signature?: string;
  //   title?: string;
  //   group?: string;
  //   tags?: { key?: string; label?: string }[];
  //   notifyCount?: number;
  //   unreadCount?: number;
  //   country?: string;
  //   access?: string;
  //   geographic?: {
  //     province?: { label?: string; key?: string };
  //     city?: { label?: string; key?: string };
  //   };
  //   address?: string;
  //   phone?: string;
  // };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
  };

  type LoginResult = {
    access: string;
    refresh: string;
  };

  type ErrorResponse = {
    errorCode: number;
    errorMessage?: string;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  interface EmployeeGeneral {
    personalInfo: {
      username: string;
      firstName: string;
      lastName: string;
      gender: 'Male' | 'Female' | 'Other';
      avatar: string;
      dateOfBirth: string | Date;
      maritalStatus: 'Single' | 'Married' | 'Other';
      phoneNumber: string;
      emailAddress: string;
      personalTaxId: string;
      socialInsurrance: string;
      healthInsurrance: string;
    };
    homeAddress: {
      country: string;
      province: string;
      city: string;
      postalCode: string;
      fullAddress: string;
    };
    emergencyContact: {
      fullName: string;
      relationship: 'father' | 'mother' | 'parent' | 'spouse' | 'sibling' | 'friend' | 'other';
      phoneNumber: string;
    };
    bankInfo: {
      bankName: string;
      branch: string;
      accountName: string;
      accountNumber: string;
    };
  }

  interface EmployeeJob {
    jobInfo: {
      joinDate?: string | Date;
      jobTitle?: any;
      employmentType?: any;
      department?: any;
      location?: any;
      skills?: any;
      education?: any;
      license?: any;
      languages?: any;
      supervisor?: Employee;
      probationStartDate?: string | Date;
      probationEndDate?: string | Date;
      contractStartDate?: string | Date;
      contractEndDate?: string | Date;
    };
    jobHistory: {
      [year: string]: [];
    };
  }

  interface EmployeePayroll {
    payCycle: 'monthly' | 'biweekly';
    salary: number;
    effectiveDateFrom: string | Date;
    effectiveDateTo?: string | Date;
  }

  // interface Employee {
  //   id: string;
  //   isActive: boolean;
  //   general: EmployeeGeneral;
  //   job: EmployeeJob;
  //   payroll: EmployeePayroll;
  // }

  interface EmployeeOnCreate {
    id: number;
    user: {
      email: string;
      username: string;
      password: string;
      first_name: string;
      last_name: string;
      is_staff?: boolean;
      is_superuser?: boolean;
    };
    supervisor?: number;
    date_of_birth?: Date;
    gender?: 'Male' | 'Female' | 'Other';
    marital_status?: string;
    street?: string;
    city?: string;
    province?: string;
    home_telephone?: string;
    mobile?: string;
    work_telephone?: string;
    work_email?: string;
  }

  interface EmployeeOnList {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string;
    email: string;
    gender: string;
    department: string;
    location: string;
    job_title: string;
    supervisor: EmployeeOnList;
    is_active: boolean;
  }

  type Manager = Pick<EmployeeOnList, 'id' | 'first_name' | 'last_name' | 'avatar'>;

  interface DepartmentUnit {
    id: number;
    name: string;
    description?: string;
    manager?: number;
    manager_full_name?: string;
    manager_avatar?: string;
    employee_no: number;
    parent: DepartmentUnit['id'];
  }

  interface User {
    id: number;
    is_active: boolean;
    is_staff: boolean;
    username: string;
    password: string;
    confirm_password?: string;
  }

  interface Employee {
    id: number;
    user: User;
    first_name: string;
    last_name: string;
    avatar: string; // Base 64
    email: string;
    gender: 'Male' | 'Female' | 'Other';
    marital_status: 'Single' | 'Married' | 'Divorced' | 'Seperated' | 'Widowed' | 'Other';
    date_of_birth: Date;
    personal_tax_id: string;
    nationality: string;
    phone: string;
    social_insurance: string;
    health_insurance: string;
    role: string;
    permissions: string[];
  }

  interface EmployeeContactInfo {
    owner: number | undefined;
    address: string;
    country: string;
    province: string;
    city: string;
  }

  interface EmployeeEmergencyContact {
    owner: number | undefined;
    fullname: string;
    relationship: 'Father' | 'Mother' | 'Parent' | 'Spouse' | 'Sibling' | 'Friend' | 'Other';
    phone: string;
  }

  interface EmployeeBankInfo {
    bank_name: string;
    account_name: string;
    branch: string;
    account_number: string;
    swift_bic: string;
    iban: string;
  }

  interface WorkShift {
    id: number;
    name: string;
    start_time: moment.Moment | string;
    end_time: moment.Moment | string;
    duration: moment.Duration | string;
  }

  interface JobTitle {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
  }

  interface EmploymentStatus {
    id: number;
    name: string;
  }

  interface Location {
    id: number;
    name: string;
    province: string;
    city: string;
    address: string;
    zipcode: string;
    phone: string;
    fax: string;
    note: string;
    country: number;
  }

  interface Country {
    id: number;
    name: string;
  }

  type User = any;

  type PermissionItem = {
    id: string;
    name: string;
    // access:
    //   | 'no_access'
    //   | 'view_only_global'
    //   | 'view_only_direct_reports'
    //   | 'view_and_edit_global'
    //   | 'view_and_direct_reports';
    access: 'no_access' | 'view_and_edit' | 'view_only';
  };

  // Attendance

  interface RoleItem {
    id: string;
    roleName: string;
    description: string;
    permissions: PermissionItem[];
    permissions: {
      access: 'all_employees' | 'direct_and_indirect' | 'direct_reports';
      permission_items: PermissionItem[];
    };
    members: Employee[];
  }

  interface AllRoles {
    id: string;
    roleName: string;
    description: string;
    permission: {
      access: 'all_employees' | 'direct_reports';
      features: {
        id: string;
        featureName: string;
        description: string;
        isEnabled: boolean;
      }[];
    };
  }
  [];
}
