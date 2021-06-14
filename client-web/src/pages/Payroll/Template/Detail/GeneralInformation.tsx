import { updatePayrollTemplate } from '@/services/payroll.template';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Card, message } from 'antd';
import React from 'react';
import { useIntl } from 'umi';

type Props = {
  payrollTemplate: API.PayrollTemplate | undefined;
  setPayrollTemplate: React.Dispatch<React.SetStateAction<API.PayrollTemplate | undefined>>;
};

export const GeneralInformation: React.FC<Props> = (props) => {
  const { payrollTemplate, setPayrollTemplate } = props;
  const intl = useIntl();

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <Card title={payrollTemplate?.name} loading={!payrollTemplate} className="card-shadow">
        <ProForm<API.PayrollTemplate>
          submitter={{
            searchConfig: {
              submitText: 'Update',
            },
          }}
          initialValues={payrollTemplate!}
          onFinish={async (value) => {
            try {
              const final = {
                ...payrollTemplate,
                ...value,
              };
              await updatePayrollTemplate(payrollTemplate!.id, final);
              setPayrollTemplate(final);
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
        >
          <ProForm.Group>
            <ProFormText
              width="sm"
              rules={[{ required: true }]}
              name="name"
              label={intl.formatMessage({ id: 'property.template' })}
            />
          </ProForm.Group>
        </ProForm>
      </Card>
      {/* <Card title="Columns">
        <ProList<any>
          rowKey="name"
          headerTitle={false}
          // dataSource={dataSource}
          showActions="hover"
          showExtra="hover"
          toolBarRender={false}
          metas={{
            title: {
              dataIndex: 'name',
            },
            description: {
              dataIndex: 'desc',
            },
            subTitle: {
              render: () => {
                return (
                  <Space size={0}>
                    <Tag>{faker.helpers.randomize(['Currency', 'Text', 'Number'])}</Tag>
                  </Space>
                );
              },
            },
          }}
        />
      </Card> */}
    </div>
  );
};
