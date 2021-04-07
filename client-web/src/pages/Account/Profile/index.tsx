import { __DEV__ } from '@/global';
import { allCountries } from '@/services';
import { changeAvatar, changePassword } from '@/services/auth';
import {
  getEmergencyContact,
  getHomeAddress,
  updateEmergencyContact,
  updateEmployee,
  updateHomeAddress,
} from '@/services/employee';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Button, Card, message, Switch, Tooltip, Upload } from 'antd';
import faker from 'faker';
import { merge } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import styles from './index.less';

export const Edit: React.FC = () => {
  const { initialState, refresh } = useModel('@@initialState');
  const [modalVisible, setModalVisible] = useState(false);
  const [homeAddress, setHomeAddress] = useState<API.EmployeeContactInfo>();
  const [emergencyContact, setEmergencyContact] = useState<API.EmployeeEmergencyContact>();
  const id = initialState?.currentUser?.id;
  const [countries, setCountries] = useState<API.Country[]>([]);

  useEffect(() => {
    if (id === undefined) return;
    getHomeAddress(id).then((fetchData) => setHomeAddress(fetchData));
    getEmergencyContact(id).then((fetchData) => setEmergencyContact(fetchData));
    allCountries().then((fetchData) => setCountries(fetchData));
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
            <h4 style={{ marginBottom: 12 }}>@{initialState?.currentUser?.user.username}</h4>
            <Button
              style={{ display: 'block', marginBottom: 12 }}
              onClick={() => setModalVisible(true)}
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
          <div className={styles.right}>
            <Card loading={!initialState?.currentUser} title="Basic info">
              <ProForm<API.Employee>
                onFinish={async (value) => {
                  const final = merge(initialState?.currentUser, value);
                  // @ts-ignore
                  delete final.user.username;
                  // @ts-ignore
                  delete final.avatar;
                  await updateEmployee(final.id, final);
                  await refresh();
                  message.success('Updated successfully!');
                }}
                initialValues={initialState?.currentUser}
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
              <ProForm<API.EmployeeContactInfo>
                onFinish={async (value) => {
                  try {
                    const final = merge(homeAddress, value);
                    final.owner = id;
                    await updateHomeAddress(id!, final);
                    setHomeAddress(final);
                    message.success('Updated successfully!');
                  } catch {
                    message.error('Update failed!');
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
                  <ProFormText width="sm" name="country" label="Country" />
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
                    final.owner = id;
                    await updateEmergencyContact(id!, final);
                    setEmergencyContact(final);
                    message.success('Updated successfully!');
                  } catch {
                    message.error('Update failed!');
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
          </div>
        </div>
      </GridContent>
    </PageContainer>
  );
};

export default Edit;
