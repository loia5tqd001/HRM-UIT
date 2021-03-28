import { Request, Response } from 'express';
import sample from 'lodash/sample';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

/**
 * 当前用户的权限，如果为空代表没登录
 * current user access， if is '', user need login
 * 如果是 pro 的预览，默认是有权限的
 */
let access = '';

const getAccess = () => {
  return access;
};

let id = 1000;

const allPermissions = [
  {
    id: 'permission_1',
    name: 'Personal Info',
  },
  {
    id: 'permission_2',
    name: 'Home Address',
  },
  {
    id: 'permission_3',
    name: 'Emergency Contact',
  },
  {
    id: 'permission_4',
    name: 'Job History',
  },
  {
    id: 'permission_5',
    name: 'Contract',
  },
];

// 代码中会兼容本地 service mock 以及部署站点的静态数据
export default {
  'POST /api/auth/login/': async (req: Request, res: Response) => {
    const { password, username } = req.body as API.LoginParams;
    await waitTime(2000);
    const tokens = {
      refresh_token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTYxNjMxMDY2NywianRpIjoiZWNjMzBkMGUyOTZlNDM2ZWE4ZjhhMmUyYzU5NmNjZjkiLCJ1c2VyX2lkIjoxfQ.taEibLy8BAymKFPMiLcVvR6tDH3_9hWyJeEIIt1N2EI',
      access_token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjE2MjI0NTY3LCJqdGkiOiIwMGYxNWFjMmI3YTA0ZDBlODYxMTBkNjgyZGJhMjdmNSIsInVzZXJfaWQiOjF9.iIftObYBJMrEaOBhMaURkS7STD8zM-ZOP6Xz-ca5Xco',
    } as API.LoginResult;

    if (password === 'uit.hrm' && username === 'admin') {
      res.send(tokens);
      access = 'admin';
      return;
    }
    if (password === 'uit.hrm' && username === 'user') {
      res.send(tokens);
      access = 'user';
      return;
    }
    res.status(401).send({
      errorCode: 401,
      errorMessage: 'error.login.incorrectUsernameOrPassword',
    } as API.ErrorResponse);
    access = 'guest';
  },
  'POST /api/auth/refresh/': async (req: Request, res: Response) => {
    await waitTime(2000);
    if (req.body.refresh_token) {
      res.send({
        access_token:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjE2MjI0NTY3LCJqdGkiOiIwMGYxNWFjMmI3YTA0ZDBlODYxMTBkNjgyZGJhMjdmNSIsInVzZXJfaWQiOjF9.iIftObYBJMrEaOBhMaURkS7STD8zM-ZOP6Xz-ca5Xco',
      });
      return;
    }
    res.status(401).send({});
  },
  'GET /api/auth/currentUser/': (req: Request, res: Response) => {
    if (!getAccess()) {
      res.status(401).send({
        errorCode: 401,
        errorMessage: 'error.login.loginFirst',
      });
      return;
    }
    res.send({
      name: 'Loi Nguyen',
      avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      userid: '00000001',
      email: 'antdesign@alipay.com',
      signature: '海纳百川，有容乃大',
      title: '交互专家',
      group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
      tags: [
        {
          key: '0',
          label: '很有想法的',
        },
        {
          key: '1',
          label: '专注设计',
        },
        {
          key: '2',
          label: '辣~',
        },
        {
          key: '3',
          label: '大长腿',
        },
        {
          key: '4',
          label: '川妹子',
        },
        {
          key: '5',
          label: '海纳百川',
        },
      ],
      notifyCount: 12,
      unreadCount: 11,
      country: 'China',
      access: getAccess(),
      geographic: {
        province: {
          label: '浙江省',
          key: '330000',
        },
        city: {
          label: '杭州市',
          key: '330100',
        },
      },
      address: '西湖区工专路 77 号',
      phone: '0752-268888888',
    } as API.CurrentUser);
  },
  'POST /api/auth/currentUser/changePassword/': (req: Request, res: Response) => {},
  'GET /api/auth/users': [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
  ],
  'POST /api/auth/user/': (req: Request, res: Response) => {},
  'GET /api/auth/user/:userid/': (req: Request, res: Response) => {},
  'PUT /api/auth/user/:userid/': (req: Request, res: Response) => {},

  'POST /api/login/account': async (req: Request, res: Response) => {
    const { password, username, type } = req.body;
    await waitTime(2000);
    if (password === 'uit.hrm' && username === 'admin') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
      });
      access = 'admin';
      return;
    }
    if (password === 'uit.hrm' && username === 'user') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'user',
      });
      access = 'user';
      return;
    }
    if (type === 'mobile') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
      });
      access = 'admin';
      return;
    }

    res.send({
      status: 'error',
      type,
      currentAuthority: 'guest',
    });
    access = 'guest';
  },
  'GET /api/login/outLogin': (req: Request, res: Response) => {
    access = '';
    res.send({ data: {}, success: true });
  },
  'POST /api/register': (req: Request, res: Response) => {
    res.send({ status: 'ok', currentAuthority: 'user', success: true });
  },
  'GET /api/500': (req: Request, res: Response) => {
    res.status(500).send({
      timestamp: 1513932555104,
      status: 500,
      error: 'error',
      message: 'error',
      path: '/base/category/list',
    });
  },
  'GET /api/404': (req: Request, res: Response) => {
    res.status(404).send({
      timestamp: 1513932643431,
      status: 404,
      error: 'Not Found',
      message: 'No message available',
      path: '/base/category/list/2121212',
    });
  },
  'GET /api/403': (req: Request, res: Response) => {
    res.status(403).send({
      timestamp: 1513932555104,
      status: 403,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
  'GET /api/401': (req: Request, res: Response) => {
    res.status(401).send({
      timestamp: 1513932555104,
      status: 401,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
  'GET /api/auth/roles/': (req: Request, res: Response) => {
    res.status(200).send(
      ['Admin', 'Employee', 'Supervisor'].map((roleName, index) => ({
        id: index,
        roleName,
        description: roleName + index,
        permissions: {
          access: 'all_employees',
          permission_items: allPermissions.map((it) => ({
            ...it,
            access: sample(['no_access', 'view_and_edit', 'view_only']),
          })),
        },
        members: [{ name: 'Loi' }, { name: 'Long' }],
      })),
    );
  },
  'PUT /api/auth/role/:roleId/': async (req: Request, res: Response) => {
    await waitTime(1000);
    res.status(200).send(req.body);
  },
  'POST /api/auth/role/create/': async (req: Request, res: Response) => {
    await waitTime(1000);
    res.status(201).send({
      id: id++,
      ...req.body,
      members: [],
      permissions: {
        access: 'direct_reports',
        permission_items: allPermissions.map((it) => ({
          ...it,
          access: 'no_access',
        })),
      },
    } as API.RoleItem);
  },
};
