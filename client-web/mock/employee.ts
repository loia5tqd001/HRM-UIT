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
        isActive: true,
        general: {
          personalInfo: {
            username: 'loia5tqd001',
            firstName: 'Nguyen',
            lastName: 'Huynh Loi',
            gender: 'Male',
            avatar:
              'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
            dateOfBirth: '10-10-1999',
            maritalStatus: 'Single',
            phoneNumber: '0961178682',
            emailAddress: 'loia5tqd001@gmail.com',
            personalTaxId: '8676824469',
            socialInsurrance: '-',
            healthInsurrance: '-',
          },
          homeAddress: {
            country: 'Vietnam',
            province: 'Binh Dinh',
            city: 'Hoai An',
            postalCode: '80000',
            fullAddress: 'Phu Khuong, An Tuong Tay, Hoai An, Binh Dinh',
          },
          emergencyContact: {
            fullName: 'Nguyen Minh Man',
            relationship: 'father',
            phoneNumber: '0988988018',
          },
          bankInfo: {
            bankName: 'Viettel Pay',
            branch: 'Chi nhanh Dien Bien Phu',
            accountName: 'NGUYEN HUYNH LOI',
            accountNumber: '1203213291',
          },
        },
        job: {
          jobInfo: {
            joinDate: '28-3-2021',
            jobTitle: {
              id: 1,
              name: 'Developer',
              description: '',
            },
            employmentType: {
              id: 1,
              name: 'Full-time',
              description: '',
            },
            department: {
              id: 1,
              name: 'IT',
              description: '',
            },
            location: {
              id: 1,
              name: 'Ho Chi Minh',
              description: '',
            },
            skills: [
              {
                id: 1,
                name: 'C++',
                description: '',
              },
              {
                id: 2,
                name: 'Javascript',
                description: '',
              },
            ],
            education: [
              {
                id: 1,
                name: 'UIT',
                description: '',
              },
            ],
            license: [],
            languages: [],
            supervisor: undefined,
            probationStartDate: '28-1-2021',
            probationEndDate: '28-5-2021',
            contractStartDate: '28-5-2021',
            contractEndDate: '28-1-2021',
          },
          jobHistory: { '2021': [] },
        },
        payroll: {
          payCycle: 'monthly',
          salary: 10000000,
          effectiveDateFrom: '29-3-2021',
        },
      },
    ] as API.Employee[]);
  },
};
