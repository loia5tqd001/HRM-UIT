import { readPayrollTemplate, updatePayrollTemplate } from '@/services/payroll.template';
import { PageContainer } from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import { history, useParams, useAccess, getIntl } from 'umi';
import { GeneralInformation } from './GeneralInformation';
import { PayrollColumns } from './PayrollColumns';

export const List: React.FC = () => {
  const access = useAccess();
  const { tab } = history.location.query as {
    tab: 'general' | 'columns' | undefined;
  };
  if (tab === undefined || (tab === 'general' && !access['change_salarytemplate']))
    history.replace('?tab=columns');

  const { id } = useParams<any>();
  const [payrollTemplate, setPayrollTemplate] = useState<API.PayrollTemplate>();

  useEffect(() => {
    readPayrollTemplate(id).then((fetchData) => {
      setPayrollTemplate(fetchData);
    });
    // .catch(() => setPayrollTemplate(null));
  }, [id]);

  const renderContent = (key: string | undefined) => {
    if (key === 'general')
      return (
        <GeneralInformation
          payrollTemplate={payrollTemplate}
          setPayrollTemplate={setPayrollTemplate}
        />
      );
    if (key === 'columns')
      return (
        <PayrollColumns
          payrollTemplate={payrollTemplate}
          onUpdateColumns={async (fields) => {
            if (!payrollTemplate) return;
            const updated = { ...payrollTemplate, fields };
            await updatePayrollTemplate(id, updated);
            setPayrollTemplate(updated);
          }}
        />
      );
    return null;
  };

  return (
    <PageContainer
      title={false}
      tabList={
        access['change_salarytemplate'] && [
          {
            tab: getIntl().formatMessage({ id: 'property.general' }),
            key: 'general',
          },
          {
            tab: getIntl().formatMessage({ id: 'property.payrollColumns' }),
            key: 'columns',
          },
        ]
      }
      onTabChange={(key) => {
        history.replace(`?tab=${key}`);
      }}
      tabActiveKey={tab}
    >
      {renderContent(tab)}
    </PageContainer>
  );
};

export default List;
