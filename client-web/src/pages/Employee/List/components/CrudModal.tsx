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
import { useIntl } from 'umi';

export const CrudModal: React.FC = () => {
  const [form] = useForm<RecordType>();
  const { crudModalVisible, setCrudModalVisible, onCrudOperation, seletectedRecord } = useModel(
    'employee',
  );
  const intl = useIntl();

  const dict = {
    title: {
      create: intl.formatMessage({
        id: 'pages.employee.new.title',
        defaultMessage: 'New Employee',
      }),
      update: intl.formatMessage({
        id: 'pages.employee.edit.title',
        defaultMessage: 'Edit Employee',
      }),
    },
  };

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
          await onCrudOperation(
            () => createEmployee(record),
            'Create successfully!',
            'Create unsuccessfully!',
          );
        } else if (crudModalVisible === 'update') {
          await onCrudOperation(
            () => updateEmployee(record.id, record),
            'Update successfully!',
            'Update unsuccessfully!',
          );
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
          label={intl.formatMessage({
            id: 'property.username',
            defaultMessage: 'Username',
          })}
        />
        <ProFormText.Password
          width="sm"
          rules={[{ required: true }]}
          name={['user', 'password']}
          label={intl.formatMessage({
            id: 'property.password',
            defaultMessage: 'Password',
          })}
        />
        <ProFormText.Password
          width="sm"
          rules={[{ required: true }]}
          name={['user', 'confirm_password']}
          label={intl.formatMessage({
            id: 'property.confirm_password',
            defaultMessage: 'Confirm Password',
          })}
        />
        <ProFormText
          width="sm"
          rules={[{ required: true, type: 'email' }]}
          name="email"
          label={intl.formatMessage({
            id: 'property.email',
            defaultMessage: 'Email',
          })}
        />
        <ProFormText
          width="sm"
          rules={[{ required: true }]}
          name="first_name"
          label={intl.formatMessage({
            id: 'property.first_name',
            defaultMessage: 'First name',
          })}
        />
        <ProFormText
          width="sm"
          rules={[{ required: true }]}
          name="last_name"
          label={intl.formatMessage({
            id: 'property.last_name',
            defaultMessage: 'Last name',
          })}
        />
        <ProFormSelect
          width="sm"
          name="gender"
          label={intl.formatMessage({
            id: 'property.gender',
            defaultMessage: 'Gender',
          })}
          options={[
            {
              value: 'Male',
              label: intl.formatMessage({
                id: 'property.gender.male',
                defaultMessage: 'Gender',
              }),
            },
            {
              value: 'Female',
              label: intl.formatMessage({
                id: 'property.gender.female',
                defaultMessage: 'Gender',
              }),
            },
            {
              value: 'Other',
              label: intl.formatMessage({
                id: 'property.gender.other',
                defaultMessage: 'Gender',
              }),
            },
          ]}
        />
        <ProFormDatePicker
          width="sm"
          name="date_of_birth"
          label={intl.formatMessage({
            id: 'property.date_of_birth',
            defaultMessage: 'Date of birth',
          })}
        />
        <ProFormSelect
          width="sm"
          name="marital_status"
          label={intl.formatMessage({
            id: 'property.marital_status',
            defaultMessage: 'Marital status',
          })}
          options={[
            {
              value: 'Single',
              label: intl.formatMessage({
                id: 'property.marital_status.single',
                defaultMessage: 'Single',
              }),
            },
            {
              value: 'Married',
              label: intl.formatMessage({
                id: 'property.marital_status.married',
                defaultMessage: 'Married',
              }),
            },
            {
              value: 'Divorced',
              label: intl.formatMessage({
                id: 'property.marital_status.divorced',
                defaultMessage: 'Divorced',
              }),
            },
            {
              value: 'Seperated',
              label: intl.formatMessage({
                id: 'property.marital_status.seperated',
                defaultMessage: 'Seperated',
              }),
            },
            {
              value: 'Widowed',
              label: intl.formatMessage({
                id: 'property.marital_status.widowed',
                defaultMessage: 'Widowed',
              }),
            },
            {
              value: 'Other',
              label: intl.formatMessage({
                id: 'property.marital_status.other',
                defaultMessage: 'Other',
              }),
            },
          ]}
        />
        <ProFormText
          width="sm"
          name="personal_tax_id"
          label={intl.formatMessage({
            id: 'property.personal_tax_id',
            defaultMessage: 'Personal tax id',
          })}
        />
        <ProFormText
          width="sm"
          name="nationality"
          label={intl.formatMessage({
            id: 'property.nationality',
            defaultMessage: 'Nationality',
          })}
        />
        <ProFormText
          width="sm"
          name="phone"
          label={intl.formatMessage({
            id: 'property.phone',
            defaultMessage: 'Phone',
          })}
        />
        <ProFormText
          width="sm"
          name="social_insurance"
          label={intl.formatMessage({
            id: 'property.social_insurance',
            defaultMessage: 'Social insurance',
          })}
        />
        <ProFormText
          width="sm"
          name="health_insurance"
          label={intl.formatMessage({
            id: 'property.health_insurance',
            defaultMessage: 'Health insurance',
          })}
        />
      </ProForm.Group>
    </ModalForm>
  );
};
