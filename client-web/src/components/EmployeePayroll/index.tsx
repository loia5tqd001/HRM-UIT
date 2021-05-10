import { FormattedMessage } from '@/.umi/plugin-locale/localeExports';
import { __DEV__ } from '@/global';
import { allInsurancePlans } from '@/services/admin.payroll.insurancePlan';
import { allTaxPlans } from '@/services/admin.payroll.taxPlan';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Card, Form, InputNumber, message } from 'antd';
import faker from 'faker';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

type Props = {
  payroll: API.EmployeePayroll | undefined;
  payrollSubmit: (value: API.EmployeePayroll) => Promise<void>;
};

export const EmployeePayroll: React.FC<Props> = (props) => {
  const { payroll, payrollSubmit } = props;
  const [taxPlans, setTaxPlans] = useState<API.TaxPlan[]>();
  const [insurancePlans, setInsurancePlans] = useState<API.InsurancePlan[]>();

  useEffect(() => {
    allTaxPlans().then((fetchData) => setTaxPlans(fetchData));
    allInsurancePlans().then((fetchData) => setInsurancePlans(fetchData));
  }, []);

  const columns: ProColumns<API.EmployeePayroll>[] = [
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
      renderText: (value) => `${parseInt(value, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    },
    // {
    //   title: (
    //     <FormattedMessage id="pages.admin.payroll.column.salaryType" defaultMessage="Salary type" />
    //   ),
    //   dataIndex: 'salary_type',
    // },
    {
      title: <FormattedMessage id="pages.admin.payroll.column.taxPlan" defaultMessage="Tax plan" />,
      dataIndex: 'tax_policy',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.payroll.column.insurancePlan"
          defaultMessage="Insurance plan"
        />
      ),
      dataIndex: 'insurance_policy',
    },
  ];

  return (
    <>
      <Card loading={payroll === undefined} title="Payroll info">
        <ProForm<API.EmployeePayroll>
          onFinish={async (value) => {
            try {
              await payrollSubmit(value);
              message.success('Updated successfully!');
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
          initialValues={payroll}
          submitter={{
            render: ({ form }, defaultDoms) => {
              return [
                ...defaultDoms,
                __DEV__ && (
                  <Button
                    key="autoFill"
                    onClick={() => {
                      form?.setFieldsValue({
                        salary:
                          faker.random.number({
                            min: 10,
                            max: 100,
                          }) * 100000,
                        basic_salary:
                          faker.random.number({
                            min: 10,
                            max: 100,
                          }) * 100000,
                        // salary_type: faker.helpers.randomize(['Gross', 'Net']),
                        tax_policy: faker.helpers.randomize(taxPlans || [])?.name,
                        insurance_policy: faker.helpers.randomize(insurancePlans || [])?.name,
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
                step={1000000}
              />
            </Form.Item>
            <Form.Item name="basic_salary" label="Basic salary" rules={[{ required: true }]}>
              <InputNumber
                style={{ width: 440 }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value?.replace(/\D+/g, ''))}
                placeholder="1,000,000"
                step={1000000}
              />
            </Form.Item>
            <ProFormSelect
              name="tax_policy"
              width="lg"
              label="Tax plan"
              options={taxPlans?.map((it) => ({ value: it.name, label: it.name }))}
              hasFeedback={!taxPlans}
              rules={[{ required: true }]}
            />
            <ProFormSelect
              name="insurance_policy"
              width="lg"
              label="Insurance plan"
              options={insurancePlans?.map((it) => ({ value: it.name, label: it.name }))}
              hasFeedback={!insurancePlans}
              rules={[{ required: true }]}
            />
          </ProForm.Group>
        </ProForm>
      </Card>
      <ProTable<API.EmployeePayroll>
        headerTitle="Payroll history"
        rowKey="id"
        columns={columns}
        dataSource={payroll ? [payroll] : []}
        search={false}
        style={{ width: '100%' }}
      />
    </>
  );
};
