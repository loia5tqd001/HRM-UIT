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
            path: '/admin/job/workShift',
            name: 'workShift',
            component: './Admin/Job/WorkShift',
          },
          {
            path: '/admin/job',
            redirect: '/admin/job/jobTitle',
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
            name: 'information',
            component: './Welcome',
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
      {
        path: '/admin/qualification',
        name: 'qualification',
        icon: 'contacts',
        routes: [
          {
            path: '/admin/qualification/skills',
            name: 'skills',
            component: './Welcome',
          },
          {
            path: '/admin/qualification/education',
            name: 'education',
            component: './Welcome',
          },
          {
            path: '/admin/qualification/language',
            name: 'language',
            component: './Welcome',
          },
          {
            path: '/admin/qualification/customFields',
            name: 'customFields',
            component: './Welcome',
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
      { path: '/employee/import', name: 'import', icon: 'import', component: './Welcome' },
      {
        path: '/employee/terminateContract',
        name: 'terminateContract',
        icon: 'pauseCircle',
        component: './Welcome',
      },
      {
        path: '/employee/customFields',
        name: 'customFields',
        icon: 'setting',
        component: './Welcome',
      },
      { path: '/employee/report', name: 'report', icon: 'barChart', component: './Welcome' },
      { path: '/employee/edit/:id', name: 'edit', component: './Employee/Edit', hideInMenu: true },
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
      { path: '/timeOff/list', name: 'list', icon: 'unorderedList', component: './Welcome' },
      { path: '/timeOff/submit', name: 'submit', icon: 'frown', component: './Welcome' },
      {
        path: '/timeOff/configuration',
        name: 'configuration',
        icon: 'setting',
        component: './Welcome',
      },
      {
        path: '/timeOff/entitlement',
        name: 'entitlement',
        icon: 'control',
        component: './Welcome',
      },
      { path: '/timeOff/report', name: 'report', icon: 'barChart', component: './Welcome' },
      {
        path: '/timeOff',
        redirect: '/timeOff/list',
      },
    ],
  },
  {
    path: '/attendance',
    name: 'attendance',
    icon: 'table',
    // access: 'canAdmin',
    routes: [
      { path: '/attendance/checkin', name: 'checkin', icon: 'checkSquare', component: './Welcome' },
      { path: '/attendance/list', name: 'list', icon: 'unorderedList', component: './Welcome' },
      { path: '/attendance/import', name: 'import', icon: 'import', component: './Welcome' },
      {
        path: '/attendance/configuration',
        name: 'configuration',
        icon: 'setting',
        component: './Welcome',
      },
      { path: '/attendance/report', name: 'report', icon: 'barChart', component: './Welcome' },
      {
        path: '/attendance',
        redirect: '/attendance/checkin',
      },
    ],
  },
  {
    name: 'payroll',
    icon: 'calculator',
    path: '/payroll',
    component: './TableList',
    routes: [
      {
        path: '/payroll/configuration',
        name: 'configuration',
        icon: 'setting',
        component: './Welcome',
      },
      {
        path: '/payroll/report',
        name: 'report',
        icon: 'barChart',
        component: './Welcome',
      },
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
