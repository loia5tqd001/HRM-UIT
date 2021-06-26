import { __DEV__ } from '@/global';
import { getConversationId } from '@/models/firebaseTalk';
import { employeeToUser } from '@/pages/Message';
import { allInsurancePlans } from '@/services/admin.payroll.insurancePlan';
import { allTaxPlans } from '@/services/admin.payroll.taxPlan';
import {
  getEmployeePayroll,
  getEmployeePayslips,
  updateEmployeePayroll,
} from '@/services/employee';
import { allPayrolls } from '@/services/payroll.payrolls';
import { unhideConversation } from '@/services/talk';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { useEmployeeDetailAccess } from '@/utils/hooks/useEmployeeDetailType';
import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { useTalkPopup } from '@/utils/talkPopup';
import { CommentOutlined, FilePdfOutlined } from '@ant-design/icons';
import ProForm, { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Card, Form, InputNumber, List, message, Tooltip } from 'antd';
import faker from 'faker';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';
import { Access, useIntl, useModel, history } from 'umi';
import type { EmployeeTabProps } from '..';

export const EmployeePayroll: React.FC<EmployeeTabProps> = (props) => {
  const { employeeId, isActive, onChange } = props;
  const intl = useIntl();
  const toPrintRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useModel('@@initialState').initialState!;
  const { mountPopup } = useTalkPopup();
  const { addParticipants } = useModel('firebaseTalk');

  // == RBAC.BEGIN

  const { canViewSalaryInfo, canChangeSalaryInfo, canViewPayslips, canOpenChatPayslip } =
    useEmployeeDetailAccess({
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

  const onOpenChat = (record: API.Payslip) => {
    // const payslipId = `${record.payroll}_${record.id}`; We don't need this as record.id is already a string concaternated by record.payroll and record.id
    const conversationId = getConversationId('payslip', record.id);
    const conversation = window.talkSession?.getOrCreateConversation(conversationId);
    const me = employeeToUser(currentUser!);
    const another = employeeToUser(record.owner);
    conversation.setParticipant(me);
    conversation.setParticipant(another);
    mountPopup(conversation).then((popup) => {
      popup.on('sendMessage', ({ conversation: conver }) => {
        if (
          conver.subject?.includes('[Payslip]') &&
          conver.custom.hideTo &&
          conver.custom.payroll
        ) {
          unhideConversation(conver.id);
          addParticipants(conver.custom.payroll, [conver.id]);
        }
      });
    });
  };

  const columns: ProColumns<API.Payslip>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: intl.formatMessage({ id: 'property.payslip' }),
      dataIndex: ['payrollDetail', 'name'],
      renderText: (it, record) => {
        if (history.location.query?.payslip_id === record.id) {
          const { query } = history.location;
          delete query.payslip_id;
          const newQuery = Object.entries(query).map(([k, v]) => `${k}=${v}`);
          const newHref =
            window.location.hostname + newQuery.length ? `?${newQuery.join('&')}` : '';
          history.replace(newHref);
          setTimeout(() => setSelectedPayslip(record), 100);
        }
        return (
          <Button type="link" onClick={() => setSelectedPayslip(record)}>
            {it}
          </Button>
        );
      },
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
    (canOpenChatPayslip as any) && {
      title: intl.formatMessage({ id: 'property.actions' }),
      fixed: 'right',
      align: 'center',
      width: 'min-content',
      search: false,
      render: (dom, record) => {
        return (
          <Tooltip title={intl.formatMessage({ id: 'property.actions.openTheConversation' })}>
            <Button size="small" onClick={() => onOpenChat(record)}>
              <CommentOutlined />
            </Button>
          </Tooltip>
        );
      },
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
          dataSource={
            employeePayslips.data &&
            [...employeePayslips.data].reverse().map((it) => ({
              ...it,
              id: `${it.payroll}_${it.id}`,
              payrollDetail: payrolls.data?.find((x) => it.payroll === x.id),
            }))
          }
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
                canOpenChatPayslip && (
                  <Button
                    key="openTheConversation"
                    onClick={() => onOpenChat(selectedPayslip!)}
                    icon={<CommentOutlined />}
                  >
                    {intl.formatMessage({ id: 'property.actions.openTheConversation' })}
                  </Button>
                ),
                <ReactToPrint
                  key="print"
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
              renderItem={(item, index) => {
                let itemValue: React.ReactNode = (
                  <div style={{ display: 'contents' }}>{item.formatted_value}</div>
                );
                if (item.field.datatype === 'Currency') {
                  itemValue = (
                    <div style={{ color: '#ad8b00', display: 'contents' }}>
                      {item.formatted_value}
                    </div>
                  );
                }
                if (item.field.datatype === 'Number')
                  itemValue = (
                    <div style={{ textDecoration: 'underline', display: 'contents' }}>
                      {item.formatted_value}
                    </div>
                  );
                return (
                  <List.Item key={index}>
                    <List.Item.Meta
                      title={
                        <div
                          className="ant-list-item-meta-description"
                          style={{ margin: 0, fontSize: '0.85em' }}
                        >
                          {item.field.display_name}:
                        </div>
                      }
                      description={
                        <div className="ant-list-item-meta-title" style={{ fontSize: '1.1em' }}>
                          {itemValue}
                        </div>
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
