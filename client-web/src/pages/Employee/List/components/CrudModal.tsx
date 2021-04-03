import { __DEV__ } from '@/global';
import type { RecordType } from '@/models/employee';
import { createEmployee, updateEmployee } from '@/services/employee';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { Button } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import moment from 'moment';
import React from 'react';
import { useModel } from 'umi';

const dict = {
  title: {
    create: 'New Employee',
    update: 'Edit Employee',
  },
};

export const CrudModal: React.FC = () => {
  const [form] = useForm<RecordType>();
  const { crudModalVisible, setCrudModalVisible, onCrudOperation, seletectedRecord } = useModel(
    'employee',
  );

  return (
    <ModalForm
      title={dict.title[crudModalVisible]}
      visible={crudModalVisible !== 'hidden'}
      onVisibleChange={(visible) => {
        if (!visible) {
          setCrudModalVisible('hidden');
          form.resetFields();
          return;
        }
        if (!seletectedRecord) return;
        if (crudModalVisible === 'update') {
          form.setFieldsValue({
            ...seletectedRecord,
          });
        } else if (crudModalVisible === 'create') {
          form.setFieldsValue({});
        }
      }}
      onFinish={async (value) => {
        const record = {
          ...seletectedRecord,
          ...value,
        };
        record.user.is_staff = true;
        if (crudModalVisible === 'create') {
          await onCrudOperation(() => createEmployee(record), 'Create unsuccessfully!');
        } else if (crudModalVisible === 'update') {
          await onCrudOperation(() => updateEmployee(value.id, record), 'Update unsuccessfully!');
        }
        setCrudModalVisible('hidden');
        form.resetFields();
      }}
      form={form}
      submitter={{
        render: (props, defaultDoms) => {
          return [
            __DEV__ && (
              <Button
                key="autoFill"
                onClick={() => {
                  const password = faker.internet.password();

                  form.setFieldsValue({
                    user: {
                      username: faker.internet.userName(),
                      password,
                      confirm_password: password,
                    },
                    first_name: faker.name.firstName(),
                    last_name: faker.name.lastName(),
                    avatar: faker.image.avatar(),
                    email: faker.internet.email(),
                    gender: faker.helpers.randomize(['Male', 'Female', 'Other']),
                    marital_status: faker.helpers.randomize([
                      'Single',
                      'Married',
                      'Divorced',
                      'Seperated',
                      'Widowed',
                      'Other',
                    ]),
                    date_of_birth: moment(faker.date.past(30)),
                    personal_tax_id: faker.finance.account(),
                    nationality: 'Việt Nam',
                    phone: faker.phone.phoneNumber('(+84) #########'),
                    social_insurance: String(
                      faker.random.number({ min: 1000000000, max: 9999999999 }),
                    ),
                    health_insurance: String(
                      faker.random.number({ min: 1000000000, max: 9999999999 }),
                    ),
                  });
                }}
              >
                Auto fill
              </Button>
            ),
            ...defaultDoms,
          ];
        },
      }}
    >
      <ProForm.Group>
        <ProFormText
          width="sm"
          rules={[{ required: true }]}
          name={['user', 'username']}
          label="Username"
        />
        <ProFormText.Password
          width="sm"
          rules={[{ required: true }]}
          name={['user', 'password']}
          label="Password"
        />
        <ProFormText.Password
          width="sm"
          rules={[{ required: true }]}
          name={['user', 'confirm_password']}
          label="Confirm Password"
        />
        <ProFormText
          width="sm"
          rules={[{ required: true, type: 'email' }]}
          name="email"
          label="Email"
        />
        <ProFormText width="sm" rules={[{ required: true }]} name="first_name" label="First name" />
        <ProFormText width="sm" rules={[{ required: true }]} name="last_name" label="Last name" />
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
    </ModalForm>
  );
};
