import { EmployeeGeneral } from '@/components/EmployeeGeneral';
import {
  changeEmployeeAvatar,
  changeEmployeePassword,
  getEmergencyContact,
  getHomeAddress,
  readEmployee,
  updateEmergencyContact,
  updateEmployee,
  updateHomeAddress,
} from '@/services/employee';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Button, Card, message, Radio, Switch, Tooltip, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import styles from './index.less';

export const Edit: React.FC = () => {
  const { id } = useParams<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [record, setRecord] = useState<API.Employee>();
  const [homeAddress, setHomeAddress] = useState<API.EmployeeHomeAddress>();
  const [emergencyContact, setEmergencyContact] = useState<API.EmployeeEmergencyContact>();
  const [currentTab, setCurrentTab] = useState<'general' | 'job' | 'payroll'>('general');

  useEffect(() => {
    readEmployee(id).then((fetchData) => setRecord(fetchData));
    getHomeAddress(id).then((fetchData) => setHomeAddress(fetchData));
    getEmergencyContact(id).then((fetchData) => setEmergencyContact(fetchData));
  }, [id]);

  return (
    <PageContainer title="Edit employee">
      <GridContent>
        <div className={styles.layout}>
          <Card bordered={false} loading={!record}>
            <Upload
              showUploadList={false}
              style={{ display: 'block', cursor: 'pointer' }}
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
                  await changeEmployeeAvatar(id, data, config);
                  await readEmployee(id).then((fetchData) => {
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
              <Tooltip title="Change avatar" placement="top">
                <div className={styles.avatar}>
                  <img src={record?.avatar} alt="avatar" />
                </div>
              </Tooltip>
            </Upload>
            <h2 style={{ marginTop: 12, marginBottom: 0 }}>
              {record?.first_name} {record?.last_name}
            </h2>
            <h4 style={{ marginBottom: 12 }}>@{record?.user.username}</h4>
            <Button
              style={{ display: 'block', marginBottom: 12 }}
              onClick={() => setModalVisible(true)}
            >
              Change password
            </Button>
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              checked={record?.user.is_active}
              onChange={(checked) => {
                console.log(checked);
              }}
            />
          </Card>
          <ModalForm
            title="Change password"
            width="400px"
            visible={modalVisible}
            onVisibleChange={setModalVisible}
            onFinish={async (value) => {
              try {
                await changeEmployeePassword(id, value.new_password);
                message.success('Password changed successfully!');
                setModalVisible(false);
              } catch {
                message.error('Cannot change password!');
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
          <div className={styles.right}>
            <Card>
              <Radio.Group
                value={currentTab}
                onChange={(e) => setCurrentTab(e.target.value)}
                className={styles.radioGroup}
              >
                <Radio.Button value="general">GENERAL</Radio.Button>
                <Radio.Button value="job">JOB</Radio.Button>
                <Radio.Button value="payroll">PAYROLL</Radio.Button>
              </Radio.Group>
            </Card>
            <EmployeeGeneral
              basicInfo={record}
              basicInfoSubmit={async (value) => {
                await updateEmployee(value.id, value);
                setRecord(value);
              }}
              homeAddress={homeAddress}
              homeAddressSubmit={async (value) => {
                value.owner = id;
                await updateHomeAddress(id, value);
                setHomeAddress(value);
              }}
              emergencyContact={emergencyContact}
              emergencyContactSubmit={async (value) => {
                value.owner = id;
                await updateEmergencyContact(id, value);
                setEmergencyContact(value);
              }}
            />
          </div>
        </div>
      </GridContent>
    </PageContainer>
  );
};

export default Edit;
