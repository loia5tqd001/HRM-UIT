import { getConversationId, getTopicUrl } from '@/models/firebaseTalk';
import { employeeToUser } from '@/pages/Message';
import {
  confirmPayroll,
  downloadSampleExcel,
  exportExcel,
  readPayroll,
  readPayslips,
  sendViaEmail,
  uploadInput,
} from '@/services/payroll.payrolls';
import { createConversation, sendMessage } from '@/services/talk';
import { useTalkPopup } from '@/utils/talkPopup';
import {
  CalculatorOutlined,
  CommentOutlined,
  FileExcelOutlined,
  LockOutlined,
  MoreOutlined,
  SendOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Affix,
  Button,
  Card,
  Dropdown,
  Menu,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Upload,
} from 'antd';
import type { ColumnType } from 'antd/lib/table';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { Access, history, useAccess, useIntl, useModel, useParams } from 'umi';
import styles from './index.less';

export const PayrollDetail: React.FC = () => {
  const { id } = useParams<any>();
  const [tableData, setTableData] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<API.Payroll>();
  const [dynamicColumns, setDynamicColumns] = useState<any>();
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDownloadingSample, setIsDownloadingSample] = useState(false);
  const access = useAccess();
  const intl = useIntl();
  const { currentUser } = useModel('@@initialState').initialState!;
  const { getParticipants } = useModel('firebaseTalk');
  const { mountPopup } = useTalkPopup();

  const requestTable = useCallback(() => {
    return readPayslips(id).then(async (fetchData) => {
      if (!fetchData.length) return;

      if (history.location.query?.action === 'create') {
        const allPromises = fetchData.map(async (payslip) => {
          const payslipId = `${payslip.payroll}_${payslip.id}`;
          const conversationId = getConversationId('payslip', payslipId);
          await createConversation(conversationId, {
            participants: [currentUser!, payslip.owner].map((it) => String(it.id)),
            subject: `[Support][Payslip][id: ${payslipId}][for: ${payslip.owner?.first_name} ${payslip.owner?.last_name}]`,
            photoUrl: getTopicUrl('payslip'),
            custom: {
              hideTo: payslip.owner.id === currentUser?.id ? '' : String(currentUser!.id),
              payroll: String(payslip.payroll),
            },
          });
          await sendMessage(conversationId, String(currentUser?.id), [
            `<${
              window.location.origin
            }/account/profile?tab=payroll&payslip_id=${payslipId}|${intl.formatMessage({
              id: 'property.actions.newPayslip',
            })}>`,
          ]);
        });
        await Promise.all(allPromises).then(() => {
          history.replace(history.location.pathname);
        });
      }

      setDynamicColumns(
        fetchData[0].values
          .map((it) => it.field)
          .filter((it) => it.is_visible)
          .sort((a, b) => a.index - b.index)
          .map((it) => ({
            dataIndex: it.code_name,
            title: (
              <div>
                {it.type === 'Input' && (
                  <Tooltip title={intl.formatMessage({ id: 'property.columnType.input' })}>
                    <UploadOutlined />
                  </Tooltip>
                )}
                {it.type === 'Formula' && (
                  <Tooltip title={intl.formatMessage({ id: 'property.columnType.formula' })}>
                    <CalculatorOutlined />
                  </Tooltip>
                )}
                {'  '}
                {it.display_name}
              </div>
            ),
            render: (text: string) => {
              if (it.datatype === 'Currency') {
                return (
                  <span style={{ color: '#ad8b00', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                    {text}
                  </span>
                );
              }
              if (it.datatype === 'Number')
                return (
                  <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{text}</span>
                );
              return text;
            },
          })),
      );
      setTableData(
        fetchData.map((it) => {
          return it.values.reduce(
            (acc, cur) => {
              acc[cur.field.code_name] = cur.formatted_value;
              return acc;
            },
            { payslip_id: `${it.payroll}_${it.id}`, payroll: it.payroll },
          );
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
    {
      title: intl.formatMessage({ id: 'property.payslip_id' }),
      dataIndex: 'payslip_id',
    },
    ...(dynamicColumns || []),
    {
      title: '',
      fixed: 'right',
      align: 'center',
      width: 'max-content',
      search: false,
      render: (dom, record) => {
        const conversationId = getConversationId('payslip', record.payslip_id);
        const keyOnFirebase = getConversationId('payslip', record.payroll);
        const participants = getParticipants(keyOnFirebase);

        return (
          <Space size="small">
            <Button
              title={intl.formatMessage({ id: 'property.actions.openTheConversation' })}
              size="small"
              className={
                participants.includes(conversationId) ? 'success-outlined-button' : undefined
              }
              onClick={() => {
                const conversation = window.talkSession?.getOrCreateConversation(conversationId);
                conversation.setParticipant(employeeToUser(currentUser!));
                mountPopup(conversation);
              }}
            >
              <CommentOutlined />
            </Button>
          </Space>
        );
      },
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
                <Access accessible={payroll?.status === 'Temporary'}>
                  <Dropdown
                    overlay={
                      <Menu style={{ marginTop: 10 }}>
                        <Menu.Item
                          key="can_export_excel_payroll"
                          icon={<FileExcelOutlined />}
                          className="success-outlined-button"
                          style={{ padding: '8px 16px' }}
                          onClick={async () => {
                            try {
                              setIsDownloadingSample(true);
                              await downloadSampleExcel(id);
                            } catch {
                              message.error(
                                `${intl.formatMessage({
                                  id: 'property.columnType.downloadSampleExcelFile',
                                })} ${intl.formatMessage({
                                  id: 'property.actions.unsuccessfully',
                                })}!`,
                              );
                            } finally {
                              setIsDownloadingSample(false);
                            }
                          }}
                        >
                          {intl.formatMessage({
                            id: 'property.columnType.downloadSampleExcelFile',
                          })}
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Upload
                      customRequest={async (options) => {
                        const { file } = options;
                        const hide = message.loading(
                          `${intl.formatMessage({ id: 'property.actions.uploading' })}...`,
                        );
                        try {
                          const data = new FormData();
                          data.append('input_file', file);
                          await uploadInput(id, data);
                          await requestTable();
                          message.success(
                            `${intl.formatMessage({
                              id: 'property.columnType.input',
                            })} ${intl.formatMessage({ id: 'property.actions.successfully' })}`,
                          );
                        } catch (err) {
                          message.error(
                            `${intl.formatMessage({
                              id: 'property.columnType.input',
                            })} ${intl.formatMessage({ id: 'property.actions.unsuccessfully' })}`,
                          );
                        } finally {
                          hide?.();
                        }
                      }}
                      showUploadList={false}
                      maxCount={1}
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    >
                      <Button
                        className="success-outlined-button"
                        loading={isDownloadingSample}
                        icon={<UploadOutlined />}
                      >
                        {intl.formatMessage({ id: 'property.columnType.input' })}
                      </Button>
                    </Upload>
                  </Dropdown>
                </Access>

                <Access
                  accessible={access['can_confirm_payroll'] && payroll?.status === 'Temporary'}
                >
                  <Popconfirm
                    placement="right"
                    title={
                      <div style={{ maxWidth: 380, marginBottom: -12 }}>
                        {intl.formatMessage({ id: 'error.actionIrreversible' })}
                      </div>
                    }
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
                <Access
                  accessible={
                    access['can_send_payslip_payroll'] || access['can_export_excel_payroll']
                  }
                >
                  <Dropdown
                    overlay={
                      <Menu>
                        <Access accessible={access['can_send_payslip_payroll']}>
                          <Menu.Item
                            key="can_send_payslip_payroll"
                            icon={<SendOutlined />}
                            className="primary-outlined-button"
                            style={{ padding: '10px 20px' }}
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
                          >
                            {intl.formatMessage({
                              id: 'component.button.sendPayslipsViaEmail',
                            })}
                          </Menu.Item>
                        </Access>
                        <Access accessible={access['can_export_excel_payroll']}>
                          <Menu.Item
                            key="can_export_excel_payroll"
                            icon={<FileExcelOutlined />}
                            className="success-outlined-button"
                            style={{ padding: '10px 20px' }}
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
                          >
                            {intl.formatMessage({ id: 'component.button.exportExcel' })}
                          </Menu.Item>
                        </Access>
                      </Menu>
                    }
                  >
                    <Button icon={<MoreOutlined />} loading={isSending || isExporting} />
                  </Dropdown>
                </Access>
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
                rowKey="id"
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
