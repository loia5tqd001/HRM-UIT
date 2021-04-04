import { readEmployee, updateEmployee } from '@/services/employee';
import ProForm, { ProFormDatePicker, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, message } from 'antd';
import { merge } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

export const Edit: React.FC = () => {
  const { id } = useParams<any>();
  const [record, setRecord] = useState<API.Employee>();

  useEffect(() => {
    readEmployee(id).then((fetchData) => setRecord(fetchData));
  }, [id]);

  return (
    <PageContainer title="Edit employee">
      <Card loading={!record} style={{ height: '100%' }}>
        <ProForm<API.Employee>
          onFinish={async (value) => {
            const final = merge(record, value);
            // @ts-ignore
            delete final.user.username;
            // @ts-ignore
            delete final.avatar;
            await updateEmployee(final.id, final);
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
    </PageContainer>
  );
};

export default Edit;
