import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { __DEV__ } from '@/global';
import { allCountries } from '@/services';
import {
  getBankInfo,
  getEmergencyContact,
  getHomeAddress,
  readEmployee,
  updateBankInfo,
  updateEmergencyContact,
  updateEmployee,
  updateHomeAddress,
} from '@/services/employee';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { useEmployeeDetailAccess } from '@/utils/hooks/useEmployeeDetailType';
import ProForm, { ProFormDatePicker, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Button, Card, message } from 'antd';
import faker from 'faker';
import merge from 'lodash/merge';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Access, useIntl } from 'umi';
import type { EmployeeTabProps } from '..';

export const EmployeeGeneral: React.FC<EmployeeTabProps> = (props) => {
  const { employeeId, isActive, onChange } = props;
  const [countries, setCountries] = useState<API.Country[]>([]);
  const intl = useIntl();

  // == RBAC.BEGIN
  const {
    canViewBasicInfo,
    canChangeBasicInfo,
    canViewHomeAddress,
    canChangeHomeAddress,
    canViewEmergencyContact,
    canChangeEmergencyContact,
    canViewBankInfo,
    canChangeBankInfo,
  } = useEmployeeDetailAccess({ isActive, employeeId });
  // == RBAC.END

  const basicInfo = useAsyncData<API.Employee>(() => readEmployee(employeeId), {
    callOnMount: canViewBasicInfo,
  });
  const homeAddress = useAsyncData<API.EmployeeHomeAddress>(() => getHomeAddress(employeeId), {
    callOnMount: canViewHomeAddress,
  });
  const emergencyContact = useAsyncData<API.EmployeeEmergencyContact>(
    () => getEmergencyContact(employeeId),
    {
      callOnMount: canViewEmergencyContact,
    },
  );
  const bankInfo = useAsyncData<API.EmployeeBankInfo>(() => getBankInfo(employeeId), {
    callOnMount: canViewBankInfo,
  });

  useEffect(() => {
    allCountries().then((fetchData) => setCountries(fetchData));
  }, []);

  return (
    <>
      <Access accessible={canViewBasicInfo}>
        <Card
          loading={basicInfo.isLoading}
          title={intl.formatMessage({ id: 'property.basicInfo' })}
          className="card-shadow"
        >
          <ProForm<API.Employee>
            name="basic_info"
            onFinish={async (value) => {
              try {
                const final = merge(basicInfo.data, value);
                // @ts-ignore
                delete final.user.username;
                delete final.avatar;
                await updateEmployee(employeeId, final);
                basicInfo.setData(final);
                onChange?.basicInfo?.(final);
                message.success(
                  intl.formatMessage({
                    id: 'error.updateSuccessfully',
                    defaultMessage: 'Update successfully!',
                  }),
                );
              } catch {
                message.error(
                  intl.formatMessage({
                    id: 'error.updateUnsuccessfully',
                    defaultMessage: 'Update unsuccessfully!',
                  }),
                );
              }
            }}
            initialValues={basicInfo.data}
            submitter={
              canChangeBasicInfo && {
                render: ({ form }, defaultDoms) => {
                  return [
                    ...defaultDoms,
                    __DEV__ && (
                      <Button
                        key="autoFill"
                        onClick={() => {
                          form?.setFieldsValue({
                            first_name: faker.name.firstName(),
                            last_name: faker.name.lastName(),
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
                  ];
                },
              }
            }
          >
            <ProForm.Group>
              <ProFormText
                width="sm"
                rules={[{ required: true, type: 'email' }]}
                name="email"
                label={intl.formatMessage({ id: 'property.email' })}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                rules={[{ required: true }]}
                name="first_name"
                label={intl.formatMessage({ id: 'property.first_name' })}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                rules={[{ required: true }]}
                name="last_name"
                label={intl.formatMessage({ id: 'property.last_name' })}
                disabled={!isActive}
              />
              <ProFormSelect
                width="sm"
                name="gender"
                label={intl.formatMessage({ id: 'property.gender' })}
                options={[
                  { value: 'Male', label: intl.formatMessage({ id: 'property.gender.male' }) },
                  { value: 'Female', label: intl.formatMessage({ id: 'property.gender.female' }) },
                  { value: 'Other', label: intl.formatMessage({ id: 'property.gender.other' }) },
                ]}
                disabled={!isActive}
              />
              <ProFormDatePicker
                width="sm"
                name="date_of_birth"
                label={intl.formatMessage({ id: 'property.date_of_birth' })}
                disabled={!isActive}
              />
              <ProFormSelect
                width="sm"
                name="marital_status"
                label={intl.formatMessage({ id: 'property.marital_status' })}
                options={[
                  {
                    value: 'Single',
                    label: intl.formatMessage({ id: 'property.marital_status.single' }),
                  },
                  {
                    value: 'Married',
                    label: intl.formatMessage({ id: 'property.marital_status.married' }),
                  },
                  {
                    value: 'Divorced',
                    label: intl.formatMessage({ id: 'property.marital_status.divorced' }),
                  },
                  {
                    value: 'Seperated',
                    label: intl.formatMessage({ id: 'property.marital_status.seperated' }),
                  },
                  {
                    value: 'Widowed',
                    label: intl.formatMessage({ id: 'property.marital_status.widowed' }),
                  },
                  {
                    value: 'Other',
                    label: intl.formatMessage({ id: 'property.marital_status.other' }),
                  },
                ]}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="personal_tax_id"
                label={intl.formatMessage({ id: 'property.personal_tax_id' })}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="nationality"
                label={intl.formatMessage({ id: 'property.nationality' })}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="phone"
                label={intl.formatMessage({ id: 'property.phone' })}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="social_insurance"
                label={intl.formatMessage({ id: 'property.social_insurance' })}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="health_insurance"
                label={intl.formatMessage({ id: 'property.health_insurance' })}
                disabled={!isActive}
              />
            </ProForm.Group>
          </ProForm>
        </Card>
      </Access>
      <Access accessible={canViewHomeAddress}>
        <Card
          loading={homeAddress.isLoading}
          title={intl.formatMessage({ id: 'property.homeAddress' })}
          className="card-shadow"
        >
          <ProForm<API.EmployeeHomeAddress>
            onFinish={async (value) => {
              try {
                const final = merge(homeAddress.data, value);
                final.owner = employeeId;
                await updateHomeAddress(employeeId, final);
                homeAddress.setData(final);
                // onChange?.();
                message.success(
                  intl.formatMessage({
                    id: 'error.updateSuccessfully',
                    defaultMessage: 'Update successfully!',
                  }),
                );
              } catch {
                message.error(
                  intl.formatMessage({
                    id: 'error.updateUnsuccessfully',
                    defaultMessage: 'Update unsuccessfully!',
                  }),
                );
              }
            }}
            initialValues={homeAddress.data}
            submitter={
              canChangeHomeAddress && {
                render: ({ form }, defaultDoms) => {
                  return [
                    ...defaultDoms,
                    __DEV__ && (
                      <Button
                        key="autoFill"
                        onClick={() => {
                          form?.setFieldsValue({
                            address: faker.address.streetAddress(),
                            country: faker.helpers.randomize(countries.map((it) => it.name)),
                            province: faker.address.state(),
                            city: faker.address.city(),
                          });
                        }}
                      >
                        Auto fill
                      </Button>
                    ),
                  ];
                },
              }
            }
          >
            <ProForm.Group>
              <ProFormText
                width="sm"
                name="address"
                label={intl.formatMessage({ id: 'property.fullAddress' })}
                disabled={!isActive}
              />
              <ProFormSelect
                name="country"
                width="sm"
                label={intl.formatMessage({ id: 'property.country' })}
                options={countries.map((it) => ({ value: it.name, label: it.name }))}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="province"
                label={intl.formatMessage({ id: 'property.province' })}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="city"
                label={intl.formatMessage({ id: 'property.city' })}
                disabled={!isActive}
              />
            </ProForm.Group>
          </ProForm>
        </Card>
      </Access>
      <Access accessible={canViewEmergencyContact}>
        <Card
          loading={emergencyContact.isLoading}
          title={intl.formatMessage({ id: 'property.emergencyContact' })}
          className="card-shadow"
        >
          <ProForm<API.EmployeeEmergencyContact>
            onFinish={async (value) => {
              try {
                const final = merge(emergencyContact.data, value);
                final.owner = employeeId;
                await updateEmergencyContact(employeeId, final);
                emergencyContact.setData(final);
                // onChange?.();
                message.success(
                  intl.formatMessage({
                    id: 'error.updateSuccessfully',
                    defaultMessage: 'Update successfully!',
                  }),
                );
              } catch {
                message.error(
                  intl.formatMessage({
                    id: 'error.updateUnsuccessfully',
                    defaultMessage: 'Update unsuccessfully!',
                  }),
                );
              }
            }}
            initialValues={emergencyContact.data}
            submitter={
              canChangeEmergencyContact && {
                render: ({ form }, defaultDoms) => {
                  return [
                    ...defaultDoms,
                    __DEV__ && (
                      <Button
                        key="autoFill"
                        onClick={() => {
                          form?.setFieldsValue({
                            fullname: faker.name.findName(),
                            relationship: faker.helpers.randomize([
                              'Father',
                              'Mother',
                              'Parent',
                              'Spouse',
                              'Sibling',
                              'Friend',
                              'Other',
                            ]),
                            phone: faker.phone.phoneNumber('+84 #########'),
                          });
                        }}
                      >
                        Auto fill
                      </Button>
                    ),
                  ];
                },
              }
            }
          >
            <ProForm.Group>
              <ProFormText
                width="sm"
                name="fullname"
                label={intl.formatMessage({ id: 'property.full_name' })}
                disabled={!isActive}
              />
              <ProFormSelect
                width="sm"
                name="relationship"
                label={intl.formatMessage({ id: 'property.relationship' })}
                options={[
                  {
                    value: 'Father',
                    label: intl.formatMessage({ id: 'property.relationship.Father' }),
                  },
                  {
                    value: 'Mother',
                    label: intl.formatMessage({ id: 'property.relationship.Mother' }),
                  },
                  {
                    value: 'Parent',
                    label: intl.formatMessage({ id: 'property.relationship.Parent' }),
                  },
                  {
                    value: 'Spouse',
                    label: intl.formatMessage({ id: 'property.relationship.Spouse' }),
                  },
                  {
                    value: 'Sibling',
                    label: intl.formatMessage({ id: 'property.relationship.Sibling' }),
                  },
                  {
                    value: 'Friend',
                    label: intl.formatMessage({ id: 'property.relationship.Friend' }),
                  },
                  {
                    value: 'Other',
                    label: intl.formatMessage({ id: 'property.relationship.Other' }),
                  },
                ]}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="phone"
                label={intl.formatMessage({ id: 'property.phone' })}
                disabled={!isActive}
              />
            </ProForm.Group>
          </ProForm>
        </Card>
      </Access>
      <Access accessible={canViewBankInfo}>
        <Card
          loading={bankInfo.isLoading}
          title={intl.formatMessage({ id: 'property.bankInfo' })}
          className="card-shadow"
        >
          <ProForm<API.EmployeeBankInfo>
            onFinish={async (value) => {
              try {
                const final = merge(bankInfo.data, value);
                final.owner = employeeId;
                await updateBankInfo(employeeId, final);
                message.success(
                  intl.formatMessage({
                    id: 'error.updateSuccessfully',
                    defaultMessage: 'Update successfully!',
                  }),
                );
                bankInfo.setData(final);
                // onChange?.();
              } catch {
                message.error(
                  intl.formatMessage({
                    id: 'error.updateUnsuccessfully',
                    defaultMessage: 'Update unsuccessfully!',
                  }),
                );
              }
            }}
            initialValues={bankInfo.data}
            submitter={
              canChangeBankInfo && {
                render: ({ form }, defaultDoms) => {
                  return [
                    ...defaultDoms,
                    __DEV__ && (
                      <Button
                        key="autoFill"
                        onClick={() => {
                          form?.setFieldsValue({
                            bank_name: faker.company.companyName(),
                            account_name: faker.finance.accountName(),
                            branch: faker.company.companyName(),
                            account_number: faker.finance.account(),
                            swift_bic: faker.finance.bic(),
                            iban: faker.finance.iban(),
                          });
                        }}
                      >
                        Auto fill
                      </Button>
                    ),
                  ];
                },
              }
            }
          >
            <ProForm.Group>
              <ProFormText
                width="sm"
                name="bank_name"
                label={intl.formatMessage({ id: 'property.bank_name' })}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="account_name"
                label={intl.formatMessage({ id: 'property.account_name' })}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="branch"
                label={intl.formatMessage({ id: 'property.branch' })}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="account_number"
                label={intl.formatMessage({ id: 'property.account_number' })}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="swift_bic"
                label={intl.formatMessage({ id: 'property.swift_bic' })}
                disabled={!isActive}
              />
              <ProFormText
                width="sm"
                name="iban"
                label={intl.formatMessage({ id: 'property.iban' })}
                disabled={!isActive}
              />
            </ProForm.Group>
          </ProForm>
        </Card>
      </Access>
    </>
  );
};
