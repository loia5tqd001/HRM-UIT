import { __DEV__ } from '@/global';
import { allCountries } from '@/services';
import ProForm, { ProFormDatePicker, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Button, Card, message } from 'antd';
import faker from 'faker';
import merge from 'lodash/merge';
import moment from 'moment';
import { useEffect, useState } from 'react';

type Props = {
  basicInfo: API.Employee | undefined;
  basicInfoSubmit: (value: API.Employee) => Promise<void>;
  homeAddress: API.EmployeeHomeAddress | undefined;
  homeAddressSubmit: (value: API.EmployeeHomeAddress) => Promise<void>;
  emergencyContact: API.EmployeeEmergencyContact | undefined;
  emergencyContactSubmit: (value: API.EmployeeEmergencyContact) => Promise<void>;
  bankInfo: API.EmployeeBankInfo | undefined;
  bankInfoSubmit: (value: API.EmployeeBankInfo) => Promise<void>;
};

export const EmployeeGeneral: React.FC<Props> = (props) => {
  const {
    basicInfo,
    basicInfoSubmit,
    homeAddress,
    homeAddressSubmit,
    emergencyContact,
    emergencyContactSubmit,
    bankInfo,
    bankInfoSubmit,
  } = props;
  const [countries, setCountries] = useState<API.Country[]>([]);

  useEffect(() => {
    allCountries().then((fetchData) => setCountries(fetchData));
  }, []);

  return (
    <>
      <Card loading={!basicInfo} title="Basic info">
        <ProForm<API.Employee>
          onFinish={async (value) => {
            try {
              const final = merge(basicInfo, value);
              // @ts-ignore
              delete final.user.username;
              // @ts-ignore
              delete final.avatar;
              await basicInfoSubmit(final);
              message.success('Updated successfully!');
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
          initialValues={basicInfo}
          submitter={{
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
          }}
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
                { value: 'Divorced', label: 'Divorced' },
                { value: 'Seperated', label: 'Seperated' },
                { value: 'Widowed', label: 'Widowed' },
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
      <Card loading={!homeAddress} title="Home address">
        <ProForm<API.EmployeeHomeAddress>
          onFinish={async (value) => {
            try {
              const final = merge(homeAddress, value);
              await homeAddressSubmit(final);
              message.success('Updated successfully!');
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
          initialValues={homeAddress}
          submitter={{
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
          }}
        >
          <ProForm.Group>
            <ProFormText width="sm" name="address" label="Full address" />
            <ProFormSelect
              name="country"
              width="sm"
              label="Country"
              options={countries.map((it) => ({ value: it.name, label: it.name }))}
            />
            <ProFormText width="sm" name="province" label="Province" />
            <ProFormText width="sm" name="city" label="City" />
          </ProForm.Group>
        </ProForm>
      </Card>
      <Card loading={!emergencyContact} title="Emergency contact">
        <ProForm<API.EmployeeEmergencyContact>
          onFinish={async (value) => {
            try {
              const final = merge(emergencyContact, value);
              await emergencyContactSubmit(final);
              message.success('Updated successfully!');
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
          initialValues={emergencyContact}
          submitter={{
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
          }}
        >
          <ProForm.Group>
            <ProFormText width="sm" name="fullname" label="Full name" />
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
            />
            <ProFormText width="sm" name="phone" label="Phone" />
          </ProForm.Group>
        </ProForm>
      </Card>
      <Card loading={!bankInfo} title="Bank info">
        <ProForm<API.EmployeeBankInfo>
          onFinish={async (value) => {
            try {
              const final = merge(bankInfo, value);
              await bankInfoSubmit(final);
              message.success('Updated successfully!');
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
          initialValues={bankInfo}
          submitter={{
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
          }}
        >
          <ProForm.Group>
            <ProFormText width="sm" name="bank_name" label="Bank name" />
            <ProFormText width="sm" name="account_name" label="Account name" />
            <ProFormText width="sm" name="branch" label="Branch" />
            <ProFormText width="sm" name="account_number" label="Account number" />
            <ProFormText width="sm" name="swift_bic" label="Swift BIC" />
            <ProFormText width="sm" name="iban" label="IBAN" />
          </ProForm.Group>
        </ProForm>
      </Card>
    </>
  );
};
