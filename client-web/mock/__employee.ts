import { Request, Response } from 'express';
import { waitTime, getId } from './utils';

export default {
  'GET /api/employees/': async (req: Request, res: Response) => {
    await waitTime(1000);
    res.status(200).send([
      {
        id: '' + getId(),
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
