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
import ProForm, { ProFormDatePicker, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Button, Card, message } from 'antd';
import faker from 'faker';
import merge from 'lodash/merge';
import moment from 'moment';
import { useEffect, useState } from 'react';

type Props = {
  employeeId: number;
  isActive: boolean;
  onChange?: () => any;
};

export const EmployeeGeneral: React.FC<Props> = (props) => {
  const { employeeId, isActive, onChange } = props;
  const [countries, setCountries] = useState<API.Country[]>([]);
  const basicInfo = useAsyncData<API.Employee>(() => readEmployee(employeeId));
  const homeAddress = useAsyncData<API.EmployeeHomeAddress>(() => getHomeAddress(employeeId));
  const emergencyContact = useAsyncData<API.EmployeeEmergencyContact>(() =>
    getEmergencyContact(employeeId),
  );
  const bankInfo = useAsyncData<API.EmployeeBankInfo>(() => getBankInfo(employeeId));

  useEffect(() => {
    allCountries().then((fetchData) => setCountries(fetchData));
  }, []);

  return (
    <>
      <Card loading={basicInfo.isLoading} title="Basic info">
        <ProForm<API.Employee>
          onFinish={async (value) => {
            try {
              const final = merge(basicInfo.data, value);
              // @ts-ignore
              delete final.user.username;
              delete final.avatar;
              await updateEmployee(employeeId, final);
              basicInfo.setData(final);
              onChange?.();
              message.success('Updated successfully!');
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
          initialValues={basicInfo.data}
          submitter={
            isActive && {
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
              label="Email"
              disabled={!isActive}
            />
            <ProFormText
              width="sm"
              rules={[{ required: true }]}
              name="first_name"
              label="First name"
              disabled={!isActive}
            />
            <ProFormText
              width="sm"
              rules={[{ required: true }]}
              name="last_name"
              label="Last name"
              disabled={!isActive}
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
              disabled={!isActive}
            />
            <ProFormDatePicker
              width="sm"
              name="date_of_birth"
              label="Date of birth"
              disabled={!isActive}
            />
            <ProFormSelect
              width="sm"
              name="marital_status"
              label="Marital status"
              options={[
                { value: 'Single', label: 'Single' },
                { value: 'Married', label: 'Married' },
                { value: 'Divorced', label: 'Divorced' },
                { value: 'Seperated', label: 'Seperated' },
                { value: 'Widowed', label: 'Widowed' },
                { value: 'Other', label: 'Other' },
              ]}
              disabled={!isActive}
            />
            <ProFormText
              width="sm"
              name="personal_tax_id"
              label="Personal tax id"
              disabled={!isActive}
            />
            <ProFormText width="sm" name="nationality" label="Nationality" disabled={!isActive} />
            <ProFormText width="sm" name="phone" label="Phone" disabled={!isActive} />
            <ProFormText
              width="sm"
              name="social_insurance"
              label="Social insurance"
              disabled={!isActive}
            />
            <ProFormText
              width="sm"
              name="health_insurance"
              label="Health insurance"
              disabled={!isActive}
            />
          </ProForm.Group>
        </ProForm>
      </Card>
      <Card loading={homeAddress.isLoading} title="Home address">
        <ProForm<API.EmployeeHomeAddress>
          onFinish={async (value) => {
            try {
              const final = merge(homeAddress.data, value);
              final.owner = employeeId;
              await updateHomeAddress(employeeId, final);
              homeAddress.setData(final);
              onChange?.();
              message.success('Updated successfully!');
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
          initialValues={homeAddress.data}
          submitter={
            isActive && {
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
            <ProFormText width="sm" name="address" label="Full address" disabled={!isActive} />
            <ProFormSelect
              name="country"
              width="sm"
              label="Country"
              options={countries.map((it) => ({ value: it.name, label: it.name }))}
              disabled={!isActive}
            />
            <ProFormText width="sm" name="province" label="Province" disabled={!isActive} />
            <ProFormText width="sm" name="city" label="City" disabled={!isActive} />
          </ProForm.Group>
        </ProForm>
      </Card>
      <Card loading={emergencyContact.isLoading} title="Emergency contact">
        <ProForm<API.EmployeeEmergencyContact>
          onFinish={async (value) => {
            try {
              const final = merge(emergencyContact.data, value);
              value.owner = employeeId;
              await updateEmergencyContact(employeeId, final);
              emergencyContact.setData(final);
              onChange?.();
              message.success('Updated successfully!');
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
          initialValues={emergencyContact.data}
          submitter={
            isActive && {
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
            <ProFormText width="sm" name="fullname" label="Full name" disabled={!isActive} />
            <ProFormSelect
              width="sm"
              name="relationship"
              label="Relationship"
              options={[
                { value: 'Father', label: 'Father' },
                { value: 'Mother', label: 'Mother' },
                { value: 'Parent', label: 'Parent' },
                { value: 'Spouse', label: 'Spouse' },
                { value: 'Sibling', label: 'Sibling' },
                { value: 'Friend', label: 'Friend' },
                { value: 'Other', label: 'Other' },
              ]}
              disabled={!isActive}
            />
            <ProFormText width="sm" name="phone" label="Phone" disabled={!isActive} />
          </ProForm.Group>
        </ProForm>
      </Card>
      <Card loading={bankInfo.isLoading} title="Bank info">
        <ProForm<API.EmployeeBankInfo>
          onFinish={async (value) => {
            try {
              const final = merge(bankInfo.data, value);
              final.owner = employeeId;
              await updateBankInfo(employeeId, final);
              message.success('Updated successfully!');
              bankInfo.setData(final);
              onChange?.();
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
          initialValues={bankInfo.data}
          submitter={
            isActive && {
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
            <ProFormText width="sm" name="bank_name" label="Bank name" disabled={!isActive} />
            <ProFormText width="sm" name="account_name" label="Account name" disabled={!isActive} />
            <ProFormText width="sm" name="branch" label="Branch" disabled={!isActive} />
            <ProFormText
              width="sm"
              name="account_number"
              label="Account number"
              disabled={!isActive}
            />
            <ProFormText width="sm" name="swift_bic" label="Swift BIC" disabled={!isActive} />
            <ProFormText width="sm" name="iban" label="IBAN" disabled={!isActive} />
          </ProForm.Group>
        </ProForm>
      </Card>
    </>
  );
};
