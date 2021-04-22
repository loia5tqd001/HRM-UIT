import { FormattedMessage } from '@/.umi/plugin-locale/localeExports';
import { __DEV__ } from '@/global';
import { allEmploymentStatuses } from '@/services/admin.job.employmentStatus';
import { allJobEvents } from '@/services/admin.job.jobEvent';
import { allJobTitles } from '@/services/admin.job.jobTitle';
import { allWorkSchedules } from '@/services/admin.job.workSchedule';
import { allLocations } from '@/services/admin.organization.location';
import { allDepartments } from '@/services/admin.organization.structure';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Button, Card, Form, InputNumber, message } from 'antd';
import faker from 'faker';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

type Props = {
  payrolls: API.EmployeeJob[] | undefined;
  payrollSubmit: (value: API.EmployeeJob) => Promise<void>;
};

export const EmployeePayroll: React.FC<Props> = (props) => {
  const { payrolls, payrollSubmit } = props;
  const [departments, setDepartments] = useState<API.DepartmentUnit[]>();
  const [jobTitles, setJobTitles] = useState<API.JobTitle[]>();
  const [workShifts, setWorkShifts] = useState<API.Schedule[]>();
  const [locations, setLocations] = useState<API.Location[]>();
  const [employmentStatuses, setEmploymentStatuses] = useState<API.EmploymentStatus[]>();
  const [jobEvents, setJobEvents] = useState<API.JobEvent[]>();

  useEffect(() => {
    allDepartments().then((fetchData) => setDepartments(fetchData));
    allJobTitles().then((fetchData) => setJobTitles(fetchData));
    allWorkSchedules().then((fetchData) => setWorkShifts(fetchData));
    allLocations().then((fetchData) => setLocations(fetchData));
    allEmploymentStatuses().then((fetchData) => setEmploymentStatuses(fetchData));
    allJobEvents().then((fetchData) => setJobEvents(fetchData));
  }, []);

  const columns: ProColumns<API.EmployeeJob>[] = [
    {
      title: (
        <FormattedMessage id="pages.admin.payroll.column.timestamp" defaultMessage="Timestamp" />
      ),
      dataIndex: 'timestamp',
      renderText: (it) => moment(it).format('YYYY-MM-DD hh:mm:ss'),
    },
    {
      title: <FormattedMessage id="pages.admin.payroll.column.salary" defaultMessage="Salary" />,
      dataIndex: 'salary',
    },
    {
      title: (
        <FormattedMessage id="pages.admin.payroll.column.salaryType" defaultMessage="Salary type" />
      ),
      dataIndex: 'salary_type',
    },
    {
      title: <FormattedMessage id="pages.admin.payroll.column.taxPlan" defaultMessage="Tax plan" />,
      dataIndex: 'tax_plan',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.payroll.column.insurancePlan"
          defaultMessage="Insurance plan"
        />
      ),
      dataIndex: 'insurance_plan',
    },
  ];

  return (
    <>
      <Card loading={payrolls === undefined} title="Payroll info">
        <ProForm<API.EmployeeJob>
          onFinish={async (value) => {
            try {
              await payrollSubmit(value);
              message.success('Updated successfully!');
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
          initialValues={payrolls?.[0]}
          submitter={{
            render: ({ form }, defaultDoms) => {
              return [
                ...defaultDoms,
                __DEV__ && (
                  <Button
                    key="autoFill"
                    onClick={() => {
                      form?.setFieldsValue({
                        salary: faker.random.number({
                          min: 1000000,
                          max: 100000000,
                          precision: -3,
                        }),
                        salary_type: faker.helpers.randomize(['Gross', 'Net']),
                      });
                    }}
                  >
                    Auto fill
                  </Button>
                ),
              ];
            },
          }}
        >
          <ProForm.Group>
            <Form.Item name="salary" label="Salary" rules={[{ required: true }]}>
              <InputNumber
                style={{ width: 440 }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value?.replace(/\D+/g, ''))}
                placeholder="1,000,000"
              />
            </Form.Item>
            <ProFormSelect
              name="salary_type"
              width="lg"
              label="Salary type"
              options={[
                { value: 'Gross', label: 'Gross' },
                { value: 'Net', label: 'Net' },
              ]}
              rules={[{ required: true }]}
            />
            <ProFormSelect
              name="tax_plan"
              width="lg"
              label="Tax plan"
              options={employmentStatuses?.map((it) => ({ value: it.name, label: it.name }))}
              hasFeedback={!employmentStatuses}
              rules={[{ required: true }]}
            />
            <ProFormSelect
              name="insurance_plan"
              width="lg"
              label="Insurance plan"
              options={jobTitles?.map((it) => ({ value: it.name, label: it.name }))}
              hasFeedback={!jobTitles}
              rules={[{ required: true }]}
            />
          </ProForm.Group>
        </ProForm>
      </Card>
      <ProTable<API.EmployeeJob>
        headerTitle="Payroll history"
        rowKey="id"
        columns={columns}
        dataSource={payrolls}
        search={false}
        style={{ width: '100%' }}
      />
    </>
  );
};
