import { EmployeeGeneral } from '@/components/EmployeeGeneral';
import { changeAvatar, changePassword, updateProfile } from '@/services/auth';
import {
  getBankInfo,
  getEmergencyContact,
  getHomeAddress,
  updateBankInfo,
  updateEmergencyContact,
  updateHomeAddress,
} from '@/services/employee';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Button, Card, message, Radio, Switch, Tooltip, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import styles from './index.less';

export const Edit: React.FC = () => {
  const { initialState, refresh } = useModel('@@initialState');
  const [modalVisible, setModalVisible] = useState(false);
  const [homeAddress, setHomeAddress] = useState<API.EmployeeHomeAddress>();
  const [emergencyContact, setEmergencyContact] = useState<API.EmployeeEmergencyContact>();
  const [bankInfo, setBankInfo] = useState<API.EmployeeBankInfo>();
  const id = initialState?.currentUser?.id;
  const [currentTab, setCurrentTab] = useState<'general' | 'job' | 'payroll'>('general');

  useEffect(() => {
    if (id === undefined) return;
    getHomeAddress(id).then((fetchData) => setHomeAddress(fetchData));
    getEmergencyContact(id).then((fetchData) => setEmergencyContact(fetchData));
    getBankInfo(id).then((fetchData) => setBankInfo(fetchData));
  }, [id]);

  return (
    <PageContainer title="Profile" loading={!id}>
      <GridContent>
        <div className={styles.layout}>
          <Card bordered={false} loading={!initialState?.currentUser}>
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
                  await changeAvatar(data, config);
                  await refresh();
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
                  <img src={initialState?.currentUser?.avatar} alt="avatar" />
                </div>
              </Tooltip>
            </Upload>
            <h2 style={{ marginTop: 12, marginBottom: 0 }}>
              {initialState?.currentUser?.first_name} {initialState?.currentUser?.last_name}
            </h2>
            <h4 style={{ marginBottom: 12 }}>@{initialState?.currentUser?.user?.username}</h4>
            <Button
              style={{ display: 'block', marginBottom: 12 }}
              onClick={() => setModalVisible(true)}
            >
              Change password
            </Button>
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              checked={initialState?.currentUser?.user?.is_active}
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
                await changePassword(value.password, value.new_password);
                message.success('Password changed successfully!');
                setModalVisible(false);
              } catch {
                message.error('Cannot change password!');
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
              basicInfo={initialState?.currentUser}
              basicInfoSubmit={async (value) => {
                await updateProfile(value);
                await refresh();
              }}
              homeAddress={homeAddress}
              homeAddressSubmit={async (value) => {
                value.owner = id;
                await updateHomeAddress(id!, value);
                setHomeAddress(value);
              }}
              emergencyContact={emergencyContact}
              emergencyContactSubmit={async (value) => {
                value.owner = id;
                await updateEmergencyContact(id!, value);
                setEmergencyContact(value);
              }}
              bankInfo={bankInfo}
              bankInfoSubmit={async (value) => {
                value.owner = id;
                await updateBankInfo(id!, value);
                setBankInfo(value);
              }}
            />
          </div>
        </div>
      </GridContent>
    </PageContainer>
  );
};

export default Edit;
