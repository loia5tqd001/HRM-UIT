import {
  confirmPayroll,
  exportExcel,
  readPayroll,
  readPayslips,
  sendViaEmail,
} from '@/services/payroll.payrolls';
import {
  CheckCircleOutlined,
  CommentOutlined,
  FileExcelOutlined,
  LockOutlined,
  SendOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { Affix, Badge, Button, Card, message, Popconfirm, Space, Table, Tag } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { Access, Link, useAccess, useIntl, useParams } from 'umi';
import styles from './index.less';

export const PayrollDetail: React.FC = () => {
  const { id } = useParams<any>();
  const [tableData, setTableData] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<API.Payroll>();
  const [dynamicColumns, setDynamicColumns] = useState<any>();
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const access = useAccess();
  const intl = useIntl();

  const requestTable = useCallback(() => {
    readPayslips(id).then((fetchData) => {
      if (!fetchData.length) return;
      setDynamicColumns(
        fetchData[0].values
          .map((it) => it.field)
          .sort((a, b) => a.index - b.index)
          .map((it) => ({
            dataIndex: it.code_name,
            title: it.display_name,
            render: (text: string) => {
              if (it.datatype === 'Currency') {
                return <span style={{ color: '#ad8b00', whiteSpace: 'nowrap' }}>{text}</span>;
              }
              if (it.datatype === 'Number')
                return <span style={{ textDecoration: 'underline' }}>{text}</span>;
              return text;
            },
          })),
      );
      setTableData(
        fetchData.map((it) => {
          return it.values.reduce((acc, cur) => {
            acc[cur.field.code_name] = cur.formatted_value;
            return acc;
          }, {});
        }),
      );
    });
  }, [id]);

  useEffect(() => {
    readPayroll(id).then((fetchData) => setPayroll(fetchData));
    requestTable();
  }, [id, requestTable]);

  const columns: ColumnType<any>[] = [
    {
      title: '#',
      dataIndex: 'index',
      width: 65,
      render: (_, __, index) => index + 1,
    },
    ...(dynamicColumns || []),
    {
      title: intl.formatMessage({ id: 'property.actions' }),
      fixed: 'right',
      align: 'center',
      width: 'min-content',
      search: false,
      render: (dom, record) => (
        <Link to={'/message'}>
          <Badge count={1}>
            <Button title={`Xem khieu nai`} size="small">
              <CommentOutlined />
            </Button>
          </Badge>
        </Link>
      ),
    },
  ];

  return (
    <PageContainer title={false}>
      <div style={{ display: 'grid', gap: 24 }}>
        <Affix offsetTop={50}>
          <Card
            className={`card-shadow ${styles.fixOverflowTable}`}
            title={
              <>
                {payroll?.status === 'Confirmed' ? <LockOutlined /> : <SyncOutlined spin />}{' '}
                {intl.formatMessage({ id: 'property.payslipsOf' })} {payroll?.name}
              </>
            }
            style={{ height: '100%' }}
            extra={
              <Space>
                <div style={{ alignSelf: 'flex-end' }}>
                  <Tag>
                    {intl.formatMessage({ id: 'property.template' })}:{' '}
                    <span className="emphasize-tag">{payroll?.template}</span>
                  </Tag>
                  <Tag>
                    {intl.formatMessage({ id: 'property.period' })}:{' '}
                    <span className="emphasize-tag">
                      {moment(payroll?.period.start_date).format('DD MMM YYYY')}
                      {' → '}
                      {moment(payroll?.period.end_date).format('DD MMM YYYY')}
                    </span>
                  </Tag>
                </div>
                <Access accessible={access['can_send_payslip_payroll']}>
                  <Button
                    className="primary-outlined-button"
                    children={intl.formatMessage({ id: 'component.button.sendPayslipsViaEmail' })}
                    icon={<SendOutlined />}
                    loading={isSending}
                    onClick={async () => {
                      try {
                        setIsSending(true);
                        await sendViaEmail(id);
                        message.success(
                          `${intl.formatMessage({
                            id: 'component.button.sendPayslipsViaEmail',
                          })} ${intl.formatMessage({
                            id: 'property.actions.successfully',
                          })}`,
                        );
                      } catch {
                        message.success(
                          `${intl.formatMessage({
                            id: 'component.button.sendPayslipsViaEmail',
                          })} ${intl.formatMessage({
                            id: 'property.actions.unsuccessfully',
                          })}`,
                        );
                      } finally {
                        setIsSending(false);
                      }
                    }}
                  />
                </Access>
                <Access accessible={access['can_export_excel_payroll']}>
                  <Button
                    className="success-outlined-button"
                    children={intl.formatMessage({ id: 'component.button.exportExcel' })}
                    icon={<FileExcelOutlined />}
                    loading={isExporting}
                    onClick={async () => {
                      try {
                        setIsExporting(true);
                        await exportExcel(id);
                      } catch {
                        message.error(
                          `Export ${intl.formatMessage({
                            id: 'property.actions.unsuccessfully',
                          })}!`,
                        );
                      } finally {
                        setIsExporting(false);
                      }
                    }}
                  />
                </Access>
                <Access
                  accessible={access['can_confirm_payroll'] && payroll?.status === 'Temporary'}
                >
                  <Popconfirm
                    placement="right"
                    title={intl.formatMessage({ id: 'error.actionIrreversible' })}
                    onConfirm={async () => {
                      try {
                        // setIsCalculating(true);
                        await confirmPayroll(id);
                        setPayroll({ ...payroll!, status: 'Confirmed' });
                        message.success(
                          `${intl.formatMessage({
                            id: 'property.actions.confirm',
                          })} ${intl.formatMessage({
                            id: 'property.actions.successfully',
                          })}`,
                        );
                      } catch {
                        message.success(
                          `${intl.formatMessage({
                            id: 'property.actions.confirm',
                          })} ${intl.formatMessage({
                            id: 'property.actions.unsuccessfully',
                          })}`,
                        );
                      } finally {
                        // setIsCalculating(false);
                      }
                    }}
                  >
                    <Button
                      children={intl.formatMessage({ id: 'property.actions.confirm' })}
                      type="primary"
                      icon={<LockOutlined />}
                    />
                  </Popconfirm>
                </Access>
                {/* <Access accessible={access['can_calculate_payroll']}>
                  <Button
                    children="Run Calculation"
                    type="primary"
                    loading={isCalculating}
                    onClick={async () => {
                      try {
                        setIsCalculating(true);
                        await calculatePayslips(id);
                        await requestTable();
                        message.success('Calculate successfully!');
                      } catch {
                        message.error('Calculate unsuccessfully!');
                      } finally {
                        setIsCalculating(false);
                      }
                    }}
                  />
                </Access> */}
              </Space>
            }
          >
            <div style={{ overflow: 'auto', margin: '0 12px' }}>
              <Table<any>
                pagination={false}
                loading={!tableData}
                dataSource={tableData}
                // scroll={{ x: 'max-content' }}
                columns={columns}
                rowKey="index"
                bordered
              />
            </div>
          </Card>
        </Affix>
      </div>
    </PageContainer>
  );
};

export default PayrollDetail;
