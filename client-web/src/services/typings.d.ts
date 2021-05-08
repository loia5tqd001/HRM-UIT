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

  interface EmployeePayroll {
    insurance_policy: string;
    tax_policy: string;
    salary: number;
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

  interface EmployeeJob {
    id: number;
    department: string;
    job_title: string;
    location: string;
    employment_status: string;
    probation_start_date: moment.Moment | string;
    probation_end_date: moment.Moment | string;
    contract_start_date: moment.Moment | string;
    contract_end_date: moment.Moment | string;
    event: string;
    timestamp: moment.Moment | string;
    owner: number;
  }

  interface EmployeeHomeAddress {
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
    id: number;
    bank_name: string;
    account_name: string;
    branch: string;
    account_number: string;
    swift_bic: string;
    iban: string;
    owner?: number;
  }

  // interface EmployeeBankInfo {
  //   bank_name: string;
  //   account_name: string;
  //   branch: string;
  //   account_number: string;
  //   swift_bic: string;
  //   iban: string;
  // }

  interface EmployeeSchedule {
    owner?: number;
    schedule: Schedule | Schedule['name'];
  }

  interface EmployeeAttendance {
    id: number;
    owner: number;
    date: moment.Moment | string;
    actual_work_hours: number;
    actual_hours_modified: boolean;
    actual_hours_modification_note: string | null;
    ot_work_hours: number;
    ot_hours_modified: boolean;
    ot_hours_modification_note: string | null;
    reviewed_by: Employee['id'];
    confirmed_by: Employee['id'];
    status: 'Pending' | 'Approved' | 'Confirmed';
    tracking_data: {
      check_in_time: moment.Moment | string;
      check_in_outside: boolean;
      check_in_note: string | null;
      check_in_lat: number;
      check_in_lng: number;
      check_out_time: moment.Moment | string | null;
      check_out_outside: boolean | null;
      check_out_note: string | null;
      check_out_lat: number | null;
      check_out_lng: number | null;
      location: string | null;
      actual_work_hours: number;
      ot_work_hours: number;
    }[];
  }

  interface CheckInBody {
    check_in_lat: number;
    check_in_lng: number;
    check_in_note?: string;
  }

  interface CheckOutBody {
    check_out_lat: number;
    check_out_lng: number;
    check_out_note?: string;
  }

  interface EditActual {
    actual_work_hours: number;
    actual_hours_modification_note: string;
  }

  interface EditOvertime {
    ot_work_hours: number;
    ot_hours_modification_note: string;
  }

  interface Schedule {
    id: number;
    name: string;
    workdays: {
      day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
      morning_from?: moment.Moment | string | null;
      morning_to?: moment.Moment | string | null;
      afternoon_from?: moment.Moment | string | null;
      afternoon_to?: moment.Moment | string | null;
    }[];
  }

  interface Period {
    id: number;
    start_date: string;
    end_date: string;
  }

  interface JobTitle {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
  }

  interface TaxPlan {
    id: number;
    name: string;
    code: string;
    tax_type: string;
  }

  interface InsurancePlan {
    id: number;
    name: string;
    code: string;
    base_on: string;
    percent_company: number;
    percent_employee: number;
  }

  interface OvertimeType {
    id: number;
    name: string;
    point_rate: number;
  }

  interface Holiday {
    id: number;
    name: string;
    start_date: moment.Moment | string;
    end_date: moment.Moment | string;
  }

  interface TimeOffType {
    id: number;
    name: string;
    description: string;
    is_paid: boolean;
  }

  interface TimeoffRequest {
    id: number;
    owner: Employee;
    start_date: moment.Moment | string;
    end_date: moment.Moment | string;
    time_off_type: string;
    note: string;
    status: 'Pending' | 'Canceled' | 'Approved' | 'Rejected';
    reviewed_by?: number;
  }

  // interface Tracking {
  //   id: number;
  //   type: 'checkin' | 'checkout';
  //   time: moment.Moment;
  //   note: string;
  //   is_ot: boolean;
  //   ot_type: OvertimeType['id'] | undefined; // undefined khi is_ot = false
  //   location: Location['id']; // dựa vô employee.job.location
  //   longitude: number; // location thực tế khi checkin/checkout
  //   latitude: number; // location thực tế khi checkin/checkout
  //   outside_office: boolean;
  // }
  // interface AttendanceDay {
  //   id: number;
  //   date: moment.Moment;
  //   employee: Employee['id'];
  //   hours_work_by_schedule: number; // depends on holidays + schedule of employee
  //   tracking: Tracking[]; // => clock in, clock in location, clock out, clock out location, actual, overtime,
  //   edited_by: Employee['id'];
  //   edited_when: moment.Moment;
  //   edited_to: number; // edit "actual hour" to xx hours
  //   status: 'pending' | 'approved' | 'confirmed';
  // }
  interface AttendanceRecord<Type extends 'AttendanceDay' | 'Tracking' = 'AttendanceDay'> {
    id: number;
    type: Type;
    owner: number;
    date: Type extends 'AttendanceDay' ? moment.Moment : undefined; // undefined when Tracking
    check_in: moment.Moment | undefined;
    check_in_note: string | undefined;
    check_in_location: 'Outside' | Location['name'] | undefined;
    check_out: moment.Moment | undefined;
    check_out_note: string | undefined;
    check_out_location: 'Outside' | Location['name'] | undefined;
    hours_work_by_schedule: number;
    actual_work_hours: number;
    actual_hours_modified: boolean;
    actual_hours_modification_note: string | null;
    ot_work_hours: number;
    ot_hours_modified: boolean;
    ot_hours_modification_note: string | null;
    // deficit: number;
    // overtime: string | number | undefined;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Confirmed' | undefined;
    // edited_by: Employee['id'] | undefined;
    // edited_when: moment.Moment | undefined;
    // edited_to: number | undefined; // edit "actual hour" to xx hours
    children: AttendanceRecord<'Tracking'>[];
  }

  interface AttendanceEmployee {
    id: 1;
    first_name: string;
    last_name: string;
    avatar: string;
    attendance: {
      id: number;
      owner: number;
      date: string | moment.Moment;
      actual_work_hours: number;
      actual_hours_modified: boolean;
      actual_hours_modification_note: string | null;
      ot_work_hours: number;
      ot_hours_modified: boolean;
      ot_hours_modification_note: string | null;
      reviewed_by: number | null;
      confirmed_by: number | null;
      status: 'Pending' | 'Approved' | 'Rejected' | 'Confirmed' | undefined;
    }[];
  }

  interface AppConfig {
    id: number;
    monthly_start_date: number;
  }

  interface CustomField {
    id: number;
    name: string;
    variable_name: string | undefined;
    description: string;
    screen: 'general' | 'job' | 'payroll' | 'dependent';
    required: boolean;
    type: 'text' | 'dropdown' | 'number' | 'email' | 'textarea' | 'checkbox' | 'radio';
    options: string | undefined; // seperated by comma, undefined for text, number, email, textarea;
  }

  interface EmploymentStatus {
    id: number;
    name: string;
  }

  interface JobEvent {
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

    accurate_address: string;
    radius: number;
    allow_outside: boolean;
    lng: number;
    lat: number;
  }

  interface Country {
    id: number;
    name: string;
  }

  interface SystemField {
    id: 1;
    code_name: string;
    name: string;
    description: string;
  }

  interface PayrollTemplate {
    id: number;
    name: string;
    fields: {
      index: number;
      type: 'System Field' | 'Input' | 'Formula';
      display_name: string;
      code_name: string;
      define: string;
    }[];
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
