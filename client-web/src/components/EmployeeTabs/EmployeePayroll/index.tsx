import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { __DEV__ } from '@/global';
import { allInsurancePlans } from '@/services/admin.payroll.insurancePlan';
import { allTaxPlans } from '@/services/admin.payroll.taxPlan';
import {
  getEmployeePayroll,
  getEmployeePayslips,
  updateEmployeePayroll,
} from '@/services/employee';
import { allPayrolls } from '@/services/payroll.payrolls';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { useEmployeeDetailAccess } from '@/utils/hooks/useEmployeeDetailType';
import { CommentOutlined, FilePdfOutlined, MessageOutlined } from '@ant-design/icons';
import ProForm, { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Card, Form, InputNumber, List, message } from 'antd';
import faker from 'faker';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';
import { Access, Link, useIntl } from 'umi';
import type { EmployeeTabProps } from '..';

export const EmployeePayroll: React.FC<EmployeeTabProps> = (props) => {
  const { employeeId, isActive, onChange } = props;
  const intl = useIntl();
  const toPrintRef = useRef<HTMLDivElement>(null);

  // == RBAC.BEGIN

  const { canViewSalaryInfo, canChangeSalaryInfo, canViewPayslips } = useEmployeeDetailAccess({
    employeeId,
    isActive,
  });
  // == RBAC.END

  const payroll = useAsyncData<API.EmployeePayroll>(() => getEmployeePayroll(employeeId), {
    callOnMount: canViewSalaryInfo,
  });
  const taxPlans = useAsyncData<API.TaxPlan[]>(() => allTaxPlans());
  const insurancePlans = useAsyncData<API.InsurancePlan[]>(() => allInsurancePlans());
  const employeePayslips = useAsyncData<API.Payslip[]>(() => getEmployeePayslips(employeeId), {
    callOnMount: canViewPayslips,
  });
  const payrolls = useAsyncData<API.Payroll[]>(() => allPayrolls(), {
    callOnMount: canViewPayslips,
  });
  const [selectedPayslip, setSelectedPayslip] = useState<API.Payslip | undefined>();

  const columns: ProColumns<API.Payslip>[] = [
    {
      title: intl.formatMessage({ id: 'property.payslip' }),
      dataIndex: ['payrollDetail', 'name'],
      renderText: (it, record) => (
        <Button type="link" onClick={() => setSelectedPayslip(record)}>
          {it}
        </Button>
      ),
    },
    {
      title: intl.formatMessage({ id: 'property.template' }),
      dataIndex: ['payrollDetail', 'template'],
    },
    {
      title: intl.formatMessage({ id: 'property.period' }),
      dataIndex: ['payrollDetail', 'period'],
      renderText: (it) =>
        `${moment(it?.start_date).format('DD MMM YYYY')} → ${moment(it?.end_date).format(
          'DD MMM YYYY',
        )}`,
    },
    {
      title: intl.formatMessage({ id: 'property.created_at' }),
      dataIndex: ['payrollDetail', 'created_at'],
      renderText: (it) => moment(it).format('DD MMM YYYY HH:mm:ss'),
    },
    {
      title: intl.formatMessage({ id: 'property.actions' }),
      fixed: 'right',
      align: 'center',
      width: 'min-content',
      search: false,
      render: (dom, record) => (
        <Link to={'/message'}>
          <Button title={`Khieu nai`} size="small">
            <CommentOutlined />
          </Button>
        </Link>
      ),
    },
  ];
  const tableSettings = useTableSettings();

  return (
    <>
      <Access accessible={canViewSalaryInfo}>
        <Card
          loading={payroll.isLoading || taxPlans.isLoading || insurancePlans.isLoading}
          title={intl.formatMessage({ id: 'property.payrollInfo' })}
          className="card-shadow"
        >
          <ProForm<API.EmployeePayroll>
            onFinish={async (value) => {
              try {
                await updateEmployeePayroll(employeeId, value);
                payroll.setData(value);
                // onChange?.();
                message.success(
                  intl.formatMessage({
                    id: 'error.updateSuccessfully',
                    defaultMessage: 'Update successfully!',
                  }),
                );
              } catch {
                message.error(
                  intl.formatMessage({
                    id: 'error.updateUnsuccessfully',
                    defaultMessage: 'Update unsuccessfully!',
                  }),
                );
              }
            }}
            initialValues={payroll.data}
            submitter={
              canChangeSalaryInfo && {
                render: ({ form }, defaultDoms) => {
                  return [
                    ...defaultDoms,
                    __DEV__ && (
                      <Button
                        key="autoFill"
                        onClick={() => {
                          form?.setFieldsValue({
                            salary:
                              faker.datatype.number({
                                min: 10,
                                max: 100,
                              }) * 100000,
                            basic_salary:
                              faker.datatype.number({
                                min: 10,
                                max: 100,
                              }) * 100000,
                            // salary_type: faker.helpers.randomize(['Gross', 'Net']),
                            tax_policy: faker.helpers.randomize(taxPlans.data || [])?.name,
                            insurance_policy: faker.helpers.randomize(insurancePlans.data || [])
                              ?.name,
                          });
                        }}
                      >
                        Auto fill
                      </Button>
                    ),
                  ];
                },
              }
            }
          >
            <ProForm.Group>
              <Form.Item
                name="salary"
                label={intl.formatMessage({ id: 'property.salary' })}
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: 328 }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/\D+/g, ''))}
                  placeholder="1,000,000"
                  step={1000000}
                  disabled={!isActive}
                />
              </Form.Item>
              <Form.Item
                name="basic_salary"
                label={intl.formatMessage({ id: 'property.basic_salary' })}
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: 328 }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/\D+/g, ''))}
                  placeholder="1,000,000"
                  step={1000000}
                  disabled={!isActive}
                />
              </Form.Item>
              <ProFormSelect
                name="tax_policy"
                label={intl.formatMessage({ id: 'property.tax_policy' })}
                width="md"
                options={taxPlans.data?.map((it) => ({ value: it.name, label: it.name }))}
                rules={[{ required: true }]}
                disabled={!isActive}
              />
              <ProFormSelect
                name="insurance_policy"
                label={intl.formatMessage({ id: 'property.insurance_policy' })}
                width="md"
                options={insurancePlans.data?.map((it) => ({ value: it.name, label: it.name }))}
                rules={[{ required: true }]}
                disabled={!isActive}
              />
            </ProForm.Group>
          </ProForm>
        </Card>
      </Access>
      <div ref={toPrintRef} className="print-table">
        <table>
          <tbody>
            <tr>
              <th colSpan={2}>{selectedPayslip?.payrollDetail?.name}</th>
            </tr>
            {selectedPayslip?.values.map((it) => (
              <tr key={it.field.code_name}>
                <td>{it.field.display_name}</td>
                <td style={{ color: it.field.datatype === 'Currency' ? '#ad8b00' : undefined }}>
                  {it.formatted_value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="copy-right">© UIT HRM</div>
      </div>
      <Access accessible={canViewPayslips}>
        <ProTable<API.Payslip>
          {...tableSettings}
          headerTitle={intl.formatMessage({ id: 'property.payslips' })}
          rowKey="id"
          columns={columns}
          loading={employeePayslips.isLoading || payrolls.isLoading}
          dataSource={employeePayslips.data?.map((it) => ({
            ...it,
            payrollDetail: payrolls.data?.find((x) => it.payroll === x.id),
          }))}
          search={false}
          style={{ width: '100%' }}
          className="card-shadow"
        />
        <ModalForm
          width="400px"
          visible={!!selectedPayslip}
          onVisibleChange={(visible) => {
            if (!visible) setSelectedPayslip(undefined);
          }}
          title={selectedPayslip?.payrollDetail?.name}
          submitter={{
            render: () => {
              return [
                <Link to={'/message'}>
                  <Button title={`Khieu nai`} icon={<CommentOutlined />}>
                    Khieu nai
                  </Button>
                </Link>,
                <ReactToPrint
                  // documentTitle={selectedPayslip?.payrollDetail?.name}
                  trigger={() => (
                    <Button icon={<FilePdfOutlined />}>
                      {intl.formatMessage({ id: 'component.button.print' })}
                    </Button>
                  )}
                  content={() => toPrintRef.current}
                  // print={() => { console.log('custom print')}}
                  // This library sucks, no download will appear: https://github.com/gregnb/react-to-print/issues/337
                />,
              ];
            },
          }}
        >
          <div style={{ height: '50vh', overflow: 'auto' }}>
            <List
              itemLayout="horizontal"
              dataSource={selectedPayslip?.values}
              renderItem={(item) => {
                let itemValue: React.ReactNode = (
                  <p style={{ display: 'contents' }}>{item.formatted_value}</p>
                );
                if (item.field.datatype === 'Currency') {
                  itemValue = (
                    <p style={{ color: '#ad8b00', display: 'contents' }}>{item.formatted_value}</p>
                  );
                }
                if (item.field.datatype === 'Number')
                  itemValue = (
                    <p style={{ textDecoration: 'underline', display: 'contents' }}>
                      {item.formatted_value}
                    </p>
                  );
                return (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <p
                          className="ant-list-item-meta-description"
                          style={{ margin: 0, fontSize: '0.85em' }}
                        >
                          {item.field.display_name}:
                        </p>
                      }
                      description={
                        <p className="ant-list-item-meta-title" style={{ fontSize: '1.1em' }}>
                          {itemValue}
                        </p>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </div>
        </ModalForm>
      </Access>
    </>
  );
};
