import { Request, Response } from 'express';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

let access = '';

const getAccess = () => {
  return access;
};

let id = 1000;

export default {
  'GET /api/employees/': async (req: Request, res: Response) => {
    await waitTime(1000);
    res.status(200).send([
      {
        id: '' + id++,
        is_active: true,
        first_name: 'Nguyen',
        last_name: 'Huynh Loi',
        avatar:
          'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        email: 'loia5tqd000@gmail.com',
        gender: 'Male',
        department: 'Department 1',
        location: 'Location 1',
        job_title: 'Job title 1',
        supervisor: 'Supervisor',
      },
    ]);
  },
};
