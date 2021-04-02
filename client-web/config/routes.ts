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
        component: './Welcome',
        hideChildrenInMenu: true,
        routes: [
          {
            path: '/admin/job/jobTitle',
            name: 'jobTitle',
            component: './Welcome',
          },
          {
            path: '/admin/job/employmentStatus',
            name: 'employmentStatus',
            component: './Welcome',
          },
          {
            path: '/admin/job/workShift',
            name: 'workShift',
            component: './Welcome',
          },
          {
            path: '/admin/job/customFields',
            name: 'customFields',
            component: './Welcome',
          },
        ],
      },
      {
        path: '/admin/organization',
        name: 'organization',
        icon: 'apartment',
        hideChildrenInMenu: true,
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
            component: './Welcome',
          },
          {
            path: '/admin/organization',
            redirect: '/admin/organization/structure',
          },
        ],
      },
      {
        path: '/admin/qualification',
        name: 'qualification',
        icon: 'contacts',
        component: './Welcome',
        hideChildrenInMenu: true,
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
      { path: '/employee/add', name: 'add', icon: 'userAdd', component: './Welcome' },
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
    redirect: '/admin/',
  },
  {
    component: './404',
  },
];
