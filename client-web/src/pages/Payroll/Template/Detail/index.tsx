import { readPayrollTemplate, updatePayrollTemplate } from '@/services/payroll.template';
import { PageContainer } from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import { history, useParams } from 'umi';
import { GeneralInformation } from './GeneralInformation';
import { PayrollColumns } from './PayrollColumns';

export const List: React.FC = () => {
  const { tab } = history.location.query as {
    tab: 'general' | 'columns' | 'payslip' | undefined;
  };
  if (tab === undefined) history.push('?tab=general');

  const { id } = useParams<any>();
  const [payrollTemplate, setPayrollTemplate] = useState<API.PayrollTemplate>();

  useEffect(() => {
    readPayrollTemplate(id).then((fetchData) => {
      setPayrollTemplate(fetchData);
    });
    // .catch(() => setPayrollTemplate(null));
  }, [id]);

  const renderContent = (key: string | undefined) => {
    if (key === 'general') return <GeneralInformation payrollTemplate={payrollTemplate} />;
    if (key === 'columns')
      return (
        <PayrollColumns
          payrollTemplate={payrollTemplate}
          onUpdateColumns={async (fields) => {
            if (!payrollTemplate) return;
            updatePayrollTemplate(id, { ...payrollTemplate, fields });
          }}
        />
      );
    if (key === 'payslip') return <div>payslip</div>;
    return null;
  };

  return (
    <PageContainer
      title={payrollTemplate?.name}
      tabList={[
        {
          tab: 'General Information',
          key: 'general',
        },
        {
          tab: 'Payroll Columns',
          key: 'columns',
        },
        // {
        //   tab: 'Payslip Template',
        //   key: 'payslip',
        // },
      ]}
      onTabChange={(key) => {
        history.push(`?tab=${key}`);
      }}
      tabActiveKey={tab}
    >
      {renderContent(tab)}
    </PageContainer>
  );
};

export default List;
