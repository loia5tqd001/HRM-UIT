export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './User/login',
          },
        ],
      },
    ],
  },
  {
    path: '/account',
    name: 'account',
    icon: 'user',
    routes: [
      {
        path: '/account/profile',
        name: 'profile',
        icon: 'user',
        component: './Account/Profile',
      },
      {
        path: '/account',
        redirect: '/account/profile',
      },
    ],
  },
  {
    path: '/message',
    name: 'message',
    icon: 'message',
    routes: [
      {
        path: '/message/conversation',
        name: 'conversation',
        icon: 'comment',
        component: './Message/Conversation',
      },
      {
        path: '/message/conversation/:id',
        icon: 'comment',
        component: './Message/Conversation',
      },
      {
        path: '/message/people',
        name: 'people',
        icon: 'contacts',
        component: './Message/People',
      },
      {
        path: '/message',
        redirect: '/message/conversation',
      },
    ],
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'control',
    // access: 'canAdmin',
    // component: './Welcome',
    // redirect: '/admin/user',
    // component: './Admin/User',
    routes: [
      {
        path: '/admin/job',
        name: 'job',
        icon: 'audit',
        routes: [
          {
            path: '/admin/job/jobTitle',
            name: 'jobTitle',
            component: './Admin/Job/JobTitle',
          },
          {
            path: '/admin/job/employmentStatus',
            name: 'employmentStatus',
            component: './Admin/Job/EmploymentStatus',
          },
          {
            path: '/admin/job/workSchedule',
            name: 'workSchedule',
            component: './Admin/Job/WorkSchedule',
          },
          {
            path: '/admin/job',
            redirect: '/admin/job/jobTitle',
          },
          {
            path: '/admin/job/terminationReason',
            name: 'terminationReason',
            component: './Admin/Job/TerminationReason',
          },
        ],
      },
      {
        path: '/admin/organization',
        name: 'organization',
        icon: 'apartment',
        routes: [
          {
            path: '/admin/organization/information',
            name: '__information',
            component: './Admin/Organization/Information',
          },
          {
            path: '/admin/organization/structure',
            name: 'structure',
            component: './Admin/Organization/Structure',
          },
          {
            path: '/admin/organization/location',
            name: 'location',
            component: './Admin/Organization/Location',
          },
          {
            path: '/admin/organization',
            redirect: '/admin/organization/information',
          },
        ],
      },
      // {
      //   path: '/admin/qualification',
      //   name: 'qualification',
      //   icon: 'contacts',
      //   routes: [
      //     {
      //       path: '/admin/qualification/skills',
      //       name: 'skills',
      //       component: './Welcome',
      //     },
      //     {
      //       path: '/admin/qualification/education',
      //       name: 'education',
      //       component: './Welcome',
      //     },
      //     {
      //       path: '/admin/qualification/language',
      //       name: 'language',
      //       component: './Welcome',
      //     },
      //   ],
      // },
      {
        path: '/admin/payroll',
        name: 'payroll',
        icon: 'moneyCollect',
        routes: [
          {
            path: '/admin/payroll/taxPlan',
            name: 'taxPlan',
            component: './Admin/Payroll/TaxPlan',
          },
          {
            path: '/admin/payroll/insurancePlan',
            name: 'insurancePlan',
            component: './Admin/Payroll/InsurancePlan',
          },
        ],
      },
      {
        path: '/admin/permission',
        name: 'permission',
        icon: 'key',
        component: './Admin/Permission',
      },
      {
        path: '/admin',
        redirect: '/admin/job',
      },
    ],
  },
  {
    path: '/employee',
    name: 'employee',
    icon: 'userSwitch',
    // access: 'canAdmin',
    routes: [
      { path: '/employee/list', name: 'list', icon: 'unorderedList', component: './Employee/List' },
      // { path: '/employee/import', name: '__import', icon: 'import', component: './Welcome' },
      // {
      //   path: '/employee/terminateContract',
      //   name: '__terminateContract',
      //   icon: 'pauseCircle',
      //   component: './Welcome',
      // },
      {
        path: '/employee/customFields',
        name: '__customFields',
        icon: 'setting',
        component: './Employee/CustomField',
      },
      // { path: '/employee/report', name: '__report', icon: 'barChart', component: './Welcome' },
      {
        path: '/employee/edit/:id',
        name: 'edit',
        component: './Employee/Edit',
        hideInMenu: true,
      },
      {
        path: '/employee',
        redirect: '/employee/list',
      },
    ],
  },
  {
    path: '/timeOff',
    name: 'timeOff',
    icon: 'clockCircle',
    // access: 'canAdmin',
    routes: [
      { path: '/timeOff/me', name: 'me', icon: 'frown', component: './Timeoff/MyTimeoff' },
      {
        path: '/timeOff/list',
        name: 'list',
        icon: 'unorderedList',
        component: './Timeoff/EmployeeTimeoff',
      },
      {
        path: '/timeOff/configuration',
        name: 'configuration',
        icon: 'setting',
        routes: [
          {
            path: '/timeOff/configuration/holiday',
            name: 'holiday',
            component: './Timeoff/Configuration/Holiday',
          },
          {
            path: '/timeOff/configuration/timeoffType',
            name: 'timeoffType',
            component: './Timeoff/Configuration/TimeoffType',
          },
          {
            path: '/timeOff/configuration',
            redirect: '/timeOff/configuration/holiday',
          },
        ],
      },
      // { path: '/timeOff/report', name: '__report', icon: 'barChart', component: './Welcome' },
      {
        path: '/timeOff',
        redirect: '/timeOff/me',
      },
    ],
  },
  {
    path: '/attendance',
    name: 'attendance',
    icon: 'schedule',
    // access: 'canAdmin',
    routes: [
      {
        path: '/attendance/me',
        name: 'me',
        icon: 'checkSquare',
        component: './Attendance/MyAttendance',
      },
      {
        path: '/attendance/list',
        name: 'list',
        icon: 'unorderedList',
        component: './Attendance/EmployeeAttendance',
      },
      {
        path: '/attendance/list/:id',
        component: './Attendance/EmployeeAttendanceDetail',
        name: 'detail',
        hideInMenu: true,
      },
      // { path: '/attendance/import', name: '__import', icon: 'import', component: './Welcome' },
      {
        path: '/attendance/configuration',
        name: 'configuration',
        icon: 'setting',
        routes: [
          {
            path: '/attendance/configuration/office',
            name: 'office',
            component: './Attendance/Configuration/Office',
          },
          {
            path: '/attendance/configuration/office/:id',
            component: './Attendance/Configuration/OfficeEdit',
            hideInMenu: true,
          },
          // {
          //   path: '/attendance/configuration/overtimeType',
          //   name: 'overtimeType',
          //   component: './Attendance/Configuration/OvertimeType',
          // },
          {
            path: '/attendance/configuration',
            redirect: '/attendance/configuration/office',
          },
        ],
      },
      // { path: '/attendance/report', name: '__report', icon: 'barChart', component: './Welcome' },
      {
        path: '/attendance',
        redirect: '/attendance/me',
      },
    ],
  },
  {
    name: 'payroll',
    icon: 'calculator',
    path: '/payroll',
    routes: [
      {
        path: '/payroll/template',
        name: 'template',
        icon: 'profile',
        component: './Payroll/Template/List',
      },
      {
        path: '/payroll/template/:id',
        component: './Payroll/Template/Detail',
        hideInMenu: true,
      },
      {
        path: '/payroll/payrolls',
        name: 'payrolls',
        icon: 'transaction',
        component: './Payroll/Payrolls/List',
      },
      {
        path: '/payroll/payrolls/:id',
        component: './Payroll/Payrolls/Detail',
        hideInMenu: true,
      },
      {
        path: '/payroll/configuration',
        name: 'configuration',
        icon: 'setting',
        routes: [
          {
            path: '/payroll/configuration/cycle',
            name: 'cycle',
            component: './Payroll/Configuration/Cycle',
          },
          {
            path: '/payroll/configuration',
            redirect: '/payroll/configuration/cycle',
          },
        ],
      },
      // {
      //   path: '/payroll/report',
      //   name: '__report',
      //   icon: 'barChart',
      //   component: './Welcome',
      // },
      { path: '/payroll', redirect: '/payroll/template' },
    ],
  },
  {
    path: '/',
    redirect: '/account/',
  },
  {
    component: './404',
  },
];
