﻿export default [
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
        path: '/account/dashboard',
        name: 'dashboard',
        icon: 'barChart',
        component: './Account/Dashboard',
      },
      {
        path: '/account/profile',
        name: 'profile',
        icon: 'user',
        component: './Account/Profile',
      },
      {
        path: '/account',
        redirect: '/account/dashboard',
      },
    ],
  },
  {
    path: '/message',
    name: 'message',
    icon: 'message',
    component: './Message',
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
            access: 'job.view_jobtitle',
            component: './Admin/Job/JobTitle',
          },
          {
            path: '/admin/job/employmentStatus',
            name: 'employmentStatus',
            access: 'job.view_employmentstatus',
            component: './Admin/Job/EmploymentStatus',
          },
          {
            path: '/admin/job/workSchedule',
            name: 'workSchedule',
            access: 'attendance.view_schedule',
            component: './Admin/Job/WorkSchedule',
          },
          {
            path: '/admin/job/terminationReason',
            name: 'terminationReason',
            access: 'job.view_terminationreason',
            component: './Admin/Job/TerminationReason',
          },
          // {
          //   path: '/admin/job',
          //   redirect: '/admin/job/jobTitle',
          // },
        ],
      },
      {
        path: '/admin/organization',
        name: 'organization',
        icon: 'apartment',
        routes: [
          // {
          //   path: '/admin/organization/information',
          //   name: '__information',
          //   component: './Admin/Organization/Information',
          // },
          {
            path: '/admin/organization/structure',
            name: 'structure',
            access: 'core.view_department',
            component: './Admin/Organization/Structure',
          },
          {
            path: '/admin/organization/location',
            name: 'location',
            access: 'job.view_location',
            component: './Admin/Organization/Location',
          },
          // {
          //   path: '/admin/organization',
          //   redirect: '/admin/organization/structure',
          // },
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
            access: 'payroll.view_taxpolicy',
            component: './Admin/Payroll/TaxPlan',
          },
          {
            path: '/admin/payroll/insurancePlan',
            name: 'insurancePlan',
            access: 'payroll.view_insurancepolicy',
            component: './Admin/Payroll/InsurancePlan',
          },
        ],
      },
      {
        path: '/admin/permission',
        name: 'permission',
        icon: 'key',
        access: 'auth.view_permission',
        component: './Admin/Permission',
      },
      {
        path: '/admin/configuration',
        name: 'configuration',
        icon: 'setting',
        access: 'core.view_applicationconfig',
        component: './Admin/Configuration',
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
    access: 'core.view_employee',
    routes: [
      // { path: '/employee/import', name: '__import', icon: 'import', component: './Welcome' },
      // {
      //   path: '/employee/terminateContract',
      //   name: '__terminateContract',
      //   icon: 'pauseCircle',
      //   component: './Welcome',
      // },
      // {
      //   path: '/employee/customFields',
      //   name: '__customFields',
      //   icon: 'setting',
      //   component: './Employee/CustomField',
      // },
      // { path: '/employee/report', name: '__report', icon: 'barChart', component: './Welcome' },
      {
        path: '/employee/list',
        name: 'list',
        icon: 'unorderedList',
        access: 'core.view_employee',
        component: './Employee/List',
      },
      {
        path: '/employee/list/:id',
        name: 'edit',
        component: './Employee/Edit',
        access: 'core.view_employee',
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
        access: 'attendance.view_attendance',
      },
      {
        path: '/attendance/list/:id',
        component: './Attendance/EmployeeAttendanceDetail',
        name: 'detail',
        access: 'attendance.view_attendance',
        hideInMenu: true,
      },
      // { path: '/attendance/import', name: '__import', icon: 'import', component: './Welcome' },
      {
        path: '/attendance/configuration',
        name: 'configuration',
        icon: 'setting',
        access: 'job.view_location',
        routes: [
          {
            path: '/attendance/configuration/office',
            name: 'office',
            component: './Attendance/Configuration/Office',
            access: 'job.view_location',
          },
          {
            path: '/attendance/configuration/office/:id',
            component: './Attendance/Configuration/OfficeEdit',
            access: 'job.view_location',
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
    access: '/payroll',
    routes: [
      {
        path: '/payroll/payrolls',
        name: 'payrolls',
        icon: 'transaction',
        component: './Payroll/Payrolls/List',
        access: 'payroll.view_payroll',
      },
      {
        path: '/payroll/payrolls/:id',
        component: './Payroll/Payrolls/Detail',
        hideInMenu: true,
        access: 'payroll.view_payslip',
      },
      {
        path: '/payroll/template',
        name: 'template',
        icon: 'profile',
        component: './Payroll/Template/List',
        access: 'payroll.view_salarytemplate',
      },
      {
        path: '/payroll/template/:id',
        component: './Payroll/Template/Detail',
        hideInMenu: true,
        access: 'payroll.view_salarytemplate',
      },

      // {
      //   path: '/payroll/configuration',
      //   name: 'configuration',
      //   icon: 'setting',
      //   routes: [
      //     {
      //       path: '/payroll/configuration/cycle',
      //       name: 'cycle',
      //       component: './Payroll/Configuration/Cycle',
      //     },
      //     {
      //       path: '/payroll/configuration',
      //       redirect: '/payroll/configuration/cycle',
      //     },
      //   ],
      // },
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
