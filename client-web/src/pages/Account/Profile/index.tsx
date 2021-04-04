import { changePassword, updateProfile } from '@/services/auth';
import { UploadOutlined } from '@ant-design/icons';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Button, Card, message, Switch, Upload } from 'antd';
import { merge } from 'lodash';
import React from 'react';
import { useModel } from 'umi';
import styles from './index.less';
import { useState } from 'react';
import jwt from '@/utils/jwt';

export const Edit: React.FC = () => {
  const { initialState, refresh } = useModel('@@initialState');
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <PageContainer title="Profile">
      <GridContent>
        <div className={styles.layout}>
          <Card bordered={false} loading={!initialState?.currentUser}>
            <div className={styles.avatar}>
              <img src={initialState?.currentUser?.avatar} alt="avatar" />
            </div>
            <Upload
              showUploadList={false}
              style={{ display: 'block' }}
              accept="image/png, image/jpeg"
              action="/api/auth/current_user/avatar"
              headers={{
                authorization: `Bearer ${jwt.getAccess()}`,
              }}
              onChange={function (info) {
                if (info.file.status !== 'uploading') {
                  console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                  message.success(`${info.file.name} file uploaded successfully`);
                } else if (info.file.status === 'error') {
                  message.error(`${info.file.name} file upload failed.`);
                }
              }}
            >
              <Button style={{ width: '100%' }}>
                <UploadOutlined />
                Change avatar
              </Button>
            </Upload>
            <h2 style={{ marginTop: 12, marginBottom: 0 }}>
              {initialState?.currentUser?.first_name} {initialState?.currentUser?.last_name}
            </h2>
            <h4 style={{ marginBottom: 12 }}>@{initialState?.currentUser?.user.username}</h4>
            <Button
              onClick={() => setModalVisible(true)}
              style={{ display: 'block', marginBottom: 12 }}
            >
              Change password
            </Button>
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              checked={initialState?.currentUser?.user.is_active}
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
          <Card loading={!initialState?.currentUser} style={{ height: '100%' }} title="Basic info">
            <ProForm<API.Employee>
              onFinish={async (value) => {
                const final = merge(initialState?.currentUser, value);
                // @ts-ignore
                delete final.user.username;
                // @ts-ignore
                delete final.avatar;
                await updateProfile(final);
                await refresh();
                message.success('Updated successfully!');
              }}
              initialValues={initialState?.currentUser}
            >
              <ProForm.Group>
                <ProFormText
                  width="sm"
                  rules={[{ required: true, type: 'email' }]}
                  name="email"
                  label="Email"
                />
                <ProFormText
                  width="sm"
                  rules={[{ required: true }]}
                  name="first_name"
                  label="First name"
                />
                <ProFormText
                  width="sm"
                  rules={[{ required: true }]}
                  name="last_name"
                  label="Last name"
                />
              </ProForm.Group>
              <ProForm.Group>
                <ProFormSelect
                  width="sm"
                  name="gender"
                  label="Gender"
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
                <ProFormDatePicker width="sm" name="date_of_birth" label="Date of birth" />
                <ProFormSelect
                  width="sm"
                  name="marital_status"
                  label="Marital status"
                  options={[
                    { value: 'Single', label: 'Single' },
                    { value: 'Married', label: 'Married' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
                <ProFormText width="sm" name="personal_tax_id" label="Personal tax id" />
                <ProFormText width="sm" name="nationality" label="Nationality" />
                <ProFormText width="sm" name="phone" label="Phone" />
                <ProFormText width="sm" name="social_insurance" label="Social insurance" />
                <ProFormText width="sm" name="health_insurance" label="Health insurance" />
              </ProForm.Group>
            </ProForm>
          </Card>
        </div>
      </GridContent>
    </PageContainer>
  );
};

export default Edit;
