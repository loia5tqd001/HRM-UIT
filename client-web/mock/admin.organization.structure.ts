import { Request, Response } from 'express';
import sample from 'lodash/sample';
import { waitTime, getId } from './utils';

const first_names = ['Nguyen', 'Dao', 'Phan', 'Tran'];
const last_names = ['Huynh Loi', 'Manh Dung', 'Vu Cuong'];
const avatars = [
  'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
  'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
];
const managers = Array.from({ length: 50 }).map((it, id) => ({
  id: String(id),
  first_name: sample(first_names),
  last_name: sample(last_names),
  avatar: sample(avatars),
}));

const data = [
  {
    id: 1,
    name: 'BOD',
    description: 'Board of Directors',
    manager: sample(managers),
    employee_no: 5,
    parent_id: null,
  },
  {
    id: 2,
    name: 'Phòng ban kinh doanh',
    description: 'Phòng ban kinh doanh',
    manager: sample(managers),
    employee_no: 2,
    parent_id: 1,
  },
  {
    id: 3,
    name: 'Phòng ban marketing',
    description: 'Phòng ban marketing',
    manager: sample(managers),
    employee_no: 2,
    parent_id: 1,
  },
  {
    id: 4,
    name: 'Phòng ban sales',
    description: 'Phòng ban sales',
    manager: sample(managers),
    employee_no: 1,
    parent_id: 1,
  },
  {
    id: 5,
    name: 'Phòng ban IT',
    description: 'Phòng ban IT',
    manager: sample(managers),
    employee_no: 1,
    parent_id: 1,
  },
  {
    id: 6,
    name: 'Team kinh doanh 12',
    description: 'Team kinh doanh 1',
    manager: sample(managers),
    employee_no: 4,
    parent_id: null,
  },
  {
    id: 7,
    name: 'Team kinh doanh 2',
    description: 'Team kinh doanh 22',
    manager: sample(managers),
    employee_no: 5,
    parent_id: 2,
  },
  {
    id: 9,
    name: 'Team kinh doanh 1.234',
    description: 'Team kinh doanh 1.2',
    manager: sample(managers),
    employee_no: 3,
    parent_id: null,
  },
  {
    id: 10,
    name: 'Team marketing 11',
    description: 'Team marketing 1',
    manager: sample(managers),
    employee_no: 2,
    parent_id: null,
  },
  {
    id: 11,
    name: 'Team sales 1',
    description: 'Team sales 1',
    manager: sample(managers),
    employee_no: 4,
    parent_id: 4,
  },
  {
    id: 12,
    name: 'Team IT 12',
    description: 'Team IT 1',
    manager: sample(managers),
    employee_no: 2,
    parent_id: 5,
  },
  {
    id: 13,
    name: 'Team IT 22',
    description: 'Team IT 2',
    manager: sample(managers),
    employee_no: 1,
    parent_id: 5,
  },
  {
    id: 22,
    name: 'Team kinhhhh doanh 1.1',
    description: '12',
    manager: sample(managers),
    employee_no: 1,
    parent_id: 6,
  },
];

export default {
  'GET /api/admin/organization/structure/': async (req: Request, res: Response) => {
    await waitTime(1000);
    res.status(200).send(data);
  },
  'POST /api/admin/organization/structure/': async (req: Request, res: Response) => {
    await waitTime(1000);
    const newItem = {
      id: getId(),
      name: req.body.name,
      description: req.body.description,
      manager: (managers.find((it) => it.id == req.body.manager) as any) as API.Manager,
      employee_no: 1,
      parent_id: +req.body.parent_id,
    } as API.DepartmentUnit;
    data.push(newItem as any);
    res.status(201).send(newItem);
  },
  'GET /api/admin/organization/structure/:id/': async (req: Request, res: Response) => {
    await waitTime(1000);
    const foundItem = data.find((it) => String(it.id) === String(req.params.id));
    res.status(200).send(foundItem);
  },
  'PUT /api/admin/organization/structure/:id/': async (req: Request, res: Response) => {
    await waitTime(1000);
    const foundItemIndex = data.findIndex((it) => String(it.id) === String(req.params.id));
    if (!foundItemIndex) {
      res.sendStatus(400);
      return;
    }
    const updateItem = {
      ...req.body,
      manager: (managers.find((it) => it.id == req.body.manager) as any) as API.Manager,
    } as API.DepartmentUnit;
    data[foundItemIndex] = { ...data[foundItemIndex], ...updateItem } as any;
    res.status(200).send(data[foundItemIndex]);
  },
  'DELETE /api/admin/organization/structure/:id/': async (req: Request, res: Response) => {
    await waitTime(1000);
    const foundItemIndex = data.findIndex((it) => String(it.id) === String(req.params.id));
    const toDeleteItem = data[foundItemIndex];
    if (toDeleteItem?.employee_no > 1) {
      res.sendStatus(400);
      return;
    }
    data.forEach((it) => {
      if (it.parent_id === toDeleteItem.id) {
        it.parent_id = toDeleteItem.parent_id as any;
      }
    });
    data.splice(foundItemIndex, 1);
    res.status(200).send(data);
  },
  'GET /api/admin/managers/': async (req: Request, res: Response) => {
    await waitTime(1000);
    res.status(200).send(managers);
  },
};
