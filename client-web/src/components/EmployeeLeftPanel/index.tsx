import { allTerminationReasons } from '@/services/admin.job.terminationReason';
import { allRoles, changePassword } from '@/services/auth';
import {
  changeEmployeeAvatar,
  changeEmployeePassword,
  changeEmployeeRole,
  readEmployee,
  terminateEmployee,
} from '@/services/employee';
import styles from '@/styles/employee_detail.less';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import {
  useEmployeeDetailAccess,
  useEmployeeDetailType,
} from '@/utils/hooks/useEmployeeDetailType';
import { EditOutlined, KeyOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Affix, Badge, Button, Card, message, Space, Tooltip, Upload } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import React from 'react';
import { Access, FormattedMessage, useIntl } from 'umi';
import type { OnChangeSubscription } from '../EmployeeTabs';

type Props = {
  employee: API.Employee | undefined;
  setEmployee: (x: API.Employee) => void;
  onChange?: OnChangeSubscription;
};

export const EmployeeLeftPanel: React.FC<Props> = (props) => {
  const { employee: record, setEmployee: setRecord, onChange } = props;
  const id = record?.id;
  const isActive = record?.status !== 'Terminated';
  const [terminationForm] = useForm<API.TerminateContract>();
  const [editRoleForm] = useForm<{ role: string }>();
  const terminationReasons = useAsyncData<API.TerminationReason[]>(allTerminationReasons);
  const roles = useAsyncData<API.RoleItem[]>(allRoles);
  const pageType = useEmployeeDetailType();
  const intl = useIntl();

  const mapStatus = {
    NewHired: {
      text: intl.formatMessage({ id: 'property.status.newHire' }),
      status: 'warning',
    },
    Working: {
      text: intl.formatMessage({ id: 'property.status.working' }),
      status: 'success',
    },
    Terminated: {
      text: intl.formatMessage({ id: 'property.status.terminated' }),
      status: 'error',
    },
  } as const;

  const { canChangeAvatar, canSetRole, canSetPassword, canTerminateEmployment } =
    useEmployeeDetailAccess({ isActive, employeeId: id });

  return (
    <Affix offsetTop={50} style={{ minWidth: 200 }}>
      <Card bordered={false} loading={!record} className="card-shadow">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Upload
            disabled={!canChangeAvatar}
            showUploadList={false}
            style={{ display: 'block', cursor: `${canChangeAvatar ? 'pointer' : undefined}` }}
            maxCount={1}
            accept="image/*"
            customRequest={async (options) => {
              const { file } = options;
              const config = {
                // headers: {
                //   'content-type': 'multipart/form-data',
                // },
                // If you set the 'content-type' header manually yourself, you fucked up: https://stackoverflow.com/a/38271059/9787887
              };
              const hide = message.loading('Uploading...');
              try {
                const data = new FormData();
                data.append('avatar', file);
                await changeEmployeeAvatar(id!, data, config);
                await readEmployee(id!).then((fetchData) => {
                  if (!record) setRecord(fetchData);
                  else {
                    const newRecord = { ...record, avatar: fetchData.avatar };
                    setRecord(newRecord);
                  }
                });
                message.success('Update avatar successfully!');
              } catch (err) {
                message.error('Update avatar failed!');
              } finally {
                hide?.();
              }
            }}
          >
            <Tooltip
              title={canChangeAvatar && intl.formatMessage({ id: 'button.changeAvatar' })}
              placement="top"
            >
              <div className={styles.avatar}>
                <img src={record?.avatar} alt="avatar" />
              </div>
            </Tooltip>
          </Upload>
        </div>
        <h2
          style={{
            marginTop: 12,
            fontWeight: 'bold',
          }}
          className={styles.textEllipse}
          title={`${record?.first_name} ${record?.last_name}`}
        >
          <span className={styles.content}>
            {record?.first_name} {record?.last_name}
          </span>
        </h2>
        {record?.status && (
          <h4
            style={{ fontWeight: 400 }}
            className={styles.badge}
            title={`${intl.formatMessage({ id: 'property.status' })}: ${
              mapStatus[record.status].text
            }`}
          >
            <Badge {...mapStatus[record.status]} />
          </h4>
        )}
        <h4
          style={{
            fontWeight: 400,
            display: 'inline-flex',
          }}
          title={`${intl.formatMessage({ id: 'property.role' })}: ${record?.role}`}
          className={`${styles.textEllipse} ${styles.roleButton}`}
        >
          <KeyOutlined /> <span className={styles.content}>{record?.role}</span>
          <Access accessible={canSetRole}>
            <ModalForm<{ role: string }>
              title={`${intl.formatMessage({ id: 'property.actions.update' })} ${intl.formatMessage(
                { id: 'property.role' },
              )}`}
              width="400px"
              trigger={
                <span className={styles.button}>
                  <Button
                    size="small"
                    className="primary-outlined-button"
                    icon={<EditOutlined />}
                    title={`${intl.formatMessage({
                      id: 'property.actions.update',
                    })} ${intl.formatMessage({ id: 'property.role' })}`}
                  ></Button>
                </span>
              }
              onVisibleChange={(visible) => {
                if (visible) {
                  editRoleForm.setFieldsValue({ role: record?.role });
                } else {
                  editRoleForm.resetFields();
                }
              }}
              form={editRoleForm}
              onFinish={async (value) => {
                try {
                  await changeEmployeeRole(id!, value.role);
                  message.success('Update successfully!');
                  onChange?.basicInfo?.({ ...value } as any);
                  return true;
                } catch {
                  message.error('Update unsuccessfully!');
                  return false;
                }
              }}
            >
              <ProFormSelect
                name="role"
                width="md"
                label={intl.formatMessage({ id: 'property.role' })}
                options={roles.data?.map((it) => ({
                  value: it.name,
                  label: it.name,
                }))}
                hasFeedback={roles.isLoading}
                rules={[{ required: true }]}
              />
            </ModalForm>
          </Access>
        </h4>
        <h4
          style={{
            fontWeight: 400,
          }}
          title={`${intl.formatMessage({ id: 'property.username' })}: ${record?.user.username}`}
          className={styles.textEllipse}
        >
          <UserOutlined /> <span className={styles.content}>{record?.user.username}</span>
        </h4>
        <h4
          style={{
            fontWeight: 400,
            marginBottom: 12,
          }}
          title={`${intl.formatMessage({ id: 'property.email' })}: ${record?.email}`}
          className={styles.textEllipse}
        >
          <MailOutlined />
          <span className={styles.content}>{record?.email}</span>
        </h4>
        {(canSetPassword || canTerminateEmployment) && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Access accessible={canSetPassword}>
              {pageType === 'employee-edit' ? (
                <ModalForm
                  title={intl.formatMessage({ id: 'component.button.changePassword' })}
                  width="400px"
                  trigger={
                    <Button className={styles.changePasswordButton} type="primary">
                      {intl.formatMessage({
                        id: 'component.button.changePassword',
                      })}
                    </Button>
                  }
                  onFinish={async (value) => {
                    try {
                      await changeEmployeePassword(id!, value.new_password);
                      message.success(
                        intl.formatMessage({
                          id: 'error.updateSuccessfully',
                          defaultMessage: 'Update successfully!',
                        }),
                      );
                      return true;
                    } catch {
                      message.error(
                        intl.formatMessage({
                          id: 'error.updateUnsuccessfully',
                          defaultMessage: 'Update unsuccessfully!',
                        }),
                      );
                      return false;
                    }
                  }}
                >
                  <ProFormText.Password
                    width="md"
                    name="new_password"
                    label={intl.formatMessage({
                      id: 'property.newPassword',
                    })}
                    rules={[
                      { required: true },
                      {
                        min: 6,
                        message: intl.formatMessage({
                          id: 'error.password6Characters',
                        }),
                      },
                      ({ getFieldValue }) => ({
                        validator(rule, value) {
                          if (value && getFieldValue('password') === value) {
                            return Promise.reject(
                              Error(
                                intl.formatMessage({
                                  id: 'error.newPasswordMustBeDifferentThanCurrent',
                                }),
                              ),
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  />
                  <ProFormText.Password
                    width="md"
                    name="confirm_password"
                    label={intl.formatMessage({
                      id: 'property.confirmPassword',
                    })}
                    dependencies={['new_password']}
                    rules={[
                      { required: true },
                      ({ getFieldValue }) => ({
                        validator(rule, value) {
                          if (!value || getFieldValue('new_password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            Error(
                              intl.formatMessage({
                                id: 'error.confirmPasswordDoesNotMatch',
                              }),
                            ),
                          );
                        },
                      }),
                    ]}
                  />
                </ModalForm>
              ) : (
                <ModalForm
                  title={intl.formatMessage({ id: 'component.button.changePassword' })}
                  width="400px"
                  trigger={
                    <Button className={styles.changePasswordButton} type="primary">
                      {intl.formatMessage({
                        id: 'component.button.changePassword',
                      })}
                    </Button>
                  }
                  onFinish={async (value) => {
                    try {
                      await changePassword(value.password, value.new_password);
                      message.success(
                        intl.formatMessage({
                          id: 'error.updateSuccessfully',
                          defaultMessage: 'Update successfully!',
                        }),
                      );
                      return true;
                    } catch {
                      message.error(
                        intl.formatMessage({
                          id: 'error.updateUnsuccessfully',
                          defaultMessage: 'Update unsuccessfully!',
                        }),
                      );
                      return false;
                    }
                  }}
                >
                  <ProFormText.Password
                    width="md"
                    name="password"
                    label={intl.formatMessage({
                      id: 'property.currentPassword',
                    })}
                    rules={[{ required: true }]}
                  />
                  <ProFormText.Password
                    width="md"
                    name="new_password"
                    label={intl.formatMessage({
                      id: 'property.newPassword',
                    })}
                    rules={[
                      { required: true },
                      {
                        min: 6,
                        message: intl.formatMessage({
                          id: 'error.password6Characters',
                        }),
                      },
                      ({ getFieldValue }) => ({
                        validator(rule, value) {
                          if (value && getFieldValue('password') === value) {
                            return Promise.reject(
                              Error(
                                intl.formatMessage({
                                  id: 'error.newPasswordMustBeDifferentThanCurrent',
                                }),
                              ),
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  />
                  <ProFormText.Password
                    width="md"
                    name="confirm_password"
                    label={intl.formatMessage({
                      id: 'property.confirmPassword',
                    })}
                    dependencies={['new_password']}
                    rules={[
                      { required: true },
                      ({ getFieldValue }) => ({
                        validator(rule, value) {
                          if (!value || getFieldValue('new_password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            Error(
                              intl.formatMessage({
                                id: 'error.confirmPasswordDoesNotMatch',
                              }),
                            ),
                          );
                        },
                      }),
                    ]}
                  />
                </ModalForm>
              )}
            </Access>
            <Access accessible={canTerminateEmployment}>
              <ModalForm<API.TerminateContract>
                title={intl.formatMessage({
                  id: 'property.terminationForm',
                })}
                width="400px"
                trigger={
                  <Button key="terminate" danger style={{ width: '100%' }}>
                    {intl.formatMessage({
                      id: 'component.button.terminateEmployment',
                    })}
                  </Button>
                }
                onVisibleChange={() => {
                  terminationForm.resetFields();
                }}
                form={terminationForm}
                onFinish={async (value) => {
                  try {
                    await terminateEmployee(id!, {
                      ...value,
                      date: moment(value.date),
                    });
                    message.success(
                      intl.formatMessage({
                        id: 'error.updateSuccessfully',
                        defaultMessage: 'Update successfully!',
                      }),
                    );
                    // jobs.fetchData();
                    // schedule.fetchData();
                    onChange?.status?.('Terminated');
                    return true;
                  } catch {
                    message.error(
                      intl.formatMessage({
                        id: 'error.updateUnsuccessfully',
                        defaultMessage: 'Update unsuccessfully!',
                      }),
                    );
                    return false;
                  }
                }}
              >
                <ProFormSelect
                  name="reason"
                  width="md"
                  label={intl.formatMessage({
                    id: 'property.terminationReason',
                  })}
                  options={terminationReasons.data?.map((it) => ({
                    value: it.name,
                    label: it.name,
                  }))}
                  hasFeedback={terminationReasons.isLoading}
                  rules={[{ required: true }]}
                />
                <ProFormDatePicker
                  rules={[{ required: true }]}
                  width="md"
                  name="date"
                  label={intl.formatMessage({
                    id: 'property.start_date',
                  })}
                  initialValue={moment()}
                />
                <ProFormTextArea
                  width="md"
                  name="note"
                  label={intl.formatMessage({
                    id: 'property.note',
                  })}
                />
              </ModalForm>
            </Access>
          </Space>
        )}
      </Card>
    </Affix>
  );
};
