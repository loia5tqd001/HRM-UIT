import { changeEmployeePassword, readEmployee, updateEmployee } from '@/services/employee';
import { UploadOutlined } from '@ant-design/icons';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,

  ProFormText
} from '@ant-design/pro-form';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Button, Card, message, Switch, Upload } from 'antd';
import { merge } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import styles from './index.less';

export const Edit: React.FC = () => {
  const { id } = useParams<any>();
  const [record, setRecord] = useState<API.Employee>();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    readEmployee(id).then((fetchData) => setRecord(fetchData));
  }, [id]);

  return (
    <PageContainer title="Edit employee">
      <GridContent>
        <div className={styles.layout}>
          <Card bordered={false} loading={!record}>
            <div className={styles.avatar}>
              <img src={record?.avatar} alt="avatar" />
            </div>
            <Upload showUploadList={false} style={{ display: 'block' }}>
              <Button style={{ width: '100%' }}>
                <UploadOutlined />
                Change avatar
              </Button>
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
          <Card loading={!record} style={{ height: '100%' }} title="Basic info">
            <ProForm<API.Employee>
              onFinish={async (value) => {
                const final = merge(record, value);
                // @ts-ignore
                delete final.user.username;
                // @ts-ignore
                delete final.avatar;
                await updateEmployee(final.id, final);
                setRecord(final);
                message.success('Updated successfully!');
              }}
              initialValues={record}
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
