import { changePassword } from '@/services/auth';
import {
  changeEmployeeAvatar,
  changeEmployeePassword,
  readEmployee,
  terminateEmployee,
} from '@/services/employee';
import {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Affix, Badge, Button, Card, message, Space, Tooltip, Upload } from 'antd';
import React from 'react';
import styles from '@/styles/employee_detail.less';
import { KeyOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { allTerminationReasons } from '@/services/admin.job.terminationReason';
import type { OnChangeSubscription } from '../EmployeeTabs';

type Props = {
  employee: API.Employee | undefined;
  setEmployee: (x: API.Employee) => void;
  type: 'employee-edit' | 'account-profile';
  onChange?: OnChangeSubscription;
};

const mapStatus = {
  NewHired: {
    text: 'New Hire',
    status: 'warning',
  },
  Working: {
    text: 'Working',
    status: 'success',
  },
  Terminated: {
    text: 'Terminated',
    status: 'error',
  },
} as const;

export const EmployeeLeftPanel: React.FC<Props> = (props) => {
  const { employee: record, setEmployee: setRecord, type, onChange } = props;
  const id = record?.id;
  const isActive = record?.status !== 'Terminated';
  const [terminationForm] = useForm<API.TerminateContract>();
  const terminationReasons = useAsyncData<API.TerminationReason[]>(allTerminationReasons);

  return (
    <Affix offsetTop={50}>
      <Card bordered={false} loading={!record} className="card-shadow">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Upload
            disabled={!isActive}
            showUploadList={false}
            style={{ display: 'block', cursor: `${isActive ? 'pointer' : undefined}` }}
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
            <Tooltip title={isActive && 'Change avatar'} placement="top">
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
            title={`Status: ${record.status}`}
          >
            <Badge {...mapStatus[record.status]} />
          </h4>
        )}
        <h4
          style={{
            fontWeight: 400,
          }}
          title={`Role: ${record?.role}`}
          className={styles.textEllipse}
        >
          <KeyOutlined /> <span className={styles.content}>{record?.role}</span>
        </h4>
        <h4
          style={{
            fontWeight: 400,
          }}
          title={`Username: ${record?.user.username}`}
          className={styles.textEllipse}
        >
          <UserOutlined /> <span className={styles.content}>{record?.user.username}</span>
        </h4>
        <h4
          style={{
            fontWeight: 400,
            marginBottom: 12,
          }}
          title={`Email: ${record?.email}`}
          className={styles.textEllipse}
        >
          <MailOutlined />
          <span className={styles.content}>{record?.email}</span>
        </h4>
        {isActive && (
          <Space direction="vertical" style={{ width: '100%' }}>
            {type === 'employee-edit' ? (
              <ModalForm
                title="Change password"
                width="400px"
                trigger={
                  <Button className={styles.changePasswordButton} type="primary">
                    Change password
                  </Button>
                }
                onFinish={async (value) => {
                  try {
                    await changeEmployeePassword(id!, value.new_password);
                    message.success('Password changed successfully!');
                    return true;
                  } catch {
                    message.error('Cannot change password!');
                    return false;
                  }
                }}
              >
                <ProFormText.Password
                  width="md"
                  name="new_password"
                  label="New password"
                  rules={[
                    { required: true },
                    { min: 6, message: 'Password must contain at least 6 characters!' },
                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        if (value && getFieldValue('password') === value) {
                          return Promise.reject(
                            Error('New password must be different than current password'),
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
                  label="Confirm password"
                  dependencies={['new_password']}
                  rules={[
                    { required: true },
                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        if (!value || getFieldValue('new_password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(Error('Confirm password does not match!'));
                      },
                    }),
                  ]}
                />
              </ModalForm>
            ) : (
              <ModalForm
                title="Change password"
                width="400px"
                trigger={
                  <Button className={styles.changePasswordButton} type="primary">
                    Change password
                  </Button>
                }
                onFinish={async (value) => {
                  try {
                    await changePassword(value.password, value.new_password);
                    message.success('Password changed successfully!');
                    return true;
                  } catch {
                    message.error('Cannot change password!');
                    return false;
                  }
                }}
              >
                <ProFormText.Password
                  width="md"
                  name="password"
                  label="Current password"
                  rules={[{ required: true }]}
                />
                <ProFormText.Password
                  width="md"
                  name="new_password"
                  label="New password"
                  rules={[
                    { required: true },
                    { min: 6, message: 'Password must contain at least 6 characters!' },
                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        if (value && getFieldValue('password') === value) {
                          return Promise.reject(
                            Error('New password must be different than current password'),
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
                  label="Confirm password"
                  dependencies={['new_password']}
                  rules={[
                    { required: true },
                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        if (!value || getFieldValue('new_password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(Error('Confirm password does not match!'));
                      },
                    }),
                  ]}
                />
              </ModalForm>
            )}
            <ModalForm<API.TerminateContract>
              title="Termination Form"
              width="400px"
              trigger={
                <Button key="terminate" danger style={{ width: '100%' }}>
                  Terminate Contract
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
                  message.success('Terminate successfully!');
                  // jobs.fetchData();
                  // schedule.fetchData();
                  onChange?.status?.('Terminated');
                  return true;
                } catch {
                  message.error('Terminate unsuccessfully!');
                  return false;
                }
              }}
            >
              <ProFormSelect
                name="reason"
                width="md"
                label="Termination reason"
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
                label="Date"
                initialValue={moment()}
              />
              <ProFormTextArea width="md" name="note" label="Note" />
            </ModalForm>
          </Space>
        )}
      </Card>
    </Affix>
  );
};
