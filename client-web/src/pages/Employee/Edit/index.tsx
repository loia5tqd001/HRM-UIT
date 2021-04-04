import { readEmployee, updateEmployee } from '@/services/employee';
import { UploadOutlined } from '@ant-design/icons';
import ProForm, {
  ProFormDatePicker,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-form';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Col, message, Row, Switch, Upload } from 'antd';
import { merge } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import styles from './index.less';

export const Edit: React.FC = () => {
  const { id } = useParams<any>();
  const [record, setRecord] = useState<API.Employee>();

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
            <Button style={{ display: 'block', marginBottom: 12 }}>Change password</Button>
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              checked={record?.user.is_active}
              onChange={(checked) => {
                console.log(checked);
              }}
            />
          </Card>
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
