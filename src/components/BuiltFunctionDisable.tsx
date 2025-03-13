import React from 'react';
import { useContexts } from '../providers/AppProvider';
import { componentLoadingStyles } from '../styles/componentLoadingStyles';
import { buildInFunctionsEnabled } from '../lib/helper';

const BuiltFunctionDisable: React.FC = () => {
  const { isNightMode } = useContexts();

  const componentLoading = componentLoadingStyles({ isNightMode });

  return buildInFunctionsEnabled() ? null : (
    <div
      className="content-block camera container_bg"
      style={{ backgroundImage: 'none' }}
    >
      <div
        style={{
          ...componentLoading.camLoading,
          fontSize: '12px',
          textAlign: 'center',
          wordBreak: 'break-word',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        Avatar and Camera are disabled.
        <br />
        Because built-in functions are disabled.
      </div>
    </div>
  );
};

export default BuiltFunctionDisable;
