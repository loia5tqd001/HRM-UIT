import { updatePayrollTemplate } from '@/services/payroll.template';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Card, message } from 'antd';
import React from 'react';

type Props = {
  payrollTemplate: API.PayrollTemplate | undefined;
};

export const GeneralInformation: React.FC<Props> = (props) => {
  const { payrollTemplate } = props;

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <Card title={payrollTemplate?.name} loading={!payrollTemplate} className="card-shadow">
        <ProForm
          submitter={{
            searchConfig: {
              submitText: 'Update',
            },
          }}
          initialValues={payrollTemplate!}
          onFinish={async (value) => {
            try {
              await updatePayrollTemplate(payrollTemplate!.id, {
                ...payrollTemplate,
                ...value,
              } as any);
              message.success('Updated successfully!');
            } catch {
              message.error('Updated unsuccessfully!');
            }
          }}
        >
          <ProForm.Group>
            <ProFormText width="sm" rules={[{ required: true }]} name="name" label="Name" />
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
